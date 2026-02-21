'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DealCard from '@/components/DealCard';
import DealFilters, { FilterState } from '@/components/DealFilters';
import type { Deal } from '@/lib/supabase';

export default function Home() {
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase.from('deep_discount_deals').select('*').limit(200);

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

          let originalPrice = deal.original_price;
          if (!originalPrice && deal.sale_price && deal.discount_percent) {
            originalPrice = deal.sale_price / (1 - deal.discount_percent / 100);
          }
          return !!originalPrice && originalPrice >= 50;
        });

        const sorted = [...qualityDeals].sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0));
        setAllDeals(sorted);
        setFilteredDeals(sorted);
      }
      setLoading(false);
    }

    fetchDeals();
    const interval = setInterval(fetchDeals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...allDeals];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(deal => deal.product_name.toLowerCase().includes(search));
    }

    if (filters.category) {
      filtered = filtered.filter(deal => {
        const name = deal.product_name.toLowerCase();
        const source = deal.source.toLowerCase();
        switch (filters.category) {
          case 'gaming': return source.includes('game') || source.includes('steam') || name.includes('game');
          case 'fashion': return source.includes('fashion') || source.includes('sneaker');
          case 'beauty': return source.includes('mua') || source.includes('beauty');
          case 'tech': return source.includes('buildapcsales') || name.includes('pc') || name.includes('monitor');
          case 'home': return source.includes('furniture') || source.includes('homedecor') || name.includes('furniture') || name.includes('home');
          case 'kitchen': return source.includes('cooking') || name.includes('kitchen') || name.includes('cook');
          case 'fitness': return source.includes('fitness') || name.includes('fitness') || name.includes('gym');
          case 'toys': return source.includes('lego') || source.includes('toy') || source.includes('boardgame');
          case 'books': return source.includes('book') || source.includes('ebook') || name.includes('book');
          default: return true;
        }
      });
    }

    if (filters.source) filtered = filtered.filter(deal => deal.source === filters.source);
    if (filters.minDiscount > 50) filtered = filtered.filter(deal => deal.discount_percent && deal.discount_percent >= filters.minDiscount);

    switch (filters.sortBy) {
      case 'discount': filtered.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0)); break;
      case 'newest': filtered.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime()); break;
      case 'quality': filtered.sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0)); break;
    }

    setFilteredDeals(filtered);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-terminal-green selection:text-black font-mono relative">
      <div className="scanlines" />
      <div className="crt-overlay" />

      <header className="bg-surface/80 backdrop-blur-md border-b border-[#252529] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-[58px] flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <span className="text-terminal-green text-xl glow-green">$</span>
            <h1 className="text-2xl font-bold tracking-tight text-terminal-green glow-green">GRABBIT.GG</h1>
          </div>

          <div className="absolute right-4 top-2 bunny-nod">
            <Image src="/bunny-head.svg" alt="Rabbit head" width={44} height={44} className="drop-shadow-[0_0_10px_rgba(57,255,20,0.45)]" />
          </div>
        </div>
      </header>

      <div className="sticky top-[58px] z-40 bg-surface/90 backdrop-blur-md border-b border-[#252529]">
        <DealFilters onFilterChange={handleFilterChange} />
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
            {filteredDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
          </div>
        )}
      </div>
    </main>
  );
}
