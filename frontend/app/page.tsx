'use client';

import { useEffect, useState } from 'react';
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
      const { data, error } = await supabase
        .from('deep_discount_deals')
        .select('*')
        .limit(200);

      if (!error && data) {
        // Filter out expired deals, cheap items, location-specific deals, AND Reddit links
        const qualityDeals = data.filter(deal => {
          // Check if expired
          const isExpired = deal.category?.toLowerCase().includes('expired') ||
                           deal.product_name?.toLowerCase().includes('expired') ||
                           (deal.expires_at && new Date(deal.expires_at) < new Date());
          if (isExpired) return false;
          
          // Skip deals that link to Reddit (old data)
          if (deal.product_url?.includes('reddit.com') || deal.product_url?.includes('redd.it')) {
            return false;
          }
          
          // Check if location-specific or in-store only
          const text = `${deal.product_name} ${deal.category || ''}`.toLowerCase();
          const locationKeywords = [
            // US States
            'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
            'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
            'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
            'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
            'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
            'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
            'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
            'wisconsin', 'wyoming',
            // Cities (major ones)
            'atlanta', 'boston', 'chicago', 'dallas', 'denver', 'houston', 'los angeles', 'miami',
            'new york city', 'nyc', 'philadelphia', 'phoenix', 'san francisco', 'seattle',
            // Location indicators
            'in-store', 'in store', 'local', 'ymmv', 'costco ', 'walmart ', 'target '
          ];
          
          const isLocationSpecific = locationKeywords.some(keyword => text.includes(keyword));
          if (isLocationSpecific) return false;
          
          // Calculate original price if missing
          let originalPrice = deal.original_price;
          if (!originalPrice && deal.sale_price && deal.discount_percent) {
            // Formula: original = sale / (1 - discount/100)
            // Example: $25 at 50% off = $25 / 0.5 = $50 original
            originalPrice = deal.sale_price / (1 - deal.discount_percent / 100);
          }
          
          // Only show items originally $50+
          return originalPrice && originalPrice >= 50;
        });
        
        // Auto-sort by discount % (high to low)
        const sorted = [...qualityDeals].sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0));
        setAllDeals(sorted);
        setFilteredDeals(sorted);
      }
      setLoading(false);
    }

    fetchDeals();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchDeals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...allDeals];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.product_name.toLowerCase().includes(search)
      );
    }

    // Category filter (expanded for all categories)
    if (filters.category) {
      filtered = filtered.filter(deal => {
        const name = deal.product_name.toLowerCase();
        const source = deal.source.toLowerCase();
        
        switch (filters.category) {
          case 'gaming':
            return source.includes('game') || source.includes('steam') || name.includes('game');
          case 'fashion':
            return source.includes('fashion') || source.includes('sneaker');
          case 'beauty':
            return source.includes('mua') || source.includes('beauty');
          case 'tech':
            return source.includes('buildapcsales') || name.includes('pc') || name.includes('monitor');
          case 'home':
            return source.includes('furniture') || source.includes('homedecor') || name.includes('furniture') || name.includes('home');
          case 'kitchen':
            return source.includes('cooking') || name.includes('kitchen') || name.includes('cook');
          case 'fitness':
            return source.includes('fitness') || name.includes('fitness') || name.includes('gym');
          case 'toys':
            return source.includes('lego') || source.includes('toy') || source.includes('boardgame');
          case 'books':
            return source.includes('book') || source.includes('ebook') || name.includes('book');
          default:
            return true;
        }
      });
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter(deal => deal.source === filters.source);
    }

    // Minimum discount filter
    if (filters.minDiscount > 50) {
      filtered = filtered.filter(deal => 
        deal.discount_percent && deal.discount_percent >= filters.minDiscount
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'discount':
        filtered.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
        break;
      case 'quality':
        filtered.sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0));
        break;
    }

    setFilteredDeals(filtered);
  };

  const deals = filteredDeals;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6 text-center relative">
          {/* Lightning bolt background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <span className="text-[200px] leading-none">⚡</span>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Grabbit
            </h1>
            <p className="text-gray-300 mt-2 text-lg">
              50%+ OFF on $50+ items • Nationwide online deals only • Updated every 6 hours
            </p>
          </div>
        </div>
      </header>

      {/* Sticky Filter Carousel */}
      <div className="sticky top-0 z-10 bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <DealFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Deals Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-xl text-gray-400 mt-4">Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-4">😔</p>
            <p className="text-2xl text-gray-400">
              No deals match your filters
            </p>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-purple-500/20 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p className="text-lg font-semibold text-purple-400">⚡ grabbit.gg</p>
          <p className="mt-2">Nationwide online deals • Updated every 6 hours</p>
          <p className="mt-2">Gaming • Fashion • Beauty • Tech • Home • Kitchen • Fitness • Books • Toys</p>
          <p className="mt-1 text-purple-400 font-semibold">Only 50%+ OFF on $50+ items 🔥</p>
          <p className="mt-1 text-xs text-gray-500">Quality deals • No local/in-store only</p>
          <p className="mt-3 text-xs">Built by E & Dezi 📊</p>
        </div>
      </footer>
    </main>
  );
}
