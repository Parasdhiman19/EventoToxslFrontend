import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Sparkles,
  Mail,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Music,
  Laptop,
  Moon,
  Utensils,
  Wrench,
  Palette,
  Globe
} from 'lucide-react'

const CATEGORY_LINKS = [
  { name: 'Music & Concerts', slug: 'Music & Concerts', icon: Music },
  { name: 'Tech & Conferences', slug: 'Tech & Conferences', icon: Laptop },
  { name: 'Nightlife & Parties', slug: 'Nightlife', icon: Moon },
  { name: 'Food & Tastings', slug: 'Food & Tasting', icon: Utensils },
  { name: 'Art & Exhibitions', slug: 'Art & Exhibitions', icon: Palette },
  { name: 'Workshops & Labs', slug: 'Workshops', icon: Wrench },
]

const EXPLORE_LINKS = [
  { label: 'Discover Feed', path: '/discover' },
  { label: 'Trending Stages', path: '/discover?sort=featured' },
  { label: 'Weekend Passes', path: '/discover?filter=weekend' },
  { label: 'Virtual Experiences', path: '/discover?online=true' },
  { label: 'My Tickets & Wallet', path: '/user/tickets' },
  { label: 'Saved Experiences', path: '/user/saved' },
]

const ORGANIZER_LINKS = [
  { label: 'Create a Stage', path: '/manager/events/create' },
  { label: 'Organizer Studio', path: '/manager/overview' },
  { label: 'Seating Map Designer', path: '/manager/events' },
  { label: 'Ticket Tiers & Pricing', path: '/manager/overview' },
  { label: 'Payouts & Settlement', path: '/manager/payouts' },
  { label: 'Real-time Check-in', path: '/manager/events' },
]

const TRUST_LINKS = [
  { label: 'Help Center & FAQs', path: '/help' },
  { label: '100% Verified Passes', path: '/guarantee' },
  { label: 'Buyer Protection Policy', path: '/protection' },
  { label: 'Refund Guidelines', path: '/refunds' },
  { label: 'Organizer Verification', path: '/verification' },
  { label: 'Security & Anti-Fraud', path: '/security' },
]

const TOP_CITIES = [
  'Chandigarh',
  'New Delhi',
  'Mumbai',
  'Bengaluru',
  'Patiala',
  'Pune',
  'Virtual Global',
]

export default function Footer({
  variant = 'default',
  hideNewsletter = false,
  className = '',
}) {
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email && email.includes('@')) {
      setIsSubscribed(true)
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 5000)
    }
  }

  // Only show newsletter to guests/non-registered visitors
  const showNewsletter = !hideNewsletter && !isAuthenticated

  return (
    <footer
      className={`border-t border-stone-800 bg-stone-950 text-stone-300 select-none ${className}`}
    >
      {/* Tier 1: Compact Drops & Newsletter Strip (Shown only to non-registered guests) */}
      {showNewsletter && (
        <div className="border-b border-stone-900 bg-stone-950">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 shadow-xs">
              
              <div className="space-y-1 max-w-xl">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Never miss a headline concert or festival drop
                </h3>
                <p className="text-xs sm:text-sm text-stone-400">
                  Get weekly curated stage alerts, secret weekend access, and VIP presales in your inbox.
                </p>
              </div>

              <div className="w-full lg:w-auto shrink-0">
                {isSubscribed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs sm:text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>You are subscribed! Check your inbox for updates.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md w-full"
                  >
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder:text-stone-500 text-xs sm:text-sm focus:outline-none focus:border-stone-600 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tier 2: Multi-Column Navigation Directory */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 sm:gap-10">
          
          {/* Column 1 & 2: Brand Identity & Trust */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white text-stone-950 flex items-center justify-center font-bold text-lg font-serif shadow-xs group-hover:bg-blue-500 group-hover:text-white transition-colors">
                E
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif tracking-tight text-white leading-none">
                  Evento
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-medium">
                  Live Stages &amp; Ticketing
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              The premier platform for curated live experiences, interactive stage maps, authentic QR ticketing, and community gatherings.
            </p>

            {/* Live Operational Status Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 1 0-1.45 1.45m1.37 9.74v-8.37H5.09v8.37z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 3: Explore */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-100">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Categories */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-100">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {CATEGORY_LINKS.map((cat) => {
                const Icon = cat.icon
                return (
                  <li key={cat.name}>
                    <Link
                      to={`/discover?category=${encodeURIComponent(cat.slug)}`}
                      className="text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <Icon className="w-3.5 h-3.5 text-stone-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Column 5: For Organizers */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-100">
              Organizers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {ORGANIZER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Support & Trust */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-100">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {TRUST_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Tier 3: Popular City Hubs Strip */}
      <div className="border-t border-stone-900 bg-stone-950/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
            <div className="flex items-center gap-2 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-stone-200">Top Stage Hubs:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              {TOP_CITIES.map((city) => (
                <Link
                  key={city}
                  to={`/discover?city=${encodeURIComponent(city)}`}
                  className="px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-800 text-[11px] sm:text-xs text-stone-300 hover:text-white hover:border-stone-700 transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 4: Bottom Legal & Copyright Strip */}
      <div className="border-t border-stone-900 bg-black">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-stone-400">
            <span>&copy; {new Date().getFullYear()} Evento Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:text-xs">
            <Link to="/terms" className="text-stone-400 hover:text-stone-200 transition-colors">
              Terms of Service
            </Link>
            <span className="text-stone-800 hidden sm:inline">•</span>
            <Link to="/privacy" className="text-stone-400 hover:text-stone-200 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-stone-800 hidden sm:inline">•</span>
            <Link to="/cookies" className="text-stone-400 hover:text-stone-200 transition-colors">
              Cookie Preferences
            </Link>
            <span className="text-stone-800 hidden sm:inline">•</span>
            <Link to="/security" className="text-stone-400 hover:text-stone-200 transition-colors">
              Security &amp; Compliance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
