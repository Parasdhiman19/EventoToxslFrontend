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
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200/80 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Browse by Category
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Explore events across your favorite categories
          </p>
        </div>

        <Link
          to="/discover"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group self-start sm:self-auto"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Categories Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.name}
              to={`/discover?category=${encodeURIComponent(cat.slug)}`}
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.badgeBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-stone-950 transition-colors truncate">
                  {cat.name}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
