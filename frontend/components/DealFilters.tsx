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

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🔍 Search
          </label>
          <input
            type="text"
            placeholder="Search deals..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            📁 Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          >
            <option value="">All Categories</option>
            <option value="gaming">🎮 Gaming</option>
            <option value="fashion">👗 Fashion</option>
            <option value="beauty">💄 Beauty</option>
            <option value="tech">💻 Tech</option>
            <option value="toys">🧸 Toys</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🌐 Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => updateFilter('source', e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          >
            <option value="">All Sources</option>
            <option value="steam">Steam</option>
            <option value="reddit_GameDeals">r/GameDeals</option>
            <option value="reddit_buildapcsales">r/buildapcsales</option>
            <option value="reddit_MUAontheCheap">r/MUAontheCheap</option>
            <option value="reddit_frugalmalefashion">r/frugalmalefashion</option>
            <option value="reddit_frugalfemalefashion">r/frugalfemalefashion</option>
            <option value="reddit_legodeals">r/legodeals</option>
            <option value="slickdeals">Slickdeals</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🔄 Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
          >
            <option value="discount">Highest Discount</option>
            <option value="newest">Newest First</option>
            <option value="quality">Highest Quality</option>
          </select>
        </div>
      </div>

      {/* Discount Slider */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          💰 Minimum Discount: {filters.minDiscount}%+
        </label>
        <input
          type="range"
          min="50"
          max="100"
          step="5"
          value={filters.minDiscount}
          onChange={(e) => updateFilter('minDiscount', parseInt(e.target.value))}
          className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
}
