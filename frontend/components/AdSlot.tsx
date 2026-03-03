'use client';

interface AdSlotProps {
  slotId: string;
  label?: string;
}

export default function AdSlot({ slotId, label = 'Sponsored' }: AdSlotProps) {
  return (
    <div className="col-span-2 border border-[#2b2b31] bg-surface-alt rounded-sm min-h-[110px] flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
        <p className="text-sm text-foreground font-mono">Ad Slot: {slotId}</p>
        <p className="text-xs text-muted">Test placement enabled for monetization QA</p>
      </div>
      <button className="text-xs border border-terminal-green/50 text-terminal-green px-3 py-1 rounded-sm hover:bg-terminal-green/10 transition-colors">
        Learn More
      </button>
    </div>
  );
}
