import React from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  Armchair
} from 'lucide-react'

export default function EventDetailHero({
  event,
  hasAssignedSeating,
  isEventEnded,
  isBookmarked,
  copiedLink,
  onNavigateBack,
  onShare,
  onToggleBookmark
}) {
  if (!event) return null

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onNavigateBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-950 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Stages</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            className="p-2 rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Share event link"
          >
            <Share2 size={13} />
            <span className="text-[11px] font-mono">{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`p-2 rounded-md border transition text-xs flex items-center gap-1 cursor-pointer shadow-2xs ${
              isBookmarked
                ? 'border-stone-900 bg-stone-900 text-stone-50'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
            title="Bookmark event"
          >
            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span className="text-[11px] font-mono">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Event Showcase Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-900 text-stone-100 shadow-md min-h-[220px] sm:min-h-[360px] md:min-h-[420px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img
            src={event.image || event.banner || event.banner_image || '/emptybanner.jpg'}
            alt={event.title}
            className="w-full h-full object-cover object-center opacity-95 filter saturate-105"
          />
          {/* Gentle directional gradient preserving image clarity while maintaining text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-black/10" />
        </div>

        <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-2 sm:space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-stone-900/80 backdrop-blur-md border border-stone-700/80 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-amber-400 shadow-xs">
              <Sparkles size={10} className="sm:w-3 sm:h-3" />
              {event.category || 'Curated Experience'}
            </span>
            {event.is_featured && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-amber-500/30 backdrop-blur-md border border-amber-400/50 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-amber-300 shadow-xs">
                Featured Stage
              </span>
            )}
            {hasAssignedSeating && (
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-emerald-500/30 backdrop-blur-md border border-emerald-400/50 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-emerald-300 shadow-xs">
                <Armchair size={10} className="sm:w-3 sm:h-3" /> Visual Seating Map
              </span>
            )}
            {isEventEnded && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-red-500/30 backdrop-blur-md border border-red-400/50 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-red-300 shadow-xs">
                Stage Completed (Past)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight sm:tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_12px_rgba(0,0,0,0.9)]">
            {event.title}
          </h1>

          <p className="text-[11px] sm:text-sm text-stone-200 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-normal">
            {event.description || 'Join us for this curated gathering featuring live performances, immersive audio-visual production, and community experiences.'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-6 text-[10px] sm:text-xs font-mono text-stone-200 pt-2 sm:pt-2.5 border-t border-white/20">
            <div className="flex items-center gap-1.5 drop-shadow-sm">
              <Calendar size={12} className="text-amber-400 sm:w-3.5 sm:h-3.5" />
              <span>{event.dateFormatted || event.date}</span>
            </div>
            <div className="flex items-center gap-1.5 drop-shadow-sm">
              <Clock size={12} className="text-amber-400 sm:w-3.5 sm:h-3.5" />
              <span>{event.time || event.startTime || 'Doors Open TBA'}</span>
            </div>
            <div className="flex items-center gap-1.5 drop-shadow-sm">
              <MapPin size={12} className="text-amber-400 sm:w-3.5 sm:h-3.5" />
              <span>{event.is_online ? 'Virtual Stream' : `${event.venueName || event.venue || 'Venue'}, ${event.city}`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
