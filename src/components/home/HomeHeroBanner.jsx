import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Music,
  Laptop,
  Utensils,
  Moon,
  Palette,
  Wrench,
} from 'lucide-react'

const QUICK_CATEGORIES = [
  { name: 'Music', slug: 'Music & Concerts', icon: Music },
  { name: 'Tech', slug: 'Tech & Conferences', icon: Laptop },
  { name: 'Nightlife', slug: 'Nightlife', icon: Moon },
  { name: 'Food & Drinks', slug: 'Food & Tasting', icon: Utensils },
  { name: 'Art & Design', slug: 'Art & Exhibitions', icon: Palette },
  { name: 'Workshops', slug: 'Workshops', icon: Wrench },
]

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80'

export default function HomeHeroBanner({ featuredEvents = [], featuredEvent = null }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const navigate = useNavigate()

  // Normalize events list (supports array or single object fallback)
  const slides = featuredEvents && featuredEvents.length > 0 
    ? featuredEvents.slice(0, 5) 
    : featuredEvent 
    ? [featuredEvent] 
    : []

  const totalSlides = slides.length
  const currentSlide = totalSlides > 0 ? slides[currentIndex] : null

  // Next and Prev handlers
  const handleNext = useCallback(() => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const handlePrev = useCallback(() => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-slide timer (every 5 seconds), pauses on user hover
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [totalSlides, isPaused, handleNext])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const query = searchTerm.trim()
    if (query) {
      navigate(`/user/discover?q=${encodeURIComponent(query)}`)
    } else {
      navigate('/user/discover')
    }
  }

  const bgImage = currentSlide?.image || currentSlide?.banner || DEFAULT_HERO_IMAGE
  const eventTitle = currentSlide?.title || 'Discover Unforgettable Live Experiences'
  const eventCategory = currentSlide?.category || 'Featured Spotlight'
  const eventDate = currentSlide?.dateFormatted || currentSlide?.date || 'Happening This Season'
  const eventLocation = currentSlide?.is_online
    ? 'Online Stream'
    : currentSlide?.city
    ? `${currentSlide?.venueName || currentSlide?.venue || 'Venue'}, ${currentSlide?.city}`
    : 'Multiple Locations'
  const eventPrice = currentSlide?.startingPrice || currentSlide?.priceRange || 'Explore Tickets'

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-3xl overflow-hidden bg-stone-900 text-white shadow-xl group"
    >
      {/* Background Image with Dark Vignette Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          key={bgImage}
          src={bgImage}
          alt={eventTitle}
          className="w-full h-full object-cover opacity-35 scale-105 transform transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-900/40" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-stone-950/50 to-stone-950/90" />
      </div>

      {/* Navigation Arrows for Slider */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:py-16 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Spotlight Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white tracking-wide uppercase font-mono shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{eventCategory}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] min-h-[72px] sm:min-h-[110px] flex items-center justify-center">
          {eventTitle}
        </h1>

        {/* Event Meta Details (Date & Venue) */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-stone-300 font-medium">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
            <MapPin className="w-4 h-4 text-stone-400" />
            <span>{eventLocation}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {currentSlide?.id ? (
            <Link
              to={`/events/${currentSlide.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>Get Tickets • {eventPrice}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/user/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            to="/user/discover"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-medium backdrop-blur-md transition-all active:scale-95"
          >
            <span>Browse All Categories</span>
          </Link>
        </div>

        {/* Integrated Quick Search Bar */}
        <div className="w-full max-w-xl pt-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concerts, festivals, workshops, cities..."
              className="w-full pl-11 pr-24 py-3 bg-white/95 text-stone-900 placeholder:text-stone-400 rounded-xl text-xs sm:text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.name}
                to={`/user/discover?category=${encodeURIComponent(cat.slug)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-stone-300 hover:text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-stone-400" />
                <span>{cat.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Slide Pagination Dots / Indicators */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 pt-3">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-blue-500'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
