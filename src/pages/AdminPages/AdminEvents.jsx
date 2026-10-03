import React, { useState, useEffect } from 'react'
import API from '../../services/api'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  Calendar,
  Search,
  Eye,
  CheckCircle,
  Ban,
  Star,
  RefreshCw,
  ExternalLink,
  X,
  Users,
  DollarSign,
  QrCode,
  MapPin,
  Clock,
  Building2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEventDetail, setSelectedEventDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedEvents,
    goToPage,
    setPageSize,
  } = usePagination(events, { initialPageSize: 15, resetDeps: [statusFilter, search] })

  const fetchEvents = async () => {
    setLoading(true)
    setError('')
    try {
      let url = `admin/events/?status=${statusFilter}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      const res = await API.get(url)
      setEvents(res.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to load platform event catalog.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchEvents()
  }

  const handleStatusChange = async (eventId, newStatus, reason = 'Administrative update') => {
    setActionLoadingId(eventId)
    try {
      await API.patch(`admin/events/${eventId}/status/`, { status: newStatus, reason })
      setFeedback(`Event successfully updated to ${newStatus}.`)
      fetchEvents()
      if (selectedEventDetail && selectedEventDetail.event.id === eventId) {
        setSelectedEventDetail((prev) => ({
          ...prev,
          event: {
            ...prev.event,
            status: newStatus,
          },
        }))
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update event status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleToggleFeatured = async (eventId) => {
    setActionLoadingId(eventId)
    try {
      const res = await API.post(`admin/events/${eventId}/toggle-featured/`)
      setFeedback(res.data.detail)
      fetchEvents()
    } catch (err) {
      alert('Failed to toggle featured status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const openEventDetail = async (eventId) => {
    setLoadingDetail(true)
    try {
      const res = await API.get(`admin/events/${eventId}/`)
      setSelectedEventDetail(res.data)
    } catch (err) {
      alert('Could not load event details.')
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Event Catalog & Moderation
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Platform-wide event controls, tier breakdown inspection, and status moderation.
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-mono transition self-start sm:self-auto shadow-2xs active:scale-95 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none flex-nowrap">
          {['all', 'published', 'draft', 'suspended', 'cancelled', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, host, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-900 transition font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-mono rounded-lg hover:bg-stone-800 transition shrink-0"
          >
            Find
          </button>
        </form>
      </div>

      {/* Events Table Card */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden max-w-full">
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-stone-500 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <span>Loading events catalog...</span>
          </div>
        ) : error ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3 text-rose-600">
            <AlertTriangle size={24} className="text-rose-500" />
            <div className="text-xs font-mono font-medium">{error}</div>
            <button
              onClick={fetchEvents}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-mono transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center text-xs font-mono text-stone-400">
            No events matched the selected filter or search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Event & Location</th>
                  <th className="py-3 px-4">Organizer / Host</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Sales / Cap</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedEvents.map((ev) => {
                  let statusBadgeClass = 'bg-stone-100 text-stone-700 border-stone-200'
                  if (ev.status === 'published') statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  if (ev.status === 'draft') statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200'
                  if (ev.status === 'suspended') statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200'
                  if (ev.status === 'cancelled') statusBadgeClass = 'bg-zinc-100 text-zinc-600 border-zinc-300'
                  if (ev.status === 'past') statusBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200'

                  return (
                    <tr key={ev.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {ev.banner_url ? (
                            <img
                              src={ev.banner_url}
                              alt=""
                              className="w-12 h-8 rounded object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200 shrink-0">
                              <Calendar size={14} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-stone-900 truncate max-w-xs flex items-center gap-1.5">
                              <span>{ev.title}</span>
                              {ev.isFeatured && (
                                <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                              {ev.category} • {ev.city || 'Online'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-medium text-stone-900 truncate max-w-[150px]">{ev.organizerName}</div>
                        <div className="text-stone-400 truncate max-w-[150px]">{ev.organizerEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                        {ev.date || 'TBA'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="font-semibold text-stone-900">{ev.ticketsSold}</span>
                        <span className="text-stone-400"> / {ev.totalCapacity || '∞'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-stone-900">
                        {ev.grossRevenue}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-medium border ${statusBadgeClass}`}>
                          {ev.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEventDetail(ev.id)}
                            title="Inspect Details"
                            className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(ev.id)}
                            title={ev.isFeatured ? 'Remove from Featured' : 'Feature Event'}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              ev.isFeatured
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-stone-400 hover:text-amber-600 hover:bg-stone-100'
                            }`}
                          >
                            <Star size={14} className={ev.isFeatured ? 'fill-amber-500' : ''} />
                          </button>

                          {ev.status !== 'published' ? (
                            <button
                              onClick={() => handleStatusChange(ev.id, 'published')}
                              title="Approve & Publish"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(ev.id, 'suspended', 'Policy review')}
                              title="Suspend / Hide Event"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          itemLabel="events"
        />
      </div>

      {/* Slide-over Inspection Sheet */}
      {selectedEventDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedEventDetail(null)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Canvas */}
          <div className="relative w-full sm:max-w-xl bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                      Event #{selectedEventDetail.event.id}
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded ${
                      selectedEventDetail.event.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                      selectedEventDetail.event.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                      selectedEventDetail.event.status === 'suspended' ? 'bg-rose-50 text-rose-700' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {selectedEventDetail.event.status}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-2">
                    {selectedEventDetail.event.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEventDetail(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Event Metadata Banner */}
              {selectedEventDetail.event.banner_url && (
                <div className="rounded-xl overflow-hidden border border-stone-200 h-36 sm:h-44 bg-stone-100">
                  <img
                    src={selectedEventDetail.event.banner_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Quick Metrics KPI */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                  <div className="text-[10px] font-mono uppercase text-stone-500">Gross Sales</div>
                  <div className="text-sm sm:text-base font-bold font-serif text-stone-900 mt-0.5">{selectedEventDetail.event.grossRevenue}</div>
                </div>
                <div className="p-2.5 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                  <div className="text-[10px] font-mono uppercase text-stone-500">Tickets Sold</div>
                  <div className="text-sm sm:text-base font-bold font-serif text-stone-900 mt-0.5">{selectedEventDetail.totalAttendees}</div>
                </div>
                <div className="p-2.5 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                  <div className="text-[10px] font-mono uppercase text-stone-500">Checked In</div>
                  <div className="text-sm sm:text-base font-bold font-serif text-emerald-700 mt-0.5">{selectedEventDetail.checkedInAttendees}</div>
                </div>
              </div>

              {/* Venue & Organizer Details */}
              <div className="space-y-2.5 p-3.5 sm:p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Building2 size={14} className="text-stone-400 shrink-0" />
                  <span className="font-medium">Hosted by:</span>
                  <span className="font-mono text-stone-900 truncate">{selectedEventDetail.event.organizerName}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Calendar size={14} className="text-stone-400 shrink-0" />
                  <span className="font-medium">Date & Time:</span>
                  <span className="font-mono text-stone-900 truncate">{selectedEventDetail.event.date} • {selectedEventDetail.event.startTime}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <MapPin size={14} className="text-stone-400 shrink-0" />
                  <span className="font-medium">Venue:</span>
                  <span className="font-mono text-stone-900 truncate">{selectedEventDetail.event.venueName || selectedEventDetail.event.city || 'TBA'}</span>
                </div>
              </div>

              {/* Ticket Tiers Breakdown */}
              <div className="space-y-2.5">
                <h3 className="font-serif text-sm font-bold text-stone-900">Configured Ticket Tiers</h3>
                <div className="space-y-2">
                  {selectedEventDetail.tiers?.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-stone-900 truncate block">{t.name}</span>
                        <span className="text-stone-500 font-mono text-[11px]">({t.price} each)</span>
                      </div>
                      <div className="font-mono text-stone-600 text-right shrink-0 text-[11px]">
                        <div>{t.sold} / {t.capacity} sold</div>
                        <div className="font-bold text-stone-900">{t.revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-sm font-bold text-stone-900">Description</h3>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-lg border border-stone-200/80">
                  {selectedEventDetail.description || 'No description provided for this event stage.'}
                </p>
              </div>

              {/* Status Moderation Controls */}
              <div className="space-y-2 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs font-serif font-bold text-stone-900">Moderation State</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => handleStatusChange(selectedEventDetail.event.id, 'published', 'Admin publish')}
                    disabled={selectedEventDetail.event.status === 'published' || actionLoadingId === selectedEventDetail.event.id}
                    className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                      selectedEventDetail.event.status === 'published'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-2xs'
                        : 'bg-white hover:bg-emerald-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEventDetail.event.id, 'draft', 'Admin move to draft')}
                    disabled={selectedEventDetail.event.status === 'draft' || actionLoadingId === selectedEventDetail.event.id}
                    className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                      selectedEventDetail.event.status === 'draft'
                        ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-2xs'
                        : 'bg-white hover:bg-amber-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEventDetail.event.id, 'suspended', 'Admin suspension')}
                    disabled={selectedEventDetail.event.status === 'suspended' || actionLoadingId === selectedEventDetail.event.id}
                    className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                      selectedEventDetail.event.status === 'suspended'
                        ? 'bg-rose-600 text-white font-bold border-rose-600 shadow-2xs'
                        : 'bg-white hover:bg-rose-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEventDetail.event.id, 'cancelled', 'Admin cancellation')}
                    disabled={selectedEventDetail.event.status === 'cancelled' || actionLoadingId === selectedEventDetail.event.id}
                    className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                      selectedEventDetail.event.status === 'cancelled'
                        ? 'bg-zinc-800 text-white font-bold border-zinc-800 shadow-2xs'
                        : 'bg-white hover:bg-zinc-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
              <a
                href={`/events/${selectedEventDetail.event.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-stone-700 hover:text-stone-950 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 transition shadow-2xs"
              >
                <span>View Public</span>
                <ExternalLink size={12} />
              </a>

              <button
                onClick={() => setSelectedEventDetail(null)}
                className="px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


