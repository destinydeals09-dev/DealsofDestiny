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
    { id: '', label: 'All', emoji: '🔥' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
    { id: 'fashion', label: 'Fashion', emoji: '👗' },
    { id: 'beauty', label: 'Beauty', emoji: '💄' },
    { id: 'tech', label: 'Tech', emoji: '💻' },
    { id: 'toys', label: 'Toys', emoji: '🧸' },
  ];

  const getSortLabel = () => {
    switch (filters.sortBy) {
      case 'newest': return 'Newest';
      case 'quality': return 'Popular';
      default: return 'Top Deals';
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide py-3">
      <div className="flex gap-2 px-4 min-w-max">
        {/* Sort Dropdown (First) */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="appearance-none px-4 py-2 pr-8 rounded-full text-sm font-medium whitespace-nowrap bg-purple-500 text-white shadow-lg shadow-purple-500/50 cursor-pointer outline-none"
          >
            <option value="discount">🔥 Top Deals</option>
            <option value="newest">🆕 Newest</option>
            <option value="quality">⭐ Popular</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Category Pills */}
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => updateFilter('category', cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filters.category === cat.id
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-black/40 text-gray-300 border border-purple-500/20 hover:border-purple-500/50'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
