import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import gsap from 'gsap'
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Building2,
  Flame,
  Sparkles,
  ShieldCheck,
  Armchair,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Check
} from 'lucide-react'
import { toggleEventLike } from '../../services/socialApi'
import { useAuthPrompt } from '../../context/AuthPromptContext'

// Helper to parse date badge
function parseDateBadge(dateStr) {
  if (!dateStr) return { month: 'EVT', day: '•' }
  try {
    const parts = dateStr.replace(',', '').split(' ')
    if (parts.length >= 2) {
      return {
        month: parts[0].substring(0, 3).toUpperCase(),
        day: parts[1],
      }
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return {
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate(),
      }
    }
  } catch {
    // Fallback
  }
  return { month: 'EVT', day: '•' }
}

const DEFAULT_BANNER = '/emptybanner.jpg'

function FeedEventCard({
  event,
  isActive = false,
  isBookmarked = false,
  onMouseEnter,
  onOpenComments,
  onToggleBookmark,
  onEventSocialUpdate,
}) {
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const { openAuthPrompt } = useAuthPrompt()
  const [imageError, setImageError] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isLikingLocal, setIsLikingLocal] = useState(false)

  const mobileHeartRef = useRef(null)
  const desktopHeartRef = useRef(null)

  const { month, day } = parseDateBadge(event.dateFormatted || event.date)
  const isUrgent = typeof event.spotsLeft === 'number' && event.spotsLeft <= 15
  const imageUrl = imageError ? DEFAULT_BANNER : event.image || event.banner || DEFAULT_BANNER
  const hasAssignedSeating = !!(event.hasAssignedSeating || event.has_assigned_seating)

  const likesCount = typeof event.likesCount === 'number' ? event.likesCount : 0
  const isLiked = !!event.isLiked
  const commentsCount = typeof event.commentsCount === 'number' ? event.commentsCount : 0

  // Organizer display initials
  const organizerName = event.organizer || 'Curated Host'
  const organizerHandle = organizerName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const organizerInitial = organizerName.charAt(0).toUpperCase()

  // Real backend like handler with optimistic UI + GSAP bounce
  const handleToggleLike = async (e, heartRef) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'like',
        title: 'Like this Experience',
        subtitle: `Sign in to support "${event.title || 'this live stage'}" and add it to your liked experiences.`,
      })
      return
    }

    if (isLikingLocal) return
    setIsLikingLocal(true)

    // GSAP Heart Bounce Animation
    if (heartRef && heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 0.7, rotation: -15 },
        { scale: 1.35, rotation: 0, duration: 0.28, yoyo: true, repeat: 1, ease: 'back.out(2.5)' }
      )
    }

    const prevLiked = isLiked
    const prevCount = likesCount

    // Optimistic UI Update
    if (onEventSocialUpdate) {
      onEventSocialUpdate(event.id, {
        isLiked: !prevLiked,
        likesCount: !prevLiked ? prevCount + 1 : Math.max(0, prevCount - 1),
      })
    }

    try {
      const data = await toggleEventLike(event.id)
      if (onEventSocialUpdate) {
        onEventSocialUpdate(event.id, {
          isLiked: data.isLiked,
          likesCount: data.likesCount,
        })
      }
    } catch {
      // Rollback on error
      if (onEventSocialUpdate) {
        onEventSocialUpdate(event.id, {
          isLiked: prevLiked,
          likesCount: prevCount,
        })
      }
    } finally {
      setIsLikingLocal(false)
    }
  }

  // Share handler
  const handleShare = async (e) => {
    e.stopPropagation()
    const canonicalUrl = `${window.location.origin}/events/${event.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Evento!`,
          url: canonicalUrl,
        })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(canonicalUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <article
      id={`feed-card-${event.id}`}
      data-event-id={event.id}
      onMouseEnter={() => onMouseEnter && onMouseEnter(event)}
      onClick={() => onMouseEnter && onMouseEnter(event)}
      className="feed-event-card w-full"
    >
      {/* ========================================================================= */}
      {/* A. MOBILE-ONLY FULL-SCREEN SNAP REELS VIEW (< lg)                         */}
      {/* ========================================================================= */}
      <div className="lg:hidden relative h-[calc(100dvh-8rem)] w-full snap-start snap-always overflow-hidden flex flex-col justify-between select-none bg-stone-950">
        
        {/* 1. Ambient Background Layer (fills letterbox/pillarbox space for 16:9 images) */}
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125 pointer-events-none"
        />

        {/* Main Full Image: Uncropped 16:9 ratio with object-contain */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={imageUrl}
            alt={event.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full max-h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* 2. Cinematic Dark Gradient Overlay for Crisp Badges & Bottom Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent via-50% to-black/40 pointer-events-none" />

        {/* 3. Top Floating Badges */}
        <div className="relative z-10 p-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Date Stamp */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-center shadow-md border border-white/20">
              <span className="block font-mono text-[9px] font-bold tracking-widest text-stone-600 uppercase leading-none">
                {month}
              </span>
              <span className="block font-serif text-base font-bold text-stone-950 leading-tight">
                {day}
              </span>
            </div>

            {/* Category */}
            <span className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md text-stone-200 text-[11px] font-mono uppercase tracking-wider border border-white/15">
              {event.category || 'Experience'}
            </span>

            {event.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 text-[10px] font-mono uppercase tracking-wider font-bold shadow-xs">
                <Sparkles size={11} />
                <span>Featured</span>
              </span>
            )}
          </div>

          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-mono uppercase tracking-wider font-semibold shadow-xs">
              <Flame size={12} className="fill-white" />
              <span>{event.spotsLeft} Left</span>
            </span>
          )}
        </div>

        {/* 4. Bottom Row: Content Overlay (Left) & Vertical Action Column (Right) */}
        <div className="relative z-10 p-4 pb-6 sm:pb-8 flex items-end justify-between gap-3">
          
          {/* Bottom-Left Information Overlay */}
          <div className="flex-1 min-w-0 space-y-2.5 pr-2">
            
            {/* Host studio */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-stone-200 text-xs font-mono border border-white/10">
              <Building2 size={12} className="text-stone-300" />
              <span className="truncate max-w-[180px]">{organizerName}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug line-clamp-2 drop-shadow-md">
              <Link to={`/events/${event.id}`}>
                {event.title}
              </Link>
            </h2>

            {/* Venue & Time Capsule */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-300">
              <div className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10 truncate max-w-[220px]">
                <MapPin size={12} className="text-amber-400 shrink-0" />
                <span className="truncate">{event.venue || event.venueName || 'Venue'} &bull; {event.city || 'City'}</span>
              </div>

              {hasAssignedSeating && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  <Armchair size={11} />
                  <span>Assigned Seats</span>
                </span>
              )}
            </div>

            {/* Price & CTA Action */}
            <div className="pt-1.5 flex items-center gap-3">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                <span className="text-[9px] font-mono text-stone-400 block uppercase leading-none">Passes</span>
                <span className="font-serif text-base font-bold text-white">
                  {event.startingPrice || 'Free'}
                </span>
              </div>

              <Link
                to={`/events/${event.id}`}
                className="px-5 py-2.5 rounded-xl bg-white text-stone-950 text-xs font-mono font-bold uppercase tracking-wider hover:bg-stone-100 transition shadow-lg inline-flex items-center gap-1.5 group/btn cursor-pointer"
              >
                <span>Reserve Pass</span>
                <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Bottom-Right Vertical Action Column (Reels Style) */}
          <div className="flex flex-col items-center gap-3 shrink-0 pb-1">
            
            {/* 1. Like Button */}
            <button
              type="button"
              onClick={(e) => handleToggleLike(e, mobileHeartRef)}
              disabled={isLikingLocal}
              aria-label={`Like event (${likesCount} likes)`}
              className="flex flex-col items-center gap-1 cursor-pointer select-none group"
            >
              <div
                ref={mobileHeartRef}
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-md ${
                  isLiked
                    ? 'bg-rose-500/90 border-rose-400 text-white'
                    : 'bg-black/45 border-white/20 text-white hover:bg-black/60'
                }`}
              >
                <Heart
                  size={19}
                  fill={isLiked ? 'currentColor' : 'none'}
                  className={isLiked ? 'text-white' : 'text-white'}
                />
              </div>
              <span className="text-[11px] font-mono text-white font-medium drop-shadow-sm">
                {likesCount}
              </span>
            </button>

            {/* 2. Comment Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenComments && onOpenComments(event)
              }}
              aria-label={`Open comments (${commentsCount} comments)`}
              className="flex flex-col items-center gap-1 cursor-pointer select-none group"
            >
              <div className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md">
                <MessageSquare size={19} />
              </div>
              <span className="text-[11px] font-mono text-white font-medium drop-shadow-sm">
                {commentsCount}
              </span>
            </button>

            {/* 3. Bookmark / Save Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark && onToggleBookmark(event.id, e)
              }}
              aria-label={isBookmarked ? 'Saved' : 'Save event'}
              className="flex flex-col items-center gap-1 cursor-pointer select-none group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all shadow-md ${
                  isBookmarked
                    ? 'bg-amber-400 border-amber-300 text-stone-950 shadow-amber-500/20'
                    : 'bg-black/45 border-white/20 text-white hover:bg-black/60'
                }`}
              >
                <Bookmark
                  size={19}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  className={isBookmarked ? 'text-stone-950' : 'text-white'}
                />
              </div>
              <span className="text-[11px] font-mono text-white font-medium drop-shadow-sm">
                {isBookmarked ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* 4. Share Button */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share event"
              className="flex flex-col items-center gap-1 cursor-pointer select-none group"
            >
              <div className="w-11 h-11 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md">
                {copiedLink ? (
                  <Check size={18} className="text-emerald-400" />
                ) : (
                  <Share2 size={18} />
                )}
              </div>
              <span className={`text-[11px] font-mono text-white font-medium drop-shadow-sm ${copiedLink ? 'text-emerald-300 font-bold' : ''}`}>
                {copiedLink ? 'Copied' : 'Share'}
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* B. DESKTOP & WIDE-SCREEN STREAM ITEM (lg:) — TWITTER / X STYLE            */}
      {/* ========================================================================= */}
      <div
        className={`hidden lg:flex w-full bg-white hover:bg-stone-50/60 transition-colors p-5 xl:p-6 flex-col space-y-3.5 cursor-pointer ${
          isActive ? 'bg-stone-50/40' : ''
        }`}
      >
        
        {/* 1. TOP AUTHOR & POST HEADER (Twitter / X Style) */}
        <div className="flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Host Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-900 to-stone-700 text-amber-400 flex items-center justify-center font-serif font-bold text-sm ring-2 ring-stone-100 shrink-0 shadow-2xs">
              {organizerInitial}
            </div>

            {/* Host Details */}
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-sans font-semibold text-stone-900 text-sm leading-tight truncate hover:underline">
                  {organizerName}
                </span>
                <ShieldCheck size={14} className="text-blue-500 fill-blue-500/15 shrink-0" />
                <span className="text-stone-400 font-mono text-xs truncate">
                  @{organizerHandle}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500 font-mono text-xs shrink-0">
                  {event.dateFormatted || event.date}
                </span>
              </div>
            </div>
          </div>

          {/* Right Badges: Category & Bookmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-mono text-[10px] font-semibold uppercase tracking-wider border border-stone-200/70">
              {event.category || 'Experience'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark && onToggleBookmark(event.id, e)
              }}
              aria-label={isBookmarked ? 'Saved' : 'Save event'}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-2xs'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-950'
              }`}
            >
              <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

        </div>

        {/* 2. BODY CONTENT & DETAILS (Unobstructed Above the Media) */}
        <div className="space-y-2">
          
          {/* Event Title */}
          <h2 className="font-serif text-2xl xl:text-[26px] font-medium tracking-tight text-stone-950 leading-snug group-hover:text-stone-700 transition-colors">
            <Link to={`/events/${event.id}`}>
              {event.title}
            </Link>
          </h2>

          {/* Venue & Metadata Capsules */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600">
            <div className="inline-flex items-center gap-1.5 bg-stone-100/90 px-2.5 py-1 rounded-lg border border-stone-200/60 truncate max-w-sm">
              <MapPin size={13} className="text-amber-500 shrink-0" />
              <span className="truncate">
                {event.venue || event.venueName || 'Main Stage Venue'} &bull; {event.city || 'City'}
              </span>
            </div>

            {event.time && (
              <div className="inline-flex items-center gap-1.5 bg-stone-100/90 px-2.5 py-1 rounded-lg border border-stone-200/60">
                <Clock size={13} className="text-stone-400 shrink-0" />
                <span>{event.time}</span>
              </div>
            )}

            {hasAssignedSeating && (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-1 rounded-lg font-sans font-medium">
                <Armchair size={12} />
                <span>Assigned Seating</span>
              </span>
            )}
          </div>

          {/* Event Narrative Description */}
          {event.description && (
            <p className="text-stone-600 text-sm leading-relaxed font-sans line-clamp-2">
              {event.description}
            </p>
          )}

        </div>

        {/* 3. DEDICATED FRAMED MEDIA BOX — UNCOMPROMISED ARTWORK (16:9, 4:3, 1:1, 21:9) */}
        <div className="relative w-full rounded-2xl border border-stone-200/90 bg-stone-100/80 overflow-hidden flex items-center justify-center max-h-[480px] xl:max-h-[520px] select-none group/media">
          <img
            src={imageUrl}
            alt={event.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-auto max-h-[480px] xl:max-h-[520px] object-contain transition-transform duration-300 group-hover/media:scale-[1.005]"
          />

          {/* Top-Left Featured Chip (If applicable) */}
          {event.is_featured && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-mono uppercase tracking-wider font-bold border border-white/10 shadow-xs">
              <Sparkles size={11} />
              <span>Featured</span>
            </div>
          )}

          {/* Top-Right Urgent Spots Chip (If applicable) */}
          {isUrgent && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider font-bold shadow-xs">
              <Flame size={11} className="fill-white" />
              <span>{event.spotsLeft} Spots Left</span>
            </div>
          )}
        </div>

        {/* 4. ACTION & ENGAGEMENT FOOTER ROW (Twitter / X Action Bar) */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Starting Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Passes:
            </span>
            <span className="font-serif text-lg xl:text-xl font-bold text-stone-950">
              {event.startingPrice || 'Free Entry'}
            </span>
            {typeof event.spotsLeft === 'number' && !isUrgent && (
              <span className="text-[11px] font-mono text-stone-400">
                ({event.spotsLeft} left)
              </span>
            )}
          </div>

          {/* Center: Twitter-Style Engagement Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Comment Action */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenComments && onOpenComments(event)
              }}
              aria-label={`Comments (${commentsCount})`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-stone-500 hover:text-blue-600 hover:bg-blue-50/80 transition-colors group/btn cursor-pointer"
            >
              <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
              <span className="text-xs font-mono font-medium">{commentsCount}</span>
            </button>

            {/* Like Action with GSAP bounce */}
            <button
              type="button"
              onClick={(e) => handleToggleLike(e, desktopHeartRef)}
              disabled={isLikingLocal}
              aria-label={`Like (${likesCount})`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors group/btn cursor-pointer ${
                isLiked
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-stone-500 hover:text-rose-600 hover:bg-rose-50/80'
              }`}
            >
              <div ref={desktopHeartRef}>
                <Heart
                  size={16}
                  fill={isLiked ? '#e11d48' : 'none'}
                  className={isLiked ? 'text-rose-600' : 'group-hover/btn:scale-110 transition-transform'}
                />
              </div>
              <span className={`text-xs font-mono font-medium ${isLiked ? 'text-rose-600 font-semibold' : ''}`}>
                {likesCount}
              </span>
            </button>

            {/* Share / Copy Link Action */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share event"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-stone-500 hover:text-emerald-600 hover:bg-emerald-50/80 transition-colors group/btn cursor-pointer"
            >
              {copiedLink ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <Share2 size={16} className="group-hover/btn:scale-110 transition-transform" />
              )}
              <span className={`text-xs font-mono font-medium ${copiedLink ? 'text-emerald-600 font-bold' : ''}`}>
                {copiedLink ? 'Copied' : 'Share'}
              </span>
            </button>

          </div>

          {/* Right: Primary CTA Button */}
          <Link
            to={`/events/${event.id}`}
            className="px-4 py-2 rounded-xl bg-stone-950 text-stone-50 text-xs font-mono font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-xs inline-flex items-center justify-center gap-1.5 group/cta cursor-pointer"
          >
            <span>Get Tickets</span>
            <ArrowRight size={13} className="group-hover/cta:translate-x-1 transition-transform" />
          </Link>

        </div>

      </div>

    </article>
  )
}

export default React.memo(FeedEventCard)
