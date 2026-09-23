import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Ticket as TicketIcon, Search, X, ChevronsUpDown } from 'lucide-react'
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
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            My Tickets &amp; Passes
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Access door QR barcodes, view seating tiers, and retrieve invoice receipts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200/80 w-fit">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upcoming')
              setSearchQuery('')
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-stone-900 text-stone-50 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Upcoming ({upcomingTickets.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('past')
              setSearchQuery('')
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-stone-900 text-stone-50 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Past Stages ({pastTickets.length})
          </button>
        </div>
      </div>

      {/* Search Input Bar & Quick Action Strip */}
      {currentTabTickets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, organizer, venue, tier, or ticket code..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 shadow-2xs transition-all font-sans"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Expand All / Collapse All Toggle Button */}
          {!isSearching && groupedOrganizers.length > 0 && (
            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-mono text-stone-700 shadow-2xs transition-colors cursor-pointer shrink-0 select-none"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs animate-pulse space-y-4">
              <div className="h-5 w-32 bg-stone-200 rounded" />
              <div className="h-14 bg-stone-100 rounded-xl" />
              <div className="h-14 bg-stone-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-xs text-red-700 space-y-2">
          <p className="font-semibold">{fetchError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-stone-900 underline font-mono cursor-pointer"
          >
            Click to retry
          </button>
        </div>
      ) : groupedOrganizers.length > 0 ? (
        /* Hierarchical Grouped Organizers & Events */
        <div className="space-y-5">
          {groupedOrganizers.map((org) => {
            // Auto-expand during search so matches are immediately visible
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
        <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-3 bg-white">
          <p className="font-semibold text-stone-900 text-sm">
            No passes found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-stone-500">
            Try searching for a different organizer, event title, or tier name.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Default Empty State */
        <div className="rounded-xl border border-dashed border-stone-300 p-16 text-center space-y-4 bg-white">
          <div className="h-12 w-12 mx-auto rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
            <TicketIcon size={24} />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg font-medium text-stone-900">No {activeTab} tickets found</p>
            <p className="text-xs text-stone-500">Discover upcoming stages and curate your weekend agenda.</p>
          </div>
          <Link
            to="/user/discover"
            className="inline-block rounded-md bg-stone-900 px-5 py-2.5 text-xs font-mono font-medium uppercase tracking-wider text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs"
          >
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