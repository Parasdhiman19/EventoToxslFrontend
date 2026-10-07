import { useState } from 'react'
import { ChevronDown, Building2, ShieldCheck } from 'lucide-react'

export default function OrganizerTicketGroup({
  organizer,
  isExpanded = true,
  onToggle,
  children,
}) {
  const [logoError, setLogoError] = useState(false)

  if (!organizer) return null

  const { organizerName, organizerLogo, totalTicketsCount, events = [] } = organizer
  const organizerInitial = organizerName ? organizerName.charAt(0).toUpperCase() : 'O'
  const eventCount = events.length
  const showLogo = !logoError && organizerLogo

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-2xs hover:border-stone-300 transition-all duration-200">
      {/* Organizer Header Accordion Toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-3.5 sm:p-5 bg-stone-50/70 hover:bg-stone-100/70 transition-colors text-left cursor-pointer select-none active:bg-stone-100"
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

          {/* Organizer Logo / Initial Badge */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 text-amber-400 font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-sm overflow-hidden ring-1 ring-stone-200">
            {showLogo ? (
              <img
                src={organizerLogo}
                alt={organizerName}
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              organizerInitial
            )}
          </div>

          {/* Organizer Title & Events Subtitle */}
          <div className="truncate">
            <h2 className="font-semibold text-stone-900 text-sm sm:text-base tracking-tight truncate flex items-center gap-1.5">
              <span>{organizerName}</span>
              <ShieldCheck size={14} className="text-blue-500 fill-blue-500/15 shrink-0" />
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
          <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold font-mono tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap">
            {totalTicketsCount} {totalTicketsCount === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
      </button>

      {/* Organizer Content (Events list injected via children) */}
      {isExpanded && (
        <div className="p-3 sm:p-5 border-t border-stone-200/70 space-y-3 bg-white animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  )
}
