import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-stone-50">
      {/* Left Editorial Brand & Feature Panel */}
      <section className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col justify-between p-12 bg-stone-900 text-stone-100 relative overflow-hidden border-r border-stone-800">
        {/* Subtle dot-grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 text-lg font-serif tracking-tight font-semibold">
            <span className="h-7 w-7 rounded bg-stone-100 text-stone-950 flex items-center justify-center font-sans font-bold text-xs">
              E
            </span>
            Evento
          </Link>
        </div>

        {/* Event Narrative Copy & Mini Feature Card */}
        <div className="relative z-10 space-y-8 max-w-sm">
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-snug text-stone-100">
              Host memorable gatherings. Sell and discover tickets seamlessly.
            </p>
            <p className="text-xs leading-relaxed text-stone-400">
              A unified platform built for organizers managing live stages, conferences, and community meetups.
            </p>
          </div>

          {/* Ticket/Live Event Stat Preview */}
          <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-4 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-stone-400">
              <span>Live Ticketing</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-stone-800/80 pt-3">
              <span className="text-xs text-stone-300">Manager Dashboard</span>
              <span className="text-xs font-medium text-stone-100">Instant Payouts</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-stone-400">
          <span>&copy; {new Date().getFullYear()} Evento Platform</span>
          <Link to="/terms" className="hover:text-stone-200 transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-stone-200 transition-colors">Privacy</Link>
        </div>
      </section>

      {/* Right Content Panel (Auth Form Injection) */}
      <section className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col justify-between min-h-screen px-6 py-10 sm:px-12 md:px-20">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden pb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-base font-serif font-bold">
            <span className="h-6 w-6 rounded bg-stone-900 text-stone-50 flex items-center justify-center text-xs">
              E
            </span>
            Evento
          </Link>
          <Link to="/explore" className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Browse Events &rarr;
          </Link>
        </div>

        {/* Dynamic Outlet Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <Outlet />
        </div>

        {/* Sub-footer */}
        <footer className="text-center lg:text-left text-xs text-stone-400 pt-8 border-t border-stone-200/80 lg:border-none">
          <p>Secure ticketing and verified checkout powered by Evento.</p>
        </footer>
      </section>
    </main>
  )
}