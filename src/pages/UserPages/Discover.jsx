import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Ticket,
  Search,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Filter,
  SlidersHorizontal,
  X
} from 'lucide-react'
import API from '../../services/api'
import { toggleEventBookmark } from '../../services/socialApi'
import FeedLeftSidebar from '../../components/feed/FeedLeftSidebar'
import FeedRightSidebar from '../../components/feed/FeedRightSidebar'
import FeedEventCard from '../../components/feed/FeedEventCard'
import FeedSkeleton from '../../components/feed/FeedSkeleton'
import CommentDrawer from '../../components/feed/CommentDrawer'

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || 'All'
  const initialCity = searchParams.get('city') || 'All Cities'
  const initialSort = searchParams.get('sort') || 'upcoming'

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [sortBy, setSortBy] = useState(initialSort)
  const [bookmarkedIds, setBookmarkedIds] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [mobileCommentEvent, setMobileCommentEvent] = useState(null)

  // Paginated Feed State
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  const sentinelRef = useRef(null)
  const isFetchingRef = useRef(false)
  const debounceTimerRef = useRef(null)
  const mobileFeedContainerRef = useRef(null)

  // Sync URL query params externally (e.g. from header search bar)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q)
    }
    const cat = searchParams.get('category')
    if (cat !== null && cat !== selectedCategory) {
      setSelectedCategory(cat)
    }
    const city = searchParams.get('city')
    if (city !== null && city !== selectedCity) {
      setSelectedCity(city)
    }
    const s = searchParams.get('sort')
    if (s !== null && s !== sortBy) {
      setSortBy(s)
    }
  }, [searchParams])

  // Dynamic city list derived from available events
  const cities = useMemo(() => {
    const list = ['All Cities']
    events.forEach((ev) => {
      const c = ev.city || (ev.is_online ? 'Virtual Stream' : null)
      if (c && !list.includes(c)) {
        list.push(c)
      }
    })
    return list
  }, [events])

  // Fetch paginated events from backend
  const fetchEvents = useCallback(
    async (pageNum, isReset = false) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      if (isReset) {
        setIsLoadingInitial(true)
        setFetchError(null)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const params = {
          page: pageNum,
          page_size: 8,
          sort: sortBy,
        }
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory
        }
        if (selectedCity && selectedCity !== 'All Cities') {
          params.city = selectedCity
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim()
        }

        const res = await API.get('events/', { params })
        const data = res.data

        let fetchedList = []
        let moreAvailable = false
        let total = 0

        if (data && Array.isArray(data.results)) {
          fetchedList = data.results
          moreAvailable = !!data.hasMore
          total = data.count || 0
        } else if (Array.isArray(data)) {
          fetchedList = data
          moreAvailable = false
          total = data.length
        }

        if (isReset) {
          setEvents(fetchedList)
          setPage(1)
          if (fetchedList.length > 0) {
            setActiveEvent(fetchedList[0])
          }
        } else {
          setEvents((prev) => {
            const existingIds = new Set(prev.map((e) => e.id))
            const newUnique = fetchedList.filter((e) => !existingIds.has(e.id))
            return [...prev, ...newUnique]
          })
          setPage(pageNum)
        }

        setHasMore(moreAvailable)
        setTotalCount(total)

        // Seed bookmarks from data
        const bookmarked = fetchedList.filter((e) => e.isBookmarked).map((e) => String(e.id))
        if (bookmarked.length > 0) {
          setBookmarkedIds((prev) => Array.from(new Set([...prev, ...bookmarked])))
        }
      } catch (err) {
        if (isReset) {
          setFetchError(err.response?.data?.detail || 'Unable to retrieve live experiences.')
        }
      } finally {
        setIsLoadingInitial(false)
        setIsLoadingMore(false)
        isFetchingRef.current = false
      }
    },
    [selectedCategory, selectedCity, searchQuery, sortBy]
  )

  // Reset and fetch whenever filters change
  useEffect(() => {
    fetchEvents(1, true)
  }, [fetchEvents])

  // Setup IntersectionObserver for Infinite Scrolling (Bottom Sentinel)
  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isFetchingRef.current && !isLoadingInitial) {
          fetchEvents(page + 1, false)
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0.1,
      }
    )

    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, page, isLoadingInitial, fetchEvents])

  // Auto-switch Active Event in Viewport as user scrolls / snaps
  useEffect(() => {
    if (events.length === 0) return

    const cardElements = document.querySelectorAll('.feed-event-card')
    if (!cardElements || cardElements.length === 0) return

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventId = entry.target.getAttribute('data-event-id')
            if (eventId) {
              const matched = events.find((e) => String(e.id) === String(eventId))
              if (matched) {
                setActiveEvent(matched)
              }
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '-15% 0px -15% 0px',
        threshold: 0.4,
      }
    )

    cardElements.forEach((el) => scrollObserver.observe(el))

    return () => {
      scrollObserver.disconnect()
    }
  }, [events])

  // Real backend Bookmark toggle with optimistic update
  const toggleBookmark = async (id, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const strId = String(id)
    const isCurrentlyBookmarked = bookmarkedIds.includes(strId)

    // Optimistic UI
    setBookmarkedIds((prev) =>
      isCurrentlyBookmarked ? prev.filter((item) => item !== strId) : [...prev, strId]
    )
    setEvents((prev) =>
      prev.map((item) => (String(item.id) === strId ? { ...item, isBookmarked: !isCurrentlyBookmarked } : item))
    )

    try {
      await toggleEventBookmark(id)
    } catch {
      // Revert on failure
      setBookmarkedIds((prev) =>
        isCurrentlyBookmarked ? [...prev, strId] : prev.filter((item) => item !== strId)
      )
      setEvents((prev) =>
        prev.map((item) => (String(item.id) === strId ? { ...item, isBookmarked: isCurrentlyBookmarked } : item))
      )
    }
  }

  // Handle social interaction updates on specific event
  const handleEventSocialUpdate = (eventId, patch) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, ...patch } : ev))
    )
    setActiveEvent((prev) => (prev?.id === eventId ? { ...prev, ...patch } : prev))
  }

  // Filter change handlers
  const handleSearchChange = (val) => {
    setSearchQuery(val)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (val.trim()) {
          next.set('q', val.trim())
        } else {
          next.delete('q')
        }
        return next
      })
    }, 300)
  }

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (catId !== 'All') {
        next.set('category', catId)
      } else {
        next.delete('category')
      }
      return next
    })
  }

  const handleCityChange = (cityVal) => {
    setSelectedCity(cityVal)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (cityVal !== 'All Cities') {
        next.set('city', cityVal)
      } else {
        next.delete('city')
      }
      return next
    })
  }

  const handleSortChange = (sortVal) => {
    setSortBy(sortVal)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (sortVal !== 'upcoming') {
        next.set('sort', sortVal)
      } else {
        next.delete('sort')
      }
      return next
    })
  }

  const handleResetFilters = () => {
    setSelectedCategory('All')
    setSelectedCity('All Cities')
    setSearchQuery('')
    setSortBy('upcoming')
    setSearchParams({})
  }

  return (
    <div className="font-sans">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP-ONLY HEADER (lg:)                                              */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between gap-4 pb-4 mb-5 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
              Live Stage Discovery
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-amber-400/15 text-amber-900 border border-amber-400/30 font-semibold inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Verified Feed
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Scroll through curated concerts, summits, art exhibits, and live experiences.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchEvents(1, true)}
            disabled={isLoadingInitial}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoadingInitial ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/manager/events/create"
            className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-mono font-semibold text-stone-50 hover:bg-black transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>+ Host Event</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOP FLOATING FILTER & REFRESH BAR (< lg)                        */}
      {/* ========================================================================= */}
      <div className="lg:hidden absolute top-20 right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="p-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition shadow-lg inline-flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {selectedCategory !== 'All' && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      {/* Mobile Filter Modal Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 p-4 sm:p-6 bg-black/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto p-5 rounded-3xl border border-stone-200 bg-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-base font-medium text-stone-900 flex items-center gap-2">
                <SlidersHorizontal size={15} />
                <span>Filters &amp; Sorting</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <FeedLeftSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                handleCategoryChange(cat)
                setIsMobileFilterOpen(false)
              }}
              selectedCity={selectedCity}
              onSelectCity={handleCityChange}
              cities={cities}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSelectSort={(sort) => {
                handleSortChange(sort)
                setIsMobileFilterOpen(false)
              }}
              onResetFilters={() => {
                handleResetFilters()
                setIsMobileFilterOpen(false)
              }}
              totalEventsCount={totalCount}
            />
          </div>
        </div>
      )}

      {/* 3. ERROR BANNER */}
      {fetchError && (
        <div className="p-4 m-4 rounded-2xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center justify-between shadow-2xs">
          <span>{fetchError}</span>
          <button
            type="button"
            onClick={() => fetchEvents(1, true)}
            className="font-mono underline font-medium cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN FEED CONTAINER: SNAP STREAM ON MOBILE, 3-COL ON DESKTOP           */}
      {/* ========================================================================= */}
      <div className="flex items-start gap-5 lg:gap-6 xl:gap-7 2xl:gap-8">
        
        {/* LEFT COLUMN: Sticky Filter Sidebar (Desktop >= 1024px) */}
        <div className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-20 self-start">
          <FeedLeftSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
            selectedCity={selectedCity}
            onSelectCity={handleCityChange}
            cities={cities}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSelectSort={handleSortChange}
            onResetFilters={handleResetFilters}
            totalEventsCount={totalCount}
          />
        </div>

        {/* MIDDLE COLUMN: Vertical Event Stream Feed */}
        <main
          ref={mobileFeedContainerRef}
          onScroll={(e) => {
            const top = e.currentTarget.scrollTop
            window.dispatchEvent(new CustomEvent('feedscroll', { detail: { scrollTop: top } }))
          }}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex-1 min-w-0 w-full max-w-3xl mx-auto h-[calc(100dvh-8rem)] overflow-y-scroll snap-y snap-mandatory scroll-smooth overscroll-contain no-scrollbar lg:h-auto lg:overflow-visible lg:snap-none lg:space-y-6 lg:pb-12"
        >
          
          {/* Initial Loading Skeletons */}
          {isLoadingInitial ? (
            <div className="h-full flex items-center justify-center p-6 space-y-4 lg:h-auto lg:block lg:space-y-6">
              <FeedSkeleton />
            </div>
          ) : events.length > 0 ? (
            /* Render Mobile Snap Reels / Desktop Stream */
            <>
              <div className="w-full flex flex-col lg:bg-white lg:rounded-2xl sm:lg:rounded-3xl lg:border lg:border-stone-200/80 lg:overflow-hidden lg:divide-y lg:divide-stone-100 lg:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)]">
                {events.map((ev) => (
                  <FeedEventCard
                    key={ev.id}
                    event={ev}
                    isActive={activeEvent?.id === ev.id}
                    isBookmarked={bookmarkedIds.includes(String(ev.id))}
                    onMouseEnter={() => setActiveEvent(ev)}
                    onToggleBookmark={toggleBookmark}
                    onOpenComments={(targetEv) => setMobileCommentEvent(targetEv)}
                    onEventSocialUpdate={handleEventSocialUpdate}
                  />
                ))}
              </div>

              {/* Pagination Sentinel for Infinite Scroll */}
              <div ref={sentinelRef} className="h-12 w-full snap-align-none flex items-center justify-center py-4">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-400 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <RefreshCw size={14} className="animate-spin text-white" />
                    <span className="text-white">Loading more experiences...</span>
                  </div>
                )}
              </div>

              {/* End of Feed Indicator (Desktop) */}
              {!hasMore && events.length > 0 && (
                <div className="hidden lg:block py-10 text-center space-y-2.5 border-t border-stone-200/80 max-w-xl mx-auto">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-600 shadow-2xs">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-base font-medium text-stone-900">
                    You&apos;re All Caught Up
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    You&apos;ve explored all active experiences matching your current filters. Check back soon for newly published stages.
                  </p>
                  <div className="pt-1.5">
                    <Link
                      to="/manager/events/create"
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-mono font-medium hover:bg-stone-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Are you an organizer? Host an event &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 py-14 px-6 text-center space-y-4 bg-white shadow-2xs lg:h-auto">
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto shadow-2xs">
                <Search size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  No experiences found
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {searchQuery.trim()
                    ? `No upcoming stages matched "${searchQuery}". Try a different keyword or reset filters.`
                    : 'No published events in this category or city right now. Check back soon!'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-black transition shadow-xs cursor-pointer"
              >
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </main>

        {/* RIGHT COLUMN: Sticky Live Stage Insights & Social Engagement (Wider Screens >= 1280px) */}
        <div className="hidden xl:block w-72 2xl:w-80 shrink-0 sticky top-20 self-start">
          <FeedRightSidebar
            activeEvent={activeEvent || events[0]}
            isBookmarked={activeEvent ? bookmarkedIds.includes(String(activeEvent.id)) : false}
            onToggleBookmark={toggleBookmark}
            onEventUpdate={handleEventSocialUpdate}
          />
        </div>

      </div>

      {/* Mobile Comment Drawer */}
      {mobileCommentEvent && (
        <CommentDrawer
          isOpen={!!mobileCommentEvent}
          onClose={() => setMobileCommentEvent(null)}
          event={mobileCommentEvent}
          onCommentCountChange={(eventId, newCount) => {
            handleEventSocialUpdate(eventId, { commentsCount: newCount })
          }}
        />
      )}

    </div>
  )
}