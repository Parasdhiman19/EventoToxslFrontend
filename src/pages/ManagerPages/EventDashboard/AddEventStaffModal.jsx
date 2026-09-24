import React from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Users,
  Search,
  Loader2,
  Check,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react'

export default function AddEventStaffModal({
  isOpen,
  onClose,
  eventTitle,
  assignModalTab,
  setAssignModalTab,
  addStaffError,
  setAddStaffError,
  isLoadingStudioStaff,
  studioStaffList,
  staffList,
  selectedStudioStaffIds,
  setSelectedStudioStaffIds,
  onBulkAssignStudioStaff,
  isSubmittingStaff,
  searchUserQuery,
  setSearchUserQuery,
  searchResults,
  setSearchResults,
  isSearchingUsers,
  selectedUser,
  setSelectedUser,
  newStaffRoleTitle,
  setNewStaffRoleTitle,
  newStaffPermissions,
  setNewStaffPermissions,
  saveToStudio,
  setSaveToStudio,
  onAddStaffSubmit,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-5 relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
        >
          <X size={18} />
        </button>

        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-serif text-lg font-medium text-stone-900">Assign Event Staff</h3>
          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
            Grant gate permissions and scan access for &quot;{eventTitle}&quot;
          </p>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setAssignModalTab('studio')
                setAddStaffError(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                assignModalTab === 'studio'
                  ? 'bg-stone-900 text-white font-medium shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              <Users size={13} />
              <span>Studio Team Roster ({studioStaffList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignModalTab('search')
                setAddStaffError(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                assignModalTab === 'search'
                  ? 'bg-stone-900 text-white font-medium shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              <Search size={13} />
              <span>Search Platform Users</span>
            </button>
          </div>
        </div>

        {addStaffError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 shrink-0">
            {addStaffError}
          </div>
        )}

        {/* TAB 1: FROM STUDIO TEAM ROSTER */}
        {assignModalTab === 'studio' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {isLoadingStudioStaff ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-mono text-xs">Loading saved studio team...</span>
              </div>
            ) : studioStaffList.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-stone-200 rounded-xl space-y-3">
                <Users size={24} className="mx-auto text-stone-400" />
                <div>
                  <p className="font-serif text-sm font-medium text-stone-800">No saved Studio Team members</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Save staff once in Organizer Settings &gt; Team &amp; Roles to quickly assign them to any event in one click.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Link
                    to="/manager/settings"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono transition cursor-pointer"
                  >
                    Manage Studio Directory
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAssignModalTab('search')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono transition cursor-pointer"
                  >
                    Search Platform User
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-100 pb-2">
                  <span>Select staff to assign to this event:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const unassignedUserIds = studioStaffList
                          .map(
                            (sm) =>
                              sm.userId ||
                              sm.user_id ||
                              (typeof sm.user === 'number' ? sm.user : sm.user?.id)
                          )
                          .filter(
                            (uid) =>
                              typeof uid === 'number' &&
                              Number.isInteger(uid) &&
                              !staffList.some((st) => (st.userId || st.user_id || st.user) === uid)
                          )
                        setSelectedStudioStaffIds(unassignedUserIds)
                      }}
                      className="text-stone-700 hover:text-stone-900 underline text-[11px] cursor-pointer"
                    >
                      Select All Unassigned
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStudioStaffIds([])}
                      className="text-stone-400 hover:text-stone-600 text-[11px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {studioStaffList.map((member) => {
                    const staffUid =
                      member.userId ||
                      member.user_id ||
                      (typeof member.user === 'number' ? member.user : member.user?.id)
                    const isAlreadyAssigned = staffList.some(
                      (st) =>
                        (st.userId || st.user_id || st.user) === staffUid || st.email === member.email
                    )
                    const isSelected = staffUid ? selectedStudioStaffIds.includes(staffUid) : false
                    const canView =
                      member.defaultCanViewAttendees ?? member.default_can_view_attendees
                    const canCheck = member.defaultCanCheckIn ?? member.default_can_check_in
                    const canEdit = member.defaultCanEditAttendees ?? member.default_can_edit_attendees
                    const rawName = member.fullName || member.full_name || member.name
                    const displayName =
                      rawName && rawName.trim() && rawName !== member.email
                        ? rawName.trim()
                        : member.username || (member.email ? member.email.split('@')[0] : 'Staff')

                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (isAlreadyAssigned || !staffUid) return
                          if (isSelected) {
                            setSelectedStudioStaffIds((prev) => prev.filter((id) => id !== staffUid))
                          } else {
                            setSelectedStudioStaffIds((prev) => [...prev, staffUid])
                          }
                        }}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isAlreadyAssigned
                            ? 'bg-stone-50/60 border-stone-200/60 opacity-65 cursor-not-allowed'
                            : isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-2xs cursor-pointer'
                            : 'bg-white border-stone-200 hover:border-stone-400 cursor-pointer text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            {isAlreadyAssigned ? (
                              <Check size={16} className="text-stone-400" />
                            ) : isSelected ? (
                              <CheckSquare size={16} className="text-white" />
                            ) : (
                              <Square size={16} className="text-stone-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs">{displayName}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected
                                    ? 'bg-stone-800 text-stone-200 border-stone-700'
                                    : 'bg-stone-100 text-stone-600 border-stone-200'
                                }`}
                              >
                                {member.roleTitle || member.role_title || 'Staff'}
                              </span>
                              {isAlreadyAssigned && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-600">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-[11px] font-mono ${
                                isSelected ? 'text-stone-300' : 'text-stone-400'
                              }`}
                            >
                              {member.email} {member.phone ? `• ${member.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* Permissions Pill Preview */}
                        <div className="hidden sm:flex items-center gap-1 shrink-0 text-[10px] font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              canView
                                ? isSelected
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'text-stone-400 line-through'
                            }`}
                          >
                            View
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              canCheck
                                ? isSelected
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'text-stone-400 line-through'
                            }`}
                          >
                            Check-in
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              canEdit
                                ? isSelected
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'text-stone-400 line-through'
                            }`}
                          >
                            Edit
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Bulk Action Footer */}
                <div className="pt-3 flex items-center justify-between border-t border-stone-100">
                  <span className="text-xs font-mono text-stone-500">
                    {selectedStudioStaffIds.length} member
                    {selectedStudioStaffIds.length === 1 ? '' : 's'} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingStaff || selectedStudioStaffIds.length === 0}
                      onClick={onBulkAssignStudioStaff}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isSubmittingStaff ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={14} />
                      )}
                      <span>Assign Selected ({selectedStudioStaffIds.length}) to Event</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: SEARCH PLATFORM USERS */}
        {assignModalTab === 'search' && (
          <form onSubmit={onAddStaffSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* User Search & Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                Search Registered Manager / Colleague (Email or Name)
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Type colleague email or full name..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                {isSearchingUsers && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />
                )}
              </div>

              {/* Search Results Dropdown List */}
              {searchResults.length > 0 && (
                <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 shadow-sm">
                  {searchResults.map((usr) => {
                    const isSelected = selectedUser?.id === usr.id
                    const usrRawName = usr.fullName || usr.full_name || usr.name
                    const usrDisplayName =
                      usrRawName && usrRawName.trim() && usrRawName !== usr.email
                        ? usrRawName.trim()
                        : usr.username || (usr.email ? usr.email.split('@')[0] : 'User')

                    return (
                      <button
                        key={usr.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(usr)
                          setSearchUserQuery(usr.email)
                          setSearchResults([])
                        }}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <p className="text-stone-900 font-medium">{usrDisplayName}</p>
                          <p className="text-[11px] font-mono text-stone-400">{usr.email}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                          Select
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Selected User Pill */}
              {selectedUser && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs mt-2">
                  <div>
                    {(() => {
                      const selRawName = selectedUser.fullName || selectedUser.full_name || selectedUser.name
                      const selDisplayName =
                        selRawName && selRawName.trim() && selRawName !== selectedUser.email
                          ? selRawName.trim()
                          : selectedUser.username ||
                            (selectedUser.email ? selectedUser.email.split('@')[0] : 'User')
                      return <span className="font-semibold text-emerald-900">{selDisplayName}</span>
                    })()}
                    <span className="block text-[11px] font-mono text-emerald-700">{selectedUser.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-emerald-700 hover:text-emerald-950 font-mono text-[11px] underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Role Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                Role Title for this Event
              </label>
              <input
                type="text"
                placeholder="e.g. Gate Lead, Scanner Lead, VIP Host"
                value={newStaffRoleTitle}
                onChange={(e) => setNewStaffRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Gate Lead', 'Ticketing Host', 'VIP Concierge', 'Scanner Lead', 'Security & Access'].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewStaffRoleTitle(preset)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-mono text-stone-600 transition cursor-pointer"
                    >
                      +{preset}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Granular Permission Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <p className="text-xs font-mono uppercase tracking-wider text-stone-500 font-medium">
                Event Permissions
              </p>

              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStaffPermissions.canViewAttendees}
                  onChange={(e) =>
                    setNewStaffPermissions({
                      ...newStaffPermissions,
                      canViewAttendees: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">
                    View Attendee Guest List
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Allows viewing registered guests and ticket tiers.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStaffPermissions.canCheckIn}
                  onChange={(e) =>
                    setNewStaffPermissions({
                      ...newStaffPermissions,
                      canCheckIn: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">
                    Gate Check-In &amp; Scanner Access
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Allows barcode scanning and toggling admission at the door.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStaffPermissions.canEditAttendees}
                  onChange={(e) =>
                    setNewStaffPermissions({
                      ...newStaffPermissions,
                      canEditAttendees: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">
                    Edit Attendee Information
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Allows updating guest gate/seat assignments or details.
                  </span>
                </div>
              </label>
            </div>

            {/* Save to Studio Team Directory Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100/70 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToStudio}
                  onChange={(e) => setSaveToStudio(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="text-xs text-stone-700 font-medium">
                  Also save this staff member to my Studio Team Directory for future events
                </span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingStaff || !selectedUser}
                className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                {isSubmittingStaff ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>Confirm Assignment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
