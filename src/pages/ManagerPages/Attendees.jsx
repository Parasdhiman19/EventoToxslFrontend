import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  Download, 
  QrCode, 
  UserCheck, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Sparkles, 
  Check, 
  Building2, 
  Ticket,
  ShieldCheck
} from 'lucide-react'
import API from '../../services/api'
import { exportToCsv } from '../../utils/exportCsv'

export default function Attendees() {
  const [searchParams, setSearchParams] = useSearchParams()
  const eventParam = searchParams.get('event') || 'all'
  const [selectedEvent, setSelectedEvent] = useState(eventParam)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'checked_in' | 'pending'
  const [searchQuery, setSearchQuery] = useState('')

  const [attendeesList, setAttendeesList] = useState([])
  const [eventsList, setEventsList] = useState([])
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalRegistered: 0,
    totalCheckedIn: 0,
    totalPending: 0,
    checkInRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scanCodeInput, setScanCodeInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)

  // Keep state in sync with URL search params
  useEffect(() => {
    const urlEvent = searchParams.get('event') || 'all'
    if (urlEvent !== selectedEvent) {
      setSelectedEvent(urlEvent)
    }
  }, [searchParams])

  // Current selected event object
  const activeEventObj = useMemo(() => {
    if (selectedEvent === 'all') return null
    return eventsList.find((e) => String(e.id) === String(selectedEvent))
  }, [selectedEvent, eventsList])

  // Load Attendees & Events Manifest from Backend
  const fetchAttendeesData = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const params = {}
      if (selectedEvent !== 'all') params.event = selectedEvent
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const res = await API.get('tickets/manager/attendees/', { params })
      if (res.data) {
        setAttendeesList(res.data.attendees || [])
        if (res.data.summary) {
          setSummaryMetrics(res.data.summary)
        }
        if (Array.isArray(res.data.events)) {
          setEventsList(res.data.events)
        }
      }
    } catch (err) {
      setFetchError(err.response?.data?.detail || 'Failed to load attendee manifest.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedEvent, statusFilter, searchQuery])

  useEffect(() => {
    fetchAttendeesData()
  }, [fetchAttendeesData])

  // Toggle Live Gate Check-in
  const toggleCheckIn = async (ticketIdentifier) => {
    setActionLoadingId(ticketIdentifier)
    try {
      const res = await API.patch(`tickets/manager/attendees/${ticketIdentifier}/check-in/`)
      const isNowCheckedIn = res.data.checkedIn ?? res.data.is_checked_in

      // Update in local state
      setAttendeesList((prev) =>
        prev.map((att) => {
          if (att.id === ticketIdentifier || att.ticketCode === ticketIdentifier || att.barcode === ticketIdentifier) {
            return {
              ...att,
              checkedIn: isNowCheckedIn,
              checkInTime: res.data.checkInTime || (isNowCheckedIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
            }
          }
          return att
        })
      )

      // Update summary counters
      setSummaryMetrics((prev) => {
        const newCheckedIn = isNowCheckedIn ? prev.totalCheckedIn + 1 : Math.max(0, prev.totalCheckedIn - 1)
        const total = prev.totalRegistered || 1
        return {
          ...prev,
          totalCheckedIn: newCheckedIn,
          totalPending: Math.max(0, total - newCheckedIn),
          checkInRate: Math.round((newCheckedIn / total) * 100),
        }
      })
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not update ticket admission status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle Gate Scanner Barcode Submission
  const handleScanSubmit = async (e) => {
    e.preventDefault()
    if (!scanCodeInput.trim()) return

    setIsScanning(true)
    setScanResult(null)

    try {
      const res = await API.patch(`tickets/manager/attendees/${scanCodeInput.trim()}/check-in/`)
      setScanResult({
        success: true,
        message: res.data.message || 'Attendee successfully admitted to venue.',
        ticketCode: res.data.ticketCode || scanCodeInput.trim(),
        checkInTime: res.data.checkInTime,
        checkedIn: res.data.checkedIn ?? res.data.is_checked_in,
      })
      setScanCodeInput('')
      fetchAttendeesData()
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.detail || 'Invalid or unrecognized barcode for this organizer.',
        ticketCode: scanCodeInput.trim(),
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Export Manifest as CSV
  const handleExportCSV = () => {
    if (attendeesList.length === 0) return

    const headers = ['Ticket Code', 'Attendee Name', 'Email', 'Event', 'Tier', 'Gate / Seat', 'Status', 'Check-In Time', 'Order Date']
    const rows = attendeesList.map((att) => [
      att.ticketCode || att.id || '',
      att.attendeeName || att.name || '',
      att.email || '',
      att.eventTitle || att.event || '',
      att.tier || '',
      att.seatOrGate || att.gate || '',
      att.checkedIn ? 'Checked In' : 'Pending',
      att.checkInTime || 'N/A',
      att.orderDate || '',
    ])

    exportToCsv(headers, rows, `evento_attendee_manifest_${activeEventObj ? activeEventObj.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'all'}`)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
              Guest List &amp; Attendees
            </h1>
            {activeEventObj?.role === 'Staff' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck size={13} />
                Staff Gate Role
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time ticket validation, gate entries, and master guest registries.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={attendeesList.length === 0}
            className="rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Download size={13} />
            <span>Export Manifest (.CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScanResult(null)
              setIsScannerOpen(true)
            }}
            className="rounded-md bg-stone-900 px-3.5 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <QrCode size={14} />
            <span>Launch Gate Scanner</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            Total Manifest
          </span>
          <div className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
            {summaryMetrics.totalRegistered} Guests
          </div>
          <p className="text-[11px] text-stone-400 font-mono">Issued across selected stage(s)</p>
        </div>

        <div className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            Checked In (Passed Gate)
          </span>
          <div className="text-2xl font-serif font-semibold text-emerald-700 tracking-tight">
            {summaryMetrics.totalCheckedIn}
          </div>
          <p className="text-[11px] text-stone-400 font-mono">{summaryMetrics.checkInRate}% venue occupancy</p>
        </div>

        <div className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            Expected / Awaiting
          </span>
          <div className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
            {summaryMetrics.totalPending}
          </div>
          <p className="text-[11px] text-stone-400 font-mono">Tickets not yet scanned</p>
        </div>

        <div className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            Check-In Rate
          </span>
          <div className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
            {summaryMetrics.checkInRate}%
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${summaryMetrics.checkInRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* Guest Table Container */}
      <section className="rounded-lg border border-stone-200/80 bg-white shadow-2xs overflow-hidden space-y-4">
        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-md border border-stone-200/80">
              {[
                { key: 'all', label: 'All Guests' },
                { key: 'checked_in', label: 'Inside Venue' },
                { key: 'pending', label: 'Pending Gate' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-stone-900 text-stone-50 shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Event Dropdown */}
            <select
              value={selectedEvent}
              onChange={(e) => {
                const val = e.target.value
                setSelectedEvent(val)
                if (val === 'all') {
                  setSearchParams({})
                } else {
                  setSearchParams({ event: val })
                }
              }}
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 cursor-pointer font-medium"
            >
              <option value="all">All Accessible Events</option>
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} {ev.role === 'Staff' ? '(Staff)' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchAttendeesData}
              className="p-1.5 rounded-md border border-stone-300 bg-white text-stone-600 hover:text-stone-950 hover:bg-stone-50 transition shadow-2xs cursor-pointer"
              title="Refresh Manifest"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search name, barcode, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && attendeesList.length === 0 ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 w-full bg-stone-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center text-xs text-red-700 space-y-2">
            <p className="font-semibold">{fetchError}</p>
            <button
              type="button"
              onClick={fetchAttendeesData}
              className="text-stone-900 underline font-mono"
            >
              Click to retry
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
                  <tr>
                    <th className="px-5 py-3 font-medium">Attendee</th>
                    <th className="px-5 py-3 font-medium">Assigned Stage &amp; Tier</th>
                    <th className="px-5 py-3 font-medium">Barcode / Security ID</th>
                    <th className="px-5 py-3 font-medium">Gate / Access</th>
                    <th className="px-5 py-3 font-medium">Status &amp; Time</th>
                    <th className="px-5 py-3 font-medium text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-normal">
                  {attendeesList.length > 0 ? (
                    attendeesList.map((att) => {
                      const ticketIdentifier = att.ticketCode || att.barcode || att.id
                      const isActionLoading = actionLoadingId === ticketIdentifier

                      return (
                        <tr key={ticketIdentifier} className="hover:bg-stone-50/60 transition-colors">
                          {/* Attendee Info */}
                          <td className="px-5 py-3.5 min-w-[160px]">
                            <div className="font-medium text-stone-900">{att.attendeeName || att.name || 'Guest'}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{att.email || '—'}</div>
                          </td>

                          {/* Event & Tier */}
                          <td className="px-5 py-3.5 min-w-[180px]">
                            <div className="font-medium text-stone-800">{att.eventTitle || att.event}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{att.tier}</div>
                          </td>

                          {/* Barcode */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="font-mono text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                              {att.ticketCode || att.barcode || att.id}
                            </span>
                          </td>

                          {/* Gate */}
                          <td className="px-5 py-3.5 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                            {att.seatOrGate || att.gate || 'Main Gate'}
                          </td>

                          {/* Status & Entry Timestamp */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {att.checkedIn ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                  Checked In
                                </span>
                                {att.checkInTime && (
                                  <div className="text-[10px] font-mono text-stone-400">
                                    at {att.checkInTime}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Manual Gate Check-in Toggle */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => toggleCheckIn(ticketIdentifier)}
                              className={`font-mono text-xs px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                                att.checkedIn
                                  ? 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                  : 'border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800'
                              } disabled:opacity-50`}
                            >
                              {isActionLoading ? 'Updating...' : att.checkedIn ? 'Undo Entry' : 'Admit Guest'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-stone-400">
                        <p className="font-serif text-base text-stone-600">No attendees match your filters</p>
                        <p className="text-xs text-stone-400 mt-0.5">Check spelling or change event selection.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Attendee Cards View */}
            <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
              {attendeesList.length > 0 ? (
                attendeesList.map((att, idx) => {
                  const ticketIdentifier = att.ticketCode || att.barcode || att.id
                  const isActionLoading = actionLoadingId === ticketIdentifier

                  return (
                    <div key={ticketIdentifier} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                      {/* Header: Name & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-semibold text-stone-900 leading-snug">{att.attendeeName || att.name || 'Guest'}</h3>
                          <p className="text-[11px] text-stone-500 font-mono">{att.email || '—'}</p>
                        </div>
                        {att.checkedIn ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Checked In
                            </span>
                            {att.checkInTime && (
                              <p className="text-[10px] font-mono text-stone-400 mt-0.5">{att.checkInTime}</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Event, Tier, Code & Gate Details */}
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-800 font-medium truncate">{att.eventTitle || att.event}</span>
                          <span className="text-[10px] font-mono bg-stone-200/70 text-stone-700 px-1.5 py-0.5 rounded shrink-0 ml-2">
                            {att.tier}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 border-t border-stone-200/50 pt-1.5">
                          <span>Barcode: <span className="text-stone-900 font-medium">{att.ticketCode || att.barcode || att.id}</span></span>
                          <span>Gate: <span className="text-stone-900">{att.seatOrGate || att.gate || 'Main Gate'}</span></span>
                        </div>
                      </div>

                      {/* Gate Admission Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => toggleCheckIn(ticketIdentifier)}
                          className={`w-full py-2 px-3 rounded-md font-mono text-xs font-medium transition-colors cursor-pointer border shadow-2xs ${
                            att.checkedIn
                              ? 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                              : 'border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800'
                          } disabled:opacity-50`}
                        >
                          {isActionLoading ? 'Updating Gate...' : att.checkedIn ? 'Undo Check-In Entry' : 'Admit Guest to Stage'}
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-stone-400">
                  <p className="font-serif text-sm text-stone-600">No attendees match your filters</p>
                  <p className="text-xs text-stone-400 mt-0.5">Check spelling or change event selection.</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Gate Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-6 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <div className="p-2 rounded-lg bg-stone-900 text-stone-50">
                <QrCode size={18} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">Door Scanner Terminal</h3>
                <p className="text-[11px] text-stone-500 font-mono">Scan or enter ticket barcode for instant entry</p>
              </div>
            </div>

            {/* Barcode Search Form */}
            <form onSubmit={handleScanSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Barcode / Ticket Security Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. EV-VIP-14-3A8F92"
                    value={scanCodeInput}
                    onChange={(e) => setScanCodeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isScanning || !scanCodeInput.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono font-medium uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <span>Validating Barcode...</span>
                ) : (
                  <>
                    <UserCheck size={14} />
                    <span>Validate &amp; Admit Guest</span>
                  </>
                )}
              </button>
            </form>

            {/* Scanner Feedback Card */}
            {scanResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in zoom-in-95 duration-100 ${
                  scanResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold font-mono">
                  {scanResult.success ? (
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-red-700 shrink-0" />
                  )}
                  <span>{scanResult.success ? 'Admission Approved' : 'Admission Rejected'}</span>
                </div>
                <p className="text-xs leading-relaxed">{scanResult.message}</p>
                {scanResult.success && scanResult.checkInTime && (
                  <p className="text-[11px] font-mono text-emerald-700">Timestamp: {scanResult.checkInTime}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}