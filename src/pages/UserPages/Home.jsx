import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
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
} from 'lucide-react'
import API from '../../services/api'
import HomeHeroBanner from '../../components/home/HomeHeroBanner'
import HomeEventSection from '../../components/home/HomeEventSection'

export default function Home() {
  const { isAuthenticated, isOrganizer } = useSelector((state) => state.auth || {})

  const [allEvents, setAllEvents] = useState([])
  const [featuredHero, setFeaturedHero] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all live events and hero spotlight from backend
  const loadHomeData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Fetch featured hero event
      const heroPromise = API.get('events/featured/').catch(() => ({ data: null }))
      
      // 2. Fetch list of published events
      const eventsPromise = API.get('events/', {
        params: { page_size: 50, sort: 'upcoming' },
      })

      const [heroRes, eventsRes] = await Promise.all([heroPromise, eventsPromise])

      if (heroRes?.data) {
        setFeaturedHero(heroRes.data)
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
    let isMounted = true
    const fetchData = async () => {
      try {
        const heroPromise = API.get('events/featured/').catch(() => ({ data: null }))
        const eventsPromise = API.get('events/', {
          params: { page_size: 50, sort: 'upcoming' },
        })

        const [heroRes, eventsRes] = await Promise.all([heroPromise, eventsPromise])

        if (!isMounted) return

        if (heroRes?.data) {
          setFeaturedHero(heroRes.data)
        }

        let eventsList = []
        if (eventsRes?.data?.results && Array.isArray(eventsRes.data.results)) {
          eventsList = eventsRes.data.results
        } else if (Array.isArray(eventsRes?.data)) {
          eventsList = eventsRes.data
        }
        setAllEvents(eventsList)
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load live experiences. Please try again.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  // Featured slides for Hero Carousel (combines hero endpoint + top featured/upcoming events)
  const heroSlides = useMemo(() => {
    const list = []
    if (featuredHero) {
      list.push(featuredHero)
    }
    allEvents.forEach((ev) => {
      if (ev.is_featured && (!featuredHero || ev.id !== featuredHero.id)) {
        list.push(ev)
      }
    })
    // If fewer than 3, pad with first available events
    if (list.length < 3) {
      allEvents.forEach((ev) => {
        if (!list.some((item) => item.id === ev.id)) {
          list.push(ev)
        }
      })
    }
    return list.slice(0, 5)
  }, [featuredHero, allEvents])

  // Category segmentations
  const trendingEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => {
        const scoreA = (a.is_featured || a.isFeatured ? 50 : 0) + (a.likesCount || 0) * 3 + (a.ticketsSold || 0) * 2
        const scoreB = (b.is_featured || b.isFeatured ? 50 : 0) + (b.likesCount || 0) * 3 + (b.ticketsSold || 0) * 2
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

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* 1. Hero Spotlight Auto-scrolling Banner */}
      <HomeHeroBanner featuredEvents={heroSlides} />

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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Trending / Selling Fast Section */}
      <HomeEventSection
        title="Trending Events"
        subtitle="The most popular experiences and hot-ticket stages right now"
        icon={Flame}
        badge="Popular"
        viewAllLink="/user/discover?sort=featured"
        events={trendingEvents}
        isLoading={isLoading}
        onBookmarkChange={handleBookmarkChange}
      />

      {/* 3. Music & Live Concerts Section */}
      {(isLoading || musicEvents.length > 0) && (
        <HomeEventSection
          title="Music & Live Concerts"
          subtitle="Acoustic sets, electronic festivals, and world-class tours"
          icon={Music}
          badge="Live"
          viewAllLink="/user/discover?category=Music%20%26%20Concerts"
          events={musicEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 4. Host Organizer Promo Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-orange-950/90 text-white p-8 sm:p-12 shadow-xl border border-stone-800/80">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Host on Evento</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Create and sell tickets for your own event
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Launch your stage in minutes. Set custom ticket tiers, design interactive seating maps, and track real-time revenue payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isOrganizer ? (
              <Link
                to="/manager/events/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
              >
                <span>Create Stage</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isAuthenticated ? (
              <Link
                to="/manager/overview"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
              >
                <span>Host Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/account/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 5. Tech & Conferences Section */}
      {(isLoading || techEvents.length > 0) && (
        <HomeEventSection
          title="Tech Conferences & Summits"
          subtitle="Developer symposiums, AI summits, and startup networkings"
          icon={Laptop}
          badge="Tech"
          viewAllLink="/user/discover?category=Tech%20%26%20Conferences"
          events={techEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 6. Nightlife & Parties Section */}
      {(isLoading || nightlifeEvents.length > 0) && (
        <HomeEventSection
          title="Nightlife & Clubbing"
          subtitle="Top DJs, rooftop lounges, and weekend after-parties"
          icon={Moon}
          badge="Nightlife"
          viewAllLink="/user/discover?category=Nightlife"
          events={nightlifeEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 7. Workshops & Creative Labs Section */}
      {(isLoading || workshopEvents.length > 0) && (
        <HomeEventSection
          title="Workshops, Arts & Tastings"
          subtitle="Masterclasses, culinary tastings, and hands-on skill labs"
          icon={Wrench}
          badge="Explore"
          viewAllLink="/user/discover?category=Workshops"
          events={workshopEvents}
          isLoading={isLoading}
          onBookmarkChange={handleBookmarkChange}
        />
      )}

      {/* 8. Bottom Platform Guarantee Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200/80">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">100% Verified Tickets</h4>
            <p className="text-xs text-stone-500 mt-0.5">Authentic QR code ticketing and direct organizer passes.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">Instant Digital Delivery</h4>
            <p className="text-xs text-stone-500 mt-0.5">Access tickets instantly in your wallet and email.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">Interactive Seating Maps</h4>
            <p className="text-xs text-stone-500 mt-0.5">Pick exact seats, rows, and VIP booths in real-time.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
