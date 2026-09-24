import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Loader2, AlertCircle, RefreshCw, Search, 
  Download, FileText, CheckCircle2, XCircle, X, 
  Ticket, DollarSign, Calendar, Clock, User, Mail, CreditCard 
} from 'lucide-react'
import API from '../../services/api'
import ReceiptModal from '../../components/modals/ReceiptModal'
import { exportToCsv } from '../../utils/exportCsv'

export default function TicketSales() {
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [metrics, setMetrics] = useState([
    { label: 'Total Ticket Gross', value: '$0.00', sub: 'Across 0 live events' },
    { label: 'Confirmed Orders', value: '0', sub: '100% success rate' },
    { label: 'Avg. Order Value', value: '$0.00', sub: '0.0 tickets/order' },
    { label: 'Refunds / Disputed', value: '$0.00', sub: '0 refund requests' },
  ])
  const [tierBreakdown, setTierBreakdown] = useState([])
  const [transactions, setTransactions] = useState([])
  const [eventsList, setEventsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const fetchSalesData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = {}
      if (selectedEvent && selectedEvent !== 'all') {
        params.event = selectedEvent
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const res = await API.get('tickets/manager/sales/', { params })
      const data = res.data

      if (data.metrics && Array.isArray(data.metrics)) {
        setMetrics(data.metrics)
      }
      if (data.tierBreakdown && Array.isArray(data.tierBreakdown)) {
        setTierBreakdown(data.tierBreakdown)
      }
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions)
      }
      if (data.events && Array.isArray(data.events)) {
        setEventsList(data.events)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load ticket sales data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [selectedEvent])

  const filteredOrders = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true

      const idStr = String(tx.id || '').toLowerCase()
      const custStr = String(tx.customer || '').toLowerCase()
      const emailStr = String(tx.email || '').toLowerCase()
      const eventStr = String(tx.event || tx.eventTitle || '').toLowerCase()
      const tierStr = String(tx.tier || '').toLowerCase()

      return (
        idStr.includes(q) ||
        custStr.includes(q) ||
        emailStr.includes(q) ||
        eventStr.includes(q) ||
        tierStr.includes(q)
      )
    })
  }, [transactions, searchQuery])

  // CSV Ledger Export Generator
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert('No transaction records available to export.')
      return
    }

    const headers = ['Order ID', 'Date', 'Time', 'Customer', 'Email', 'Event', 'Tier', 'Quantity', 'Total Paid', 'Payment Method', 'Status']
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.customer,
      t.email,
      t.event || t.eventTitle,
      t.tier,
      t.qty,
      t.total,
      t.paymentMethod,
      t.status,
    ])

    exportToCsv(headers, rows, 'evento_sales_ledger')
  }

  const handleDownloadInvoices = () => {
    if (!transactions || transactions.length === 0) {
      alert('No invoice records found.')
      return
    }
    handleExportCSV()
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Ticket Sales
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time ticketing volume, gate checkout receipts, and tier distribution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchSalesData}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50 text-center"
            title="Refresh metrics"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadInvoices}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer text-center"
          >
            <FileText size={13} />
            <span>Invoices Summary</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-stone-900 px-3.5 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer text-center"
          >
            <Download size={13} />
            <span>Export Ledger (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Failed to load ticket sales</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchSalesData}
            className="underline text-xs font-mono hover:text-red-900 shrink-0 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* KPI Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-2xs space-y-1.5"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
              {item.label}
            </span>
            <div className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
              {isLoading ? (
                <span className="inline-block w-24 h-7 bg-stone-100 rounded animate-pulse" />
              ) : (
                item.value
              )}
            </div>
            <p className="text-[11px] text-stone-400 font-mono">{item.sub}</p>
          </div>
        ))}
      </section>

      {/* Tier Inventory Velocity */}
      <section className="rounded-lg border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base font-medium text-stone-900">Active Tier Performance</h2>
            <p className="text-xs text-stone-500">Inventory allocation and price tiers across active stages</p>
          </div>
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            {tierBreakdown.length} configured {tierBreakdown.length === 1 ? 'tier' : 'tiers'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin text-stone-400" />
            <p className="font-mono text-xs text-stone-400 uppercase tracking-wider">
              Calculating tier velocities...
            </p>
          </div>
        ) : tierBreakdown.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
                  <tr>
                    <th className="px-5 py-3 font-medium">Ticket Tier &amp; Event</th>
                    <th className="px-5 py-3 font-medium">Unit Price</th>
                    <th className="px-5 py-3 font-medium">Sold / Quota</th>
                    <th className="px-5 py-3 font-medium">Total Gross</th>
                    <th className="px-5 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-normal">
                  {tierBreakdown.map((tier, idx) => {
                    const totalVal = tier.total || 100
                    const percent = totalVal > 0 ? Math.min(100, Math.round((tier.sold / totalVal) * 100)) : 0
                    return (
                      <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-stone-900">{tier.name}</div>
                          <div className="text-[11px] text-stone-400">{tier.event}</div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-stone-800">{tier.price}</td>
                        <td className="px-5 py-3.5 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-medium text-stone-900 font-mono">
                              {tier.sold} / {tier.total}
                            </span>
                            <span className="text-stone-400 font-mono">{percent}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-stone-900 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-medium text-stone-900">
                          {tier.revenue}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                              tier.status === 'Sold Out'
                                ? 'bg-stone-900 text-stone-50 border-stone-900'
                                : tier.status === 'Almost Full'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {tier.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
              {tierBreakdown.map((tier, idx) => {
                const totalVal = tier.total || 100
                const percent = totalVal > 0 ? Math.min(100, Math.round((tier.sold / totalVal) * 100)) : 0
                return (
                  <div key={idx} className={idx > 0 ? 'pt-3 space-y-2' : 'space-y-2'}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-semibold text-stone-900">{tier.name}</h3>
                        <p className="text-[11px] text-stone-500 font-mono">{tier.event}</p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border shrink-0 ${
                          tier.status === 'Sold Out'
                            ? 'bg-stone-900 text-stone-50 border-stone-900'
                            : tier.status === 'Almost Full'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {tier.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-md bg-stone-50 border border-stone-200/60 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">Unit Price</span>
                        <span className="font-mono font-medium text-stone-800">{tier.price}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">Total Gross</span>
                        <span className="font-mono font-semibold text-stone-900">{tier.revenue}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-stone-500">Allocation:</span>
                        <span className="font-medium text-stone-800">{tier.sold} / {tier.total} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-stone-900 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-stone-400">
            <p className="font-serif text-sm text-stone-600">No ticket tiers found</p>
            <p className="text-xs text-stone-400 mt-1">Host or edit an event to configure ticket tiers.</p>
          </div>
        )}
      </section>

      {/* Orders & Receipts Master Table */}
      <section className="rounded-lg border border-stone-200/80 bg-white shadow-2xs overflow-hidden space-y-4">
        {/* Controls */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-medium text-stone-900">Transaction Receipts</h2>
            <p className="text-xs text-stone-500">Live ticket purchases and attendee check-out logs</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Event Dropdown Filter */}
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 sm:py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 w-full sm:w-auto"
            >
              <option value="all">All Events ({eventsList.length})</option>
              {eventsList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search order ID, name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-3 py-2 sm:py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Desktop Orders Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
              <tr>
                <th className="px-5 py-3 font-medium">Order ID &amp; Timestamp</th>
                <th className="px-5 py-3 font-medium">Attendee</th>
                <th className="px-5 py-3 font-medium">Event &amp; Tier</th>
                <th className="px-5 py-3 font-medium">Quantity</th>
                <th className="px-5 py-3 font-medium">Total Paid</th>
                <th className="px-5 py-3 font-medium">Payment Gateway</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 size={24} className="animate-spin text-stone-400" />
                      <p className="font-mono text-xs uppercase tracking-wider">Syncing ledger orders...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-stone-900">{ord.id}</div>
                      <div className="text-[11px] font-mono text-stone-400">
                        {ord.date} {ord.time && `• ${ord.time}`}
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[160px]">
                      <div className="font-medium text-stone-900">{ord.customer || 'Guest Attendee'}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{ord.email}</div>
                    </td>
                    <td className="px-5 py-4 min-w-[180px]">
                      <div className="font-medium text-stone-800">{ord.event || ord.eventTitle}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{ord.tier}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-stone-800 whitespace-nowrap">
                      {ord.qty} {ord.qty > 1 ? 'tickets' : 'ticket'}
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {ord.total}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      {ord.paymentMethod}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                          ord.status === 'Paid' || ord.status === 'Confirmed' || ord.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.status === 'Refunded'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(ord)}
                        className="font-mono text-stone-600 hover:text-stone-950 underline underline-offset-2 cursor-pointer text-xs"
                      >
                        View &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-stone-400">
                    <p className="font-serif text-base text-stone-600">No orders match your criteria</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {searchQuery
                        ? `No orders matching "${searchQuery}". Try modifying your query.`
                        : 'No orders recorded for this selection.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Orders Card List */}
        <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
          {isLoading ? (
            <div className="py-12 text-center text-stone-400">
              <Loader2 size={24} className="animate-spin mx-auto text-stone-400 mb-2" />
              <p className="font-mono text-xs uppercase tracking-wider">Syncing ledger orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((ord, idx) => (
              <div key={ord.id} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                {/* Header: Order ID, Timestamp & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-semibold text-xs text-stone-900 block">{ord.id}</span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {ord.date} {ord.time && `• ${ord.time}`}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border shrink-0 ${
                      ord.status === 'Paid' || ord.status === 'Confirmed' || ord.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ord.status === 'Refunded'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                {/* Attendee Info */}
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-900">{ord.customer || 'Guest Attendee'}</span>
                    <span className="font-mono text-stone-500 text-[11px]">{ord.email}</span>
                  </div>
                  <div className="text-xs text-stone-800 border-t border-stone-200/50 pt-1.5 flex items-center justify-between">
                    <span className="truncate">{ord.event || ord.eventTitle}</span>
                    <span className="text-[10px] font-mono bg-stone-200/60 px-1.5 py-0.5 rounded text-stone-700 shrink-0 ml-2">
                      {ord.tier}
                    </span>
                  </div>
                </div>

                {/* Financial Summary 2-Col Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-stone-100/60 border border-stone-200/40">
                    <span className="text-[10px] uppercase text-stone-400 block">Quantity</span>
                    <span className="font-medium text-stone-800">{ord.qty} {ord.qty > 1 ? 'tickets' : 'ticket'}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-100/60 border border-stone-200/40">
                    <span className="text-[10px] uppercase text-stone-400 block">Total Paid</span>
                    <span className="font-semibold text-stone-900">{ord.total}</span>
                  </div>
                </div>

                {/* Footer: Payment method & Action Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-stone-500">{ord.paymentMethod}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(ord)}
                    className="px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 cursor-pointer shadow-2xs"
                  >
                    View Receipt &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-stone-400">
              <p className="font-serif text-sm text-stone-600">No orders match your criteria</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {searchQuery
                  ? `No orders matching "${searchQuery}".`
                  : 'No orders recorded for this selection.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Order Receipt Detail Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  )
}