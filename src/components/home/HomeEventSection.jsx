import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import HomeEventCard from './HomeEventCard'

export default function HomeEventSection({
  title,
  subtitle,
  icon: Icon,
  badge,
  viewAllLink,
  events = [],
  isLoading = false,
  onBookmarkChange,
}) {
  const scrollContainerRef = useRef(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const hasDraggedRef = useRef(false)
  const [isGrabbing, setIsGrabbing] = useState(false)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' })
    }
  }

  // Desktop Mouse Drag-to-Scroll handlers (Only applies to mouse/trackpad pointer, not native touch)
  const handleMouseDown = (e) => {
    // Only handle primary mouse click (button 0)
    if (e.button !== 0) return
    isDraggingRef.current = true
    hasDraggedRef.current = false
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft
    setIsGrabbing(true)
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.5 // Multiplier for smooth velocity
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true
    }
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
    setIsGrabbing(false)
  }

  // If not loading and no events, don't show an empty block
  if (!isLoading && (!events || events.length === 0)) {
    return null
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {title}
            </h2>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-blue-50 text-blue-700 border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-500 mt-1 pl-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls: View All + Carousel Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mr-2 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {/* Desktop Left / Right Scroll Buttons */}
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="hidden sm:flex w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 items-center justify-center text-stone-700 hover:text-stone-900 shadow-2xs active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right"
            className="hidden sm:flex w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 items-center justify-center text-stone-700 hover:text-stone-900 shadow-2xs active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Event Row (Dual-Axis Native Touch + Desktop Drag) */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden pb-4 pt-1 no-scrollbar select-none ${
          isGrabbing ? 'cursor-grabbing' : 'cursor-grab sm:cursor-default'
        }`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
        }}
      >
        {isLoading ? (
          // Skeleton placeholders
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="min-w-[270px] sm:min-w-[310px] max-w-[310px] bg-stone-50 rounded-xl border border-stone-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 space-y-3 shrink-0 animate-pulse"
            >
              <div className="aspect-[16/10] bg-stone-200 rounded-lg" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
              <div className="h-6 bg-stone-200 rounded mt-4" />
            </div>
          ))
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="min-w-[270px] sm:min-w-[310px] max-w-[310px] shrink-0"
              onClickCapture={(e) => {
                // If user dragged more than 5px, suppress link navigation click
                if (hasDraggedRef.current) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <HomeEventCard
                event={event}
                onBookmarkChange={onBookmarkChange}
              />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
