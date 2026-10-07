import { Link } from 'react-router-dom'
import {
  Music,
  Laptop,
  Wine,
  Utensils,
  Palette,
  Wrench,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

const CATEGORIES = [
  {
    name: 'Music',
    slug: 'Music & Concerts',
    icon: Music,
    badgeBg: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Tech',
    slug: 'Tech & Conferences',
    icon: Laptop,
    badgeBg: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Nightlife',
    slug: 'Nightlife',
    icon: Wine,
    badgeBg: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Food & Drinks',
    slug: 'Food & Tasting',
    icon: Utensils,
    badgeBg: 'bg-amber-100 text-amber-600',
  },
  {
    name: 'Art & Design',
    slug: 'Art & Exhibitions',
    icon: Palette,
    badgeBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    name: 'Workshops',
    slug: 'Workshops',
    icon: Wrench,
    badgeBg: 'bg-violet-100 text-violet-600',
  },
]

export default function HomeCategorySection() {
  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-2.5 sm:pb-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-stone-900">
            Browse by Category
          </h2>
          <p className="text-[11px] sm:text-sm text-stone-500 mt-0.5">
            Explore live stages and experiences
          </p>
        </div>

        <Link
          to="/discover"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Categories: Horizontal Swipe on Mobile / Grid on Tablet & Desktop */}
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar touch-auto -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.name}
              to={`/discover?category=${encodeURIComponent(cat.slug)}`}
              className="group flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2 sm:p-3.5 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer min-w-[130px] sm:min-w-0 shadow-2xs"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.badgeBg}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-stone-950 transition-colors truncate">
                  {cat.name}
                </span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
