import type { Deal } from '@/lib/supabase';
import Image from 'next/image';

interface DealCardProps {
  deal: Deal;
}

const sourceColors = {
  bestbuy: 'from-blue-500 to-blue-700',
  newegg: 'from-orange-500 to-red-600',
  steam: 'from-purple-500 to-indigo-600'
};

const sourceLogos = {
  bestbuy: '🛒',
  newegg: '🖥️',
  steam: '🎮'
};

export default function DealCard({ deal }: DealCardProps) {
  const savings = deal.original_price
    ? (deal.original_price - deal.sale_price).toFixed(2)
    : null;

  return (
    <a
      href={deal.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/60 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        {deal.image_url ? (
          <Image
            src={deal.image_url}
            alt={deal.product_name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <span className="text-6xl">{sourceLogos[deal.source]}</span>
        )}

        {/* Discount Badge */}
        {deal.discount_percent && deal.discount_percent > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
            -{deal.discount_percent}%
          </div>
        )}

        {/* Source Badge */}
        <div className={`absolute bottom-2 left-2 bg-gradient-to-r ${sourceColors[deal.source]} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize shadow-lg`}>
          {sourceLogos[deal.source]} {deal.source}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {deal.category && (
          <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-2">
            {deal.category}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-purple-300 transition-colors mb-3">
          {deal.product_name}
        </h3>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-green-400">
              ${deal.sale_price.toFixed(2)}
            </span>
            {deal.original_price && deal.original_price !== deal.sale_price && (
              <span className="text-sm text-gray-500 line-through">
                ${deal.original_price.toFixed(2)}
              </span>
            )}
          </div>
          
          {savings && parseFloat(savings) > 0 && (
            <p className="text-sm text-purple-300">
              💰 Save ${savings}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
