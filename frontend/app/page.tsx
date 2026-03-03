'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DealCard from '@/components/DealCard';
import DealFilters, { FilterState } from '@/components/DealFilters';
import type { Deal } from '@/lib/supabase';

const TARGET_CATEGORIES = ['fashion', 'beauty', 'tech', 'home', 'kitchen', 'fitness', 'toys', 'books'] as const;
const TARGET_CATEGORY_SET = new Set<string>(TARGET_CATEGORIES);

type RankedDeal = Deal & { rank: number; dedupeKey: string };

const normalizeCategory = (category: string | null | undefined) => (category || '').trim().toLowerCase();

// URL canonicalization now happens in backend ingestion quality gate.

const normalizeText = (text: string | null | undefined) =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const titleSignature = (text: string | null | undefined) =>
  normalizeText(text)
    .split(' ')
    .filter(Boolean)
    .filter(token => !['with', 'and', 'the', 'for', 'free', 'shipping', 'more', 'plus'].includes(token))
    .slice(0, 10)
    .join(' ');

const inferMerchant = (rawUrl: string | null | undefined, fallbackSource: string | null | undefined) => {
  try {
    const hostname = new URL(rawUrl || '').hostname.toLowerCase().replace(/^www\./, '');
    if (hostname.includes('walmart')) return 'walmart';
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('target')) return 'target';
    if (hostname.includes('bestbuy')) return 'bestbuy';
    if (hostname.includes('costco')) return 'costco';
    return hostname || (fallbackSource || 'unknown');
  } catch {
    return fallbackSource || 'unknown';
  }
};

const getOriginalPrice = (deal: Deal) => {
  if (deal.original_price) return deal.original_price;
  if (deal.sale_price && deal.discount_percent) {
    const ratio = 1 - deal.discount_percent / 100;
    if (ratio > 0) return deal.sale_price / ratio;
  }
  return null;
};

const getDealPriority = (deal: Deal) => {
  const originalPrice = getOriginalPrice(deal) ?? 0;
  const discountPercent = deal.discount_percent ?? 0;
  const savings = originalPrice * (discountPercent / 100);

  const freshnessHours = Math.max(0, (Date.now() - new Date(deal.scraped_at).getTime()) / (1000 * 60 * 60));
  const freshnessBonus = Math.max(0, 24 - freshnessHours);
  const qualityBase = deal.quality_score ?? 0;

  const score = (discountPercent * 2.5) + (savings * 0.15) + freshnessBonus + qualityBase;

  return { savings, originalPrice, discountPercent, score };
};

const compareDeals = (a: Deal, b: Deal) => {
  const pa = getDealPriority(a);
  const pb = getDealPriority(b);

  if (pb.score !== pa.score) return pb.score - pa.score;
  if (pb.savings !== pa.savings) return pb.savings - pa.savings;
  if (pb.originalPrice !== pa.originalPrice) return pb.originalPrice - pa.originalPrice;
  return pb.discountPercent - pa.discountPercent;
};

const buildDedupeKey = (deal: Deal) => {
  const merchant = inferMerchant(deal.product_url, deal.source);
  const category = normalizeCategory(deal.category);
  const title = titleSignature(deal.product_name);
  const saleBucket = Math.round((deal.sale_price || 0));

  // Primary dedupe is semantic (merchant + normalized title + rounded price)
  // so affiliate URL variants don't create visual duplicates.
  const semanticKey = `sem:${merchant}:${category}:${title}:${saleBucket}`;

  return semanticKey;
};

export default function Home() {
  const [shopAllDeals, setShopAllDeals] = useState<RankedDeal[]>([]);
  const [categoryDeals, setCategoryDeals] = useState<Record<string, RankedDeal[]>>({});
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    source: '',
    minDiscount: 50,
    sortBy: 'quality'
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase.from('hot_deals').select('*').limit(1000);

      if (!error && data) {
        const qualityDeals = data.filter(deal => {
          const isExpired = deal.category?.toLowerCase().includes('expired') ||
            deal.product_name?.toLowerCase().includes('expired') ||
            (deal.expires_at && new Date(deal.expires_at) < new Date());
          if (isExpired) return false;
          if (deal.product_url?.includes('reddit.com') || deal.product_url?.includes('redd.it')) return false;

          const text = `${deal.product_name} ${deal.category || ''}`.toLowerCase();
          const locationKeywords = ['in-store', 'in store', 'local', 'ymmv', 'new york', 'los angeles', 'seattle'];
          if (locationKeywords.some(k => text.includes(k))) return false;

          const category = normalizeCategory(deal.category);
          if (!TARGET_CATEGORY_SET.has(category)) return false;

          const originalPrice = getOriginalPrice(deal);
          return !!originalPrice && originalPrice >= 30;
        });

        // Global dedupe pool (best deal wins in each duplicate cluster)
        const bestByKey = new Map<string, Deal>();
        for (const deal of qualityDeals) {
          const key = buildDedupeKey(deal);
          const existing = bestByKey.get(key);
          if (!existing || compareDeals(deal, existing) < 0) {
            bestByKey.set(key, deal);
          }
        }

        const dedupedPool = [...bestByKey.values()].sort(compareDeals);

        const nextCategoryDeals: Record<string, RankedDeal[]> = {};
        const liveCategories: string[] = [];

        for (const category of TARGET_CATEGORIES) {
          const ranked = dedupedPool
            .filter(deal => normalizeCategory(deal.category) === category)
            .slice(0, 10)
            .map((deal, idx) => ({ ...deal, rank: idx + 1, dedupeKey: buildDedupeKey(deal) }));

          if (ranked.length === 10) {
            nextCategoryDeals[category] = ranked;
            liveCategories.push(category);
          }
        }

        // "Shop All": best 10 across all categories, no duplicates.
        const categoryPool = Object.values(nextCategoryDeals).flat().sort(compareDeals);
        const seen = new Set<string>();
        const allTopTen: RankedDeal[] = [];

        for (const deal of categoryPool) {
          if (seen.has(deal.dedupeKey)) continue;
          seen.add(deal.dedupeKey);
          allTopTen.push({ ...deal, rank: allTopTen.length + 1 });
          if (allTopTen.length === 10) break;
        }

        setCategoryDeals(nextCategoryDeals);
        setAvailableCategories(liveCategories);
        setShopAllDeals(allTopTen);
      }
      setLoading(false);
    }

    fetchDeals();
    const interval = setInterval(fetchDeals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredDeals = useMemo(() => {
    const base = filters.category ? (categoryDeals[filters.category] || []) : shopAllDeals;
    let next = [...base];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      next = next.filter(deal => deal.product_name.toLowerCase().includes(search));
    }

    if (filters.source) next = next.filter(deal => deal.source === filters.source);
    if (filters.minDiscount > 0) next = next.filter(deal => (deal.discount_percent ?? 0) >= filters.minDiscount);

    // Keep rank-first behavior by default, allow alternate views for debugging.
    switch (filters.sortBy) {
      case 'discount':
        next.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0));
        break;
      case 'newest':
        next.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
        break;
      case 'quality':
      default:
        next.sort((a, b) => a.rank - b.rank);
        break;
    }

    return next;
  }, [filters, categoryDeals, shopAllDeals]);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-terminal-green selection:text-black font-mono relative">
      <div className="scanlines" />
      <div className="crt-overlay" />

      <header className="bg-surface/80 backdrop-blur-md border-b border-[#252529] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-[58px] flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-thin italic tracking-tight text-terminal-green glow-green">GRABBIT</h1>
            <div className="flex flex-col text-[10px] leading-[1.1] text-white font-thin italic">
              <span>The internet&apos;s best deals.</span>
              <span>Grab them before they&apos;re gone.</span>
            </div>
          </div>

          <div className="absolute right-4 inset-y-0 flex items-center bunny-nod">
            <Image src="/rabbit-head-v1.svg" alt="Rabbit head" width={36} height={36} className="pt-1" />
          </div>
        </div>
      </header>

      <div className="sticky top-[58px] z-40 bg-surface/90 backdrop-blur-md border-b border-[#252529]">
        <DealFilters
          onFilterChange={setFilters}
          categories={availableCategories.map(category => ({
            id: category,
            label: category.toUpperCase(),
          }))}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {loading ? (
          <div className="text-center py-20 font-mono">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terminal-green mb-4"></div>
            <p className="text-xl text-muted animate-pulse"><span className="text-terminal-green">&gt;</span> ACCESSING_MAINFRAME...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#252529] rounded-lg bg-surface/30">
            <p className="text-4xl mb-4 grayscale opacity-50">👾</p>
            <p className="text-2xl text-muted font-bold">NO_RESULTS_FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {filteredDeals.map(deal => <DealCard key={`${deal.id}-${deal.rank}`} deal={deal} rank={deal.rank} />)}
          </div>
        )}
      </div>
    </main>
  );
}
