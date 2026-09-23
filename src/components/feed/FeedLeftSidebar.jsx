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
  ArrowUpDown,
  Calendar,
  Sparkles,
  Flame,
  DollarSign,
  Filter,
  Check
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

const SORT_OPTIONS = [
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'recent', label: 'Recent', icon: Sparkles },
  { id: 'featured', label: 'Featured', icon: Flame },
  { id: 'price_asc', label: 'Price: Low', icon: DollarSign },
]

export default function FeedLeftSidebar({
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  cities = ['All Cities'],
  searchQuery,
  onSearchChange,
  sortBy,
  onSelectSort,
  onResetFilters,
  totalEventsCount = 0,
}) {
  const isFiltering =
    selectedCategory !== 'All' ||
    selectedCity !== 'All Cities' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'upcoming'

  return (
    <aside className="w-full space-y-4">
      {/* 1. Main Navigation & Search Card */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        
        {/* Search Input Box */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
            Search Stages
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search artists, venues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-7 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all font-sans"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
            <Filter size={11} className="text-stone-400" />
            <span>Categories</span>
          </label>

          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.id

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer select-none text-left ${
                    isSelected
                      ? 'bg-stone-900 text-stone-50 font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon size={13} className={isSelected ? 'text-amber-400' : 'text-stone-400 shrink-0'} />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort By Filter (Compact 2x2 Grid) */}
        <div className="space-y-1.5 pt-1 border-t border-stone-100">
          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
            <ArrowUpDown size={11} className="text-stone-400" />
            <span>Sort Stages</span>
          </label>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-50/80 border border-stone-200/60">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = sortBy === opt.id

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectSort(opt.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer select-none text-left truncate ${
                    isSelected
                      ? 'bg-stone-900 text-stone-50 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon size={11} className={isSelected ? 'text-amber-400 shrink-0' : 'text-stone-400 shrink-0'} />
                  <span className="truncate">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Location / City Filter */}
        <div className="space-y-1.5 pt-1 border-t border-stone-100">
          <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
            <MapPin size={11} className="text-stone-400" />
            <span>Location</span>
          </label>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="w-full h-8.5 appearance-none rounded-xl border border-stone-200 bg-stone-50/50 pl-7 pr-6 text-xs font-mono text-stone-800 focus:outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 cursor-pointer transition-all"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Reset Filters CTA (shown when filtering) */}
      {isFiltering && (
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <X size={12} />
          <span>Reset All Filters</span>
        </button>
      )}

      {/* Lineup Counter */}
      <div className="px-3.5 py-2.5 rounded-xl bg-stone-100/70 border border-stone-200/60 text-[11px] font-mono text-stone-500 flex items-center justify-between">
        <span>Available Stages</span>
        <span className="font-semibold text-stone-900">{totalEventsCount}</span>
      </div>

    </aside>
  )
}
