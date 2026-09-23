import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import gsap from 'gsap'
import {
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Building2,
  Sparkles,
  Check,
  Clock,
  MapPin,
  QrCode,
  Armchair,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { toggleEventLike } from '../../services/socialApi'
import CommentDrawer from './CommentDrawer'

export default function FeedRightSidebar({
  activeEvent,
  isBookmarked = false,
  onToggleBookmark,
  onEventUpdate,
}) {
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  
  // Real backend social state
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const cardRef = useRef(null)
  const heartRef = useRef(null)
  const shareBtnRef = useRef(null)

  // Sync real social metrics whenever activeEvent changes
  useEffect(() => {
    if (activeEvent?.id) {
      setLikesCount(activeEvent.likesCount || 0)
      setIsLiked(!!activeEvent.isLiked)
      setCommentsCount(activeEvent.commentsCount || 0)

      // GSAP Entrance Transition
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 10, scale: 0.99 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
    }
  }, [activeEvent?.id, activeEvent?.likesCount, activeEvent?.isLiked, activeEvent?.commentsCount])

  // Real backend Like toggle with optimistic UI & rollback
  const handleToggleLike = async () => {
    if (!activeEvent?.id) return

    if (!isAuthenticated) {
      alert('Please log in to like experiences.')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    const prevLiked = isLiked
    const prevCount = likesCount

    // Optimistic UI update
    const nextLiked = !prevLiked
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1)
    setIsLiked(nextLiked)
    setLikesCount(nextCount)

    // GSAP Heart Micro-Animation
    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 0.75, rotation: -12 },
        { scale: 1.35, rotation: 0, duration: 0.28, yoyo: true, repeat: 1, ease: 'back.out(2.5)' }
      )
    }

    try {
      const data = await toggleEventLike(activeEvent.id)
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)

      if (onEventUpdate) {
        onEventUpdate(activeEvent.id, {
          isLiked: data.isLiked,
          likesCount: data.likesCount,
        })
      }
    } catch {
      // Revert on failure
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setIsLiking(false)
    }
  }

  // Real Share interaction (Web Share API + Clipboard Fallback)
  const handleShare = async () => {
    if (!activeEvent?.id) return
    const canonicalUrl = `${window.location.origin}/events/${activeEvent.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: activeEvent.title,
          text: `Check out ${activeEvent.title} on Evento!`,
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

      if (shareBtnRef.current) {
        gsap.fromTo(
          shareBtnRef.current,
          { scale: 0.9 },
          { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }
        )
      }

      setTimeout(() => setCopiedLink(false), 2200)
    }
  }

  // Handle live comment count updates from CommentDrawer
  const handleCommentCountChange = (eventId, newCount) => {
    if (activeEvent?.id === eventId) {
      setCommentsCount(newCount)
      if (onEventUpdate) {
        onEventUpdate(eventId, { commentsCount: newCount })
      }
    }
  }

  if (!activeEvent) {
    return (
      <aside className="w-full space-y-3 pb-8 mb-6">
        <div className="p-5 rounded-2xl border border-stone-200/90 bg-white shadow-2xs space-y-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
            <Sparkles size={16} />
          </div>
          <h4 className="font-serif text-sm font-medium text-stone-900">Community &amp; Logistics</h4>
          <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
            Explore live stage discussions, host verification, and gate logistics for each experience.
          </p>
        </div>
      </aside>
    )
  }

  const hasAssignedSeating = !!(activeEvent.hasAssignedSeating || activeEvent.has_assigned_seating)

  return (
    <>
      <aside className="w-full space-y-3.5 pb-8 mb-6 select-none">
        <div ref={cardRef} className="space-y-3">
          
          {/* 1. UNIFIED STAGE COMMUNITY & HOST PROFILE CARD */}
          <div className="p-4 rounded-2xl border border-stone-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-3.5">
            
            {/* Header / Social Title */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Community &amp; Host
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Stage
              </span>
            </div>

            {/* Social Interaction Buttons Grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLiking}
                aria-label={`Like event (${likesCount} likes)`}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-all cursor-pointer select-none ${
                  isLiked
                    ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-2xs'
                    : 'border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div ref={heartRef}>
                  <Heart
                    size={15}
                    fill={isLiked ? 'currentColor' : 'none'}
                    className={isLiked ? 'text-rose-600' : 'text-stone-500'}
                  />
                </div>
                <span className="text-[10px] font-mono font-medium">
                  {likesCount}
                </span>
              </button>

              {/* Save / Bookmark Button */}
              <button
                type="button"
                onClick={(e) => onToggleBookmark(activeEvent.id, e)}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-all cursor-pointer select-none ${
                  isBookmarked
                    ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-2xs'
                    : 'border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <Bookmark
                  size={15}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  className={isBookmarked ? 'text-amber-500' : 'text-stone-500'}
                />
                <span className="text-[10px] font-mono font-medium">
                  {isBookmarked ? 'Saved' : 'Save'}
                </span>
              </button>

              {/* Share Button */}
              <button
                ref={shareBtnRef}
                type="button"
                onClick={handleShare}
                aria-label="Share event link"
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition cursor-pointer select-none"
              >
                {copiedLink ? (
                  <Check size={15} className="text-emerald-600 animate-in zoom-in duration-200" />
                ) : (
                  <Share2 size={15} className="text-stone-500" />
                )}
                <span className={`text-[10px] font-mono font-medium ${copiedLink ? 'text-emerald-700 font-semibold' : ''}`}>
                  {copiedLink ? 'Copied' : 'Share'}
                </span>
              </button>

              {/* Comments Toggle */}
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                aria-label={`Open stage comments (${commentsCount} comments)`}
                className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition cursor-pointer select-none"
              >
                <MessageSquare size={15} className="text-stone-500" />
                <span className="text-[10px] font-mono font-medium">
                  {commentsCount}
                </span>
              </button>
            </div>

            {/* Host Studio Profile Snippet */}
            <div className="pt-2.5 border-t border-stone-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-stone-50 flex items-center justify-center font-serif text-xs font-bold shadow-2xs shrink-0 select-none">
                {activeEvent.organizer ? activeEvent.organizer.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {activeEvent.organizer || 'Curated Producer'}
                  </h4>
                  <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                </div>
                <p className="text-[10px] text-stone-500 font-mono truncate">
                  Evento Verified Partner
                </p>
              </div>
            </div>

          </div>

          {/* 2. LIVE GATE & VENUE LOGISTICS (Compact Scannable Rows) */}
          <div className="p-4 rounded-2xl border border-stone-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
              Gate &amp; Logistics
            </span>

            <div className="space-y-1.5 text-xs font-mono">
              {/* Venue & City */}
              <div className="flex items-start gap-2 p-2 rounded-xl bg-stone-50/70 border border-stone-200/40">
                <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-stone-900 block text-[11px] truncate">
                    {activeEvent.venue || activeEvent.venueName || 'Main Stage Venue'}
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate">
                    {activeEvent.address ? `${activeEvent.address}, ` : ''}{activeEvent.city || 'Venue City'}
                  </span>
                </div>
              </div>

              {/* Door Schedule */}
              <div className="flex items-start gap-2 p-2 rounded-xl bg-stone-50/70 border border-stone-200/40">
                <Clock size={14} className="text-stone-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-stone-900 block text-[11px]">
                    Doors: {activeEvent.time || activeEvent.startTime || '8:00 PM'}
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate">
                    {activeEvent.dateFormatted || activeEvent.date}
                  </span>
                </div>
              </div>

              {/* Seating Type & Mobile Pass */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <div className="p-2 rounded-xl bg-stone-50/70 border border-stone-200/40">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Armchair size={13} className="shrink-0" />
                    <span className="text-[10px] font-semibold truncate">
                      {hasAssignedSeating ? 'Assigned' : 'Open GA'}
                    </span>
                  </div>
                  <span className="text-[9px] text-stone-500 block truncate mt-0.5">
                    {hasAssignedSeating ? 'Seat Layout' : 'General Entry'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-stone-50/70 border border-stone-200/40">
                  <div className="flex items-center gap-1.5 text-stone-800">
                    <QrCode size={13} className="shrink-0" />
                    <span className="text-[10px] font-semibold truncate">
                      Mobile QR
                    </span>
                  </div>
                  <span className="text-[9px] text-stone-500 block truncate mt-0.5">
                    Instant Access
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. ADMISSION PASSES & QUICK ACCESS CTA (With guaranteed breathing room) */}
          <div className="p-4 rounded-2xl border border-stone-800 bg-stone-900 text-stone-50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Admission Passes
              </span>
              <span className="text-[11px] font-mono text-stone-300">
                From <strong className="text-white font-serif text-sm font-bold">{activeEvent.startingPrice || 'Free'}</strong>
              </span>
            </div>

            <Link
              to={`/events/${activeEvent.id}`}
              className="w-full py-2.5 px-3.5 rounded-xl bg-white text-stone-950 text-xs font-mono font-semibold uppercase tracking-wider hover:bg-stone-100 transition shadow-2xs flex items-center justify-center gap-1.5 group/btn cursor-pointer"
            >
              <span>Explore Passes</span>
              <ChevronRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </aside>

      {/* Reusable Comment & Discussion Drawer */}
      <CommentDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        event={activeEvent}
        onCommentCountChange={handleCommentCountChange}
      />
    </>
  )
}

