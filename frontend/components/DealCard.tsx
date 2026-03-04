'use client';

import React from 'react';
import type { Deal } from '@/lib/supabase';
import Image from 'next/image';

interface DealCardProps {
  deal: Deal;
  rank?: number;
  activeTouchCardId?: string | null;
  touchPulse?: number;
  onCardTouch?: (cardId: string) => void;
}

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

export default function DealCard({ deal, rank, activeTouchCardId, touchPulse = 0, onCardTouch }: DealCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const cardId = String(deal.id);
  const isActiveTouchCard = activeTouchCardId === cardId;

  const handleTouch = React.useCallback(() => {
    onCardTouch?.(cardId);
  }, [onCardTouch, cardId]);

  const computedOriginalPrice = React.useMemo(() => {
    if (deal.original_price && deal.original_price > deal.sale_price) return deal.original_price;
    if (deal.discount_percent && deal.discount_percent > 0 && deal.discount_percent < 100) {
      const ratio = 1 - deal.discount_percent / 100;
      if (ratio > 0) return deal.sale_price / ratio;
    }
    return null;
  }, [deal.original_price, deal.sale_price, deal.discount_percent]);

  return (
    <a
      href={deal.product_url}
      target="_blank"
      rel="noopener noreferrer"
      onTouchStart={handleTouch}
      onTouchEnd={handleTouch}
      onTouchCancel={handleTouch}
      className="group holographic-card block bg-surface border border-[#252529] hover:border-terminal-green hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all duration-200 relative overflow-hidden"
    >
      {isActiveTouchCard && <span key={touchPulse} className="touch-shimmer-overlay" />}
      <div className="absolute inset-0 bg-terminal-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      <div className="relative h-48 bg-white border-b border-[#252529] flex items-center justify-center overflow-hidden">
        {deal.image_url && !imageError ? (
          <Image src={deal.image_url} alt={deal.product_name} fill className="object-contain p-2 bg-white group-hover:scale-105 transition-transform duration-300" unoptimized onError={() => setImageError(true)} />
        ) : (
          <div className="text-8xl opacity-20 transition-all">{getCategoryIcon(deal)}</div>
        )}

        {rank ? (
          <div className="absolute top-0 left-0 bg-black text-terminal-green font-bold font-mono text-xs px-2 py-1 border-r border-b border-terminal-green">#{rank}</div>
        ) : null}

        {deal.discount_percent && deal.discount_percent > 0 && (
          <div className="absolute top-0 right-0 bg-terminal-green text-black font-bold font-mono text-xs px-2 py-1 border-l border-b border-black">-{deal.discount_percent}%</div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/90 backdrop-blur border border-terminal-green/40 text-foreground text-xs font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
          <span className="text-terminal-green">{sourceLogos[deal.source] || '>'}</span>
          {getSourceDisplay(deal.source)}
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-12rem)] relative z-20">
        <h3 className="text-foreground font-bold text-sm leading-tight line-clamp-2 mb-2 font-mono group-hover:text-terminal-green transition-colors">{deal.product_name}</h3>
        <div className="mt-auto">
          <div className="flex items-end justify-between border-t border-[#252529] pt-2 mt-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted line-through">{computedOriginalPrice ? `$${computedOriginalPrice.toFixed(2)}` : '—'}</span>
              <span className="text-xl font-bold text-terminal-green font-mono tracking-tight">${deal.sale_price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
