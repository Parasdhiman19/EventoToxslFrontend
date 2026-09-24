import React from 'react'
import { Link } from 'react-router-dom'
import { Edit3 } from 'lucide-react'

export default function EventTierBreakdown({ eventId, tiers }) {
  return (
    <section className="bg-white border border-stone-200/80 rounded-lg overflow-hidden shadow-2xs">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-serif text-lg text-stone-900">Tier Inventory &amp; Sales</h2>
        <Link
          to={`/manager/events/${eventId}/edit`}
          className="text-xs font-mono uppercase text-stone-500 hover:text-stone-900 transition cursor-pointer"
        >
          Manage Tiers &rarr;
        </Link>
      </div>

      {tiers.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-stone-700">
              <thead>
                <tr className="bg-stone-50/80 font-mono text-[10px] uppercase text-stone-500 tracking-wider border-b border-stone-200/80">
                  <th className="py-3 px-5 font-medium">Tier Name</th>
                  <th className="py-3 px-5 font-medium">Price</th>
                  <th className="py-3 px-5 font-medium">Sold / Total</th>
                  <th className="py-3 px-5 font-medium">Gross</th>
                  <th className="py-3 px-5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {tiers.map((tier) => {
                  const tierSold = tier.soldCount || tier.sold_count || 0
                  const tierCap = tier.capacity || 0
                  const isSoldOut = tierCap > 0 && tierSold >= tierCap
                  const priceNum = parseFloat(tier.price) || 0
                  const priceDisplay = priceNum > 0 ? `$${priceNum.toFixed(2)}` : 'Free'
                  const grossDisplay = tier.gross || `$${(priceNum * tierSold).toFixed(2)}`

                  return (
                    <tr key={tier.id || tier.name} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-stone-900">{tier.name || tier.tierName}</div>
                        {tier.description && (
                          <div className="text-[11px] text-stone-400 mt-0.5">{tier.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-stone-600">{priceDisplay}</td>
                      <td className="py-3.5 px-5 font-mono text-stone-600">
                        {tierSold} / {tierCap}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-stone-900">{grossDisplay}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                            isSoldOut
                              ? 'bg-stone-100 text-stone-600 border-stone-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isSoldOut ? 'Sold Out' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Tier Cards View */}
          <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
            {tiers.map((tier, idx) => {
              const tierSold = tier.soldCount || tier.sold_count || 0
              const tierCap = tier.capacity || 0
              const isSoldOut = tierCap > 0 && tierSold >= tierCap
              const tierPct = tierCap > 0 ? Math.round((tierSold / tierCap) * 100) : 0
              const priceNum = parseFloat(tier.price) || 0
              const priceDisplay = priceNum > 0 ? `$${priceNum.toFixed(2)}` : 'Free'
              const grossDisplay = tier.gross || `$${(priceNum * tierSold).toFixed(2)}`

              return (
                <div key={tier.id || tier.name} className={idx > 0 ? 'pt-3 space-y-2' : 'space-y-2'}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-stone-900">{tier.name || tier.tierName}</h3>
                      {tier.description && (
                        <p className="text-[10px] text-stone-400 mt-0.5">{tier.description}</p>
                      )}
                    </div>
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border shrink-0 ${
                        isSoldOut
                          ? 'bg-stone-100 text-stone-600 border-stone-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isSoldOut ? 'Sold Out' : 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-md bg-stone-50 border border-stone-200/60 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-stone-400 block">Price</span>
                      <span className="font-mono font-medium text-stone-800">{priceDisplay}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-stone-400 block">Gross Sales</span>
                      <span className="font-mono font-semibold text-stone-900">{grossDisplay}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-stone-500">Sold:</span>
                      <span className="font-medium text-stone-900">
                        {tierSold} / {tierCap} ({tierPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-stone-900 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, tierPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-stone-400 space-y-2">
          <p className="font-serif text-sm text-stone-600">No ticket tiers configured</p>
          <p className="text-xs text-stone-400">Add tiers to start selling tickets for this stage.</p>
          <div className="pt-2">
            <Link
              to={`/manager/events/${eventId}/edit`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono"
            >
              <Edit3 size={12} /> Configure Tiers
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
