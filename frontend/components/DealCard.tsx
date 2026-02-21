'use client';

import React from 'react';
import type { Deal } from '@/lib/supabase';
import Image from 'next/image';

interface DealCardProps { deal: Deal; }

const sourceLogos: Record<string, string> = {
  bestbuy: '🛒', newegg: '🖥️', steam: '🎮', amazon: '📦', microcenter: '💻',
  gamestop: '🎮', target: '🎯', walmart: '🛒', bhphoto: '📷', sephora: '💄',
  ulta: '💅', toysrus: '🧸', reddit_buildapcsales: '🎮', reddit_GameDeals: '🎮', slickdeals: '🔥'
};

const getSourceDisplay = (source: string) => source.startsWith('reddit_') ? `r/${source.replace('reddit_', '')}` : source;

const getCategoryIcon = (deal: Deal) => {
  const source = deal.source.toLowerCase();
  const name = deal.product_name.toLowerCase();
  if (source.includes('game') || source.includes('steam') || name.includes('game')) return '🎮';
  if (source.includes('fashion') || source.includes('sneaker')) return '👗';
  if (source.includes('beauty') || source.includes('sephora')) return '💄';
  if (source.includes('pc') || name.includes('monitor')) return '💻';
  if (source.includes('home') || name.includes('furniture')) return '🏠';
  if (source.includes('kitchen') || name.includes('cook')) return '🍳';
  if (source.includes('fitness') || name.includes('gym')) return '💪';
  if (source.includes('book') || name.includes('book')) return '📚';
  if (source.includes('toy') || name.includes('lego')) return '🧸';
  return '🔥';
};

export default function DealCard({ deal }: DealCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const savings = deal.original_price ? (deal.original_price - deal.sale_price).toFixed(2) : null;

  return (
    <a href={deal.product_url} target="_blank" rel="noopener noreferrer"
      className="group block bg-surface border border-[#252529] hover:border-terminal-green hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all duration-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-terminal-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      <div className="relative h-48 bg-black/50 border-b border-[#252529] flex items-center justify-center overflow-hidden">
        {deal.image_url && !imageError ? (
          <Image src={deal.image_url} alt={deal.product_name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" unoptimized onError={() => setImageError(true)} />
        ) : (
          <div className="text-8xl opacity-20 transition-all">{getCategoryIcon(deal)}</div>
        )}

        {deal.discount_percent && deal.discount_percent > 0 && (
          <div className="absolute top-0 right-0 bg-terminal-green text-black font-bold font-mono text-xs px-2 py-1 border-l border-b border-black">-{deal.discount_percent}%</div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur border border-[#252529] text-muted text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
          <span className="text-terminal-green">{sourceLogos[deal.source] || '>'}</span>
          {getSourceDisplay(deal.source)}
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-12rem)] relative z-20">
        <h3 className="text-foreground font-bold text-sm leading-tight line-clamp-2 mb-3 font-mono group-hover:text-terminal-green transition-colors">{deal.product_name}</h3>
        <div className="mt-auto">
          {deal.category && (
            <div className="mb-2"><span className="text-[10px] text-muted uppercase tracking-widest border border-[#252529] px-1.5 py-0.5 rounded-sm">{deal.category}</span></div>
          )}
          <div className="flex items-end justify-between border-t border-[#252529] pt-3 mt-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted line-through">${deal.original_price?.toFixed(2)}</span>
              <span className="text-xl font-bold text-terminal-green font-mono tracking-tight">${deal.sale_price.toFixed(2)}</span>
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
