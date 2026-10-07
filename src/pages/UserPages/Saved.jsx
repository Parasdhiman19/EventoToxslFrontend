import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  MapPin,
  Calendar,
  X,
  Compass,
  ChevronDown,
  Flame,
  Clock,
  TrendingUp,
  AlignLeft,
  Search,
} from 'lucide-react'
import API from '../../services/api'

/* ─── Aspect-ratio pool for Pinterest variety ─── */
const ASPECTS = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[2/3]',
  'aspect-[3/4]',
  'aspect-[1/1]',
  'aspect-[4/5]',
]

/* ─── Category colour map ─── */
const CAT_COLORS = {
  music:     'bg-violet-500/20 text-violet-200 border-violet-400/30',
  concert:   'bg-violet-500/20 text-violet-200 border-violet-400/30',
  tech:      'bg-blue-500/20   text-blue-200   border-blue-400/30',
  conference:'bg-blue-500/20   text-blue-200   border-blue-400/30',
  food:      'bg-orange-500/20 text-orange-200 border-orange-400/30',
  art:       'bg-pink-500/20   text-pink-200   border-pink-400/30',
  sports:    'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  default:   'bg-white/15      text-white      border-white/20',
}
function catColor(cat = '') {
  const key = cat.toLowerCase()
  return CAT_COLORS[key] || CAT_COLORS.default
}

/* ─── Individual Pinterest Card ─── */
function SavedCard({ ev, index, onRemove, isRemoving }) {
  const [imgError, setImgError] = useState(false)
  const aspect = ASPECTS[index % ASPECTS.length]
  const catCls = catColor(ev.category)

  return (
    <div
      className={`break-inside-avoid mb-3 sm:mb-3.5 group transition-all duration-300
        ${isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
    >
      <Link
        to={`/events/${ev.id}`}
        className="block rounded-2xl overflow-hidden bg-stone-100 shadow-sm ring-1 ring-stone-200/60
                   hover:shadow-2xl hover:ring-stone-300 hover:-translate-y-1
                   transition-all duration-300"
      >
        {/* ── Image zone ── */}
        <div className={`relative w-full ${aspect} overflow-hidden`}>
          <img
            src={!imgError ? (ev.image || ev.banner || '/emptybanner.jpg') : '/emptybanner.jpg'}
            alt={ev.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover
                       group-hover:scale-[1.07] transition-transform duration-700 ease-out"
          />

          {/* multi-stop scrim */}
          <div className="absolute inset-0 bg-gradient-to-t
                          from-black/85 via-black/10 to-transparent" />
          {/* subtle vignette on sides */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />

          {/* ── Top: category + unsave ── */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1">
            {ev.category ? (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold
                                uppercase tracking-widest border backdrop-blur-sm ${catCls}`}>
                {ev.category}
              </span>
            ) : <span />}

            <button
              type="button"
              onClick={(e) => onRemove(ev.id, e)}
              aria-label="Remove bookmark"
              className="flex-shrink-0 p-2 rounded-full
                         bg-black/40 backdrop-blur-md
                         text-amber-400 border border-white/10
                         hover:bg-red-500 hover:text-white hover:border-red-400/50
                         transition-all duration-200 cursor-pointer
                         shadow-lg active:scale-90 active:rotate-12"
            >
              <Bookmark size={10} fill="currentColor" />
            </button>
          </div>

          {/* ── Bottom: title glasscard + meta ── */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            {/* Glassmorphism title pill */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl px-2.5 py-2
                            border border-white/10 shadow-lg">
              <h3 className="font-serif text-[11px] sm:text-xs font-bold text-white
                             leading-snug line-clamp-2 mb-1.5">
                {ev.title}
              </h3>
              <div className="flex items-center justify-between gap-1 flex-wrap">
                {/* Date */}
                {(ev.dateFormatted || ev.date) && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-white/70">
                    <Calendar size={7} className="shrink-0" />
                    {ev.dateFormatted || ev.date}
                  </span>
                )}
                {/* Price */}
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold
                                 bg-amber-400 text-stone-900 shadow-sm leading-none">
                  {ev.startingPrice || 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Text footer ── */}
        {(ev.venueName || ev.venue || ev.city) && (
          <div className="bg-white px-3 py-2">
            <p className="flex items-center gap-1 text-[10px] text-stone-400 font-mono truncate">
              <MapPin size={8} className="shrink-0 text-stone-300" />
              <span className="truncate">
                {ev.venueName || ev.venue || ''}{ev.city ? `, ${ev.city}` : ''}
              </span>
            </p>
          </div>
        )}
      </Link>
    </div>
  )
}

/* ─── Shimmer skeleton card ─── */
function SkeletonCard({ index }) {
  const aspect = ASPECTS[index % ASPECTS.length]
  return (
    <div className="break-inside-avoid mb-3 sm:mb-3.5 rounded-2xl overflow-hidden bg-white ring-1 ring-stone-200/60 shadow-sm">
      <div className={`w-full ${aspect} relative overflow-hidden bg-stone-200`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
                        bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
      <div className="px-3 py-2 space-y-1.5 bg-white">
        <div className="h-2.5 w-4/5 bg-stone-200 rounded-full" />
        <div className="h-2 w-3/5 bg-stone-100 rounded-full" />
      </div>
    </div>
  )
}

/* ─── Sort/Filter chip row ─── */
const SORT_OPTIONS = [
  { label: 'Recent',   value: 'newest',    icon: Clock },
  { label: 'Soonest',  value: 'date_asc',  icon: Flame },
  { label: 'Price ↑',  value: 'price_asc', icon: TrendingUp },
  { label: 'A → Z',    value: 'alpha',     icon: AlignLeft },
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

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true); setFetchError(null)
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
    e.preventDefault(); e.stopPropagation()
    setRemovingIds(prev => new Set([...prev, id]))
    await new Promise(r => setTimeout(r, 280)) // wait for fade-out
    setBookmarkedEvents(prev => prev.filter(item => item.id !== id))
    setRemovingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    try { await API.post(`events/${id}/bookmark/`) } catch {}
  }

  const clearAll = async () => {
    setBookmarkedEvents([])
    try { await API.delete('events/saved/clear/') } catch {}
  }

  /* Search + Sort */
  const filtered = bookmarkedEvents.filter(ev => {
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
    if (sortBy === 'alpha')     return (a.title||'').localeCompare(b.title||'')
    if (sortBy === 'price_asc') {
      const pa = parseFloat((a.startingPrice||'0').replace(/[^\d.]/g,'')) || 0
      const pb = parseFloat((b.startingPrice||'0').replace(/[^\d.]/g,'')) || 0
      return pa - pb
    }
    if (sortBy === 'date_asc')  return new Date(a.date||0) - new Date(b.date||0)
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
        <div className="relative overflow-hidden
                        rounded-none md:rounded-2xl
                        bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950
                        px-4 pt-6 pb-5 sm:px-6 sm:pt-8 sm:pb-7
                        shadow-xl
                        -mx-2.5 sm:mx-0 -mt-2.5 sm:mt-0 mb-4 md:mb-6">

          {/* ambient glows */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-rose-500/6 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-indigo-500/5 blur-2xl" />

          {/* Content */}
          <div className="relative">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                text-[10px] font-mono font-bold uppercase tracking-widest
                                text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-3">
                  <Bookmark className="w-3 h-3" fill="currentColor" />
                  Your Collection
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight
                               text-white leading-tight">
                  Saved Stages
                </h1>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed max-w-xs">
                  Bookmark events to track ticket drops &amp; plan your calendar.
                </p>
              </div>

              {/* Count + Clear */}
              {!isLoading && bookmarkedEvents.length > 0 && (
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-2xl bg-white/8 border border-white/10
                                  text-center backdrop-blur-sm">
                    <p className="text-2xl font-extrabold font-mono text-white leading-none">
                      {bookmarkedEvents.length}
                    </p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-stone-500 mt-0.5">
                      saved
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl
                               border border-red-500/25 bg-red-500/8 text-red-400
                               hover:bg-red-500/18 text-[10px] font-mono font-semibold
                               transition-all cursor-pointer active:scale-95"
                  >
                    <X size={10} />
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* ── Inline search bar ── */}
            {!isLoading && bookmarkedEvents.length > 0 && (
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by name, venue, city…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl
                             bg-white/8 border border-white/12 backdrop-blur-sm
                             text-xs text-white placeholder:text-stone-500
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
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ SORT CHIPS ════════════════════════════════════════════ */}
        {!isLoading && sorted.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            {/* Result count */}
            <p className="text-xs text-stone-500 font-mono shrink-0">
              {search ? (
                <><span className="text-stone-700 font-semibold">{sorted.length}</span> of {bookmarkedEvents.length}</>
              ) : (
                <><span className="text-stone-700 font-semibold">{sorted.length}</span> saved</>
              )}
            </p>

            {/* Sort chip row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SORT_OPTIONS.map(opt => {
                const Icon = opt.icon
                const active = sortBy === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full
                                text-[10px] font-mono font-semibold transition-all cursor-pointer
                                ${active
                                  ? 'bg-stone-900 text-white shadow-sm'
                                  : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 shadow-sm'
                                }`}
                  >
                    <Icon size={9} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ CONTENT ═══════════════════════════════════════════════ */}
        {isLoading ? (
          /* Shimmer masonry skeleton */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-3.5">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
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
          /* ── Pinterest Masonry ── */
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-3.5">
            {sorted.map((ev, i) => (
              <SavedCard
                key={ev.id}
                ev={ev}
                index={i}
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
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white
                          p-10 sm:p-16 text-center space-y-6">
            {/* Decorative stacked bookmark icons */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-2 rounded-2xl bg-stone-100 rotate-6" />
              <div className="absolute inset-2 rounded-2xl bg-stone-200 -rotate-3" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700
                              text-amber-400 flex items-center justify-center shadow-xl">
                <Bookmark size={32} fill="currentColor" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-xl font-bold text-stone-900">Nothing saved yet</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
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
    </>
  )
}