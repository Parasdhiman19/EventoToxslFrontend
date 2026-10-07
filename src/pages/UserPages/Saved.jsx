import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  Sparkles,
  MapPin,
  Calendar,
  X,
  Compass,
  ArrowUpDown,
} from 'lucide-react'
import API from '../../services/api'

// Deterministically pick aspect ratio per card for Pinterest variety
const ASPECT_RATIOS = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-[2/3]', 'aspect-square', 'aspect-[3/4]']

function SavedCard({ ev, index, onRemove }) {
  const [imgError, setImgError] = useState(false)
  const aspect = ASPECT_RATIOS[index % ASPECT_RATIOS.length]

  return (
    <div className="break-inside-avoid mb-3 sm:mb-4 group relative">
      <Link
        to={`/events/${ev.id}`}
        className="block rounded-2xl overflow-hidden bg-stone-200 shadow-sm
                   hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
      >
        {/* Image with overlay */}
        <div className={`relative w-full ${aspect} overflow-hidden`}>
          <img
            src={!imgError ? (ev.image || ev.banner || '/emptybanner.jpg') : '/emptybanner.jpg'}
            alt={ev.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient scrim — bottom text overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top row: Category pill + Remove button */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
            {ev.category && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold
                               uppercase tracking-widest bg-white/15 backdrop-blur-sm
                               text-white border border-white/20">
                {ev.category}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => onRemove(ev.id, e)}
              aria-label="Remove bookmark"
              className="ml-auto p-1.5 rounded-full bg-stone-900/70 backdrop-blur-sm
                         text-amber-400 hover:bg-red-600 hover:text-white
                         transition-all duration-200 cursor-pointer
                         shadow-sm active:scale-90"
            >
              <Bookmark size={11} fill="currentColor" />
            </button>
          </div>

          {/* Bottom overlay: Date pill */}
          {(ev.dateFormatted || ev.date) && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               text-[9px] font-mono text-white/90 bg-black/40 backdrop-blur-sm">
                <Calendar size={8} className="shrink-0" />
                {ev.dateFormatted || ev.date}
              </span>
            </div>
          )}

          {/* Price badge — bottom right */}
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold
                             bg-amber-400 text-stone-900 shadow-sm">
              {ev.startingPrice || 'Free'}
            </span>
          </div>
        </div>

        {/* Card text body */}
        <div className="bg-white px-3 py-2.5">
          <h3 className="font-serif text-xs sm:text-sm font-semibold text-stone-900
                         leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors">
            {ev.title}
          </h3>
          {(ev.venueName || ev.venue) && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-stone-400 font-mono truncate">
              <MapPin size={9} className="shrink-0 text-stone-300" />
              {ev.venueName || ev.venue}
              {ev.city ? `, ${ev.city}` : ''}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

// Masonry skeleton card
function SkeletonCard({ index }) {
  const aspect = ASPECT_RATIOS[index % ASPECT_RATIOS.length]
  return (
    <div className="break-inside-avoid mb-3 sm:mb-4 rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className={`w-full ${aspect} bg-stone-200`} />
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="h-3 w-4/5 bg-stone-200 rounded" />
        <div className="h-2.5 w-3/5 bg-stone-100 rounded" />
      </div>
    </div>
  )
}

const SORT_OPTIONS = [
  { label: 'Newest saved', value: 'newest' },
  { label: 'Date: soonest', value: 'date_asc' },
  { label: 'Price: low–high', value: 'price_asc' },
  { label: 'A → Z', value: 'alpha' },
]

export default function Saved() {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchSavedEvents = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const res = await API.get('events/saved/')
        if (isMounted && Array.isArray(res.data)) {
          setBookmarkedEvents(res.data)
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.detail || 'Could not load bookmarked stages.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchSavedEvents()
    return () => { isMounted = false }
  }, [])

  const removeBookmark = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarkedEvents((prev) => prev.filter((item) => item.id !== id))
    try {
      await API.post(`events/${id}/bookmark/`)
    } catch {
      // optimistic update — ignore error
    }
  }

  const clearAllBookmarks = async () => {
    setBookmarkedEvents([])
    try {
      await API.delete('events/saved/clear/')
    } catch { }
  }

  // Sort logic (client-side)
  const sortedEvents = [...bookmarkedEvents].sort((a, b) => {
    if (sortBy === 'alpha') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'price_asc') {
      const pa = parseFloat((a.startingPrice || '0').replace(/[^\d.]/g, '')) || 0
      const pb = parseFloat((b.startingPrice || '0').replace(/[^\d.]/g, '')) || 0
      return pa - pb
    }
    if (sortBy === 'date_asc') {
      return new Date(a.date || 0) - new Date(b.date || 0)
    }
    return 0 // newest = API order
  })

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'

  return (
    <div className="max-w-7xl mx-auto pb-20 md:pb-10">

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden
                   rounded-none md:rounded-2xl
                   bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950
                   px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8
                   shadow-xl
                   -mx-2.5 sm:mx-0 -mt-2.5 sm:mt-0 mb-5 md:mb-7"
      >
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-pink-500/8 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            text-[10px] font-mono font-semibold uppercase tracking-widest
                            text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-3">
              <Bookmark className="w-3 h-3" fill="currentColor" />
              Your Collection
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Saved Stages
            </h1>
            <p className="text-xs text-stone-400 mt-1.5 max-w-sm leading-relaxed">
              Experiences, talks &amp; live stages you&apos;re monitoring for ticket drops.
            </p>
          </div>

          {/* Stats + Clear */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {!isLoading && bookmarkedEvents.length > 0 && (
              <>
                <div className="text-center">
                  <p className="text-xl font-bold font-mono text-white">{bookmarkedEvents.length}</p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wide font-mono">Saved</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <button
                  type="button"
                  onClick={clearAllBookmarks}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
                             border border-red-500/30 bg-red-500/10 text-red-400
                             hover:bg-red-500/20 text-xs font-mono font-medium
                             transition-all cursor-pointer active:scale-95"
                >
                  <X size={12} />
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Sort bar (only when events exist) ───────────────────────── */}
      {!isLoading && sortedEvents.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-0.5">
          <p className="text-xs text-stone-500 font-mono">
            <span className="font-semibold text-stone-700">{sortedEvents.length}</span> saved experience{sortedEvents.length !== 1 ? 's' : ''}
          </p>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu(p => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200
                         bg-white text-xs font-mono text-stone-600 hover:bg-stone-50 shadow-sm
                         transition-colors cursor-pointer"
            >
              <ArrowUpDown size={12} className="text-stone-400" />
              {currentSortLabel}
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-stone-200
                              shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-mono transition-colors cursor-pointer
                      ${sortBy === opt.value
                        ? 'text-stone-900 font-semibold bg-stone-50'
                        : 'text-stone-600 hover:bg-stone-50'
                      }`}
                  >
                    {sortBy === opt.value ? '✓ ' : ''}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      {isLoading ? (
        /* Loading — masonry skeleton */
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      ) : fetchError ? (
        /* Error state */
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="font-semibold text-red-700 text-sm">{fetchError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : sortedEvents.length > 0 ? (
        /* Pinterest masonry grid */
        <div
          className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4"
          onClick={() => showSortMenu && setShowSortMenu(false)}
        >
          {sortedEvents.map((ev, i) => (
            <SavedCard
              key={ev.id}
              ev={ev}
              index={i}
              onRemove={removeBookmark}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white
                        p-10 sm:p-16 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700
                          text-amber-400 flex items-center justify-center shadow-lg">
            <Bookmark size={28} />
          </div>
          <div className="space-y-1.5">
            <p className="font-serif text-lg font-semibold text-stone-900">No saved stages yet</p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Bookmark upcoming concerts, summits &amp; gatherings to track ticket availability.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5
                       text-xs font-mono font-semibold uppercase tracking-wider text-white
                       hover:bg-stone-800 transition-colors shadow-sm active:scale-95"
          >
            <Compass size={13} className="text-amber-400" />
            Explore Events &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}