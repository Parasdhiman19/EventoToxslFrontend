import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, Search, Loader2, AlertCircle, RefreshCw, Calendar, MapPin, DollarSign, Users,
  Trash2, Archive, AlertTriangle, X, CheckCircle2
} from 'lucide-react'
import API from '../../services/api'
import DeleteArchiveEventModal from '../../components/modals/DeleteArchiveEventModal'

export default function MyEvents() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'published' | 'draft' | 'past'
  const [searchQuery, setSearchQuery] = useState('')

  // Delete / Archive Modal State
  const [deletingEvent, setDeletingEvent] = useState(null)

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await API.get('events/manager/')
      setEvents(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load events. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSuccess = ({ eventId, deleted, isPermanent }) => {
    if (deleted || isPermanent) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } else {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'past' } : e))
      )
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const counts = useMemo(() => {
    return {
      all: events.length,
      published: events.filter((e) => e.status === 'published' && e.userRole !== 'staff').length,
      draft: events.filter((e) => e.status === 'draft' && e.userRole !== 'staff').length,
      staff: events.filter((e) => e.userRole === 'staff').length,
      past: events.filter((e) => e.status === 'past' && e.userRole !== 'staff').length,
    }
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      let matchesTab = true
      if (activeTab === 'published') {
        matchesTab = event.status === 'published' && event.userRole !== 'staff'
      } else if (activeTab === 'draft') {
        matchesTab = event.status === 'draft' && event.userRole !== 'staff'
      } else if (activeTab === 'staff') {
        matchesTab = event.userRole === 'staff'
      } else if (activeTab === 'past') {
        matchesTab = event.status === 'past' && event.userRole !== 'staff'
      }

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesTab

      const idStr = String(event.id || '').toLowerCase()
      const titleStr = (event.title || '').toLowerCase()
      const venueStr = (event.venueName || event.venue || event.venue_name || '').toLowerCase()
      const cityStr = (event.city || '').toLowerCase()
      const catStr = (event.category || '').toLowerCase()

      const matchesSearch =
        titleStr.includes(q) ||
        venueStr.includes(q) ||
        idStr.includes(q) ||
        cityStr.includes(q) ||
        catStr.includes(q)

      return matchesTab && matchesSearch
    })
  }, [events, activeTab, searchQuery])

  const getStatusBadge = (status, userRole) => {
    if (userRole === 'staff') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
          Staff Gate Role
        </span>
      )
    }

    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Draft
          </span>
        )
      case 'past':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
            Ended
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
            {status || 'Unknown'}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            My Events
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize stages, adjust ticket quotas, and monitor live inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEvents}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh events"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/manager/events/create"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-stone-900 px-4 py-2 text-xs font-mono font-medium uppercase tracking-wider text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer w-fit"
          >
            <Plus size={14} /> Host New Event
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load events</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchEvents}
            className="underline text-xs font-mono hover:text-red-900 shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200/80 w-fit overflow-x-auto">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'published', label: 'Active' },
            { key: 'draft', label: 'Drafts' },
            { key: 'staff', label: 'Staff Assignments' },
            { key: 'past', label: 'Ended' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  activeTab === tab.key ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/80 text-stone-500'
                }`}
              >
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by title, venue, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Events Table Container */}
      <section className="rounded-lg border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={28} className="animate-spin text-stone-400" />
            <p className="font-mono text-xs text-stone-400 uppercase tracking-wider">
              Retrieving stage roster...
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
                  <tr>
                    <th className="px-5 py-3 font-medium">Event Details</th>
                    <th className="px-5 py-3 font-medium">Date &amp; Time</th>
                    <th className="px-5 py-3 font-medium">Ticket Pricing</th>
                    <th className="px-5 py-3 font-medium">Capacity / Sold</th>
                    <th className="px-5 py-3 font-medium">Gross Revenue</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-normal">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const totalCap = event.totalCapacity || 0
                      const sold = event.ticketsSold || 0
                      const percentage = totalCap > 0 ? Math.round((sold / totalCap) * 100) : 0
                      const venueLabel = event.is_online
                        ? 'Virtual / Online Stream'
                        : [event.venueName || event.venue || event.venue_name, event.city].filter(Boolean).join(' • ') || 'Location TBA'
                      const dateDisplay = event.dateFormatted || event.date || 'Date TBA'
                      const timeDisplay = event.time || (event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : '')

                      return (
                        <tr key={event.id} className="hover:bg-stone-50/60 transition-colors">
                          {/* Title & Venue */}
                          <td className="px-5 py-4 min-w-[220px]">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-stone-400">EV-{event.id}</span>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                                • {event.category || 'General'}
                              </span>
                            </div>
                            <div className="font-medium text-stone-900 mt-0.5 text-sm">
                              {event.title}
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {venueLabel}
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="font-mono text-stone-800">{dateDisplay}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{timeDisplay}</div>
                          </td>

                          {/* Price Range */}
                          <td className="px-5 py-4 font-mono text-stone-700 whitespace-nowrap">
                            {event.priceRange || event.startingPrice || 'Free'}
                          </td>

                          {/* Ticket Progress */}
                          <td className="px-5 py-4 min-w-[150px]">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-medium text-stone-900">
                                {sold} / {totalCap}
                              </span>
                              <span className="text-stone-400 font-mono">{percentage}%</span>
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                          </td>

                          {/* Gross Revenue */}
                          <td className="px-5 py-4 font-mono font-medium text-stone-900 whitespace-nowrap">
                            {event.grossRevenue || '$0.00'}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {getStatusBadge(event.status, event.userRole)}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3 font-mono">
                              {event.userRole === 'staff' ? (
                                <Link
                                  to={`/manager/attendees?event=${event.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-mono font-medium transition shadow-2xs"
                                >
                                  Scan &amp; Check-In &rarr;
                                </Link>
                              ) : (
                                <>
                                  <Link
                                    to={`/manager/events/${event.id}/edit`}
                                    className="text-stone-600 hover:text-stone-950 underline underline-offset-2 text-xs"
                                  >
                                    Edit
                                  </Link>
                                  <Link
                                    to={`/manager/events/${event.id}`}
                                    className="text-stone-900 font-medium hover:underline underline-offset-2 text-xs"
                                  >
                                    Dashboard &rarr;
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteError(null)
                                      setDeleteMode('archive')
                                      setDeletingEvent(event)
                                    }}
                                    className="text-stone-400 hover:text-red-600 transition p-1 rounded hover:bg-stone-100 cursor-pointer"
                                    title="Delete / Archive Stage"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-5 py-16 text-center text-stone-400">
                        <div className="space-y-2 max-w-sm mx-auto">
                          <p className="font-serif text-base text-stone-700">No events found</p>
                          <p className="text-xs text-stone-400">
                            {searchQuery
                              ? `No stages matching "${searchQuery}". Try modifying your query.`
                              : events.length === 0
                              ? 'You have not hosted any events yet. Create your first event to get started.'
                              : `No events in the "${activeTab}" category.`}
                          </p>
                          {events.length === 0 && (
                            <div className="pt-2">
                              <Link
                                to="/manager/events/create"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono uppercase"
                              >
                                <Plus size={13} /> Host First Event
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Events Card List */}
            <div className="md:hidden p-4 space-y-4 divide-y divide-stone-100">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, idx) => {
                  const totalCap = event.totalCapacity || 0
                  const sold = event.ticketsSold || 0
                  const percentage = totalCap > 0 ? Math.round((sold / totalCap) * 100) : 0
                  const venueLabel = event.is_online
                    ? 'Virtual / Online Stream'
                    : [event.venueName || event.venue || event.venue_name, event.city].filter(Boolean).join(' • ') || 'Location TBA'
                  const dateDisplay = event.dateFormatted || event.date || 'Date TBA'
                  const timeDisplay = event.time || (event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : '')

                  return (
                    <div key={event.id} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                      {/* Header: ID, Category & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400">
                            <span>EV-{event.id}</span>
                            <span>•</span>
                            <span className="uppercase">{event.category || 'General'}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-stone-900 mt-0.5 leading-snug">
                            {event.title}
                          </h3>
                          <p className="text-[11px] text-stone-500 mt-0.5">{venueLabel}</p>
                        </div>
                        <div className="shrink-0">{getStatusBadge(event.status, event.userRole)}</div>
                      </div>

                      {/* Schedule & Price Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded bg-stone-50 border border-stone-200/60">
                          <span className="text-[10px] uppercase text-stone-400 block flex items-center gap-1">
                            <Calendar size={10} /> Schedule
                          </span>
                          <span className="text-stone-800 font-medium block mt-0.5">{dateDisplay}</span>
                          <span className="text-[10px] text-stone-400 block">{timeDisplay}</span>
                        </div>
                        <div className="p-2.5 rounded bg-stone-50 border border-stone-200/60">
                          <span className="text-[10px] uppercase text-stone-400 block flex items-center gap-1">
                            <DollarSign size={10} /> Pricing / Gross
                          </span>
                          <span className="text-stone-800 font-medium truncate block mt-0.5">
                            {event.priceRange || event.startingPrice || 'Free'}
                          </span>
                          <span className="text-stone-900 font-semibold block">{event.grossRevenue || '$0.00'}</span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-stone-500 flex items-center gap-1">
                            <Users size={11} /> Tickets Sold:
                          </span>
                          <span className="font-medium text-stone-900">
                            {sold} / {totalCap} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {event.userRole === 'staff' ? (
                          <Link
                            to={`/manager/attendees?event=${event.id}`}
                            className="w-full py-2 px-3 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 text-center shadow-2xs inline-flex items-center justify-center gap-1.5"
                          >
                            Scan &amp; Check-In Attendees &rarr;
                          </Link>
                        ) : (
                          <>
                            <Link
                              to={`/manager/events/${event.id}/edit`}
                              className="flex-1 py-2 px-3 rounded-md border border-stone-300 bg-white text-stone-700 text-xs font-mono font-medium hover:bg-stone-50 text-center"
                            >
                              Edit Event
                            </Link>
                            <Link
                              to={`/manager/events/${event.id}`}
                              className="flex-1 py-2 px-3 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 text-center shadow-2xs"
                            >
                              Dashboard &rarr;
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null)
                                setDeleteMode('archive')
                                setDeletingEvent(event)
                              }}
                              className="p-2 border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 rounded-md bg-white transition cursor-pointer"
                              title="Delete / Archive"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-10 text-center text-stone-400 space-y-2">
                  <p className="font-serif text-sm text-stone-600">No events found</p>
                  <p className="text-xs text-stone-400">
                    {searchQuery
                      ? `No stages matching "${searchQuery}".`
                      : events.length === 0
                      ? 'You have not hosted any events yet.'
                      : 'No events in this category.'}
                  </p>
                  {events.length === 0 && (
                    <div className="pt-2">
                      <Link
                        to="/manager/events/create"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono"
                      >
                        <Plus size={13} /> Host Event
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ========================================================================= */}
      {/* DELETE / ARCHIVE EVENT CONFIRMATION MODAL */}
      {/* Delete / Archive Event Modal */}
      <DeleteArchiveEventModal
        isOpen={Boolean(deletingEvent)}
        event={deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}