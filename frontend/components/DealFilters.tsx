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

  const sorts = [
    { id: 'discount', label: 'Top Deals' },
    { id: 'newest', label: 'Newest' },
    { id: 'quality', label: 'Popular' },
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide py-3">
      <div className="flex gap-2 px-4 min-w-max">
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
        
        {/* Divider */}
        <div className="w-px bg-purple-500/20 mx-2" />
        
        {/* Sort Pills */}
        {sorts.map(sort => (
          <button
            key={sort.id}
            onClick={() => updateFilter('sortBy', sort.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filters.sortBy === sort.id
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-black/40 text-gray-300 border border-purple-500/20 hover:border-purple-500/50'
            }`}
          >
            {sort.label}
          </button>
        ))}
      </div>
    </div>
  );
}
