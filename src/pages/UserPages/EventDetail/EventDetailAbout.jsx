import React from 'react'
import { MapPin, Building2, ShieldCheck } from 'lucide-react'

export default function EventDetailAbout({ event }) {
  if (!event) return null

  return (
    <div className="space-y-6">
      {/* About Section */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
        <h2 className="font-serif text-xl font-medium text-stone-900 border-b border-stone-100 pb-3">
          About This Experience
        </h2>
        <div className="prose prose-stone text-xs leading-relaxed text-stone-600 space-y-3">
          <p>
            {event.description || 'Experience a curated production with state-of-the-art stage engineering, sound design, and live engagement.'}
          </p>
          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/70 space-y-2 font-mono text-[11px] text-stone-700">
            <div className="flex items-center gap-2 text-stone-900 font-semibold">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Guaranteed Direct Gate Admission</span>
            </div>
            <p className="text-stone-500 font-sans text-xs">
              Passes include instantaneous cryptographic door QR barcodes delivered to your <strong>My Tickets</strong> dashboard upon purchase.
            </p>
          </div>
        </div>
      </div>

      {/* Location & Host Studio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-medium text-xs font-mono uppercase tracking-wider">
            <MapPin size={14} className="text-stone-500" />
            <span>Venue &amp; Location</span>
          </div>
          <p className="font-medium text-stone-900 text-sm">{event.venueName || event.venue || 'Main Venue'}</p>
          <p className="text-xs text-stone-500">{event.address || `${event.city}, India`}</p>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-medium text-xs font-mono uppercase tracking-wider">
            <Building2 size={14} className="text-stone-500" />
            <span>Curated By Host</span>
          </div>
          <p className="font-medium text-stone-900 text-sm">{event.organizer || 'Nexus Productions'}</p>
          <p className="text-xs text-stone-500 font-mono">Verified Studio Host</p>
        </div>
      </div>
    </div>
  )
}
