import React from 'react'

export default function EventFlatTierEditor({
  ticketTiers,
  addTier,
  removeTier,
  updateTier,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-stone-500">
          Define pass categories and quantity limits for open floor admission.
        </span>
        <button
          type="button"
          onClick={addTier}
          className="text-xs font-mono font-medium text-stone-900 hover:underline cursor-pointer"
        >
          + Add Another Tier
        </button>
      </div>

      <div className="space-y-4">
        {ticketTiers.map((tier, index) => (
          <div
            key={index}
            className="p-4 rounded-md border border-stone-200/80 bg-stone-50/60 space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Pass Tier #{index + 1}
              </span>
              {ticketTiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer text-xs font-mono"
                >
                  Delete Tier
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="block text-[11px] font-mono text-stone-600">Tier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Early Bird Pass"
                  value={tier.name}
                  onChange={(e) => updateTier(index, 'name', e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-stone-600">Price (USD $)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00 for Free"
                  value={tier.price}
                  onChange={(e) => updateTier(index, 'price', e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-stone-600">Available Quantity</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  value={tier.capacity}
                  onChange={(e) => updateTier(index, 'capacity', e.target.value)}
                  className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-stone-600">Perks / Description</label>
              <input
                type="text"
                placeholder="e.g. Includes access to open floor &amp; refreshments"
                value={tier.description}
                onChange={(e) => updateTier(index, 'description', e.target.value)}
                className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
