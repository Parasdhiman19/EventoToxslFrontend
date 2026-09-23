import { ChevronDown, Calendar, MapPin, Clock } from 'lucide-react'

export default function EventTicketGroup({
  event,
  isExpanded = true,
  onToggle,
  children,
}) {
  if (!event) return null

  const {
    eventTitle,
    date,
    doorsOpen,
    venue,
    totalTicketsCount,
    tierSummary = [],
  } = event

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white overflow-hidden shadow-2xs">
      {/* Event Header Toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-stone-50/40 hover:bg-stone-100/50 transition-colors text-left cursor-pointer gap-3 select-none"
      >
        {/* Left Side: Title, Date, Venue */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Chevron Indicator */}
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-stone-400 mt-0.5 sm:mt-0 transition-transform duration-200 shrink-0 ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-sm sm:text-base tracking-tight truncate">
              {eventTitle}
            </h3>

            {/* Event Logistics Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 font-mono">
              {date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>{date}</span>
                </div>
              )}
              {doorsOpen && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Doors: {doorsOpen}</span>
                </div>
              )}
              {venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span className="truncate max-w-[200px]">{venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tier Badges Summary & Count */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto pl-8 sm:pl-0">
          {/* Tier breakdown chips (e.g. VIP x 3) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tierSummary.map((t) => (
              <span
                key={t.tierName}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200/80"
              >
                {t.tierName} &times; {t.count}
              </span>
            ))}
          </div>

          {/* Event Total Tickets Count */}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono bg-stone-900 text-white shadow-2xs">
            {totalTicketsCount} {totalTicketsCount === 1 ? 'pass' : 'passes'}
          </span>
        </div>
      </button>

      {/* Expanded Tickets List */}
      {isExpanded && (
        <div className="p-3 sm:p-4 border-t border-stone-100 bg-stone-50/20 space-y-2.5 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  )
}
