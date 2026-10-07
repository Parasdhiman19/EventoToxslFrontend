import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Sparkles, ArrowUpRight } from 'lucide-react'

export default function Footer({
  className = '',
  onOpenBecomeOrganizer,
}) {
  const { isAuthenticated, isOrganizer } = useSelector((state) => state.auth || {})

  const handleOrganizerClick = (e) => {
    if (isAuthenticated && !isOrganizer && onOpenBecomeOrganizer) {
      e.preventDefault()
      onOpenBecomeOrganizer()
    }
  }

  return (
    <footer className={`border-t border-stone-200/80 bg-white text-stone-600 select-none ${className}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* Left: Brand Identity & Status */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 text-center sm:text-left">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-serif font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="font-serif font-bold tracking-tight text-stone-900 text-base">
                Evento
              </span>
            </Link>

            <span className="hidden sm:inline-block text-stone-300">•</span>

            <p className="text-xs text-stone-500 font-sans">
              Live stages, interactive seating &amp; digital ticketing.
            </p>

            <span className="hidden lg:inline-block text-stone-300">•</span>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational</span>
            </div>
          </div>

          {/* Right: Quick Links & Legal */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-xs font-medium text-stone-600">
            <Link to="/discover" className="hover:text-stone-900 transition-colors">
              Discover
            </Link>

            {isOrganizer ? (
              <Link to="/manager/overview" className="hover:text-stone-900 transition-colors inline-flex items-center gap-1">
                <span>Manager Studio</span>
                <ArrowUpRight size={11} className="text-stone-400" />
              </Link>
            ) : (
              <Link 
                to="/manager/events/create" 
                onClick={handleOrganizerClick}
                className="hover:text-amber-800 text-amber-700 transition-colors inline-flex items-center gap-1"
              >
                <Sparkles size={11} className="text-amber-500" />
                <span>Host on Evento</span>
              </Link>
            )}

            <Link to="/user/support" className="hover:text-stone-900 transition-colors">
              Support
            </Link>

            <Link to="/terms" className="text-stone-400 hover:text-stone-700 transition-colors">
              Terms
            </Link>

            <Link to="/privacy" className="text-stone-400 hover:text-stone-700 transition-colors">
              Privacy
            </Link>

            <span className="text-stone-400 font-mono text-[11px] pl-1">
              &copy; {new Date().getFullYear()} Evento Inc.
            </span>
          </div>

        </div>
      </div>
    </footer>
  )
}

