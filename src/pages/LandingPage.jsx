import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-neutral-900 selection:bg-neutral-200">
      
      {/* Navbar - Matching the crisp white top-bar aesthetic with expanding/contracting animation */}
      <header className={`flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-xl border-b border-neutral-200 sticky top-0 z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? 'py-2 sm:py-3 shadow-sm bg-white/95' : 'py-3 sm:py-4 shadow-2xs'
      }`}>
        <div className="flex items-center gap-2.5 sm:gap-3 group">
          {/* Logo mimicking the dark sidebar square icon */}
          <div className={`bg-neutral-900 text-white flex items-center justify-center font-bold rounded-lg font-serif transition-all duration-300 shadow-xs group-hover:scale-105 ${
            isScrolled ? 'w-6.5 h-6.5 text-xs sm:w-8 sm:h-8 sm:text-sm' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'
          }`}>
            E
          </div>
          <span className={`font-bold tracking-tight font-serif transition-all duration-300 ${
            isScrolled ? 'text-base sm:text-lg' : 'text-base sm:text-lg'
          }`}>Evento</span>
          <span className={`hidden md:inline-flex ml-2 px-2 py-0.5 rounded-full border border-neutral-200 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider font-mono transition-all duration-300 ${
            isScrolled ? 'scale-95' : ''
          }`}>
            Host Studio
          </span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-neutral-500">
          <Link to="/user/discover" className="hover:text-neutral-900 transition-colors">Attendee View</Link>
          <Link to="/manager/overview" className="hover:text-neutral-900 transition-colors">Manager Overview</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/account/login" className="text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-full hover:bg-neutral-100 transition-all active:scale-95">
            Log in
          </Link>
          <Link 
            to="/account/signup" 
            className={`text-xs sm:text-sm font-medium bg-neutral-900 text-white rounded-full flex items-center gap-1.5 hover:bg-neutral-800 active:scale-95 transition-all duration-200 shadow-xs ${
              isScrolled ? 'px-3 py-1.5 text-xs' : 'px-3.5 sm:px-4 py-2'
            }`}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-24 pb-14 sm:pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-6 sm:mb-8 shadow-2xs">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
           Environment • Production
        </div>

        {/* Responsive Serif Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-neutral-900 mb-4 sm:mb-6 tracking-tight max-w-4xl leading-tight">
          Event Management, <br className="hidden sm:block" /> Streamlined.
        </h1>

        <p className="text-sm sm:text-lg text-neutral-500 mb-8 sm:mb-10 max-w-2xl px-2">
          Real-time stage performance, ticket check-ins, and gross payout pipelines for organizers. Seamless discovery and secure booking for attendees.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          {/* Primary Action */}
          <Link 
            to="/manager/overview" 
            className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm w-full sm:w-auto font-mono uppercase tracking-wider"
          >
            <span>+</span> Host an Event
          </Link>
          {/* Secondary Action */}
          <Link 
            to="/user/discover" 
            className="flex items-center justify-center bg-white border border-neutral-300 text-neutral-900 px-6 py-3 rounded text-xs sm:text-sm font-medium hover:bg-neutral-50 transition-colors shadow-sm w-full sm:w-auto font-mono uppercase tracking-wider"
          >
            Attendee View &rarr;
          </Link>
        </div>
      </main>

      {/* Features Section - Modeled directly after the dashboard cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

          {/* Organizer Side */}
          <div className="space-y-6">
            <div className="border-b border-neutral-200 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-serif text-neutral-900 tracking-tight">Host Studio</h2>
                <p className="text-sm text-neutral-500 mt-1">Tools for operations and stage management.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Feature Card 1 */}
              <div className="bg-white border border-neutral-200 p-6 rounded-md shadow-sm hover:border-neutral-300 transition-colors">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Total Revenue</h3>
                <p className="text-xl font-medium text-neutral-900 mb-2">Track Gross Payouts</p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Monitor pipeline revenue, active stages, and average attendance rates with real-time financial tracking.
                </p>
              </div>
              
              {/* Feature Card 2 */}
              <div className="bg-white border border-neutral-200 p-6 rounded-md shadow-sm hover:border-neutral-300 transition-colors">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Active Stages</h3>
                <p className="text-xl font-medium text-neutral-900 mb-2">Manage Inventory</p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Oversee published inventory, ticket velocity, and capacities for all upcoming events.
                </p>
              </div>
            </div>
          </div>

          {/* Attendee Side */}
          <div className="space-y-6">
             <div className="border-b border-neutral-200 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-serif text-neutral-900 tracking-tight">Attendee View</h2>
                <p className="text-sm text-neutral-500 mt-1">A seamless experience for event-goers.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Feature Card 3 */}
              <div className="bg-white border border-neutral-200 p-6 rounded-md shadow-sm hover:border-neutral-300 transition-colors">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Discovery</h3>
                <p className="text-xl font-medium text-neutral-900 mb-2">Find Your Next Event</p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Browse live curated schedules, from Electronic & Indie Sessions to Architecture Summits.
                </p>
              </div>
              
              {/* Feature Card 4 */}
              <div className="bg-white border border-neutral-200 p-6 rounded-md shadow-sm hover:border-neutral-300 transition-colors">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Recent Orders</h3>
                <p className="text-xl font-medium text-neutral-900 mb-2">Secure Ticketing</p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Access saved events, track previous orders, and manage digital tickets in one central dashboard.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-900">
             <div className="w-5 h-5 bg-neutral-900 text-white flex items-center justify-center font-bold rounded-sm text-[10px]">
              E
            </div>
            <span className="text-sm font-semibold tracking-tight">Evento / Nexus Productions</span>
          </div>
          <div className="flex gap-6 text-sm text-neutral-500">
            <span className="hover:text-neutral-900 cursor-pointer">Support</span>
            <span className="hover:text-neutral-900 cursor-pointer">Terms</span>
            <span className="hover:text-neutral-900 cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage