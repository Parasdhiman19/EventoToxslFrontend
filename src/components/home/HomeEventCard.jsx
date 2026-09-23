import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Calendar, MapPin, Bookmark, Flame } from 'lucide-react'
import { toggleEventBookmark } from '../../services/socialApi'

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'

export default function HomeEventCard({
  event,
  onBookmarkChange,
  className = '',
}) {
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const [imageError, setImageError] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(Boolean(event.isBookmarked || event.is_bookmarked))
  const [isSaving, setIsSaving] = useState(false)

  if (!event) return null

  const imageUrl = imageError ? DEFAULT_BANNER : event.image || event.banner || DEFAULT_BANNER
  const isUrgent = typeof event.spotsLeft === 'number' && event.spotsLeft > 0 && event.spotsLeft <= 15
  const venueDisplay = event.is_online
    ? 'Virtual Stream'
    : event.city
    ? `${event.venueName || event.venue || 'Venue'}, ${event.city}`
    : event.venueName || event.venue || 'Location TBA'
  const priceDisplay = event.startingPrice || event.priceRange || 'Free'

  const handleToggleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      alert('Please log in to save events to your list.')
      return
    }

    if (isSaving) return
    setIsSaving(true)

    // Optimistic toggle
    const nextState = !isBookmarked
    setIsBookmarked(nextState)

    try {
      await toggleEventBookmark(event.id)
      if (onBookmarkChange) {
        onBookmarkChange(event.id, nextState)
      }
    } catch {
      // Revert if request fails
      setIsBookmarked(!nextState)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Link
      to={`/events/${event.id}`}
      className={`group flex flex-col bg-stone-50 hover:bg-white rounded-xl border border-stone-200/60 hover:border-stone-300/80 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 transition-all duration-300 ease-out ${className}`}
    >
      {/* Card Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 rounded-t-xl">
        <img
          src={imageUrl}
          alt={event.title || 'Event'}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges: Category & Bookmark */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
          {event.category ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-stone-900/80 backdrop-blur-md text-white shadow-xs uppercase font-mono">
              {event.category}
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={isSaving}
            aria-label="Save event"
            className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
              isBookmarked
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Floating Pill on Image: Urgency or Date */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          {/* Calendar Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md font-medium text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-stone-300" />
            <span>{event.dateFormatted || event.date || 'Upcoming'}</span>
          </div>

          {/* Low inventory alert */}
          {isUrgent && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase font-mono">
              <Flame className="w-3 h-3 animate-pulse" />
              <span>{event.spotsLeft} left</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-3.5 justify-between gap-3 transition-colors duration-300">
        <div className="space-y-1.5">
          {/* Event Title */}
          <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          {/* Venue & Location */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
            <span className="truncate">{venueDisplay}</span>
          </div>
        </div>

        {/* Card Footer: Starting Price & Details link */}
        <div className="pt-2.5 border-t border-stone-200/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">Starting From</span>
            <span className="text-sm font-bold text-stone-900">{priceDisplay}</span>
          </div>

          <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Get Tickets &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
