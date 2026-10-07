import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ticket as TicketIcon, Search, X, ChevronsUpDown, Sparkles } from 'lucide-react'
import API from '../../services/api'
import { groupTicketsByOrganizerAndEvent } from '../../utils/ticketGrouping'
import OrganizerTicketGroup from '../../components/tickets/OrganizerTicketGroup'
import EventTicketGroup from '../../components/tickets/EventTicketGroup'
import CompactTicketRow from '../../components/tickets/CompactTicketRow'
import DigitalPassModal from '../../components/tickets/DigitalPassModal'

export default function MyTickets() {
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' | 'past'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Expand / Collapse State (stores IDs/keys of collapsed sections)
  const [collapsedOrganizers, setCollapsedOrganizers] = useState(new Set())
  const [collapsedEvents, setCollapsedEvents] = useState(new Set())

  useEffect(() => {
    let isMounted = true

    const fetchTickets = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const res = await API.get('tickets/user/passes/')
        if (isMounted) {
          if (Array.isArray(res.data)) {
            setTickets(res.data)
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.detail || 'Failed to load your digital passes.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTickets()

    return () => {
      isMounted = false
    }
  }, [])

  // 1. Separate into Upcoming and Past Passes
  const upcomingTickets = useMemo(() => {
    return tickets.filter((t) => (t.status || 'upcoming') === 'upcoming')
  }, [tickets])

  const pastTickets = useMemo(() => {
    return tickets.filter((t) => t.status === 'past')
  }, [tickets])

  const currentTabTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets

  // 2. Filter tickets based on active search query
  const searchedTickets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return currentTabTickets

    return currentTabTickets.filter((t) => {
      const org = (t.organizer || '').toLowerCase()
      const title = (t.eventTitle || t.event || '').toLowerCase()
      const venue = (t.venue || '').toLowerCase()
      const tier = (t.tier || '').toLowerCase()
      const code = (t.ticketCode || t.barcode || t.id || '').toLowerCase()
      const order = (t.orderId || '').toLowerCase()
      const name = (t.attendeeName || t.name || '').toLowerCase()

      return (
        org.includes(q) ||
        title.includes(q) ||
        venue.includes(q) ||
        tier.includes(q) ||
        code.includes(q) ||
        order.includes(q) ||
        name.includes(q)
      )
    })
  }, [currentTabTickets, searchQuery])

  // 3. Transform into hierarchical structure: Organizer -> Events -> Tickets
  const groupedOrganizers = useMemo(() => {
    return groupTicketsByOrganizerAndEvent(searchedTickets)
  }, [searchedTickets])

  // Toggle single organizer collapse
  const toggleOrganizer = (organizerName) => {
    setCollapsedOrganizers((prev) => {
      const next = new Set(prev)
      if (next.has(organizerName)) {
        next.delete(organizerName)
      } else {
        next.add(organizerName)
      }
      return next
    })
  }

  // Toggle single event collapse
  const toggleEvent = (eventKey) => {
    setCollapsedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventKey)) {
        next.delete(eventKey)
      } else {
        next.add(eventKey)
      }
      return next
    })
  }

  // Expand all / Collapse all helper
  const allCollapsed = groupedOrganizers.length > 0 && groupedOrganizers.every((o) => collapsedOrganizers.has(o.organizerName))

  const handleToggleExpandAll = () => {
    if (allCollapsed) {
      // Expand everything
      setCollapsedOrganizers(new Set())
      setCollapsedEvents(new Set())
    } else {
      // Collapse everything
      const allOrgNames = new Set(groupedOrganizers.map((o) => o.organizerName))
      const allEventKeys = new Set(
        groupedOrganizers.flatMap((o) => o.events.map((e) => `${o.organizerName}::${e.eventTitle}`))
      )
      setCollapsedOrganizers(allOrgNames)
      setCollapsedEvents(allEventKeys)
    }
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-10">

      {/* ── Mobile Hero Header ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden
                   rounded-none md:rounded-2xl
                   bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950
                   px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8
                   shadow-xl
                   -mx-2.5 sm:mx-0 -mt-2.5 sm:mt-0 mb-6 md:mb-8"
      >
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-500/8 blur-2xl" />

        {/* Header content */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            text-[10px] font-mono font-semibold uppercase tracking-widest
                            text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-3">
              <Sparkles className="w-3 h-3" />
              Digital Passes
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              My Tickets &amp; Passes
            </h1>
            <p className="text-xs text-stone-400 mt-1.5 max-w-xs leading-relaxed">
              Access QR codes, view seating tiers &amp; retrieve invoice receipts.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-sm rounded-xl
                          border border-white/10 w-fit shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { setActiveTab('upcoming'); setSearchQuery('') }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
                ${activeTab === 'upcoming'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Upcoming
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono
                ${activeTab === 'upcoming' ? 'bg-stone-900 text-white' : 'bg-white/10 text-stone-400'}`}>
                {upcomingTickets.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('past'); setSearchQuery('') }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
                ${activeTab === 'past'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
                }`}
            >
              Past
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono
                ${activeTab === 'past' ? 'bg-stone-900 text-white' : 'bg-white/10 text-stone-400'}`}>
                {pastTickets.length}
              </span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold font-mono text-white">{tickets.length}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wide font-mono mt-0.5">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono text-amber-400">{upcomingTickets.length}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wide font-mono mt-0.5">Upcoming</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono text-stone-400">{pastTickets.length}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wide font-mono mt-0.5">Past</p>
          </div>
        </div>
      </div>

      {/* ── Search & Expand Strip ──────────────────────────────────── */}
      {currentTabTickets.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, organizer, or code..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-stone-200 rounded-2xl
                         text-sm text-stone-900 placeholder:text-stone-400
                         focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400
                         shadow-sm transition-all font-sans"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-stone-400 hover:text-stone-700 p-1 cursor-pointer
                           rounded-full hover:bg-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isSearching && groupedOrganizers.length > 0 && (
            <button
              type="button"
              onClick={handleToggleExpandAll}
              title={allCollapsed ? 'Expand All' : 'Collapse All'}
              className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl border border-stone-200
                         bg-white hover:bg-stone-50 text-stone-600 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <ChevronsUpDown className="w-4 h-4" />
              <span className="text-xs font-mono hidden sm:inline">{allCollapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}
        </div>
      )}

      {/* ── Loading Skeleton ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm animate-pulse">
              <div className="p-4 bg-stone-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-stone-200 rounded" />
                  <div className="h-3 w-20 bg-stone-100 rounded" />
                </div>
                <div className="h-6 w-16 bg-stone-200 rounded-full shrink-0" />
              </div>
              <div className="p-4 space-y-3 border-t border-stone-100">
                <div className="h-16 bg-stone-100 rounded-xl" />
                <div className="h-16 bg-stone-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        /* Error State */
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="font-semibold text-red-700 text-sm">{fetchError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : groupedOrganizers.length > 0 ? (
        /* Hierarchical Grouped Organizers & Events */
        <div className="space-y-4">
          {groupedOrganizers.map((org) => {
            const isOrgExpanded = isSearching ? true : !collapsedOrganizers.has(org.organizerName)
            return (
              <OrganizerTicketGroup
                key={org.organizerName}
                organizer={org}
                isExpanded={isOrgExpanded}
                onToggle={() => toggleOrganizer(org.organizerName)}
              >
                <div className="space-y-3">
                  {org.events.map((ev) => {
                    const eventKey = `${org.organizerName}::${ev.eventTitle}`
                    const isEventExpanded = isSearching ? true : !collapsedEvents.has(eventKey)
                    return (
                      <EventTicketGroup
                        key={eventKey}
                        event={ev}
                        isExpanded={isEventExpanded}
                        onToggle={() => toggleEvent(eventKey)}
                      >
                        <div className="space-y-2">
                          {ev.tickets.map((ticket) => (
                            <CompactTicketRow
                              key={ticket.id || ticket.ticketCode}
                              ticket={ticket}
                              isPast={activeTab === 'past'}
                              onViewPass={(t) => setSelectedTicket(t)}
                            />
                          ))}
                        </div>
                      </EventTicketGroup>
                    )
                  })}
                </div>
              </OrganizerTicketGroup>
            )
          })}
        </div>
      ) : isSearching ? (
        /* Search Empty State */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-stone-400" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 text-sm">
              No passes for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Try a different event title, organizer, or tier name.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Default Empty State */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 sm:p-16 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700
                          text-amber-400 flex items-center justify-center shadow-lg">
            <TicketIcon size={28} />
          </div>
          <div className="space-y-1.5">
            <p className="font-serif text-lg font-semibold text-stone-900">
              No {activeTab} tickets yet
            </p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Discover upcoming live stages and curate your weekend agenda.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5
                       text-xs font-mono font-semibold uppercase tracking-wider text-white
                       hover:bg-stone-800 transition-colors shadow-sm active:scale-95"
          >
            <Sparkles size={13} className="text-amber-400" />
            Explore Events &rarr;
          </Link>
        </div>
      )}

      {/* Digital Pass Modal */}
      {selectedTicket && (
        <DigitalPassModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}