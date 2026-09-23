import { ChevronDown, Building2 } from 'lucide-react'

export default function OrganizerTicketGroup({
  organizer,
  isExpanded = true,
  onToggle,
  children,
}) {
  if (!organizer) return null

  const { organizerName, totalTicketsCount, events = [] } = organizer
  const organizerInitial = organizerName ? organizerName.charAt(0).toUpperCase() : 'O'
  const eventCount = events.length

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-2xs hover:border-stone-300 transition-all duration-200">
      {/* Organizer Header Accordion Toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-stone-50/70 hover:bg-stone-100/70 transition-colors text-left cursor-pointer select-none"
      >
        {/* Left Side: Avatar + Name + Expand Chevron */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          {/* Animated Chevron */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-stone-500 transition-transform duration-200 shrink-0 ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>

          {/* Organizer Initial Badge */}
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-50 font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {organizerInitial}
          </div>

          {/* Organizer Title & Events Subtitle */}
          <div className="truncate">
            <h2 className="font-semibold text-stone-900 text-base sm:text-lg tracking-tight truncate">
              {organizerName}
            </h2>
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 font-mono">
              <Building2 className="w-3 h-3 text-stone-400" />
              <span>
                {eventCount} {eventCount === 1 ? 'stage' : 'stages'}
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Total Tickets Badge */}
        <div className="shrink-0 flex items-center gap-2 pl-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold font-mono tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            {totalTicketsCount} {totalTicketsCount === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
      </button>

      {/* Organizer Content (Events list injected via children) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-stone-200/70 space-y-4 bg-white animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  )
}
