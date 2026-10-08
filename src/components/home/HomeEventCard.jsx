import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Calendar, MapPin, Bookmark, Flame } from 'lucide-react'
import { toggleEventBookmark } from '../../services/socialApi'
import { useAuthPrompt } from '../../context/AuthPromptContext'

const DEFAULT_BANNER = '/emptybanner.jpg'

export default function HomeEventCard({
  event,
  onBookmarkChange,
  className = '',
}) {
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const { openAuthPrompt } = useAuthPrompt()
  const [imageError, setImageError] = useState(false)
  const [logoError, setLogoError] = useState(false)
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
  const organizerName = event.organizer || ''
  const organizerLogo = !logoError && (event.organizerLogo || event.organizer_logo)

  const handleToggleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'bookmark',
        title: 'Save to Your Wishlist',
        subtitle: `Sign in to bookmark "${event.title || 'this experience'}" and get notified before tickets run out.`,
      })
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
      draggable={false}
      className={`group flex flex-col w-full select-none cursor-pointer active:scale-[0.98] transition-transform duration-150 ${className}`}
    >
      {/* 1. Rectangular Artwork Tile with Sharp/Squarish Border Radius */}
      <div className="relative aspect-[16/10] w-full rounded-md sm:rounded-lg overflow-hidden bg-stone-100 border border-stone-200/90 shadow-2xs group-hover:shadow-md group-hover:border-stone-300 transition-all duration-300">
        <img
          src={imageUrl}
          alt={event.title || 'Event'}
          onError={() => setImageError(true)}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
        />

        {/* Subtle Top Gradient for Badge Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />

        {/* Floating Top Elements: Category & Bookmark with Squarish Corners */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-auto">
          {event.category ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider bg-black/65 backdrop-blur-md text-white border border-white/20 shadow-xs truncate max-w-[130px]">
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
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border border-white/20 backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xs ${isBookmarked
                ? 'bg-amber-500 text-white'
                : 'bg-black/50 text-white hover:bg-black/70'
              }`}
          >
            <Bookmark className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Low Inventory Alert on Image (if active) */}
        {isUrgent && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-rose-600/90 backdrop-blur-md border border-rose-400/30 text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-xs">
            <Flame className="w-2.5 h-2.5 animate-pulse" />
            <span>{event.spotsLeft} left</span>
          </div>
        )}
      </div>

      {/* 2. Clean Typography & Metadata Flow Below Image */}
      <div className="pt-2 px-0.5 space-y-0.5">
        {/* Date & Time Kicker (Clean neutral/blue) */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-blue-600">
          <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="truncate">{event.dateFormatted || event.date || 'Upcoming'}</span>
        </div>

        {/* Bold Event Title */}
        <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors tracking-tight">
          {event.title}
        </h3>

        {/* Venue & Location */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 line-clamp-1 pt-0.5">
          <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
          <span className="truncate">{venueDisplay}</span>
        </div>

        {/* Price & Action Row */}
        <div className="pt-1 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-stone-400 uppercase font-mono">From</span>
            <span className="text-xs sm:text-sm font-bold text-stone-900">{priceDisplay}</span>
          </div>

          <span className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all shrink-0">
            Passes &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
