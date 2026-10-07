import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Armchair,
  ExternalLink,
  QrCode,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function DigitalPassModal({ ticket, onClose }) {
  const [logoError, setLogoError] = useState(false)

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!ticket) return null

  const ticketCode = ticket.ticketCode || ticket.barcode || ticket.id
  const eventTitle = ticket.eventTitle || ticket.event || 'Admission Pass'
  const venue = ticket.venue || 'Main Venue'
  const address = ticket.address || 'Chandigarh'
  const date = ticket.date || 'Event Date'
  const doors = ticket.doorsOpen || ticket.showStarts || 'TBA'
  const tierName = ticket.tier || 'General Admission'
  const price = ticket.price || '$0.00'
  const attendeeName = ticket.attendeeName || ticket.name || 'Admit One'
  const seatInfo = ticket.seat || ticket.gate || ticket.seatOrGate || 'Main Gate'
  const isCheckedIn = Boolean(ticket.checkedIn || ticket.is_checked_in)
  const checkInTime = ticket.checkInTime || ticket.check_in_time
  const organizerName = ticket.organizer || 'Event Host'
  const organizerLogo = !logoError && (ticket.organizerLogo || ticket.organizer_logo)

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4
                 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md sm:max-h-[92vh] overflow-y-auto
                   rounded-t-3xl sm:rounded-2xl
                   bg-stone-900 text-stone-100 shadow-2xl border border-stone-800
                   space-y-4 p-5 sm:p-6 relative
                   max-h-[92dvh] overflow-y-auto
                   scrollbar-thin scrollbar-thumb-stone-700
                   animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom-sheet drag handle (mobile only) */}
        <div className="sm:hidden w-10 h-1 bg-stone-700 rounded-full mx-auto -mt-1 mb-2" />
        {/* Close Button with generous touch target */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pass"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-stone-400 hover:text-stone-100 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer font-mono"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Verified Header */}
        <div className="text-center space-y-1.5 pt-1 pr-6 sm:pr-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Admission Pass</span>
          </div>

          <h3 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug px-2">
            {eventTitle}
          </h3>

          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 truncate max-w-xs mx-auto">
            <span>Presented by</span>
            {organizerLogo ? (
              <img
                src={organizerLogo}
                alt={organizerName}
                onError={() => setLogoError(true)}
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white/30 shrink-0"
              />
            ) : null}
            <span className="text-stone-200 font-medium">{organizerName}</span>
          </div>
        </div>

        {/* High-Contrast Barcode / QR Ticket Box */}
        <div className="bg-white text-stone-950 p-4 sm:p-6 rounded-2xl text-center space-y-3.5 shadow-md">
          {/* Real Scannable QR Code */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-white rounded-xl p-2 sm:p-3 flex items-center justify-center border border-stone-200 shadow-inner">
            <QRCodeSVG
              value={ticketCode}
              size={144}
              level="H"
              includeMargin={false}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Barcode / Ticket Code info */}
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest block text-stone-950">
              {ticketCode}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center justify-center gap-1">
              <Armchair className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate">{seatInfo}</span>
            </span>
          </div>

          {/* Check-in verification status */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center text-center">
            {isCheckedIn ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Checked in at venue door{checkInTime ? ` (${checkInTime})` : ''}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-stone-500">
                <span>Scan at gate entrance for admission</span>
              </span>
            )}
          </div>
        </div>

        {/* Event Schedule & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-mono bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
          <div className="space-y-1">
            <span className="text-stone-500 text-[10px] uppercase block">Schedule</span>
            <div className="text-stone-200 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
              <span>{date}</span>
            </div>
            <div className="text-stone-400 text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-500 shrink-0" />
              <span>Doors: {doors}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 text-[10px] uppercase block">Venue</span>
            <div className="text-stone-200 font-medium truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>
            <div className="text-stone-400 text-[11px] truncate">{address}</div>
          </div>
        </div>

        {/* Pass Meta: Attendee & Order */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t border-stone-800 pt-3">
          <div>
            <span className="text-stone-500 block text-[10px]">Attendee Name</span>
            <span className="text-stone-200 font-medium truncate block">{attendeeName}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 block text-[10px]">Pass Tier • Price</span>
            <span className="text-stone-200 font-medium block">
              {tierName} • {price}
            </span>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => window.print()}
            className="text-stone-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>

          <Link
            to="/user/orders"
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors underline underline-offset-2 py-1"
          >
            <span>Purchase Invoice</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
