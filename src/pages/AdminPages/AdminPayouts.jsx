import React, { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  AlertTriangle,
  DollarSign,
  Building2,
  Send,
  Eye,
  Check,
} from 'lucide-react'
import { getAvatarInitials } from '../../utils/avatar'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [processingPayout, setProcessingPayout] = useState(null)
  const [actionType, setActionType] = useState('approve')
  const [processNotes, setProcessNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      let url = `admin/payouts/?status=${statusFilter}`
      const res = await API.get(url)
      setPayouts(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [statusFilter])

  const handleProcessSubmit = async (e) => {
    e.preventDefault()
    if (!processingPayout) return
    setIsSubmitting(true)
    try {
      await API.post(`admin/payouts/${processingPayout.id}/process/`, {
        action: actionType,
        notes: processNotes,
      })
      setFeedback(`Payout #${processingPayout.payout_number} marked as ${actionType === 'approve' ? 'Completed' : 'Failed'}.`)
      setProcessingPayout(null)
      setProcessNotes('')
      fetchPayouts()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to process payout.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPayouts = useMemo(() => {
    if (!search.trim()) return payouts
    const q = search.toLowerCase()
    return payouts.filter((p) =>
      (p.payout_number && p.payout_number.toLowerCase().includes(q)) ||
      (p.organizer_name && p.organizer_name.toLowerCase().includes(q)) ||
      (p.organizer_email && p.organizer_email.toLowerCase().includes(q)) ||
      (p.destination_summary && p.destination_summary.toLowerCase().includes(q))
    )
  }, [payouts, search])

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedPayouts,
    goToPage,
    setPageSize,
  } = usePagination(filteredPayouts, { initialPageSize: 15, resetDeps: [statusFilter, search] })

  const stats = useMemo(() => {
    const totalPending = payouts.filter((p) => p.status === 'Pending' || p.status === 'Processing')
      .reduce((acc, p) => acc + (parseFloat(p.net_disbursed || p.gross_amount) || 0), 0)
    const totalSettled = payouts.filter((p) => p.status === 'Completed')
      .reduce((acc, p) => acc + (parseFloat(p.net_disbursed || p.gross_amount) || 0), 0)
    const pendingCount = payouts.filter((p) => p.status === 'Pending' || p.status === 'Processing').length
    return {
      totalPending: totalPending.toFixed(2),
      totalSettled: totalSettled.toFixed(2),
      pendingCount,
      totalCount: payouts.length,
    }
  }, [payouts])

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      case 'pending':
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200/80'
      case 'failed':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Treasury Operations
            </span>
            <span className="text-stone-400 text-xs font-mono">• Organizer Disbursals</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Payout Disbursements</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Review, authorize, and disburse withdrawal requests submitted by studio organizers.
          </p>
        </div>

        <button
          onClick={fetchPayouts}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-700 mb-1">Pending Approval</div>
          <div className="font-serif text-xl font-bold text-amber-700">${stats.totalPending}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">{stats.pendingCount} awaiting authorization</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 mb-1">Total Settled</div>
          <div className="font-serif text-xl font-bold text-emerald-700">${stats.totalSettled}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Disbursed to date</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Active Queue Items</div>
          <div className="font-serif text-xl font-bold text-stone-900">{filteredPayouts.length}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Matching filter</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Gateway Protocol</div>
          <div className="font-serif text-xl font-bold text-stone-900">PayPal Direct</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Auto & manual settlement</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap pb-1 md:pb-0">
          {['all', 'pending', 'processing', 'completed', 'failed'].map((s) => (
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

        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payout #, organizer, account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-sans bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-900 transition"
          />
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden max-w-full">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-stone-400">Loading payout disbursement queue...</div>
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <CreditCard className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="text-xs font-mono text-stone-500">No payout requests in this queue.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Payout ID</th>
                  <th className="py-3 px-4 font-semibold">Creator / Studio</th>
                  <th className="py-3 px-4 font-semibold">Settlement Target</th>
                  <th className="py-3 px-4 font-semibold">Net Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Requested Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {paginatedPayouts.map((p) => {
                  const initials = getAvatarInitials(p.organizer_name || 'Host')
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {p.payout_number}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-[10px] shrink-0 font-sans">
                            {initials}
                          </div>
                          <div>
                            <div className="font-sans font-medium text-stone-900">{p.organizer_name || 'Studio Host'}</div>
                            <div className="text-stone-400 text-[10px]">{p.organizer_email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-700">
                        <div className="font-sans font-medium text-stone-900">
                          {p.destination_summary || `${p.method_type?.toUpperCase() || 'PAYPAL'}`}
                        </div>
                        <div className="text-stone-400 text-[10px] font-mono">
                          Method: {p.method_type || 'PayPal'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-stone-900 text-xs">
                        ${parseFloat(p.net_disbursed || p.gross_amount || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getStatusBadge(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {p.status !== 'Completed' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setProcessingPayout(p)
                                setActionType('approve')
                                setProcessNotes('')
                              }}
                              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-mono font-semibold transition"
                            >
                              Process
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-mono font-semibold inline-flex items-center gap-1">
                            <Check size={12} /> Settled
                          </span>
                        )}
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
          itemLabel="payouts"
        />
      </div>

      {/* Payout Processing Slide-over Drawer */}
      {processingPayout && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setProcessingPayout(null)}
          />
          <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Treasury Action</span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Disburse #{processingPayout.payout_number}
                </h2>
              </div>
              <button
                onClick={() => setProcessingPayout(null)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-900 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleProcessSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 font-sans text-xs">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-mono text-[11px]">Payout Amount</span>
                  <span className="text-2xl font-serif font-bold text-white">
                    ${parseFloat(processingPayout.net_disbursed || processingPayout.gross_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-stone-800 pt-2 text-stone-300 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Recipient:</span>
                    <span className="font-semibold text-white">{processingPayout.organizer_name || 'Studio Host'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Target Account:</span>
                    <span className="text-stone-200">{processingPayout.destination_summary || 'PayPal'}</span>
                  </div>
                </div>
              </div>

              {/* Action Selector */}
              <div className="space-y-2">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Authorization Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className={`p-3 rounded-xl border text-center transition font-mono text-xs ${
                      actionType === 'approve'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    ✓ Approve & Settle
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('reject')}
                    className={`p-3 rounded-xl border text-center transition font-mono text-xs ${
                      actionType === 'reject'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold ring-1 ring-rose-500'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    ✕ Reject Request
                  </button>
                </div>
              </div>

              {/* Audit Notes */}
              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Audit Notes & Reference
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'e.g., PayPal batch ID or verification confirmation...'
                      : 'e.g., Reason for disbursement decline...'
                  }
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-1">
                <div className="font-mono text-[11px] font-bold uppercase flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-700" />
                  <span>Settlement Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Approving this payout will transition the status to Completed and balance records will be marked settled.
                </p>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProcessingPayout(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-semibold text-white transition shadow-xs disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-stone-900 hover:bg-stone-800'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Confirm Settlement'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

