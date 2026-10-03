import React, { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  Receipt,
  Search,
  RefreshCw,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Clock,
  Ban,
  AlertCircle,
  Copy,
  Check,
  Eye,
  X,
  CreditCard,
  Building2,
  TrendingUp,
} from 'lucide-react'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState(null)
  const [copiedId, setCopiedId] = useState('')

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedTransactions,
    goToPage,
    setPageSize,
  } = usePagination(transactions, { initialPageSize: 15, resetDeps: [statusFilter, search] })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      let url = `admin/transactions/?status=${statusFilter}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      const res = await API.get(url)
      setTransactions(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTransactions()
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedId(key)
    setTimeout(() => setCopiedId(''), 2000)
  }

  // Calculate summary metrics
  const stats = useMemo(() => {
    const total = transactions.reduce((acc, t) => acc + (parseFloat(t.totalAmount) || 0), 0)
    const fees = transactions.reduce((acc, t) => acc + (parseFloat(t.platformFee) || 0), 0)
    const confirmedCount = transactions.filter(
      (t) => t.status === 'Confirmed' || t.status === 'Paid'
    ).length
    return {
      totalVolume: total.toFixed(2),
      platformRevenue: fees.toFixed(2),
      confirmedCount,
      totalCount: transactions.length,
    }
  }, [transactions])

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/80'
      case 'refunded':
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200/80'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Financial Audit
            </span>
            <span className="text-stone-400 text-xs font-mono">• PayPal Capture Ledger</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Platform Transaction Ledger</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Immutable settlement records, gross volumes, platform fee share, and gateway capture IDs.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* KPI Stats Quick Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Gross Volume</div>
          <div className="font-serif text-xl font-bold text-stone-900">${stats.totalVolume}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Across displayed rows</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Platform Take</span>
          </div>
          <div className="font-serif text-xl font-bold text-emerald-700">+${stats.platformRevenue}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Platform service cut</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Settled Orders</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.confirmedCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Completed captures</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Total Records</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.totalCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Audit log items</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap pb-1 md:pb-0">
          {['all', 'confirmed', 'paid', 'pending', 'refunded', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search order #, buyer, capture ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-sans bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-900 transition"
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

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden max-w-full">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-stone-400">Loading platform transaction ledger...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Receipt className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="text-xs font-mono text-stone-500">No transactions recorded matching criteria.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order / Reference</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Stage & Tier</th>
                  <th className="py-3 px-4 font-semibold">Gross</th>
                  <th className="py-3 px-4 font-semibold">Fee (3.5%)</th>
                  <th className="py-3 px-4 font-semibold">PayPal Capture</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {paginatedTransactions.map((tx) => {
                  const captureId = tx.paypalCaptureId || tx.paypalOrderId
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-stone-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-bold text-stone-900 group-hover:text-stone-950">
                        #{tx.orderNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-sans font-medium text-stone-900">{tx.buyerName || 'Guest Attendee'}</div>
                        <div className="text-stone-400 text-[10px]">{tx.buyerEmail}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-sans font-medium text-stone-900 truncate">{tx.eventTitle}</div>
                        <div className="text-stone-500 text-[10px]">
                          {tx.tierName} • {tx.quantity}x ticket{tx.quantity > 1 ? 's' : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-stone-900">
                        ${parseFloat(tx.totalAmount || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-700">
                        +${parseFloat(tx.platformFee || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {captureId ? (
                          <button
                            onClick={() => copyToClipboard(captureId, `tx-${tx.id}`)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded border border-stone-200 text-[10px] font-mono transition"
                            title="Click to copy capture ID"
                          >
                            <span className="truncate max-w-[120px]">{captureId}</span>
                            {copiedId === `tx-${tx.id}` ? (
                              <Check size={10} className="text-emerald-600" />
                            ) : (
                              <Copy size={10} className="text-stone-400" />
                            )}
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[10px]">Direct Transfer</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getStatusBadge(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-stone-400 whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900 transition"
                          title="Inspect Transaction"
                        >
                          <Eye size={14} />
                        </button>
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
          itemLabel="transactions"
        />
      </div>

      {/* Slide-over Inspection Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedTx(null)}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Transaction Record</span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Order #{selectedTx.orderNumber}</h2>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-900 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 font-sans text-xs">
              {/* Financial Snapshot */}
              <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-mono text-[11px]">Gross Capture</span>
                  <span className="text-xl font-serif font-bold text-white">
                    ${parseFloat(selectedTx.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-stone-800 pt-2 flex items-center justify-between text-stone-300 font-mono text-[11px]">
                  <span>Platform Fee Take (3.5%)</span>
                  <span className="text-emerald-400 font-bold">
                    +${parseFloat(selectedTx.platformFee || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-400 font-mono text-[11px]">
                  <span>Organizer Settlement Net</span>
                  <span>
                    ${(parseFloat(selectedTx.totalAmount || 0) - parseFloat(selectedTx.platformFee || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status & Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 block mb-1">SETTLEMENT STATUS</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getStatusBadge(
                      selectedTx.status
                    )}`}
                  >
                    {selectedTx.status}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 block mb-1">PROCESSED AT</span>
                  <span className="font-mono text-stone-800 font-medium">
                    {selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Customer Details</span>
                <div className="font-semibold text-stone-900 text-sm">{selectedTx.buyerName || 'Guest User'}</div>
                <div className="text-stone-500 font-mono">{selectedTx.buyerEmail}</div>
              </div>

              {/* Stage & Items */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Stage Ticket Details</span>
                <div className="font-serif font-bold text-stone-900 text-sm">{selectedTx.eventTitle}</div>
                <div className="flex items-center justify-between text-stone-600 pt-2 border-t border-stone-100 font-mono text-[11px]">
                  <span>Tier: {selectedTx.tierName}</span>
                  <span>Qty: {selectedTx.quantity}x</span>
                </div>
              </div>

              {/* Gateway References */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-3 bg-stone-50">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-semibold">
                  Payment Gateway Tracing
                </span>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-stone-400 block">PayPal Order ID</span>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                    <span className="truncate">{selectedTx.paypalOrderId || 'N/A'}</span>
                    {selectedTx.paypalOrderId && (
                      <button
                        onClick={() => copyToClipboard(selectedTx.paypalOrderId, 'drawer-order')}
                        className="text-stone-400 hover:text-stone-900 ml-2"
                      >
                        {copiedId === 'drawer-order' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-stone-400 block">PayPal Capture ID</span>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                    <span className="truncate">{selectedTx.paypalCaptureId || 'N/A'}</span>
                    {selectedTx.paypalCaptureId && (
                      <button
                        onClick={() => copyToClipboard(selectedTx.paypalCaptureId, 'drawer-capture')}
                        className="text-stone-400 hover:text-stone-900 ml-2"
                      >
                        {copiedId === 'drawer-capture' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-semibold transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

