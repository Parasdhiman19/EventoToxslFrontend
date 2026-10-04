import React from 'react'

export default function PayoutBalanceCards({ balanceCards, isLoading }) {
  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4">
      {balanceCards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border p-3.5 sm:p-5 shadow-2xs space-y-1 sm:space-y-2 relative overflow-hidden transition-all ${
            card.primary
              ? 'bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-stone-50 border-stone-800 col-span-2 sm:col-span-1'
              : 'bg-white text-stone-900 border-stone-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider truncate ${
                card.primary ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              {card.label}
            </span>
            {card.primary && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
            )}
          </div>

          <div className="text-xl sm:text-3xl font-serif font-semibold tracking-tight">
            {isLoading ? (
              <span className="inline-block w-20 sm:w-28 h-6 sm:h-8 bg-stone-200/50 rounded-lg animate-pulse" />
            ) : (
              card.value
            )}
          </div>

          <p
            className={`text-[10px] sm:text-[11px] font-mono truncate ${
              card.primary ? 'text-stone-300' : 'text-stone-400'
            }`}
          >
            {card.sub}
          </p>
        </div>
      ))}
    </section>
  )
}
