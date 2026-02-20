'use client';

import React from 'react';
import type { Deal } from '@/lib/supabase';
import Image from 'next/image';

interface DealCardProps {
  deal: Deal;
}

const sourceLogos: Record<string, string> = {
  bestbuy: '🛒',
  newegg: '🖥️',
  steam: '🎮',
  amazon: '📦',
  microcenter: '💻',
  gamestop: '🎮',
  target: '🎯',
  walmart: '🛒',
  bhphoto: '📷',
  sephora: '💄',
  ulta: '💅',
  toysrus: '🧸',
  reddit_buildapcsales: '🎮',
  reddit_GameDeals: '🎮',
  slickdeals: '🔥'
};

// Helper to get source display name
const getSourceDisplay = (source: string) => {
  if (source.startsWith('reddit_')) {
    return `r/${source.replace('reddit_', '')}`;
  }
  return source;
};

export default function DealCard({ deal }: DealCardProps) {
  const [imageError, setImageError] = React.useState(false);

  // Strict image policy: no image (or broken image) => no card rendered
  if (!deal.image_url || imageError) return null;

  const savings = deal.original_price
    ? (deal.original_price - deal.sale_price).toFixed(2)
    : null;

  return (
    <a
      href={deal.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-surface border border-[#252529] hover:border-terminal-green hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all duration-200 relative overflow-hidden"
    >
      {/* Selection/Hover Effect Overlay */}
      <div className="absolute inset-0 bg-terminal-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Image Area */}
      <div className="relative h-48 bg-black/50 border-b border-[#252529] flex items-center justify-center overflow-hidden">
        <Image
          src={deal.image_url}
          alt={deal.product_name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          unoptimized
          onError={() => setImageError(true)}
        />

        {/* Discount Badge - Top Right */}
        {deal.discount_percent && deal.discount_percent > 0 && (
          <div className="absolute top-0 right-0 bg-terminal-green text-black font-bold font-mono text-xs px-2 py-1 border-l border-b border-black">
            -{deal.discount_percent}%
          </div>
        )}

        {/* Source Badge - Bottom Left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur border border-[#252529] text-muted text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
          <span className="text-terminal-green">{sourceLogos[deal.source] || '>'}</span>
          {getSourceDisplay(deal.source)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-[calc(100%-12rem)] relative z-20">
        {/* Title */}
        <h3 className="text-foreground font-bold text-sm leading-tight line-clamp-2 mb-3 font-mono group-hover:text-terminal-green transition-colors">
          {deal.product_name}
        </h3>

        <div className="mt-auto">
          {/* Category Tag */}
          {deal.category && (
            <div className="mb-2">
              <span className="text-[10px] text-muted uppercase tracking-widest border border-[#252529] px-1.5 py-0.5 rounded-sm">
                {deal.category}
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-end justify-between border-t border-[#252529] pt-3 mt-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted line-through decoration-red-500/50">
                ${deal.original_price?.toFixed(2)}
              </span>
              <span className="text-xl font-bold text-terminal-green font-mono tracking-tight">
                ${deal.sale_price.toFixed(2)}
              </span>
            </div>
            
            {savings && parseFloat(savings) > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-muted uppercase tracking-wider">Saved</p>
                <p className="text-xs font-bold text-foreground">${savings}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}