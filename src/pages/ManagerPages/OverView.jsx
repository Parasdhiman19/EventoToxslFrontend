import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Loader2, AlertCircle, RefreshCw, Download, 
  Plus, ArrowRight, QrCode, CreditCard, TrendingUp,
  Calendar, Users, DollarSign, ExternalLink
} from 'lucide-react'
import API from '../../services/api'
import { exportToCsv } from '../../utils/exportCsv'

export default function Overview() {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0.00', change: '+0.0%', period: 'vs last month' },
    { label: 'Tickets Sold', value: '0', change: '+0.0%', period: 'across configured stages' },
    { label: 'Active Events', value: '0', change: '0 live upcoming', period: 'in schedule' },
    { label: 'Avg. Attendance Rate', value: '0.0%', change: '0/0 checked-in', period: 'gate admissions rate' },
  ])
  const [activeEvents, setActiveEvents] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [nextPayoutEstimated, setNextPayoutEstimated] = useState('$0.00')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOverviewData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await API.get('payouts/manager/overview/')
      const data = res.data

      if (data.stats && Array.isArray(data.stats)) {
        setStats(data.stats)
      }
      if (data.activeEvents && Array.isArray(data.activeEvents)) {
        setActiveEvents(data.activeEvents)
      }
      if (data.recentTransactions && Array.isArray(data.recentTransactions)) {
        setRecentTransactions(data.recentTransactions)
      }
      if (data.nextPayoutEstimated) {
        setNextPayoutEstimated(data.nextPayoutEstimated)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load manager overview telemetry. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const handleExportReport = () => {
    if (!recentTransactions || recentTransactions.length === 0) {
      alert('No recent transaction activity to export.')
      return
    }

    const headers = ['Order Number', 'Attendee', 'Email', 'Event Stage', 'Tier', 'Amount', 'Timestamp']
    const rows = recentTransactions.map((tx) => [
      tx.id,
      tx.buyer,
      tx.email,
      tx.event,
      tx.tier,
      tx.amount,
      tx.time,
    ])

    exportToCsv(headers, rows, 'evento_overview_report')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Manager Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time stage performance, ticket check-ins, and gross payout pipeline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchOverviewData}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50 text-center"
            title="Refresh overview metrics"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer text-center"
          >
            <Download size={13} />
            <span>Export Report (.CSV)</span>
          </button>
          <Link
            to="/manager/events/create"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-stone-900 px-3.5 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer text-center"
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
              <p className="font-medium">Failed to load overview data</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchOverviewData}
            className="underline text-xs font-mono hover:text-red-900 shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-2"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
              {stat.label}
            </span>
            <div className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
              {isLoading ? (
                <span className="inline-block w-24 h-7 bg-stone-100 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-emerald-700">{stat.change}</span>
              <span className="text-stone-400 font-light">{stat.period}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Active Events Table / List */}
      <section className="rounded-lg border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-medium text-stone-900">Active Stages &amp; Events</h2>
            <p className="text-xs text-stone-500">Currently published inventory and ticket velocity</p>
          </div>
          <Link
            to="/manager/events"
            className="text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
              <tr>
                <th className="px-5 py-3 font-medium">Event &amp; Venue</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Capacity / Sold</th>
                <th className="px-5 py-3 font-medium">Gross Revenue</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 size={24} className="animate-spin text-stone-400" />
                      <p className="font-mono text-xs uppercase tracking-wider">Syncing active stage roster...</p>
                    </div>
                  </td>
                </tr>
              ) : activeEvents.length > 0 ? (
                activeEvents.map((event) => {
                  const totalVal = event.total || 100
                  const percentage = totalVal > 0 ? Math.min(100, Math.round((event.sold / totalVal) * 100)) : 0
                  return (
                    <tr key={event.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-stone-900">{event.title}</div>
                        <div className="text-[11px] text-stone-500">{event.venue}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-stone-600 whitespace-nowrap">
                        {event.date}
                      </td>
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-medium text-stone-900 font-mono">
                            {event.sold} / {event.total} sold
                          </span>
                          <span className="text-stone-400 font-mono">{percentage}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-medium text-stone-900 whitespace-nowrap">
                        {event.revenue}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${event.statusColor || 'text-stone-600 bg-stone-100 border-stone-200'}`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/manager/events/${event.id}`}
                          className="font-mono text-stone-600 hover:text-stone-950 underline underline-offset-2"
                        >
                          Manage &rarr;
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-stone-400">
                    <p className="font-serif text-base text-stone-600">No active events found</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Publish a stage to start receiving attendee bookings.
                    </p>
                    <div className="pt-3">
                      <Link
                        to="/manager/events/create"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono uppercase"
                      >
                        <Plus size={13} /> Host Event
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Active Events Card List */}
        <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
          {isLoading ? (
            <div className="py-10 text-center text-stone-400">
              <Loader2 size={24} className="animate-spin mx-auto text-stone-400 mb-2" />
              <p className="font-mono text-xs uppercase tracking-wider">Syncing active stage roster...</p>
            </div>
          ) : activeEvents.length > 0 ? (
            activeEvents.map((event, idx) => {
              const totalVal = event.total || 100
              const percentage = totalVal > 0 ? Math.min(100, Math.round((event.sold / totalVal) * 100)) : 0
              return (
                <div key={event.id} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                  {/* Header: Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-stone-900 leading-snug">{event.title}</h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">{event.venue}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border shrink-0 ${event.statusColor || 'text-stone-600 bg-stone-100 border-stone-200'}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  {/* Date & Gross Revenue Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-stone-50 border border-stone-200/60">
                      <span className="text-[10px] uppercase text-stone-400 block">Schedule</span>
                      <span className="text-stone-800 font-medium">{event.date}</span>
                    </div>
                    <div className="p-2 rounded bg-stone-50 border border-stone-200/60">
                      <span className="text-[10px] uppercase text-stone-400 block">Gross Sales</span>
                      <span className="text-stone-900 font-semibold">{event.revenue}</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-stone-500">Ticket Velocity:</span>
                      <span className="font-medium text-stone-900 font-mono">{event.sold} / {event.total} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-1">
                    <Link
                      to={`/manager/events/${event.id}`}
                      className="w-full inline-flex items-center justify-center py-2 px-3 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs"
                    >
                      Manage Event &amp; Tiers &rarr;
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-stone-400 space-y-2">
              <p className="font-serif text-sm text-stone-600">No active events found</p>
              <p className="text-xs text-stone-400">Publish a stage to start receiving attendee bookings.</p>
              <div className="pt-2">
                <Link
                  to="/manager/events/create"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono"
                >
                  <Plus size={13} /> Host Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2-Column Section: Recent Transactions & Organizer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions List */}
        <section className="lg:col-span-8 rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif text-base font-medium text-stone-900">Recent Orders</h2>
              <p className="text-xs text-stone-500">Live ticket sales and direct checkouts</p>
            </div>
            <Link
              to="/manager/tickets"
              className="text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-950"
            >
              All Orders &rarr;
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {isLoading ? (
              <div className="py-8 text-center text-stone-400">
                <Loader2 size={20} className="animate-spin mx-auto text-stone-400 mb-1" />
                <p className="font-mono text-xs">Loading order logs...</p>
              </div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-medium text-stone-900 truncate">
                      {tx.buyer}{' '}
                      <span className="text-stone-400 font-normal">({tx.tier})</span>
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">{tx.event}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-stone-900">{tx.amount}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{tx.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-stone-400">
                <p className="font-serif text-sm text-stone-600">No recent orders yet</p>
                <p className="text-xs text-stone-400 mt-0.5">Customer purchases will appear here in real-time.</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Operations / Stage Tools */}
        <section className="lg:col-span-4 rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-4">
          <h2 className="font-serif text-base font-medium text-stone-900 border-b border-stone-100 pb-3">
            Stage Operations
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200/60 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-900 font-semibold block">
                Door Scanner Check-in
              </span>
              <p className="text-xs text-stone-500 leading-relaxed">
                Scan attendee QR passes and admit guests at your venue gate.
              </p>
              <Link
                to="/manager/attendees"
                className="mt-2 text-xs font-mono font-medium text-stone-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Open Attendee Gate Check-in &rarr;
              </Link>
            </div>

            <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200/60 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-900 font-semibold block">
                Next Payout Cycle
              </span>
              <p className="text-xs text-stone-500 leading-relaxed">
                Estimated settlement of <span className="font-mono font-medium text-stone-900">{nextPayoutEstimated}</span> available for disbursement.
              </p>
              <Link
                to="/manager/payouts"
                className="mt-2 text-xs font-mono font-medium text-stone-900 hover:underline inline-flex items-center gap-1 block"
              >
                Manage Payout Accounts &rarr;
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}