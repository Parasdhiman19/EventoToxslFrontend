import React, { useState } from 'react'
import { MapPin, Building2, ShieldCheck, Globe, ExternalLink } from 'lucide-react'

export default function EventDetailAbout({ event }) {
  const [logoError, setLogoError] = useState(false)

  if (!event) return null

  const organizerName = event.organizer || 'Nexus Productions'
  const organizerInitial = organizerName.charAt(0).toUpperCase()
  const organizerLogo = !logoError && (event.organizerLogo || event.organizer_logo)
  const organizerHandle = event.organizerHandle || event.organizer_handle || organizerName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const organizerBio = event.organizerBio || 'Curated stage production studio delivering live performances and community gatherings on Evento.'
  const organizerWebsite = event.organizerWebsite || ''
  const organizerInstagram = event.organizerInstagram || ''

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Venue & Location Box */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-medium text-xs font-mono uppercase tracking-wider mb-2">
              <MapPin size={14} className="text-stone-500" />
              <span>Venue &amp; Location</span>
            </div>
            <p className="font-semibold text-stone-900 text-sm">{event.venueName || event.venue || 'Main Venue'}</p>
            <p className="text-xs text-stone-500 mt-0.5">{event.address || `${event.city || 'Chandigarh'}, India`}</p>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {event.is_online ? 'Live Virtual Stream' : 'In-Person Stage Venue'}
            </span>
          </div>
        </div>

        {/* Host Studio Profile Card */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-900 font-medium text-xs font-mono uppercase tracking-wider">
              <Building2 size={14} className="text-stone-500" />
              <span>Hosted By Studio</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full font-semibold">
              <ShieldCheck size={11} className="fill-blue-500/20" /> Verified Host
            </span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            {/* Studio Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-stone-900 to-stone-700 text-amber-400 flex items-center justify-center font-serif text-base font-bold ring-2 ring-stone-100 shrink-0 shadow-2xs overflow-hidden">
              {organizerLogo ? (
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

            {/* Studio Name & Handle */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-stone-900 text-sm leading-tight truncate">
                {organizerName}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono truncate mt-0.5">
                @{organizerHandle}
              </p>
              <p className="text-xs text-stone-600 font-sans line-clamp-2 mt-1.5 leading-relaxed">
                {organizerBio}
              </p>
            </div>
          </div>

          {/* Studio Links (If available) */}
          {(organizerWebsite || organizerInstagram) && (
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100 text-xs font-mono">
              {organizerWebsite && (
                <a
                  href={organizerWebsite.startsWith('http') ? organizerWebsite : `https://${organizerWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-950 transition"
                >
                  <Globe size={12} className="text-stone-400" />
                  <span className="truncate max-w-[140px]">Website</span>
                  <ExternalLink size={10} className="text-stone-400" />
                </a>
              )}
              {organizerInstagram && (
                <a
                  href={`https://instagram.com/${organizerInstagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-950 transition"
                >
                  <svg className="w-3 h-3 fill-none stroke-current stroke-2 text-pink-500 shrink-0" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span className="truncate max-w-[140px]">@{organizerInstagram.replace('@', '')}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
