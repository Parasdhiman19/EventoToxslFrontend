import React, { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import { getAvatarInitials } from '../../utils/avatar'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle2,
  RefreshCw,
  Lock,
  Unlock,
  X,
  AlertTriangle,
  Mail,
  UserCheck,
  Building2,
  ShoppingBag,
  CreditCard,
  Calendar,
  UserX,
} from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [suspendingUser, setSuspendingUser] = useState(null)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [roleChangeUser, setRoleChangeUser] = useState(null)
  const [newRole, setNewRole] = useState('user')
  const [feedback, setFeedback] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedUsers,
    goToPage,
    setPageSize,
  } = usePagination(users, { initialPageSize: 15, resetDeps: [roleFilter, statusFilter, search] })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let url = `admin/users/?role=${roleFilter}&status=${statusFilter}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      const res = await API.get(url)
      setUsers(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleSuspend = async (e) => {
    e.preventDefault()
    if (!suspendingUser) return
    setIsProcessing(true)
    try {
      await API.post(`admin/users/${suspendingUser.id}/suspend/`, {
        reason: suspensionReason || 'Suspended by Super Admin',
      })
      setFeedback(`Account for ${suspendingUser.email} has been suspended.`)
      setSuspendingUser(null)
      setSuspensionReason('')
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to suspend user.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnsuspend = async (user) => {
    if (!window.confirm(`Unsuspend account for ${user.email}?`)) return
    try {
      await API.post(`admin/users/${user.id}/unsuspend/`)
      setFeedback(`User ${user.email} successfully restored.`)
      fetchUsers()
    } catch (err) {
      alert('Failed to unsuspend user.')
    }
  }

  const handleRoleChange = async (e) => {
    e.preventDefault()
    if (!roleChangeUser) return
    setIsProcessing(true)
    try {
      await API.patch(`admin/users/${roleChangeUser.id}/role/`, { role: newRole })
      setFeedback(`Role for ${roleChangeUser.email} updated to ${newRole}.`)
      setRoleChangeUser(null)
      fetchUsers()
    } catch (err) {
      alert('Failed to update role.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Quick stats calculation
  const stats = useMemo(() => {
    const total = users.length
    const organizers = users.filter((u) => u.isOrganizer || u.role === 'manager').length
    const suspended = users.filter((u) => u.isSuspended).length
    return { total, organizers, suspended }
  }, [users])

  const getRoleBadgeStyle = (user) => {
    if (user.isSuperAdmin || user.role === 'admin') {
      return 'bg-stone-900 text-stone-50 border-stone-800'
    }
    if (user.isOrganizer || user.role === 'manager') {
      return 'bg-stone-100 text-stone-800 border-stone-200'
    }
    return 'bg-stone-50 text-stone-600 border-stone-200/80'
  }

  const getRoleLabel = (user) => {
    if (user.isSuperAdmin || user.role === 'admin') return 'Super Admin'
    if (user.isOrganizer || user.role === 'manager') return 'Organizer'
    return 'Attendee'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Identity & Access
            </span>
            <span className="text-stone-400 text-xs font-mono">• Global Directory</span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-stone-900">
            User Registry & Permissions
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Manage attendee & organizer accounts, assign platform roles, and manage account suspensions.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-mono transition shadow-2xs self-start sm:self-auto active:scale-95 cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Stats Quick Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-0.5 truncate">
            Total Users
          </div>
          <div className="font-serif text-base sm:text-xl font-bold text-stone-900">{stats.total}</div>
          <div className="text-[9px] sm:text-[10px] text-stone-400 font-mono hidden sm:block">Matching filter</div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-stone-700 mb-0.5 truncate">
            Hosts & Studios
          </div>
          <div className="font-serif text-base sm:text-xl font-bold text-stone-900">{stats.organizers}</div>
          <div className="text-[9px] sm:text-[10px] text-stone-400 font-mono hidden sm:block">Organizers</div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-rose-700 mb-0.5 truncate">
            Suspended
          </div>
          <div className="font-serif text-base sm:text-xl font-bold text-rose-700">{stats.suspended}</div>
          <div className="text-[9px] sm:text-[10px] text-stone-400 font-mono hidden sm:block">Access revoked</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none flex-nowrap">
          <div className="flex items-center gap-1 shrink-0">
            {['all', 'user', 'manager', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-stone-200 mx-0.5 shrink-0" />

          <div className="flex items-center gap-1 shrink-0">
            {['all', 'active', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition shrink-0 whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-stone-800 text-white font-semibold shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search email, name..."
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

      {/* Users Container: Responsive Card List (Mobile) & Data Table (Desktop) */}
      {loading ? (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs py-16 text-center text-xs font-mono text-stone-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={18} className="animate-spin text-stone-400" />
          <span>Loading user registry...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs py-16 text-center text-xs font-mono text-stone-400 space-y-1">
          <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <div>No users matched the search criteria.</div>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Clean, Compact User Cards */}
          <div className="block md:hidden space-y-3">
            {paginatedUsers.map((u) => {
              const initials = getAvatarInitials(u.fullName || u.email, 'U')
              return (
                <div
                  key={u.id}
                  className="bg-white rounded-xl border border-stone-200/80 shadow-2xs p-4 space-y-3.5"
                >
                  {/* Card Header: Avatar, Name, Email, Status */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 text-xs truncate">
                          {u.fullName || u.email.split('@')[0]}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono truncate">{u.email}</div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
                          <Ban size={10} />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-[11px] font-mono">
                    <div>
                      <span className="text-stone-400 text-[10px] block uppercase">Role & Access</span>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getRoleBadgeStyle(u)}`}>
                          {getRoleLabel(u)}
                        </span>
                      </div>
                      {u.organizationName && (
                        <div className="text-[10px] text-stone-500 truncate mt-0.5">
                          {u.organizationName}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-stone-400 text-[10px] block uppercase">Purchases</span>
                      <div className="mt-0.5 font-semibold text-stone-900">
                        {u.totalSpent || '$0.00'}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {u.totalOrders || 0} order{u.totalOrders === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setRoleChangeUser(u)
                        setNewRole(u.role)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200/80 text-stone-800 rounded-lg text-xs font-mono font-medium transition"
                    >
                      <Shield size={13} />
                      <span>Edit Role</span>
                    </button>

                    {u.isSuspended ? (
                      <button
                        onClick={() => handleUnsuspend(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-medium transition"
                      >
                        <Unlock size={13} />
                        <span>Unsuspend</span>
                      </button>
                    ) : (
                      <button
                        disabled={u.isSuperAdmin}
                        onClick={() => setSuspendingUser(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-mono font-medium transition disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Lock size={13} />
                        <span>Suspend</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* DESKTOP VIEW: High Density Data Table */}
          <div className="hidden md:block bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden max-w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role & Studio</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedUsers.map((u) => {
                    const initials = getAvatarInitials(u.fullName || u.email, 'U')
                    return (
                      <tr key={u.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-stone-900 truncate">{u.fullName || u.email.split('@')[0]}</div>
                              <div className="text-[11px] text-stone-500 font-mono truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getRoleBadgeStyle(u)}`}>
                              {getRoleLabel(u)}
                            </span>
                          </div>
                          {u.organizationName && (
                            <div className="text-[10px] text-stone-500 font-medium truncate max-w-[160px] mt-0.5">
                              {u.organizationName}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-700">
                          {u.totalOrders || 0} orders
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-stone-900">
                          {u.totalSpent || '$0.00'}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200 font-medium flex items-center gap-1 w-fit">
                              <Ban size={10} />
                              <span>Suspended</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1 w-fit">
                              <CheckCircle2 size={10} />
                              <span>Active</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setRoleChangeUser(u)
                                setNewRole(u.role)
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                              title="Edit Role / Privileges"
                            >
                              <Shield size={14} />
                            </button>

                            {u.isSuspended ? (
                              <button
                                onClick={() => handleUnsuspend(u)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="Restore User Access"
                              >
                                <Unlock size={14} />
                              </button>
                            ) : (
                              <button
                                disabled={u.isSuperAdmin}
                                onClick={() => setSuspendingUser(u)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-20"
                                title="Suspend Account"
                              >
                                <Lock size={14} />
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
              itemLabel="users"
            />
          </div>

          {/* Mobile Pagination */}
          <div className="block md:hidden bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              pageSize={pageSize}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
              itemLabel="users"
            />
          </div>
        </>
      )}

      {/* Suspend User Drawer Sheet */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setSuspendingUser(null)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5 text-rose-600">
                  <AlertTriangle size={20} />
                  <h2 className="font-serif text-lg font-bold text-stone-900">Suspend User Account</h2>
                </div>
                <button
                  onClick={() => setSuspendingUser(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                You are preparing to suspend <span className="font-semibold text-stone-900">{suspendingUser.email}</span>. This will immediately revoke active tokens and terminate user login capabilities across the platform.
              </p>

              <form onSubmit={handleSuspend} id="suspend-form" className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                    Suspension Reason *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a reason (e.g. chargeback dispute, abusive comments, fraud)..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition font-sans"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-stone-600 hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="suspend-form"
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-mono font-medium transition shadow-2xs"
              >
                {isProcessing ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Drawer Sheet */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setRoleChangeUser(null)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Shield size={20} className="text-stone-700" />
                  <h2 className="font-serif text-lg font-bold text-stone-900">Change Account Role</h2>
                </div>
                <button
                  onClick={() => setRoleChangeUser(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-stone-600">
                Updating privileges for <span className="font-semibold text-stone-900">{roleChangeUser.email}</span>.
              </p>

              <form onSubmit={handleRoleChange} id="role-form" className="space-y-3 text-xs">
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 sm:p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl cursor-pointer hover:bg-stone-100 transition">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={newRole === 'user'}
                      onChange={(e) => setNewRole(e.target.value)}
                    />
                    <div>
                      <div className="font-semibold text-stone-900">Attendee / Customer</div>
                      <div className="text-[11px] text-stone-500 font-mono">Standard ticket purchasing and discovery</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 sm:p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl cursor-pointer hover:bg-stone-100 transition">
                    <input
                      type="radio"
                      name="role"
                      value="manager"
                      checked={newRole === 'manager'}
                      onChange={(e) => setNewRole(e.target.value)}
                    />
                    <div>
                      <div className="font-semibold text-stone-900">Studio Organizer / Manager</div>
                      <div className="text-[11px] text-stone-500 font-mono">Create stages, configure seat maps, manage payouts</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 sm:p-3.5 bg-stone-900 text-stone-50 rounded-xl cursor-pointer hover:bg-stone-800 transition">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={newRole === 'admin'}
                      onChange={(e) => setNewRole(e.target.value)}
                    />
                    <div>
                      <div className="font-semibold text-stone-100">Super Administrator</div>
                      <div className="text-[11px] text-stone-400 font-mono">Platform-wide governance & moderation access</div>
                    </div>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRoleChangeUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-stone-600 hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="role-form"
                disabled={isProcessing}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-mono font-medium transition shadow-2xs"
              >
                {isProcessing ? 'Saving...' : 'Save Privileges'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
