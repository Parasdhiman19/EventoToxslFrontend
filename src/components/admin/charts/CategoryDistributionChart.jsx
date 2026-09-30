import React, { useState, useMemo } from 'react'
import { PieChart as PieIcon, Layers, Sparkles } from 'lucide-react'

const COLOR_PALETTE = [
  { stroke: '#1c1917', bg: 'bg-stone-900', text: 'text-stone-900', label: 'Stone' },
  { stroke: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-600', label: 'Emerald' },
  { stroke: '#d97706', bg: 'bg-amber-600', text: 'text-amber-600', label: 'Amber' },
  { stroke: '#4f46e5', bg: 'bg-indigo-600', text: 'text-indigo-600', label: 'Indigo' },
  { stroke: '#e11d48', bg: 'bg-rose-600', text: 'text-rose-600', label: 'Rose' },
  { stroke: '#0891b2', bg: 'bg-cyan-600', text: 'text-cyan-600', label: 'Cyan' },
  { stroke: '#9333ea', bg: 'bg-purple-600', text: 'text-purple-600', label: 'Purple' },
]

export default function CategoryDistributionChart({ categories = [] }) {
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const processedData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { category: 'Concerts & Music', count: 12, percentage: 40 },
        { category: 'Theatre & Arts', count: 8, percentage: 26.7 },
        { category: 'Festivals', count: 5, percentage: 16.7 },
        { category: 'Technology', count: 3, percentage: 10 },
        { category: 'Nightlife', count: 2, percentage: 6.6 },
      ]
    }
    return categories
  }, [categories])

  const totalEvents = useMemo(() => {
    return processedData.reduce((acc, c) => acc + (c.count || 0), 0)
  }, [processedData])

  // Donut Arc Calculations
  const size = 180
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let cumulativeAngle = 0
  const segments = processedData.map((item, idx) => {
    const share = item.percentage ? item.percentage / 100 : item.count / (totalEvents || 1)
    const strokeDasharray = `${share * circumference} ${circumference}`
    const strokeDashoffset = -cumulativeAngle
    cumulativeAngle += share * circumference
    const color = COLOR_PALETTE[idx % COLOR_PALETTE.length]

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      color,
      index: idx,
    }
  })

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
              <PieIcon size={14} />
            </span>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
                Genre & Category Share
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Stage distribution across catalog
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
            {totalEvents} Stages
          </span>
        </div>
      </div>

      {/* Donut Chart Visual & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Donut with zero flutter */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 overflow-visible"
          >
            {/* Base Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f5f5f4"
              strokeWidth={strokeWidth}
            />

            {/* Colored Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredCategory?.category === seg.category
              const isAnyHovered = hoveredCategory !== null
              return (
                <circle
                  key={seg.category}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.color.stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="butt"
                  opacity={!isAnyHovered ? 1 : isHovered ? 1 : 0.35}
                  className="transition-opacity duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(seg)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              )
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            {hoveredCategory ? (
              <div className="animate-in fade-in zoom-in-95 duration-100">
                <span className="text-xl font-serif font-bold text-stone-900 block leading-none">
                  {hoveredCategory.percentage}%
                </span>
                <span className="text-[10px] font-mono text-stone-600 block line-clamp-2 leading-tight mt-1 max-w-[100px]">
                  {hoveredCategory.category}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-serif font-bold text-stone-900 block leading-none">
                  {totalEvents}
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mt-1">
                  Stages
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Legend List */}
        <div className="w-full space-y-1.5 font-sans text-xs">
          {segments.map((seg) => {
            const isHovered = hoveredCategory?.category === seg.category
            return (
              <div
                key={seg.category}
                onMouseEnter={() => setHoveredCategory(seg)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                  isHovered ? 'bg-stone-100 shadow-2xs font-semibold' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    style={{ backgroundColor: seg.color.stroke }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                  />
                  <span className="text-stone-800 truncate text-[11px] sm:text-xs">
                    {seg.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-stone-400">{seg.count} stages</span>
                  <span className="font-bold text-stone-900 w-12 text-right">{seg.percentage}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] font-mono text-stone-600 flex items-center justify-between">
        <span>Catalog Diversity Index</span>
        <span className="font-bold text-emerald-700">Healthy Blend ({segments.length} Genres)</span>
      </div>
    </div>
  )
}
