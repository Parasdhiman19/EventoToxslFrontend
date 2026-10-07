import { Link } from 'react-router-dom'
import { QrCode, CheckCircle2, Armchair, Receipt } from 'lucide-react'

export default function CompactTicketRow({ ticket, onViewPass, isPast = false }) {
  if (!ticket) return null

  const ticketCode = ticket.ticketCode || ticket.barcode || ticket.id
  const attendeeName = ticket.attendeeName || ticket.name || 'Admit 1 Guest'
  const seatInfo = ticket.seat || ticket.gate || ticket.seatOrGate || 'Main Gate'
  const tierName = ticket.tier || 'General Admission'
  const isCheckedIn = Boolean(ticket.checkedIn)
  const isConcluded = isPast || ticket.status === 'past'

  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden transition-all
        ${isConcluded
          ? 'border-stone-200/60 opacity-90'
          : 'border-stone-200/90 hover:border-stone-300 hover:shadow-sm'
        }`}
    >
      {/* Top stripe — ticket colour accent */}
      <div className={`h-1 w-full ${isConcluded ? 'bg-stone-200' : 'bg-gradient-to-r from-stone-800 via-stone-600 to-stone-900'}`} />

      <div className="p-3.5 sm:p-4">
        {/* Row 1: Code + Tier badge + Status badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
              ${isConcluded ? 'bg-stone-100 text-stone-400' : 'bg-stone-100 text-stone-700'}`}>
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className={`font-mono font-bold text-xs tracking-wide truncate
              ${isConcluded ? 'text-stone-500' : 'text-stone-900'}`}>
              {ticketCode}
            </span>
          </div>

          {/* Status badge */}
          {isCheckedIn ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Checked In
            </span>
          ) : isConcluded ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-stone-100 text-stone-500 border border-stone-200 shrink-0">
              Concluded
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              ✓ Valid Pass
            </span>
          )}
        </div>

        {/* Row 2: Tier + Attendee + Seat */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-3 pl-9">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200/70 shrink-0">
            {tierName}
          </span>
          <span className="text-xs text-stone-500 font-mono truncate">{attendeeName}</span>
          <span className="hidden sm:inline text-stone-300">•</span>
          <span className="flex items-center gap-1 text-xs text-stone-500 font-mono">
            <Armchair className="w-3 h-3 text-stone-400 shrink-0" />
            {seatInfo}
          </span>
          {ticket.orderId && (
            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
              #{ticket.orderId}
            </span>
          )}
        </div>

        {/* Row 3: Actions — full-width on mobile */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewPass && onViewPass(ticket)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5
                        px-3 py-2.5 rounded-xl text-xs font-mono font-semibold
                        shadow-sm active:scale-95 transition-all cursor-pointer
              ${isConcluded
                ? 'bg-stone-800 hover:bg-stone-900 text-stone-200'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
          >
            <QrCode className="w-3.5 h-3.5 text-stone-300" />
            {isConcluded ? 'Archived Pass' : 'View Digital Pass'} &rarr;
          </button>

          <Link
            to="/user/orders"
            title="View receipt"
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-800 text-xs font-mono transition-colors shrink-0"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Receipt</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
