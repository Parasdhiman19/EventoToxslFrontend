import React from 'react'
import { TrendingUp } from 'lucide-react'

export default function EventOverviewStats({
  grossTotal,
  sold,
  totalCap,
  percentage,
  tiers,
  avgPrice,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Gross Revenue</p>
        <h3 className="text-2xl font-serif text-stone-900 mt-1.5">{grossTotal}</h3>
        <p className="text-[11px] font-mono text-emerald-600 mt-2 flex items-center gap-1">
          <TrendingUp size={12} /> Live sales synced
        </p>
      </div>

      <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Tickets Sold</p>
        <div className="flex items-baseline justify-between mt-1.5">
          <h3 className="text-2xl font-serif text-stone-900">
            {sold} <span className="text-xs font-sans text-stone-400">/ {totalCap}</span>
          </h3>
          <span className="font-mono text-xs font-semibold text-stone-700">{percentage}%</span>
        </div>
        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-stone-900 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Inventory Spots Left</p>
        <h3 className="text-2xl font-serif text-stone-900 mt-1.5">
          {Math.max(0, totalCap - sold)}
        </h3>
        <p className="text-[11px] font-mono text-stone-400 mt-2">
          Across {tiers.length} active tier{tiers.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
        <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Average Ticket Price</p>
        <h3 className="text-2xl font-serif text-stone-900 mt-1.5">{avgPrice}</h3>
        <p className="text-[11px] font-mono text-stone-400 mt-2">Blended Tier Average</p>
      </div>
    </div>
  )
}
