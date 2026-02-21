'use client';

import { useState } from 'react';

interface DealFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  category: string;
  source: string;
  minDiscount: number;
  sortBy: 'discount' | 'newest' | 'quality';
}

export default function DealFilters({ onFilterChange }: DealFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    source: '',
    minDiscount: 50,
    sortBy: 'discount'
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const categories = [
    { id: '', label: 'ALL_SYSTEMS' },
    { id: 'gaming', label: 'GAMING' },
    { id: 'fashion', label: 'FASHION' },
    { id: 'beauty', label: 'BEAUTY' },
    { id: 'tech', label: 'TECH' },
    { id: 'home', label: 'HOME' },
    { id: 'kitchen', label: 'KITCHEN' },
    { id: 'fitness', label: 'FITNESS' },
    { id: 'toys', label: 'TOYS' },
    { id: 'books', label: 'BOOKS' },
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide py-3 font-mono">
      <div className="flex gap-2 px-4 min-w-max">
        <div className="relative group">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded text-xs font-bold whitespace-nowrap bg-surface border border-[#252529] text-terminal-green cursor-pointer outline-none hover:border-terminal-green focus:ring-1 focus:ring-terminal-green transition-colors uppercase tracking-wider"
          >
            <option value="discount">SORT: TOP_DEALS</option>
            <option value="newest">SORT: NEWEST</option>
            <option value="quality">SORT: POPULAR</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-terminal-green">▾</div>
        </div>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => updateFilter('category', cat.id)}
            className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all duration-150 uppercase tracking-wide border ${
              filters.category === cat.id
                ? 'bg-terminal-green text-black border-terminal-green shadow-[0_0_10px_rgba(57,255,20,0.35)]'
                : 'bg-surface text-muted border-[#252529] hover:text-terminal-green hover:border-terminal-green/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
