import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Flame,
  Music,
  Laptop,
  Moon,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ticket,
  Building2,
  RefreshCw,
  AlertCircle,
  Search,
} from 'lucide-react'
import API from '../../services/api'
import HomeHeroBanner from '../../components/home/HomeHeroBanner'
import HomeCategorySection from '../../components/home/HomeCategorySection'
import HomeEventSection from '../../components/home/HomeEventSection'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, isOrganizer } = useSelector((state) => state.auth || {})
  const { openBecomeOrganizer } = useOutletContext() || {}

  const [searchQuery, setSearchQuery] = useState('')
  const [allEvents, setAllEvents] = useState([])
  const [featuredHero, setFeaturedHero] = useState(null)
  const [customBanners, setCustomBanners] = useState([])
  const [customRecommendations, setCustomRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all live events, hero spotlight, and dynamic admin content
  const loadHomeData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Fetch featured hero event & dynamic admin homepage content
      const heroPromise = API.get('events/featured/').catch(() => ({ data: null }))
      const contentPromise = API.get('admin/content/homepage/').catch(() => ({ data: { banners: [], recommendations: [] } }))

      // 2. Fetch list of published events
      const eventsPromise = API.get('events/', {
        params: { page_size: 50, sort: 'upcoming' },
      })

      const [heroRes, contentRes, eventsRes] = await Promise.all([heroPromise, contentPromise, eventsPromise])

      if (heroRes?.data) {
        setFeaturedHero(heroRes.data)
      }

      if (contentRes?.data?.banners) {
        setCustomBanners(contentRes.data.banners)
      }
      if (contentRes?.data?.recommendations) {
        setCustomRecommendations(contentRes.data.recommendations)
      }

      let eventsList = []
      if (eventsRes?.data?.results && Array.isArray(eventsRes.data.results)) {
        eventsList = eventsRes.data.results
      } else if (Array.isArray(eventsRes?.data)) {
        eventsList = eventsRes.data
      }
      setAllEvents(eventsList)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load live experiences. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHomeData()
  }, [loadHomeData])

  // Featured slides for Hero Carousel (uses admin banners if configured, otherwise falls back to featured/published events)
  const heroSlides = useMemo(() => {
    if (customBanners && customBanners.length > 0) {
      return customBanners.slice(0, 3).map((b) => ({
        id: b.eventId || b.id,
        eventId: b.eventId,
        title: b.title,
        category: b.subtitle || 'Featured Spotlight',
        banner: b.imageUrl,
        image: b.imageUrl,
        ctaText: b.ctaText || 'Get Tickets',
        customUrl: b.customUrl,
        dateFormatted: 'Curated Experience',
        venueName: b.eventTitle ? `Stage: ${b.eventTitle}` : 'Special Event',
        city: '',
        startingPrice: 'Spotlight',
      }))
    }

    const list = []
    if (featuredHero) {
      list.push(featuredHero)
    }
    allEvents.forEach((ev) => {
      if (ev.is_featured && (!featuredHero || ev.id !== featuredHero.id)) {
        list.push(ev)
      }
    })
    // Pad with first available live events
    allEvents.forEach((ev) => {
      if (list.length < 3 && !list.some((item) => item.id === ev.id)) {
        list.push(ev)
      }
    })
    return list.slice(0, 3)
  }, [customBanners, featuredHero, allEvents])

  // Recommended events curated by Super Admin
  const curatedRecommendedEvents = useMemo(() => {
    if (customRecommendations && customRecommendations.length > 0) {
      const list = []
      customRecommendations.forEach((rec) => {
        const found = allEvents.find((e) => e.id === rec.eventId)
        if (found && !list.some((item) => item.id === found.id)) {
          list.push(found)
        }
      })
      if (list.length > 0) return list
    }
    return []
  }, [customRecommendations, allEvents])

  // Category segmentations
  const trendingEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => {
        const scoreA = (a.is_featured || a.isFeatured ? 50 : 0) + (a.likesCount || 0) * 3 + (a.commentsCount || 0) * 2
        const scoreB = (b.is_featured || b.isFeatured ? 50 : 0) + (b.likesCount || 0) * 3 + (b.commentsCount || 0) * 2
        return scoreB - scoreA
      })
      .slice(0, 8)
  }, [allEvents])

  const musicEvents = useMemo(() => {
    return allEvents.filter(
      (e) => (e.category || '').toLowerCase().includes('music')
    )
  }, [allEvents])

  const techEvents = useMemo(() => {
    return allEvents.filter(
      (e) =>
        (e.category || '').toLowerCase().includes('tech') ||
        (e.category || '').toLowerCase().includes('conference')
    )
  }, [allEvents])

  const nightlifeEvents = useMemo(() => {
    return allEvents.filter(
      (e) =>
        (e.category || '').toLowerCase().includes('nightlife') ||
        (e.category || '').toLowerCase().includes('club')
    )
  }, [allEvents])

  const workshopEvents = useMemo(() => {
    return allEvents.filter(
      (e) =>
        (e.category || '').toLowerCase().includes('workshop') ||
        (e.category || '').toLowerCase().includes('art') ||
        (e.category || '').toLowerCase().includes('food')
    )
  }, [allEvents])

  // Handle bookmark toggle locally to keep state synced across all sections
  const handleBookmarkChange = (eventId, nextBookmarked) => {
    setAllEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, isBookmarked: nextBookmarked } : ev))
    )
  }

  // Handle standalone search submit
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/discover')
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-0 sm:px-0 py-1 sm:py-2 space-y-5 sm:space-y-10">
      {/* 1. Hero Spotlight Auto-scrolling Banner */}
      <HomeHeroBanner 
        featuredEvents={heroSlides} 
        onOpenBecomeOrganizer={openBecomeOrganizer}
      />

      {/* 2. Standalone Search Bar */}
      <div className="max-w-2xl mx-auto w-full px-0.5">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white border border-stone-200/90 rounded-2xl p-1 sm:p-1.5 shadow-2xs hover:border-stone-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-150"
        >
          <div className="pl-3 pr-2 text-stone-400 shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, festivals, concerts, cities..."
            className="w-full bg-transparent text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm outline-none pr-2 py-1.5"
          />
          <button
            type="submit"
            className="px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* 3. Browse by Category Section */}
      <HomeCategorySection />

      {/* Error Notice with Retry */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadHomeData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 3.5. Curated Recommendations (if set by Super Admin) */}
      {curatedRecommendedEvents.length > 0 && (
        <HomeEventSection
          title="Curated Recommendations"
          subtitle="Hand-picked events and editor's top choices this week"
          icon={Sparkles}
          badge="Featured Choice"
          viewAllLink="/discover"
          events={curatedRecommendedEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 4. Trending / Selling Fast Section */}
      <HomeEventSection
        title="Trending Events"
        subtitle="The most popular experiences and hot-ticket stages right now"
        icon={Flame}
        badge="Popular"
        viewAllLink="/discover?sort=featured"
        events={trendingEvents}
        isLoading={isLoading}
        onBookmarkChange={handleBookmarkChange}
      />

      {/* 5. Music & Live Concerts Section */}
      {(isLoading || musicEvents.length > 0) && (
        <HomeEventSection
          title="Music & Live Concerts"
          subtitle="Acoustic sets, electronic festivals, and world-class tours"
          icon={Music}
          badge="Live"
          viewAllLink="/discover?category=Music%20%26%20Concerts"
          events={musicEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 6. Host Organizer Promo Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-orange-950/90 text-white p-5 sm:p-8 md:p-10 shadow-lg border border-stone-800/80">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[10px] sm:text-xs font-semibold uppercase font-mono">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Host on Evento</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Create and sell tickets for your own event
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Launch your stage in minutes. Set custom ticket tiers, design interactive seating maps, and track real-time revenue payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {isOrganizer ? (
              <Link
                to="/manager/events/create"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Create Stage</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={openBecomeOrganizer}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-200" />
                <span>Become an Organizer</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            ) : (
              <Link
                to="/account/signup"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Subtle background decoration (GPU-friendly radial gradient) */}
        <div 
          className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)' }}
        />
      </section>

      {/* 7. Tech & Conferences Section */}
      {(isLoading || techEvents.length > 0) && (
        <HomeEventSection
          title="Tech Conferences & Summits"
          subtitle="Developer symposiums, AI summits, and startup networkings"
          icon={Laptop}
          badge="Tech"
          viewAllLink="/discover?category=Tech%20%26%20Conferences"
          events={techEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 8. Nightlife & Parties Section */}
      {(isLoading || nightlifeEvents.length > 0) && (
        <HomeEventSection
          title="Nightlife & Clubbing"
          subtitle="Top DJs, rooftop lounges, and weekend after-parties"
          icon={Moon}
          badge="Nightlife"
          viewAllLink="/discover?category=Nightlife"
          events={nightlifeEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 9. Workshops & Creative Labs Section */}
      {(isLoading || workshopEvents.length > 0) && (
        <HomeEventSection
          title="Workshops, Arts & Tastings"
          subtitle="Masterclasses, culinary tastings, and hands-on skill labs"
          icon={Wrench}
          badge="Explore"
          viewAllLink="/discover?category=Workshops"
          events={workshopEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 10. Bottom Platform Guarantee Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4 border-t border-stone-200/80">
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">100% Verified Tickets</h4>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">Authentic QR code ticketing and direct organizer passes.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Instant Digital Delivery</h4>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">Access tickets instantly in your wallet and email.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Interactive Seating Maps</h4>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">Pick exact seats, rows, and VIP booths in real-time.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
