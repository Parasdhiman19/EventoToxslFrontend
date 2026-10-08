import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  MapPin,
  Calendar,
  X,
  Compass,
  Flame,
  Clock,
  TrendingUp,
  AlignLeft,
  Search,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import API from '../../services/api'

/* ─── Category colour map ─── */
const CAT_COLORS = {
  music:      'bg-violet-500/20 text-violet-200 border-violet-400/30',
  concert:    'bg-violet-500/20 text-violet-200 border-violet-400/30',
  tech:       'bg-blue-500/20   text-blue-200   border-blue-400/30',
  conference: 'bg-blue-500/20   text-blue-200   border-blue-400/30',
  food:       'bg-orange-500/20 text-orange-200 border-orange-400/30',
  art:        'bg-pink-500/20   text-pink-200   border-pink-400/30',
  sports:     'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  default:    'bg-white/15      text-white      border-white/20',
}

function catColor(cat = '') {
  const key = cat.toLowerCase()
  return CAT_COLORS[key] || CAT_COLORS.default
}

/* ─── Responsive Saved Event Card ─── */
function SavedCard({ ev, onRemove, isRemoving }) {
  const [imgError, setImgError] = useState(false)
  const catCls = catColor(ev.category)

  return (
    <div
      className={`group transition-all duration-300 ${
        isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <Link
        to={`/events/${ev.id}`}
        className="flex flex-col h-full rounded-2xl overflow-hidden bg-white shadow-2xs border border-stone-200/80
                   hover:shadow-xl hover:border-stone-300 hover:-translate-y-1
                   transition-all duration-300"
      >
        {/* ── Image Zone ── */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-stone-100 shrink-0">
          <img
            src={!imgError ? (ev.image || ev.banner || '/emptybanner.jpg') : '/emptybanner.jpg'}
            alt={ev.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* subtle scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          {/* Top category & unsave bookmark button */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-auto">
            {ev.category ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold
                            uppercase tracking-wider border backdrop-blur-md shadow-xs ${catCls} truncate max-w-[130px]`}
              >
                {ev.category}
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={(e) => onRemove(ev.id, e)}
              aria-label="Remove bookmark"
              title="Remove from saved"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                         bg-black/50 backdrop-blur-md text-amber-400 border border-white/20
                         hover:bg-red-600 hover:text-white hover:border-red-500
                         transition-all duration-200 cursor-pointer
                         shadow-md active:scale-90 shrink-0"
            >
              <Bookmark size={13} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* ── Metadata Zone Below Artwork ── */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-white">
          <div className="space-y-1">
            {/* Date */}
            {(ev.dateFormatted || ev.date) && (
              <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-semibold text-amber-600">
                <Calendar size={12} className="shrink-0 text-amber-500" />
                <span className="truncate">{ev.dateFormatted || ev.date}</span>
              </p>
            )}

            {/* Title */}
            <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2
                           group-hover:text-amber-600 transition-colors tracking-tight">
              {ev.title}
            </h3>

            {/* Venue & City */}
            {(ev.venueName || ev.venue || ev.city) && (
              <p className="flex items-center gap-1 text-[10px] sm:text-xs text-stone-500 font-mono truncate pt-0.5">
                <MapPin size={11} className="shrink-0 text-stone-400" />
                <span className="truncate">
                  {ev.venueName || ev.venue || ''}{ev.city ? `, ${ev.city}` : ''}
                </span>
              </p>
            )}
          </div>

          {/* Bottom row: Price & Passes */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-xs font-mono">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-stone-400 uppercase">From</span>
              <span className="font-bold text-stone-900 text-xs sm:text-sm">
                {ev.startingPrice || 'Free'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform">
              Passes &rarr;
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

/* ─── Shimmer skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-2xs">
      <div className="w-full aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden bg-stone-200">
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
                     bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </div>
      <div className="p-3 sm:p-3.5 space-y-2 bg-white">
        <div className="h-2.5 w-1/3 bg-stone-200 rounded-full" />
        <div className="h-3.5 w-4/5 bg-stone-200 rounded-full" />
        <div className="h-2.5 w-1/2 bg-stone-100 rounded-full" />
      </div>
    </div>
  )
}

/* ─── Sort/Filter chip row ─── */
const SORT_OPTIONS = [
  { label: 'Recent',  value: 'newest',    icon: Clock },
  { label: 'Soonest', value: 'date_asc',  icon: Flame },
  { label: 'Price ↑', value: 'price_asc', icon: TrendingUp },
  { label: 'A → Z',   value: 'alpha',     icon: AlignLeft },
]

/* ═══════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════ */
export default function Saved() {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [sortBy, setSortBy]         = useState('newest')
  const [search, setSearch]         = useState('')
  const [removingIds, setRemovingIds] = useState(new Set())
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  /* Close modal on Escape key */
  useEffect(() => {
    if (!showClearConfirm) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowClearConfirm(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showClearConfirm])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const res = await API.get('events/saved/')
        if (isMounted && Array.isArray(res.data)) setBookmarkedEvents(res.data)
      } catch (err) {
        if (isMounted) setFetchError(err.response?.data?.detail || 'Could not load saved stages.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  /* Animated remove */
  const removeBookmark = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setRemovingIds((prev) => new Set([...prev, id]))
    await new Promise((r) => setTimeout(r, 280)) // wait for fade-out
    setBookmarkedEvents((prev) => prev.filter((item) => item.id !== id))
    setRemovingIds((prev) => {
      const n = new Set(prev)
      n.delete(id)
      return n
    })
    try {
      await API.post(`events/${id}/bookmark/`)
    } catch {
      // ignore network failure on background bookmark toggle
    }
  }

  const clearAll = async () => {
    setIsClearing(true)
    setShowClearConfirm(false)
    setBookmarkedEvents([])
    try {
      await API.delete('events/saved/clear/')
    } catch {
      // ignore network failure on background clear
    } finally {
      setIsClearing(false)
    }
  }

  /* Search + Sort */
  const filtered = bookmarkedEvents.filter((ev) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (ev.title || '').toLowerCase().includes(q) ||
      (ev.venueName || ev.venue || '').toLowerCase().includes(q) ||
      (ev.city || '').toLowerCase().includes(q) ||
      (ev.category || '').toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'alpha') return (a.title || '').localeCompare(b.title || '')
    if (sortBy === 'price_asc') {
      const pa = parseFloat((a.startingPrice || '0').replace(/[^\d.]/g, '')) || 0
      const pb = parseFloat((b.startingPrice || '0').replace(/[^\d.]/g, '')) || 0
      return pa - pb
    }
    if (sortBy === 'date_asc') return new Date(a.date || 0) - new Date(b.date || 0)
    return 0
  })

  return (
    <>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer { to { transform: translateX(200%) } }
      `}</style>

      <div className="max-w-7xl mx-auto pb-20 md:pb-10">
        {/* ══ HERO HEADER ═══════════════════════════════════════════ */}
        <div
          className="relative overflow-hidden
                     rounded-none sm:rounded-2xl
                     bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950
                     px-4 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8
                     shadow-xl
                     -mx-2.5 sm:mx-0 -mt-2.5 sm:mt-0 mb-6"
        >
          {/* ambient glows */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-rose-500/8 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-indigo-500/8 blur-2xl" />

          {/* Content */}
          <div className="relative">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             text-[10px] font-mono font-bold uppercase tracking-widest
                             text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-2.5"
                >
                  <Bookmark className="w-3 h-3" fill="currentColor" />
                  Your Collection
                </div>
                <h1
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight
                             text-white leading-tight"
                >
                  Saved Stages
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 leading-relaxed max-w-md">
                  Bookmark events to track ticket drops, price updates &amp; plan your calendar.
                </p>
              </div>

              {/* Count + Clear */}
              {!isLoading && bookmarkedEvents.length > 0 && (
                <div className="flex items-center sm:flex-col sm:items-end gap-2.5 shrink-0 self-start sm:self-auto">
                  {/* Count badge */}
                  <div
                    className="px-3.5 py-1.5 rounded-2xl bg-white/8 border border-white/10
                                text-center backdrop-blur-sm flex items-center sm:block gap-2"
                  >
                    <p className="text-xl sm:text-2xl font-extrabold font-mono text-white leading-none">
                      {bookmarkedEvents.length}
                    </p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 sm:mt-0.5">
                      saved
                    </p>
                  </div>

                  {/* Clear All trigger button */}
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                               bg-red-500/10 hover:bg-red-500/20
                               border border-red-500/30 hover:border-red-500/50
                               text-red-400 hover:text-red-300
                               text-[11px] font-mono font-bold
                               transition-all duration-200 cursor-pointer active:scale-95
                               shadow-sm shadow-red-950/20"
                  >
                    <Trash2 size={12} className="group-hover:rotate-12 transition-transform duration-200" />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* ── Inline search bar (nicely constrained on desktop) ── */}
            {!isLoading && bookmarkedEvents.length > 0 && (
              <div className="relative max-w-md">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by name, venue, city…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl
                             bg-white/8 border border-white/12 backdrop-blur-sm
                             text-xs sm:text-sm text-white placeholder:text-stone-500
                             focus:outline-none focus:ring-2 focus:ring-amber-400/30
                             focus:border-amber-400/40 focus:bg-white/12
                             transition-all font-mono"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400
                               hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ SORT CHIPS ════════════════════════════════════════════ */}
        {!isLoading && sorted.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            {/* Result count */}
            <p className="text-xs sm:text-sm text-stone-500 font-mono shrink-0">
              {search ? (
                <>
                  <span className="text-stone-800 font-bold">{sorted.length}</span> of {bookmarkedEvents.length} results
                </>
              ) : (
                <>
                  <span className="text-stone-800 font-bold">{sorted.length}</span> experiences saved
                </>
              )}
            </p>

            {/* Sort chip row */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = sortBy === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                text-[11px] sm:text-xs font-mono font-semibold transition-all cursor-pointer
                                ${
                                  active
                                    ? 'bg-stone-900 text-white shadow-sm'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 shadow-xs'
                                }`}
                  >
                    <Icon size={12} />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ CONTENT ═══════════════════════════════════════════════ */}
        {isLoading ? (
          /* Shimmer skeleton grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="font-semibold text-red-700 text-sm">{fetchError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-mono cursor-pointer shadow-sm hover:bg-stone-800 active:scale-95 transition-all"
            >
              Try again
            </button>
          </div>
        ) : sorted.length > 0 ? (
          /* ── Responsive Event Grid ── */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {sorted.map((ev) => (
              <SavedCard
                key={ev.id}
                ev={ev}
                onRemove={removeBookmark}
                isRemoving={removingIds.has(ev.id)}
              />
            ))}
          </div>
        ) : bookmarkedEvents.length > 0 ? (
          /* No search results */
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 text-sm">No matches for &ldquo;{search}&rdquo;</p>
              <p className="text-xs text-stone-500 mt-1">Try a different event name or city.</p>
            </div>
            <button
              onClick={() => setSearch('')}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-mono cursor-pointer shadow-sm hover:bg-stone-800 transition-all active:scale-95"
            >
              Clear filter
            </button>
          </div>
        ) : (
          /* Empty state */
          <div
            className="rounded-2xl border border-dashed border-stone-200 bg-white
                            p-10 sm:p-16 text-center space-y-6"
          >
            {/* Decorative stacked bookmark icons */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-2 rounded-2xl bg-stone-100 rotate-6" />
              <div className="absolute inset-2 rounded-2xl bg-stone-200 -rotate-3" />
              <div
                className="relative w-full h-full rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700
                                text-amber-400 flex items-center justify-center shadow-xl"
              >
                <Bookmark size={32} fill="currentColor" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-xl font-bold text-stone-900">Nothing saved yet</p>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
                Tap the bookmark icon on any event to save it here. We&apos;ll remind you before tickets sell out.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3
                           text-xs font-mono font-bold uppercase tracking-wider text-white
                           hover:bg-stone-800 transition-all shadow-md active:scale-95"
              >
                <Compass size={14} className="text-amber-400" />
                Explore Events
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3
                           text-xs font-mono font-semibold text-stone-600 hover:bg-stone-50
                           transition-all shadow-sm active:scale-95"
              >
                Go Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ══ CLEAR ALL CONFIRMATION MODAL ══ */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-all-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6
                     bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl
                       bg-stone-900 border border-stone-800
                       p-5 sm:p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-red-600/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-amber-600/10 blur-3xl" />

            {/* Close 'X' button */}
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white
                         hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            {/* Header with warning icon */}
            <div className="flex items-start gap-3.5 mb-4">
              <div
                className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30
                                text-red-400 flex items-center justify-center shrink-0 shadow-inner"
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 id="clear-all-dialog-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                  Clear All Saved Events?
                </h3>
                <p className="text-[10px] font-mono font-semibold text-red-400/90 uppercase tracking-wider mt-0.5">
                  Action cannot be undone
                </p>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/8 mb-5 text-xs text-stone-300 leading-relaxed space-y-1.5">
              <p>
                Are you sure you want to remove all{' '}
                <strong className="text-white font-semibold">
                  {bookmarkedEvents.length} {bookmarkedEvents.length === 1 ? 'event' : 'events'}
                </strong>{' '}
                from your saved collection?
              </p>
              <p className="text-[11px] text-stone-400">
                You will lose track of price drops and dates for these bookmarked stages.
              </p>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800/80
                           text-xs font-mono font-semibold text-stone-300 hover:text-white hover:bg-stone-800
                           transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={isClearing}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl
                           bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500
                           text-xs font-mono font-bold text-white transition-all
                           shadow-lg shadow-red-900/30 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isClearing ? 'Clearing…' : 'Yes, Clear All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}