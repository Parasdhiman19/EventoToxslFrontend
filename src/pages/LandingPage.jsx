import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Sparkles, ArrowRight, Building2, Ticket, Compass, Receipt, Layers, ShieldCheck } from 'lucide-react'
import { useAuthPrompt } from '../context/AuthPromptContext'

export default function LandingPage() {
  const { isAuthenticated, isOrganizer } = useSelector((state) => state.auth || {})
  const { openAuthPrompt } = useAuthPrompt()

  const handleHostClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      openAuthPrompt({
        actionType: 'host',
        title: 'Host Experiences on Evento',
        subtitle: 'Sign in or create an organizer account to host events, customize seating plans, and sell passes.',
      })
    }
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white p-8 sm:p-14 lg:p-20 text-center overflow-hidden border border-stone-800 shadow-xl">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-800/80 border border-stone-700/80 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-amber-400 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Stages • Production Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-tight">
            Event Management, <br className="hidden sm:block" /> Streamlined for Creators.
          </h1>

          <p className="text-sm sm:text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Real-time stage performance, ticket check-ins, and gross payout pipelines for organizers. Seamless discovery and verified digital passes for attendees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              to={isOrganizer ? "/manager/overview" : "/account/signup"}
              onClick={handleHostClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Building2 size={16} />
              <span>{isAuthenticated ? (isOrganizer ? 'Host Studio Dashboard' : 'Become a Host') : '+ Host an Event'}</span>
            </Link>

            <Link
              to="/discover"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800/90 hover:bg-stone-700 text-stone-100 border border-stone-700 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Compass size={16} />
              <span>Explore Live Stages &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid: Two Columns (Host Studio vs Attendee View) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900">
            A Dual Platform for Both Sides of Live Events
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Everything you need whether you are organizing a stadium concert or attending an intimate acoustic session.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 pt-4">
          {/* Organizer Column */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">Host Studio</h3>
                  <p className="text-xs text-stone-500">Tools for venue and stage operations</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                For Organizers
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-900 uppercase">
                  <Layers size={14} className="text-amber-600" />
                  <span>Interactive Venue Seat Builder</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Design complex stadium, theatre, and club seating layouts with custom rows, tiers, and VIP tables.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-900 uppercase">
                  <Receipt size={14} className="text-amber-600" />
                  <span>Gross Payouts & Settlement</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Direct revenue pipelines with transparent platform fees, automated invoicing, and instant bank transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Attendee Column */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">Attendee Experience</h3>
                  <p className="text-xs text-stone-500">Curated discovery &amp; verified access</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                For Guests
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-900 uppercase">
                  <Compass size={14} className="text-blue-600" />
                  <span>Live Dynamic Feed & Discovery</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Browse video highlights, live discussions, community comments, and curated genre collections.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-900 uppercase">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span>Cryptographic QR Passes</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Instant mobile wallet passes with dynamic QR codes for fast zero-fraud gate check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}