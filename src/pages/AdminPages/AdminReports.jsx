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
} from 'lucide-react'

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
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
      setFeedback(`Report #${resolvingReport.id} successfully marked as ${resolutionStatus}.`)
      setResolvingReport(null)
      setResolutionNotes('')
      fetchReports()
    } catch (err) {
      alert('Failed to resolve report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && r.status !== 'Resolved' && r.status !== 'Dismissed') ||
        r.status?.toLowerCase() === statusFilter.toLowerCase()

      const q = search.toLowerCase()
      const matchesSearch =
        !search.trim() ||
        (r.reporterEmail && r.reporterEmail.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.targetModel && r.targetModel.toLowerCase().includes(q)) ||
        (r.details && r.details.toLowerCase().includes(q))

      return matchesStatus && matchesSearch
    })
  }, [reports, statusFilter, search])

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
  } = usePagination(filteredReports, { initialPageSize: 15, resetDeps: [statusFilter, search] })

  const stats = useMemo(() => {
    const pendingCount = reports.filter((r) => r.status !== 'Resolved' && r.status !== 'Dismissed').length
    const resolvedCount = reports.filter((r) => r.status === 'Resolved').length
    return {
      pendingCount,
      resolvedCount,
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
        return 'bg-rose-50 text-rose-700 border-rose-200/80'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Platform Safety & Trust
            </span>
            <span className="text-stone-400 text-xs font-mono">• Moderation Desk</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Content Moderation & Complaints</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Investigate attendee reports on policy violations, copyright infringement, or listing disputes.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Reports</span>
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1">
            <ShieldAlert size={12} />
            <span>Open Violations</span>
          </div>
          <div className="font-serif text-xl font-bold text-rose-700">{stats.pendingCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Requiring adjudication</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 mb-1">Resolved Reports</div>
          <div className="font-serif text-xl font-bold text-emerald-700">{stats.resolvedCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Corrective actions taken</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Total Filed</div>
          <div className="font-serif text-xl font-bold text-stone-900">{stats.totalCount}</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">All historical filings</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1">Target Entities</div>
          <div className="font-serif text-xl font-bold text-stone-900">Stages & Studios</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">Monitored objects</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap pb-1 md:pb-0">
          {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((s) => (
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
            <div className="text-xs font-mono text-stone-400">Loading moderation reports...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Flag className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="text-xs font-mono text-stone-500">No complaints matching filter.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Reporter</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Complaint Details</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Filed Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {paginatedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 font-bold text-stone-900">
                      <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800">
                        {r.targetModel} #{r.targetId}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-stone-600 font-sans">
                      {r.reporterEmail}
                    </td>

                    <td className="py-3 px-4 font-semibold text-rose-700 font-sans">
                      {r.reason}
                    </td>

                    <td className="py-3 px-4 font-sans text-stone-600 max-w-xs truncate">
                      {r.details || 'No additional details provided.'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getStatusBadge(
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
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-mono font-semibold transition"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
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

      {/* Resolution Slide-over Drawer */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setResolvingReport(null)}
          />
          <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Adjudication Case</span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Report #{resolvingReport.id}
                </h2>
              </div>
              <button
                onClick={() => setResolvingReport(null)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-900 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleResolveSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 font-sans text-xs">
              {/* Report Information Card */}
              <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                    Violation Reported
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    {resolvingReport.createdAt ? new Date(resolvingReport.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="font-serif text-base font-bold text-white">{resolvingReport.reason}</div>
                <div className="border-t border-stone-800 pt-2 text-stone-300 font-mono text-[11px] space-y-1">
                  <div>Target: {resolvingReport.targetModel} #{resolvingReport.targetId}</div>
                  <div>Reporter: {resolvingReport.reporterEmail}</div>
                </div>
              </div>

              {/* Reported Details */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-2 bg-stone-50">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-semibold">
                  Attendee Complaint Statement
                </span>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {resolvingReport.details || 'No additional details submitted with this report.'}
                </p>
              </div>

              {/* Resolution Verdict */}
              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Moderation Verdict
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition"
                >
                  <option value="Resolved">Resolved (Action Taken / Corrected)</option>
                  <option value="Dismissed">Dismissed (No Policy Infraction Found)</option>
                  <option value="Investigating">Investigating (Escalated for Review)</option>
                </select>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Resolution Notes & Audit Log
                </label>
                <textarea
                  rows={3}
                  placeholder="Document the investigative findings and action rationale..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingReport(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-semibold transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

