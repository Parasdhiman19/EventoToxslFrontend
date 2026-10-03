import React, { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  FileText,
  Search,
  RefreshCw,
  Clock,
  Shield,
  User,
  Activity,
  Eye,
  X,
  Laptop,
  Layers,
} from 'lucide-react'
import { getAvatarInitials } from '../../utils/avatar'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [selectedLog, setSelectedLog] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let url = 'admin/audit-logs/'
      if (search) url += `?search=${encodeURIComponent(search)}`
      const res = await API.get(url)
      setLogs(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchLogs()
  }

  const filteredLogs = useMemo(() => {
    if (actionFilter === 'all') return logs
    return logs.filter((l) =>
      l.actionType?.toLowerCase().includes(actionFilter.toLowerCase())
    )
  }, [logs, actionFilter])

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedLogs,
    goToPage,
    setPageSize,
  } = usePagination(filteredLogs, { initialPageSize: 20, resetDeps: [actionFilter, search] })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Governance & Security
            </span>
            <span className="text-stone-400 text-xs font-mono">• Immutable Chronicle</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Administrative Audit Trail</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Cryptographically chronological records of all administrative state overrides, disbarments, and financial operations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Audit Trail</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap pb-1 md:pb-0">
          {['all', 'user', 'stage', 'banner', 'payout', 'settings', 'auth'].map((f) => (
            <button
              key={f}
              onClick={() => setActionFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                actionFilter === f
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, actor, target..."
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

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden max-w-full">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-stone-400">Loading administrative audit records...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Shield className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="text-xs font-mono text-stone-500">No audit events recorded matching criteria.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono text-[11px]">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/80 text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Admin Actor</th>
                  <th className="py-3 px-4 font-semibold">Action Classification</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                  <th className="py-3 px-4 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedLogs.map((log) => {
                  const initials = getAvatarInitials(log.actorName || 'Admin')
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-stone-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-[9px] font-sans shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 font-sans">{log.actorName}</div>
                            <div className="text-stone-400 text-[10px]">{log.actorEmail}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold uppercase text-[10px] border border-stone-200">
                          {log.actionType}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-700 font-bold">
                        {log.targetModel ? `${log.targetModel} #${log.targetId}` : '—'}
                      </td>

                      <td className="py-3 px-4 font-sans text-stone-700 max-w-sm truncate">
                        {log.description}
                      </td>

                      <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900 transition"
                        >
                          <Eye size={13} />
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
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          itemLabel="audit logs"
        />
      </div>

      {/* Audit Log Slide-over Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Security Audit</span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">Event #{selectedLog.id}</h2>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-900 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 font-sans text-xs">
              {/* Event Card */}
              <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 font-mono text-[10px] uppercase tracking-wider">Action Type</span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 text-emerald-400 font-mono uppercase text-[10px] font-bold">
                    {selectedLog.actionType}
                  </span>
                </div>
                <div className="text-white font-medium text-sm leading-snug">{selectedLog.description}</div>
                <div className="border-t border-stone-800 pt-2 text-stone-400 font-mono text-[11px]">
                  Timestamp: {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* Actor Info */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Admin Actor</span>
                <div className="font-semibold text-stone-900 text-sm">{selectedLog.actorName}</div>
                <div className="text-stone-500 font-mono">{selectedLog.actorEmail}</div>
              </div>

              {/* Target & Network */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 block mb-1">TARGET OBJECT</span>
                  <span className="font-mono text-stone-800 font-bold text-xs">
                    {selectedLog.targetModel ? `${selectedLog.targetModel} #${selectedLog.targetId}` : 'None'}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 block mb-1">IP ADDRESS</span>
                  <span className="font-mono text-stone-800 font-bold text-xs">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-[11px] font-mono text-stone-600 space-y-2">
                <div className="font-bold text-stone-900 uppercase text-[10px] flex items-center gap-1.5">
                  <Shield size={13} className="text-stone-700" />
                  <span>Compliance Verification</span>
                </div>
                <p className="leading-relaxed">
                  Audit events are recorded synchronously within database transactions and cannot be mutated or purged by administrators.
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-semibold transition"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

