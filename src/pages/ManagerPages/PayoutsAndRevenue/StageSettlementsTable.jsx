import React from 'react'
import { Loader2 } from 'lucide-react'

export default function StageSettlementsTable({ revenueByEvent, isLoading }) {
  return (
    <section className="lg:col-span-6 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-4">
      <div className="border-b border-stone-100 pb-3">
        <h2 className="font-serif text-base font-medium text-stone-900">Stage Settlements</h2>
        <p className="text-xs text-stone-500">Gross revenue vs gateway deductions per event</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-stone-400">
            <Loader2 size={20} className="animate-spin mx-auto text-stone-400 mb-1" />
            <p className="font-mono text-xs">Loading event settlements...</p>
          </div>
        ) : revenueByEvent.length > 0 ? (
          revenueByEvent.map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-stone-50/60 border border-stone-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-900 truncate max-w-[220px]">{item.name}</span>
                <span className="font-mono font-semibold text-stone-900">{item.net}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-stone-200/40 pt-1.5">
                <span>Gross: {item.gross}</span>
                <span>Fees: {item.fees}</span>
                <span className="text-stone-700 font-medium uppercase text-[10px]">{item.status}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center space-y-1 border border-dashed border-stone-200 rounded-2xl">
            <p className="text-xs text-stone-700 font-medium">No stage settlements recorded</p>
            <p className="text-[11px] text-stone-400">
              When attendees purchase tickets to your stages, financial breakdowns will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
