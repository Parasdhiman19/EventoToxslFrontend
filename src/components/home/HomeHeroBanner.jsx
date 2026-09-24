import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const DEFAULT_HERO_IMAGE = '/emptybanner.jpg'

// Sample curated experiences fallback for rich 3-card peek deck
const FALLBACK_SLIDES = [
  {
    id: 1,
    title: 'Tech Summit 2026',
    category: 'Tech & Conferences',
    dateFormatted: 'Sep 25, 2026',
    venueName: 'A.S. LDFJLKADS;JF;, SALOON',
    city: 'PATIALA',
    startingPrice: '$35.00',
    banner: '/emptybanner.jpg',
    attendees: '250+ Attendees',
  },
  {
    id: 2,
    title: 'Summer Vibes Fest',
    category: 'Music & Concerts',
    dateFormatted: 'Aug 15, 2026',
    venueName: 'Open Air Grounds',
    city: 'Chandigarh',
    startingPrice: '$50.00',
    banner: '/emptybanner.jpg',
    attendees: '1,200+ Attendees',
  },
  {
    id: 3,
    title: 'Neon Horizon: Live Electronic Odyssey',
    category: 'Music & Concerts',
    dateFormatted: 'Oct 14, 2026',
    venueName: 'The Soundstage Arena',
    city: 'Chandigarh',
    startingPrice: '$45.00',
    banner: '/emptybanner.jpg',
    attendees: '500+ Attendees',
  },
]

export default function HomeHeroBanner({ featuredEvents = [], featuredEvent = null }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)

  // Normalize events list (supports array or single object fallback)
  const rawSlides = featuredEvents && featuredEvents.length > 0
    ? featuredEvents.slice(0, 6)
    : featuredEvent
      ? [featuredEvent]
      : []

  const slides = rawSlides.length >= 3
    ? rawSlides
    : rawSlides.length > 0
      ? [...rawSlides, ...FALLBACK_SLIDES].slice(0, 4)
      : FALLBACK_SLIDES

  const totalSlides = slides.length

  // Navigation handlers
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (diff > 45) {
      handleNext()
    } else if (diff < -45) {
      handlePrev()
    }
    setTouchStartX(null)
  }

  // Calculate Symmetrical 3D Coverflow Placement (Unified Anchor GPU Transforms for Smooth Interpolation)
  const getCardPlacementClass = (index) => {
    let offset = index - currentIndex
    if (offset > totalSlides / 2) offset -= totalSlides
    if (offset < -totalSlides / 2) offset += totalSlides

    if (offset === 0) {
      // Main Center Card: Dominant, Elevated, Full Opacity, Sharp & Unfaded with subtle realistic shadow
      return 'left-1/2 -translate-x-1/2 scale-100 [transform:translateZ(0)_rotateY(0deg)] z-30 opacity-100 pointer-events-auto border-white/20 shadow-[0_14px_34px_-10px_rgba(0,0,0,0.18),0_4px_14px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/5'
    } else if (offset === -1) {
      // Left Preview Card: Tucked nicely closer to center on all screen sizes
      return 'left-1/2 max-sm:-translate-x-[150%] max-sm:scale-90 max-sm:opacity-0 max-sm:pointer-events-none sm:-translate-x-[57%] md:-translate-x-[60%] lg:-translate-x-[62%] xl:-translate-x-[63%] sm:scale-[0.82] md:scale-[0.85] lg:scale-[0.88] sm:[transform:perspective(1200px)_rotateY(14deg)_translateZ(0)] z-10 opacity-0 sm:opacity-75 sm:hover:opacity-95 filter sm:brightness-75 sm:hover:brightness-90 cursor-pointer sm:pointer-events-auto border-white/10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
    } else if (offset === 1) {
      // Right Preview Card: Tucked nicely closer to center on all screen sizes
      return 'left-1/2 max-sm:translate-x-[50%] max-sm:scale-90 max-sm:opacity-0 max-sm:pointer-events-none sm:-translate-x-[43%] md:-translate-x-[40%] lg:-translate-x-[38%] xl:-translate-x-[37%] sm:scale-[0.82] md:scale-[0.85] lg:scale-[0.88] sm:[transform:perspective(1200px)_rotateY(-14deg)_translateZ(0)] z-10 opacity-0 sm:opacity-75 sm:hover:opacity-95 filter sm:brightness-75 sm:hover:brightness-90 cursor-pointer sm:pointer-events-auto border-white/10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
    } else if (offset < 0) {
      // Non-adjacent slides on the left: Smoothly receded offscreen
      return 'left-1/2 -translate-x-[150%] scale-[0.70] [transform:perspective(1200px)_rotateY(25deg)] opacity-0 pointer-events-none z-0'
    } else {
      // Non-adjacent slides on the right: Smoothly receded offscreen
      return 'left-1/2 translate-x-[50%] scale-[0.70] [transform:perspective(1200px)_rotateY(-25deg)] opacity-0 pointer-events-none z-0'
    }
  }

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full select-none py-1 sm:py-2 overflow-hidden"
    >
      {/* Main 3-Card Carousel Track */}
      <div className="relative w-full h-[320px] sm:h-[430px] md:h-[490px] lg:h-[550px] flex items-center justify-center [perspective:1400px]">

        {/* Carousel Cards Deck */}
        <div className="relative w-full h-full flex items-center justify-center">
          {slides.map((slide, idx) => {
            const isCenter = idx === currentIndex
            const placementClass = getCardPlacementClass(idx)
            const slideImg = slide.image || slide.banner || DEFAULT_HERO_IMAGE
            const slideTitle = slide.title || 'Curated Experience'
            const slideCategory = slide.category || 'Curated Experience'
            const slideDate = slide.dateFormatted || slide.date || 'TBA'
            const slideLocation = slide.is_online
              ? 'Virtual Stream'
              : `${slide.venueName || slide.venue || 'Venue'}, ${slide.city || 'City'}`
            const slidePrice = slide.startingPrice || slide.priceRange || '$0.00'
            const attendees = slide.attendees || '250+ Attendees'

            return (
              <div
                key={slide.id || idx}
                onClick={() => !isCenter && setCurrentIndex(idx)}
                className={`absolute w-[94%] sm:w-[86%] lg:w-[80%] h-[300px] sm:h-[410px] md:h-[470px] lg:h-[530px] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-700 sm:duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform border bg-stone-900 ${placementClass}`}
              >
                {/* Card Background Banner (Full Quality, Unfaded) */}
                <img
                  src={slideImg}
                  alt={slideTitle}
                  className="absolute inset-0 w-full h-full object-cover object-center rounded-2xl sm:rounded-3xl"
                />

                {/* Localized Bottom Gradient for Crisp Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-45% to-transparent rounded-2xl sm:rounded-3xl" />

                {/* Card Content Overlay */}
                <div className="relative z-10 p-4 sm:p-7 lg:p-10 h-full flex flex-col justify-between text-left">

                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-stone-100 font-semibold shadow-md">
                      <Sparkles size={11} className="text-amber-400 sm:w-3 sm:h-3" />
                      <span>{slideCategory}</span>
                    </span>

                    <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-mono font-bold text-amber-300 shadow-md">
                      {slidePrice}
                    </span>
                  </div>

                  {/* Bottom Information Details */}
                  <div className="space-y-1.5 sm:space-y-3.5">
                    {/* Live Kicker */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <span className="text-[9px] sm:text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold drop-shadow-sm">
                        Live Experience
                      </span>
                    </div>

                    {/* Bold Modern Poster Title */}
                    <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight sm:tracking-tight text-white leading-[1.05] line-clamp-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_12px_rgba(0,0,0,0.9)]">
                      {slideTitle}
                    </h2>

                    {/* Meta details chips */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-mono text-stone-100">
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 shadow-sm font-medium">
                        <Calendar size={11} className="text-amber-400 shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span>{slideDate}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 shadow-sm font-medium truncate max-w-[170px] sm:max-w-[260px]">
                        <MapPin size={11} className="text-amber-400 shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">{slideLocation}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-sm font-medium">
                        <Users size={13} className="text-amber-400 shrink-0" />
                        <span>{attendees}</span>
                      </div>
                    </div>

                    {/* Active Center CTA Action Buttons */}
                    {isCenter && (
                      <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3">
                        <Link
                          to={`/events/${slide.id}`}
                          className="px-4 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-sm font-bold uppercase tracking-wider font-mono shadow-lg shadow-blue-600/40 transition-all active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                        >
                          <span>Get Passes</span>
                          <ArrowRight size={13} className="sm:w-4 sm:h-4" />
                        </Link>
                        <Link
                          to="/discover"
                          className="px-3.5 sm:px-5 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-black/50 hover:bg-black/70 border border-white/30 text-white text-[11px] sm:text-sm font-semibold uppercase tracking-wider font-mono backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          <span>Discover</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Synchronized Pagination Indicators on Light Background */}
      {totalSlides > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-2 pt-4">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${currentIndex === idx
                  ? 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-600 shadow-xs'
                  : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-200/80 hover:bg-blue-300'
                }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
