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

  const isValidProductImageUrl = (url?: string | null) => {
    if (!url) return false;
    const u = url.toLowerCase();
    if (!u.startsWith('http')) return false;
    if (u.length < 12) return false;

    // Block obvious non-product/fallback assets
    const blocked = ['logo', 'icon', 'sprite', 'placeholder', 'favicon', 'avatar', 'brandmark'];
    return !blocked.some(token => u.includes(token));
  };

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
          
          // ABSOLUTELY NO REDDIT LINKS
          if (deal.product_url?.includes('reddit.com') || deal.product_url?.includes('redd.it')) {
            return false;
          }

          // Must have a real product image + direct e-commerce link
          const hasImage = isValidProductImageUrl(deal.image_url);
          const hasDirectLink = Boolean(
            deal.product_url &&
            deal.product_url.startsWith('http') &&
            !deal.product_url.includes('slickdeals.net')
          );
          if (!hasImage || !hasDirectLink) return false;
          
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
          
          // Lowered threshold to increase inventory density
          return originalPrice && originalPrice >= 15;
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
        const category = (deal.category || '').toLowerCase();
        
        switch (filters.category) {
          case 'gaming':
            return category === 'gaming' || source.includes('game') || source.includes('steam') || name.includes('game');
          case 'fashion':
            return category === 'fashion' || source.includes('fashion') || source.includes('sneaker');
          case 'beauty':
            return category === 'beauty' || source.includes('mua') || source.includes('beauty');
          case 'tech':
            return category === 'tech' || source.includes('buildapcsales') || name.includes('pc') || name.includes('monitor');
          case 'home':
            return category === 'home' || source.includes('furniture') || source.includes('homedecor') || name.includes('furniture') || name.includes('home');
          case 'kitchen':
            return category === 'kitchen' || source.includes('cooking') || name.includes('kitchen') || name.includes('cook');
          case 'fitness':
            return category === 'fitness' || source.includes('fitness') || name.includes('fitness') || name.includes('gym');
          case 'toys':
            return category === 'toys' || source.includes('lego') || source.includes('toy') || source.includes('boardgame');
          case 'books':
            return category === 'books' || source.includes('book') || source.includes('ebook') || name.includes('book');
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
    <main className="min-h-screen bg-background text-foreground selection:bg-terminal-green selection:text-black font-mono">
      {/* Header - Terminal Style */}
      <header className="bg-[#1b1b20]/95 backdrop-blur-md border-b border-[#2b2b31] sticky top-0 z-50">
        <div className="container mx-auto px-4 h-[112px] flex items-center justify-between">
          <div className="flex flex-col items-start justify-center leading-tight">
            <h1 className="text-3xl leading-none font-bold italic tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-terminal-green to-emerald-400 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
              GRABBIT
            </h1>
            <p className="text-[12px] text-terminal-green/85 italic mt-1">before it&apos;s gone</p>
          </div>

          <div className="h-full flex items-end justify-end">
            <img src="/gangster-bunny.svg" alt="Gangster Bunny" className="h-[126px] w-[126px] object-contain" />
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-[112px] z-40 bg-surface/90 backdrop-blur-md border-b border-[#252529]">
        <DealFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Deals Grid */}
      <div className="container mx-auto px-4 py-8 relative">
        {loading ? (
          <div className="text-center py-20 font-mono">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terminal-green mb-4"></div>
            <p className="text-xl text-muted animate-pulse">
              <span className="text-terminal-green">{'>'}</span> ACCESSING_MAINFRAME...
            </p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#252529] rounded-lg bg-surface/30">
            <p className="text-4xl mb-4 grayscale opacity-50">👾</p>
            <p className="text-2xl text-muted font-bold">NO_RESULTS_FOUND</p>
            <p className="text-gray-500 mt-2 font-mono text-sm">
              Try adjusting search parameters...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-[#252529] mt-20 py-12">
        <div className="container mx-auto px-4 text-center text-muted text-sm font-mono">
          <div className="mb-6 inline-flex items-center justify-center p-4 border border-[#252529] rounded-lg bg-background/50">
            <div className="flex items-center gap-2">
              <img src="/gangster-bunny.svg" alt="Gangster Bunny" className="h-6 w-6 object-contain" />
              <span className="text-lg font-light italic text-terminal-green tracking-wider glow-green">GRABBIT</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left opacity-80">
            <div>
              <h3 className="text-foreground font-bold mb-2 uppercase text-xs tracking-widest text-emerald-500">Protocol</h3>
              <p className="mb-1 text-xs">Lightning-fast deals</p>
              <p className="mb-1 text-xs">Nationwide online only</p>
              <p className="mb-1 text-xs">Updated every 6 hours</p>
            </div>
            <div>
              <h3 className="text-foreground font-bold mb-2 uppercase text-xs tracking-widest text-emerald-500">Categories</h3>
              <p className="mb-1 text-xs">Gaming • Tech • Home</p>
              <p className="mb-1 text-xs">Fashion • Beauty • Toys</p>
              <p className="mb-1 text-xs">Kitchen • Fitness • Books</p>
            </div>
            <div>
              <h3 className="text-foreground font-bold mb-2 uppercase text-xs tracking-widest text-emerald-500">System</h3>
              <p className="mb-1 text-xs text-terminal-green font-semibold">50%+ OFF on $50+ items 🔥</p>
              <p className="mt-4 text-[10px] text-[#444]">
                v2.0.4 • EST. 2026<br/>
                Built by E & Dezi 📊
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
