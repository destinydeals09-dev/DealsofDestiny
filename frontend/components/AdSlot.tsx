'use client';

import { useEffect } from 'react';
import { ADSENSE_CLIENT, ADSENSE_ENABLED, getAdSlotForPlacement } from '@/lib/ads';

interface AdSlotProps {
  slotId: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function AdSlot({ slotId, label = 'Sponsored' }: AdSlotProps) {
  const adSlot = getAdSlotForPlacement(slotId);
  const canRenderRealAd = ADSENSE_ENABLED && !!adSlot;

  useEffect(() => {
    if (!canRenderRealAd) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (e) {
      console.warn('AdSense slot render failed:', e);
    }
  }, [slotId, canRenderRealAd]);

  if (!canRenderRealAd) {
    return (
      <div className="col-span-2 border border-[#2b2b31] bg-surface-alt rounded-sm min-h-[110px] flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/85">{label}</p>
          <p className="text-sm text-foreground font-mono">Ad Slot: {slotId}</p>
          <p className="text-xs text-muted">Ad network not configured yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-2 border border-[#2b2b31] bg-surface-alt rounded-sm min-h-[110px] px-2 py-2">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 96 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
