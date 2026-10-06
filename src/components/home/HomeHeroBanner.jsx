import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Ticket,
  Compass,
  Zap,
} from 'lucide-react'

// Premium branded platform slides for when no admin banners or events are configured
const BRANDED_WELCOME_SLIDES = [
  {
    id: 'brand-welcome',
    isBranded: true,
    title: 'Discover Unforgettable Live Experiences',
    category: 'Welcome to Evento',
    badgeIcon: Sparkles,
    dateFormatted: 'Live Daily',
    venueName: 'Concerts, Tech, Arts & Nightlife',
    city: 'Everywhere',
    startingPrice: 'Explore Events',
    attendees: '10,000+ Community',
    ctaText: 'Discover Experiences',
    ctaLink: '/discover',
    gradientBg: 'from-slate-950 via-indigo-950 to-stone-950',
    accentGlow: 'rgba(99, 102, 241, 0.25)',
    kicker: 'Live Experiences Platform',
  },
  {
    id: 'brand-creator',
    isBranded: true,
    isCreatorSlide: true,
    title: 'Host Your Next Event & Sell Out Fast',
    category: 'Creator Studio',
    badgeIcon: Zap,
    dateFormatted: 'Instant Setup',
    venueName: 'Interactive Seating Studio & QR Gate Entry',
    city: 'Manager Hub',
    startingPrice: '0% Setup Fee',
    attendees: 'Real-Time Check-In',
    ctaText: 'Host an Event',
    ctaLink: '/discover',
    gradientBg: 'from-stone-950 via-zinc-900 to-amber-950/80',
    accentGlow: 'rgba(245, 158, 11, 0.22)',
    kicker: 'Organizer Hub',
  },
  {
    id: 'brand-genres',
    isBranded: true,
    title: 'Music, Tech, Nightlife & Masterclasses',
    category: 'Curated Categories',
    badgeIcon: Compass,
    dateFormatted: 'Happening Now',
    venueName: 'Live Stages, Clubs & Auditoriums',
    city: 'Top Destinations',
    startingPrice: 'Verified Entry',
    attendees: 'Instant QR Passes',
    ctaText: 'Browse Categories',
    ctaLink: '/discover',
    gradientBg: 'from-slate-950 via-cyan-950 to-blue-950',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    kicker: 'Curated Spotlight',
  },
]

export default function HomeHeroBanner({ featuredEvents = [], featuredEvent = null, onOpenBecomeOrganizer }) {
  const { isAuthenticated, isOrganizer } = useSelector((state) => state.auth || {})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(null)
  const [imageErrors, setImageErrors] = useState({})

  // Normalize input into at most 3 items
  const rawSlides = featuredEvents && featuredEvents.length > 0
    ? featuredEvents.slice(0, 3)
    : featuredEvent
      ? [featuredEvent]
      : []

  // Always Exactly 3 Cards Rule:
  // - If 3 real events/banners exist: use the 3 real items (0 welcome cards).
  // - If 2 real items exist: use 2 real items + 1 welcome card.
  // - If 1 real item exists: use 1 real item + 2 welcome cards.
  // - If 0 real items exist: use all 3 welcome cards.
  const slides = rawSlides.length === 3
    ? rawSlides
    : [...rawSlides, ...BRANDED_WELCOME_SLIDES].slice(0, 3)

  const totalSlides = 3 // Guaranteed fixed 3-card peek deck

  // Reset index if needed
  useEffect(() => {
    if (currentIndex >= 3) {
      setCurrentIndex(0)
    }
  }, [currentIndex])

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % 3)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + 3) % 3)
  }, [])

  // Auto-slide timer (every 5 seconds), pauses on user hover
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, handleNext])

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

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }))
  }

  // Calculate Symmetrical 3D Coverflow Placement for Fixed 3-Ring Deck
  const getCardPlacementClass = (index) => {
    let offset = (index - currentIndex + 3) % 3
    if (offset === 2) offset = -1 // 0: center, 1: right peek, -1: left peek

    if (offset === 0) {
      // Main Center Card: Dominant, Elevated, Full Opacity
      return 'left-1/2 -translate-x-1/2 scale-100 [transform:translateZ(0)_rotateY(0deg)] z-30 opacity-100 pointer-events-auto border-white/20 shadow-[0_14px_34px_-10px_rgba(0,0,0,0.18),0_4px_14px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/5'
    } else if (offset === -1) {
      // Left Preview Card
      return 'left-1/2 max-sm:-translate-x-[150%] max-sm:scale-90 max-sm:opacity-0 max-sm:pointer-events-none sm:-translate-x-[57%] md:-translate-x-[60%] lg:-translate-x-[62%] xl:-translate-x-[63%] sm:scale-[0.82] md:scale-[0.85] lg:scale-[0.88] sm:[transform:perspective(1200px)_rotateY(14deg)_translateZ(0)] z-10 opacity-0 sm:opacity-75 sm:hover:opacity-95 filter sm:brightness-75 sm:hover:brightness-90 cursor-pointer sm:pointer-events-auto border-white/10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
    } else {
      // Right Preview Card
      return 'left-1/2 max-sm:translate-x-[50%] max-sm:scale-90 max-sm:opacity-0 max-sm:pointer-events-none sm:-translate-x-[43%] md:-translate-x-[40%] lg:-translate-x-[38%] xl:-translate-x-[37%] sm:scale-[0.82] md:scale-[0.85] lg:scale-[0.88] sm:[transform:perspective(1200px)_rotateY(-14deg)_translateZ(0)] z-10 opacity-0 sm:opacity-75 sm:hover:opacity-95 filter sm:brightness-75 sm:hover:brightness-90 cursor-pointer sm:pointer-events-auto border-white/10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)] ring-1 ring-black/5'
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
      {/* Main Carousel Track */}
      <div className="relative w-full h-[330px] sm:h-[430px] md:h-[490px] lg:h-[550px] flex items-center justify-center sm:[perspective:1400px]">

        {/* Carousel Cards Deck */}
        <div className="relative w-full h-full flex items-center justify-center">
          {slides.map((slide, idx) => {
            const isCenter = idx === currentIndex
            const placementClass = getCardPlacementClass(idx)
            const slideImg = slide.image || slide.banner
            const hasImage = Boolean(slideImg) && !imageErrors[slide.id || idx]
            const slideTitle = slide.title || 'Curated Experience'
            const slideCategory = slide.category || 'Featured Spotlight'
            const slideDate = slide.dateFormatted || slide.date || 'Happening Live'
            const slideLocation = slide.is_online
              ? 'Virtual Stage'
              : `${slide.venueName || slide.venue || 'Premium Venue'}, ${slide.city || ''}`.replace(/,\s*$/, '')
            const slidePrice = slide.startingPrice || slide.priceRange || '$0.00'
            const attendees = slide.attendees || 'Live Gatherings'
            const kickerText = slide.kicker || 'Live Experience'
            const BadgeIcon = slide.badgeIcon || Sparkles

            // Resolve CTA target and text
            const targetUrl = slide.customUrl || slide.ctaLink || (slide.eventId ? `/events/${slide.eventId}` : slide.id ? `/events/${slide.id}` : '/discover')
            const isExternal = typeof targetUrl === 'string' && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))
            const buttonText = slide.ctaText || (slide.isBranded ? 'Explore Events' : 'Get Passes')

            return (
              <div
                key={slide.isBranded ? slide.id : `slide-${slide.id || idx}-${idx}`}
                onClick={() => !isCenter && setCurrentIndex(idx)}
                className={`absolute w-[95%] sm:w-[86%] lg:w-[80%] h-[310px] sm:h-[410px] md:h-[470px] lg:h-[530px] rounded-lg sm:rounded-xl overflow-hidden transition-all duration-700 sm:duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform border bg-stone-950 ${placementClass}`}
              >
                {/* Visual Backdrop: Artwork or Rich Atmospheric Mesh Gradient */}
                {hasImage ? (
                  <img
                    src={slideImg}
                    alt={slideTitle}
                    onError={() => handleImageError(slide.id || idx)}
                    decoding="async"
                    loading={isCenter ? 'eager' : 'lazy'}
                    className="absolute inset-0 w-full h-full object-cover object-center rounded-lg sm:rounded-xl"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradientBg || 'from-indigo-950 via-slate-950 to-black'}`}>
                    {/* Ambient Radial Spotlight */}
                    <div
                      className="absolute inset-0 opacity-40 mix-blend-screen"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${slide.accentGlow || 'rgba(99, 102, 241, 0.3)'}, transparent 60%)`,
                      }}
                    />
                    {/* Subtle grid pattern overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
                  </div>
                )}

                {/* Localized Gradient for Crisp Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 via-50% to-transparent rounded-lg sm:rounded-xl" />

                {/* Card Content Overlay */}
                <div className="relative z-10 p-4 sm:p-7 lg:p-10 h-full flex flex-col justify-between text-left">

                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/60 border border-white/20 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-stone-100 font-semibold shadow-md">
                      <BadgeIcon size={11} className="text-amber-400 sm:w-3 sm:h-3" />
                      <span>{slideCategory}</span>
                    </span>

                    <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/60 border border-white/20 text-[10px] sm:text-xs font-mono font-bold text-amber-300 shadow-md">
                      {slidePrice}
                    </span>
                  </div>

                  {/* Bottom Information Details */}
                  <div className="space-y-1.5 sm:space-y-3.5">
                    {/* Live Kicker */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <span className="text-[9px] sm:text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold drop-shadow-sm">
                        {kickerText}
                      </span>
                    </div>

                    {/* Bold Modern Poster Title */}
                    <h2 className="text-lg sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05] line-clamp-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_12px_rgba(0,0,0,0.9)]">
                      {slideTitle}
                    </h2>

                    {/* Meta details chips */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-mono text-stone-100">
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 shadow-sm font-medium">
                        <Calendar size={11} className="text-amber-400 shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span>{slideDate}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 shadow-sm font-medium truncate max-w-[170px] sm:max-w-[260px]">
                        <MapPin size={11} className="text-amber-400 shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">{slideLocation}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/20 shadow-sm font-medium">
                        <Users size={13} className="text-amber-400 shrink-0" />
                        <span>{attendees}</span>
                      </div>
                    </div>

                    {/* Active Center CTA Action Buttons */}
                    {isCenter && (
                      <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3">
                        {slide.isCreatorSlide ? (
                          isOrganizer ? (
                            <Link
                              to="/manager/events/create"
                              className="px-4 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] sm:text-sm font-bold uppercase tracking-wider font-mono shadow-lg shadow-orange-500/30 transition-all active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <span>Create Stage</span>
                              <ArrowRight size={13} className="sm:w-4 sm:h-4" />
                            </Link>
                          ) : isAuthenticated ? (
                            <button
                              type="button"
                              onClick={onOpenBecomeOrganizer}
                              className="px-4 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] sm:text-sm font-bold uppercase tracking-wider font-mono shadow-lg shadow-orange-500/30 transition-all active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <span>Become a Host</span>
                              <Sparkles size={13} className="sm:w-4 sm:h-4 text-amber-200" />
                            </button>
                          ) : (
                            <Link
                              to="/account/signup"
                              className="px-4 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] sm:text-sm font-bold uppercase tracking-wider font-mono shadow-lg shadow-orange-500/30 transition-all active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <span>Host an Event</span>
                              <ArrowRight size={13} className="sm:w-4 sm:h-4" />
                            </Link>
                          )
                        ) : isExternal ? (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-sm font-bold uppercase tracking-wider font-mono shadow-lg shadow-blue-600/40 transition-all active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                          >
                            <span>{buttonText}</span>
                            <ArrowRight size={13} className="sm:w-4 sm:h-4" />
                          </a>
                        ) : (
                          <Link
                            to={targetUrl}
                            className="px-4 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-sm font-bold uppercase tracking-wider font-mono shadow-lg shadow-blue-600/40 transition-all active:scale-95 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                          >
                            <span>{buttonText}</span>
                            <ArrowRight size={13} className="sm:w-4 sm:h-4" />
                          </Link>
                        )}

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

      {/* Synchronized Pagination Indicators */}
      {totalSlides > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-2 pt-4">
          {slides.map((slide, idx) => (
            <button
              key={slide.isBranded ? slide.id : `dot-${slide.id || idx}-${idx}`}
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
