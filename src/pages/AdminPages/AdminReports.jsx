import React, { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  Flag,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Check,
  MessageSquare,
  LifeBuoy,
  User,
  CreditCard,
  Ticket,
  Sparkles,
  HelpCircle,
  Bell,
  Send,
} from 'lucide-react'

const REPORT_TYPE_LABELS = {
  bug: { label: 'Bug / Tech Glitch', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert },
  tickets: { label: 'Tickets & Passes', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Ticket },
  payment: { label: 'Payment & Billing', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CreditCard },
  event: { label: 'Event Flag / Violation', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Sparkles },
  account: { label: 'Account & Security', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: HelpCircle },
  general: { label: 'General Inquiry', color: 'bg-stone-100 text-stone-700 border-stone-200', icon: MessageSquare },
  support: { label: 'Support Request', color: 'bg-stone-100 text-stone-700 border-stone-200', icon: LifeBuoy },
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all') // 'all' | 'support' | 'moderation'
  const [search, setSearch] = useState('')
  const [resolvingReport, setResolvingReport] = useState(null)
  const [resolutionStatus, setResolutionStatus] = useState('Resolved')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await API.get('admin/reports/')
      setReports(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    if (!resolvingReport) return
    setIsSubmitting(true)
    try {
      await API.patch(`admin/reports/${resolvingReport.id}/`, {
        status: resolutionStatus,
        resolutionNotes,
      })
      setFeedback(`Report #${resolvingReport.id} successfully updated to "${resolutionStatus}". Notification dispatched to user.`)
      setResolvingReport(null)
      setResolutionNotes('')
      fetchReports()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && r.status !== 'Resolved' && r.status !== 'Dismissed') ||
        r.status?.toLowerCase() === statusFilter.toLowerCase()

      // Category filter (support vs event moderation)
      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'support' && r.reportType !== 'event') ||
        (categoryFilter === 'moderation' && r.reportType === 'event')

      // Search query
      const q = search.toLowerCase()
      const matchesSearch =
        !search.trim() ||
        (r.reporterEmail && r.reporterEmail.toLowerCase().includes(q)) ||
        (r.reporterName && r.reporterName.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.targetModel && r.targetModel.toLowerCase().includes(q)) ||
        (r.details && r.details.toLowerCase().includes(q))

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [reports, statusFilter, categoryFilter, search])

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedReports,
    goToPage,
    setPageSize,
  } = usePagination(filteredReports, { initialPageSize: 15, resetDeps: [statusFilter, categoryFilter, search] })

  const stats = useMemo(() => {
    const pendingCount = reports.filter((r) => r.status !== 'Resolved' && r.status !== 'Dismissed').length
    const resolvedCount = reports.filter((r) => r.status === 'Resolved').length
    const supportTicketsCount = reports.filter((r) => r.reportType !== 'event').length
    const moderationCount = reports.filter((r) => r.reportType === 'event').length
    return {
      pendingCount,
      resolvedCount,
      supportTicketsCount,
      moderationCount,
      totalCount: reports.length,
    }
  }, [reports])

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      case 'dismissed':
        return 'bg-stone-100 text-stone-700 border-stone-200'
      case 'investigating':
        return 'bg-blue-50 text-blue-700 border-blue-200/80'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/80'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Platform Safety &amp; Support Desk
            </span>
            <span className="text-stone-400 text-xs font-mono">• Problem Center</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            User Support &amp; Moderation Reports
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Review problem messages sent by logged-in users, resolve support inquiries, and investigate content flags.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Reports</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
            <Clock size={12} />
            <span>Open Tickets</span>
          </div>
          <div className="font-serif text-xl font-bold text-amber-700">{stats.pendingCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Awaiting super admin response</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1">
            <LifeBuoy size={12} />
            <span>User Support Requests</span>
          </div>
          <div className="font-serif text-xl font-bold text-blue-700">{stats.supportTicketsCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Attendee &amp; host inquiries</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Resolved</span>
          </div>
          <div className="font-serif text-xl font-bold text-emerald-700">{stats.resolvedCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Resolved with user notice</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Total Filings</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.totalCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">All tickets &amp; moderation logs</div>
        </div>
      </div>

      {/* Filter Category & Status Strip */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Category Filter */}
          <div className="inline-flex p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs font-mono">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-stone-900 text-white font-medium shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Types ({stats.totalCount})
            </button>
            <button
              onClick={() => setCategoryFilter('support')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                categoryFilter === 'support'
                  ? 'bg-stone-900 text-white font-medium shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              User Support ({stats.supportTicketsCount})
            </button>
            <button
              onClick={() => setCategoryFilter('moderation')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                categoryFilter === 'moderation'
                  ? 'bg-stone-900 text-white font-medium shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Event Flags ({stats.moderationCount})
            </button>
          </div>

          <div className="h-4 w-px bg-stone-200 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
            {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition shrink-0 whitespace-nowrap cursor-pointer ${
                  statusFilter === s
                    ? 'bg-stone-200 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reason, reporter, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-sans bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-900 transition"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden max-w-full">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-stone-400">Loading support inquiries &amp; reports...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Flag className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="text-xs font-mono text-stone-500">No support tickets or complaints matching filter.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">ID / Type</th>
                  <th className="py-3 px-4 font-semibold">Reporter</th>
                  <th className="py-3 px-4 font-semibold">Subject / Reason</th>
                  <th className="py-3 px-4 font-semibold">Message Details</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {paginatedReports.map((r) => {
                  const categoryMeta = REPORT_TYPE_LABELS[r.reportType] || REPORT_TYPE_LABELS.support
                  const CatIcon = categoryMeta.icon

                  return (
                    <tr key={r.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900">#{r.id}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${categoryMeta.color}`}
                          >
                            <CatIcon size={11} />
                            <span>{categoryMeta.label}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-700 font-sans">
                        <div className="space-y-0.5">
                          <div className="font-medium text-stone-900 flex items-center gap-1.5">
                            <span>{r.reporterName || 'Anonymous'}</span>
                            {r.reporterRole && (
                              <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                                {r.reporterRole}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-stone-400">{r.reporterEmail}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-stone-950 font-sans max-w-xs">
                        <div className="truncate">{r.reason}</div>
                        {r.targetModel && r.targetModel !== 'Platform' && (
                          <div className="text-[10px] font-mono text-stone-400 font-normal">
                            Target: {r.targetModel} {r.targetId ? `#${r.targetId}` : ''}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-stone-600 max-w-xs">
                        <div className="truncate">{r.details || 'No additional details.'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getStatusBadge(
                            r.status
                          )}`}
                        >
                          {r.status || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setResolvingReport(r)
                            setResolutionStatus(r.status === 'Dismissed' ? 'Dismissed' : 'Resolved')
                            setResolutionNotes(r.resolutionNotes || '')
                          }}
                          className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-mono font-semibold transition shadow-2xs cursor-pointer active:scale-95"
                        >
                          Respond
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
          itemLabel="reports"
        />
      </div>

      {/* Resolution & Response Slide-over Drawer */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setResolvingReport(null)}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
                  Support Ticket &amp; Case Adjudication
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Ticket #{resolvingReport.id}
                </h2>
              </div>
              <button
                onClick={() => setResolvingReport(null)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-900 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleResolveSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 font-sans text-xs">
              {/* Ticket Information Card */}
              <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                    <LifeBuoy size={12} />
                    <span>Inquiry Overview</span>
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    {resolvingReport.createdAt ? new Date(resolvingReport.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <div className="font-serif text-base font-bold text-white">{resolvingReport.reason}</div>
                <div className="border-t border-stone-800 pt-2 text-stone-300 font-mono text-[11px] space-y-1">
                  <div>
                    <span className="text-stone-500">Reporter:</span> {resolvingReport.reporterName} ({resolvingReport.reporterEmail})
                  </div>
                  <div>
                    <span className="text-stone-500">Account Role:</span> {resolvingReport.reporterRole || 'Attendee'}
                  </div>
                  {resolvingReport.targetModel && (
                    <div>
                      <span className="text-stone-500">Target Entity:</span> {resolvingReport.targetModel} #{resolvingReport.targetId || 'N/A'}
                    </div>
                  )}
                </div>
              </div>

              {/* User Reported Details */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-1.5 bg-stone-50">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-semibold">
                  User Message Statement
                </span>
                <p className="text-stone-800 leading-relaxed text-xs whitespace-pre-wrap">
                  {resolvingReport.details || 'No additional details submitted with this report.'}
                </p>
              </div>

              {/* Resolution Verdict */}
              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Status Verdict <span className="text-red-500">*</span>
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition"
                >
                  <option value="Resolved">Resolved (Problem Solved / Action Taken)</option>
                  <option value="Investigating">Investigating (In Progress / Escalated)</option>
                  <option value="Dismissed">Dismissed (Closed / Invalid)</option>
                </select>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                    Super Admin Resolution Response
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                    <Bell size={11} />
                    <span>Sends In-App Notice</span>
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Type an official resolution message or explanation. The user will be able to read this response directly in their support history..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans focus:bg-white focus:outline-none focus:border-stone-900 transition leading-relaxed"
                />
              </div>

              {/* Notification Notice Callout */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-mono text-amber-900 flex items-start gap-2">
                <Bell size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Saving this resolution will immediately update the ticket status and notify{' '}
                  <strong className="font-semibold">{resolvingReport.reporterEmail}</strong> via in-app notification.
                </span>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingReport(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Saving & Notifying...' : 'Save & Notify User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
