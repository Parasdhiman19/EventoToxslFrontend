import React from 'react'
import {
  Compass,
  Music,
  Laptop,
  Utensils,
  Moon,
  Palette,
  Wrench,
  Search,
  MapPin,
  X,
  SlidersHorizontal
} from 'lucide-react'

const CATEGORIES = [
  { id: 'All', label: 'All Experiences', icon: Compass },
  { id: 'Music & Concerts', label: 'Music & Live', icon: Music },
  { id: 'Tech & Conferences', label: 'Tech & Summits', icon: Laptop },
  { id: 'Food & Tasting', label: 'Food & Culinary', icon: Utensils },
  { id: 'Nightlife', label: 'Nightlife & Club', icon: Moon },
  { id: 'Art & Exhibitions', label: 'Art & Design', icon: Palette },
  { id: 'Workshops', label: 'Workshops & Labs', icon: Wrench },
]

export default function FeedControls({
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  cities = ['All Cities'],
  searchQuery,
  onSearchChange,
  onResetFilters,
  totalEventsCount = 0,
}) {
  const isFiltering =
    selectedCategory !== 'All' ||
    selectedCity !== 'All Cities' ||
    searchQuery.trim() !== ''

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Category Horizontal Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-2xs touch-pan-x scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-stone-900 text-stone-50 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-stone-400'} />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Filter Row: Search & City Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* City Filter & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="appearance-none rounded-xl border border-stone-300/90 bg-white pl-9 pr-8 py-2 text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 shadow-2xs cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {isFiltering && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 transition cursor-pointer"
            >
              <X size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search experiences, artists, venues..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300/90 bg-white pl-9 pr-8 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 shadow-2xs transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
