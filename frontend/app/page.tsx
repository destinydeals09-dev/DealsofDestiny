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

const hasCreditCardLikeContent = (name: string) =>
  /\bgift card\b|\bcredit card\b|\bdebit card\b|\bprepaid card\b|\bvisa\b|\bmastercard\b|\bamerican express\b|\bamex\b|\bdiscover card\b/i.test(name);

const categoryLooksValid = (category: string, name: string) => {
  const n = name.toLowerCase();

  const signals = {
    fashion: /shirt|pants|jacket|dress|clothing|apparel|shoe|sneaker|hoodie|jeans|adidas|nike|under armour|puma/.test(n),
    beauty: /makeup|lipstick|mascara|eyeliner|foundation|concealer|skincare|serum|moisturizer|cleanser|beauty|sephora|ulta|perfume|cologne|fragrance|eau de|deodorant/.test(n),
    tech: /laptop|monitor|ssd|gpu|cpu|keyboard|mouse|headset|computer|electronics|tv|router|tablet|iphone|android|usb|charger|battery/.test(n),
    home: /sofa|chair|table|lamp|bed|furniture|home decor|dresser|bookshelf|cabinet|mattress/.test(n),
    kitchen: /kitchen|cookware|pan|pot|blender|mixer|knife|air fryer|toaster|coffee maker|instant pot/.test(n),
    fitness: /fitness|gym|yoga|dumbbell|barbell|treadmill|protein|workout|weights|massage gun|exercise/.test(n),
    toys: /lego|toy|doll|nerf|board game|puzzle|action figure|playset/.test(n),
    books: /book|books|novel|kindle|paperback|hardcover|audiobook|ebook/.test(n)
  } as const;

  if (category === 'fashion' && /furniture|dresser|cabinet|bookshelf|sofa|chair|table|bed/.test(n)) return false;
  if (category === 'beauty' && /playstation|xbox|nintendo|video game|gaming|furniture|dresser|cabinet|bookshelf|golf cart battery/.test(n)) return false;

  const match = signals[category as keyof typeof signals];
  return match ?? true;
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

const normalizeImageKey = (url: string | null | undefined) => {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.toString().toLowerCase();
  } catch {
    return String(url).toLowerCase();
  }
};

export default function Home() {
  const [shopAllDeals, setShopAllDeals] = useState<RankedDeal[]>([]);
  const [categoryDeals, setCategoryDeals] = useState<Record<string, RankedDeal[]>>({});
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    source: '',
    minDiscount: 0,
    sortBy: 'quality'
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllHotDeals(maxRows = 5000) {
      const pageSize = 1000;
      let from = 0;
      const all: Deal[] = [];

      while (all.length < maxRows) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('hot_deals')
          .select('*')
          .range(from, to);

        if (error) throw error;
        if (!data || data.length === 0) break;

        all.push(...data as Deal[]);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      return all;
    }

    async function fetchDeals() {
      try {
        const data = await fetchAllHotDeals(5000);

        const qualityDeals = data.filter(deal => {
          const isExpired = deal.category?.toLowerCase().includes('expired') ||
            deal.product_name?.toLowerCase().includes('expired') ||
            (deal.expires_at && new Date(deal.expires_at) < new Date());
          if (isExpired) return false;
          if (deal.product_url?.includes('reddit.com') || deal.product_url?.includes('redd.it')) return false;
          if (deal.product_url?.toLowerCase().includes('ebay.com')) return false;

          const text = `${deal.product_name} ${deal.category || ''}`.toLowerCase();
          const locationKeywords = ['in-store', 'in store', 'local', 'ymmv', 'new york', 'los angeles', 'seattle'];
          if (locationKeywords.some(k => text.includes(k))) return false;

          const category = normalizeCategory(deal.category);
          if (!TARGET_CATEGORY_SET.has(category)) return false;
          if (hasCreditCardLikeContent(deal.product_name || '')) return false;
          if (!categoryLooksValid(category, deal.product_name || '')) return false;

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
          const ranked: RankedDeal[] = [];
          const seenImageKeys = new Set<string>();

          for (const deal of dedupedPool) {
            if (normalizeCategory(deal.category) !== category) continue;

            const imageKey = normalizeImageKey(deal.image_url);
            if (imageKey && seenImageKeys.has(imageKey)) continue;
            if (imageKey) seenImageKeys.add(imageKey);

            ranked.push({ ...deal, rank: ranked.length + 1, dedupeKey: buildDedupeKey(deal) });
            if (ranked.length === 10) break;
          }

          if (ranked.length === 10) {
            nextCategoryDeals[category] = ranked;
            liveCategories.push(category);
          }
        }

        // "Shop All": best 10 across all categories, no duplicates.
        const categoryPool = Object.values(nextCategoryDeals).flat().sort(compareDeals);
        const seen = new Set<string>();
        const seenImageKeys = new Set<string>();
        const allTopTen: RankedDeal[] = [];

        for (const deal of categoryPool) {
          if (seen.has(deal.dedupeKey)) continue;

          const imageKey = normalizeImageKey(deal.image_url);
          if (imageKey && seenImageKeys.has(imageKey)) continue;

          seen.add(deal.dedupeKey);
          if (imageKey) seenImageKeys.add(imageKey);

          allTopTen.push({ ...deal, rank: allTopTen.length + 1 });
          if (allTopTen.length === 10) break;
        }

        setCategoryDeals(nextCategoryDeals);
        setAvailableCategories(liveCategories);
        setShopAllDeals(allTopTen);
      } catch (err) {
        console.error('Failed to fetch deals:', err);
      } finally {
        setLoading(false);
      }
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
      <div className="grain-overlay" />
      <div className="crt-overlay" />

      <header className="bg-surface/80 backdrop-blur-md border-b border-[#252529] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-[58px] flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl matrix-title text-terminal-green">GRABBIT</h1>
            <div className="flex flex-col text-[10px] leading-[1.1] text-white font-thin italic">
              <span>The internet&apos;s best deals.</span>
              <span>Grab them before they&apos;re gone.</span>
            </div>
          </div>

          <div className="absolute right-4 inset-y-0 flex items-center bunny-nod">
            <Image src="/rabbit-head-v1.svg" alt="Rabbit head" width={36} height={36} className="pt-1 opacity-95 drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]" />
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
