import React from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Calendar, Search, X, RefreshCw, Edit3, Trash2 } from 'lucide-react'
import { getAvatarInitials } from '../../../utils/avatar'

export default function TeamRosterSection({
  teamMembers,
  isLoadingTeam,
  teamSearchFilter,
  setTeamSearchFilter,
  onRefreshTeam,
  onOpenAddStaff,
  onOpenEditStaff,
  onOpenDeleteStaff,
  onOpenViewAssigned,
}) {
  const filteredMembers = teamMembers.filter((member) => {
    if (!teamSearchFilter.trim()) return true
    const q = teamSearchFilter.toLowerCase()
    return (
      (member.name || '').toLowerCase().includes(q) ||
      (member.email || '').toLowerCase().includes(q) ||
      (member.roleTitle || member.role || '').toLowerCase().includes(q)
    )
  })

  const activeScannersCount = teamMembers.filter(
    (m) => !m.isOwner && m.defaultCanCheckIn !== false && m.canCheckIn !== false
  ).length

  const totalAssignedSlots = teamMembers.reduce(
    (acc, m) => acc + (m.assignedEventsCount || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-lg font-medium text-stone-900">Studio Team & Staff Directory</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Save your trusted staff roster once with default gate credentials and quick-assign them to any event in 1 click.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenAddStaff}
              className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>Add Staff Member</span>
            </button>
            <Link
              to="/manager/events"
              className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              title="Manage Events"
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">Event Assignments</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Total Team Pool</span>
            <p className="text-lg font-mono font-semibold text-stone-900 mt-1">
              {teamMembers.length} <span className="text-xs font-sans text-stone-500 font-normal">members</span>
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 block">Gate Scanners</span>
            <p className="text-lg font-mono font-semibold text-emerald-900 mt-1">
              {activeScannersCount} <span className="text-xs font-sans text-emerald-700 font-normal">active scanners</span>
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Active Event Assignments</span>
            <p className="text-lg font-mono font-semibold text-stone-900 mt-1">
              {totalAssignedSlots} <span className="text-xs font-sans text-stone-500 font-normal">slots assigned</span>
            </p>
          </div>
        </div>

        {/* Search Filter */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Filter team by name, email or role..."
              value={teamSearchFilter}
              onChange={(e) => setTeamSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            {teamSearchFilter && (
              <button
                type="button"
                onClick={() => setTeamSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onRefreshTeam}
            disabled={isLoadingTeam}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
            title="Refresh Team Roster"
          >
            <RefreshCw size={14} className={isLoadingTeam ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Team Roster List */}
        {isLoadingTeam ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-stone-500">
            <RefreshCw size={18} className="animate-spin text-stone-400" />
            <span className="font-mono">Syncing studio team roster...</span>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredMembers.map((member) => {
              const canView = member.defaultCanViewAttendees ?? member.canViewAttendees ?? true
              const canCheck = member.defaultCanCheckIn ?? member.canCheckIn ?? true
              const assignedCount =
                member.assignedEventsCount || (member.assignedEvents ? member.assignedEvents.length : 0)

              const rawName = member.name || member.fullName || member.full_name
              const displayName =
                rawName && rawName.trim() && rawName !== member.email
                  ? rawName.trim()
                  : member.username || (member.email ? member.email.split('@')[0] : 'Staff')

              return (
                <div
                  key={member.id}
                  className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-stone-50/40 px-2 rounded-xl transition-colors"
                >
                  {/* Member Identity */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-stone-100 text-stone-800 font-mono text-xs font-semibold flex items-center justify-center shrink-0 border border-stone-200 shadow-2xs">
                      {member.avatar || getAvatarInitials(displayName, 'ST')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-stone-900 truncate">{displayName}</span>
                        {member.isOwner ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-900 text-stone-50 font-medium">
                            Owner & Host
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-700 font-medium border border-stone-200/80">
                            {member.roleTitle || member.role || 'Stage Coordinator'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono mt-0.5">
                        <span className="truncate">{member.email}</span>
                        {member.phone && (
                          <>
                            <span>•</span>
                            <span>{member.phone}</span>
                          </>
                        )}
                      </div>
                      {member.notes && (
                        <p className="text-[11px] text-stone-500 italic mt-1 line-clamp-1">
                          &quot;{member.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Permissions & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    {/* Permissions Pill */}
                    {!member.isOwner && (
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-md border ${
                            canCheck
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-50 text-stone-400 border-stone-200'
                          }`}
                          title="Gate Check-In / Scanning Permission"
                        >
                          Scan: {canCheck ? 'Yes' : 'No'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md border ${
                            canView
                              ? 'bg-stone-100 text-stone-800 border-stone-200'
                              : 'bg-stone-50 text-stone-400 border-stone-200'
                          }`}
                          title="Attendee List Access"
                        >
                          Guest List: {canView ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}

                    {/* Assigned Events Badge */}
                    <button
                      type="button"
                      onClick={() => onOpenViewAssigned(member)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-[11px] font-mono font-medium transition cursor-pointer flex items-center gap-1"
                      title="Click to view assigned events"
                    >
                      <Calendar size={12} className="text-stone-500" />
                      <span>
                        {assignedCount} {assignedCount === 1 ? 'Event' : 'Events'}
                      </span>
                    </button>

                    {/* Edit / Delete Buttons */}
                    {!member.isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditStaff(member)}
                          className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title="Edit Staff Role & Permissions"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDeleteStaff(member)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Remove from Studio Team"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
