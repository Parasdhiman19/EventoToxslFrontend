import React, { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import {
  QrCode,
  Search,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Eye,
  X,
  Building2,
  TrendingUp,
  MapPin,
  Ticket,
} from 'lucide-react'

export default function AdminAttendance() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await API.get('admin/attendance/')
      setEvents(res.data.events || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events
    const q = search.toLowerCase()
    return events.filter((ev) =>
      (ev.eventTitle && ev.eventTitle.toLowerCase().includes(q)) ||
      (ev.organizer && ev.organizer.toLowerCase().includes(q)) ||
      (ev.venue && ev.venue.toLowerCase().includes(q)) ||
      String(ev.eventId).includes(q)
    )
  }, [events, search])

  const stats = useMemo(() => {
    const totalAdmissions = events.reduce((acc, ev) => acc + (parseInt(ev.checkedIn, 10) || 0), 0)
    const totalTickets = events.reduce((acc, ev) => acc + (parseInt(ev.totalAttendees, 10) || 0), 0)
    const overallRate = totalTickets > 0 ? Math.round((totalAdmissions / totalTickets) * 100) : 0
    return {
      totalAdmissions,
      totalTickets,
      overallRate,
      activeStages: events.length,
    }
  }, [events])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Admissions Telemetry
            </span>
            <span className="text-stone-400 text-xs font-mono">• QR Scanner Monitor</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Venue Gate Attendance</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Real-time gate scan throughput, admission conversion rates, and ticket verification monitoring.
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Scan Data</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Admitted Attendees</span>
          </div>
          <div className="font-serif text-xl font-bold text-emerald-700">{stats.totalAdmissions}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Scanned at gate entrance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Total Issued Tickets</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.totalTickets}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Across published stages</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Global Turnout Rate</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.overallRate}%</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Check-in efficiency</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Active Stages</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.activeStages}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">With scanning operational</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stage title, venue, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-sans bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-900 transition"
          />
        </div>

        <span className="text-xs font-mono text-stone-500 hidden sm:inline">
          Showing {filteredEvents.length} active stages
        </span>
      </div>

      {/* Grid of Event Attendance Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-xl border border-stone-200/80">
          <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
          <div className="text-xs font-mono text-stone-400">Loading attendance telemetry...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-xl border border-stone-200/80">
          <QrCode className="w-8 h-8 text-stone-300 mx-auto" />
          <div className="text-xs font-mono text-stone-500">No published stages matching search.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredEvents.map((ev) => {
            const rawRate = Math.min(100, Math.max(0, ev.rateRaw || 0))
            return (
              <div
                key={ev.eventId}
                onClick={() => setSelectedEvent(ev)}
                className="bg-white rounded-xl border border-stone-200/80 shadow-2xs p-4 sm:p-5 space-y-3 sm:space-y-4 hover:border-stone-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      Stage #{ev.eventId}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {ev.rate} Turnout
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-stone-950 truncate">
                    {ev.eventTitle}
                  </h3>

                  <div className="text-[11px] font-mono text-stone-500 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={12} className="text-stone-400 shrink-0" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-stone-400 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-stone-100">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${rawRate}%` }}
                        className="bg-stone-900 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold text-stone-900">{ev.checkedIn} Admitted</span>
                      <span className="text-stone-400">{ev.pending} Pending</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span className="truncate max-w-[130px]">Host: {ev.organizer}</span>
                    <span className="font-semibold text-stone-900">{ev.totalAttendees} Total Tix</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stage Inspection Slide-over Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Gate Telemetry</span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Stage #{selectedEvent.eventId}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-900 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 font-sans text-xs">
              <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-2">
                <span className="text-stone-400 font-mono text-[10px] uppercase tracking-wider">Stage Overview</span>
                <h3 className="font-serif text-base font-bold text-white leading-snug">{selectedEvent.eventTitle}</h3>
                <div className="text-stone-400 font-mono text-[11px] pt-2 border-t border-stone-800 space-y-1">
                  <div>Date: {selectedEvent.date}</div>
                  <div>Venue: {selectedEvent.venue}</div>
                  <div>Organizer: {selectedEvent.organizer}</div>
                </div>
              </div>

              {/* Admissions Rate Breakdown */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Admissions Throughput</span>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 font-mono">Check-in Percentage:</span>
                  <span className="text-lg font-serif font-bold text-emerald-700">{selectedEvent.rate}</span>
                </div>

                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, selectedEvent.rateRaw || 0))}%` }}
                    className="bg-stone-900 h-full rounded-full transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 font-mono text-[11px]">
                  <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-900">
                    <span className="text-[10px] text-emerald-600 uppercase block">Admitted</span>
                    <span className="text-sm font-bold">{selectedEvent.checkedIn} guests</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg text-amber-900">
                    <span className="text-[10px] text-amber-600 uppercase block">Pending</span>
                    <span className="text-sm font-bold">{selectedEvent.pending} guests</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-600 space-y-2">
                <div className="font-bold text-stone-900 uppercase text-[10px] flex items-center gap-1.5">
                  <QrCode size={13} className="text-stone-700" />
                  <span>QR Validation Protocol</span>
                </div>
                <p className="leading-relaxed">
                  Scanners verify cryptographically signed QR tickets at the venue gates. Double scans or invalidated tickets are rejected instantly by the verification engine.
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-semibold transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

