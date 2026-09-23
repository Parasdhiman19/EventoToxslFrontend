import { Link } from 'react-router-dom'
import { QrCode, CheckCircle2, Armchair } from 'lucide-react'

export default function CompactTicketRow({ ticket, onViewPass, isPast = false }) {
  if (!ticket) return null

  const ticketCode = ticket.ticketCode || ticket.barcode || ticket.id
  const attendeeName = ticket.attendeeName || ticket.name || 'Admit 1 Guest'
  const seatInfo = ticket.seat || ticket.gate || ticket.seatOrGate || 'Main Gate'
  const tierName = ticket.tier || 'General Admission'
  const isCheckedIn = Boolean(ticket.checkedIn)
  const isConcluded = isPast || ticket.status === 'past'

  return (
    <div className={`rounded-lg border bg-white p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
      isConcluded
        ? 'border-stone-200/60 opacity-90 hover:border-stone-300'
        : 'border-stone-200/90 hover:border-stone-300 hover:shadow-2xs'
    }`}>
      {/* Left Info: Pass Code, Tier, Attendee, Seat */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isConcluded ? 'bg-stone-100 text-stone-400' : 'bg-stone-100 text-stone-700'
        }`}>
          <QrCode className="w-4 h-4" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-mono font-semibold text-xs tracking-wide ${
              isConcluded ? 'text-stone-600' : 'text-stone-900'
            }`}>
              {ticketCode}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200/70">
              {tierName}
            </span>
            {ticket.orderId && (
              <span className="text-[10px] font-mono text-stone-400 hidden md:inline">
                Order #{ticket.orderId}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 font-mono">
            <span>{attendeeName}</span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1 text-stone-600">
              <Armchair className="w-3 h-3 text-stone-400" />
              <span>{seatInfo}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Check-in Badge & View Pass CTA */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
        {/* Status Badge */}
        {isCheckedIn ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Checked In</span>
          </span>
        ) : isConcluded ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-stone-100 text-stone-500 border border-stone-200">
            Concluded
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Valid Pass
          </span>
        )}

        {/* View Pass & Receipt Action */}
        <div className="flex items-center gap-2">
          <Link
            to="/user/orders"
            className="text-xs font-mono text-stone-400 hover:text-stone-700 underline underline-offset-2 hidden sm:inline px-1"
          >
            Receipt
          </Link>

          <button
            type="button"
            onClick={() => onViewPass && onViewPass(ticket)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium shadow-2xs active:scale-95 transition-all cursor-pointer ${
              isConcluded
                ? 'bg-stone-800 hover:bg-stone-900 text-stone-200'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-stone-300" />
            <span>{isConcluded ? 'Archived Pass' : 'Digital Pass'} &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  )
}
