import { supabase } from '@/lib/supabase';
import DealCard from '@/components/DealCard';
import type { Deal } from '@/lib/supabase';

async function getDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('hot_deals')
    .select('*')
    .limit(50);

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const deals = await getDeals();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            ⚡ Deals of Destiny
          </h1>
          <p className="text-gray-300 mt-2">
            The hottest deals on electronics & gaming, updated daily
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-400">{deals.length}</p>
              <p className="text-gray-400 text-sm">Active Deals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-400">
                {deals.length > 0 ? Math.max(...deals.map(d => d.discount_percent || 0)) : 0}%
              </p>
              <p className="text-gray-400 text-sm">Best Discount</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {deals.filter(d => d.source === 'steam').length}
              </p>
              <p className="text-gray-400 text-sm">Steam Deals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {deals.filter(d => d.source === 'bestbuy' || d.source === 'newegg').length}
              </p>
              <p className="text-gray-400 text-sm">Tech Deals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="container mx-auto px-4 py-8">
        {deals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">
              🔄 Scraping deals... Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-purple-500/20 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>🚀 Built by E & Dezi 📊 | Updated daily at 6 AM PST</p>
          <p className="mt-2">Deals aggregated from Best Buy, Newegg, and Steam</p>
        </div>
      </footer>
    </main>
  );
}
