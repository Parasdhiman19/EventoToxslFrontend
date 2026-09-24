import React from 'react'
import { X, Search, RefreshCw, UserCheck, AlertCircle, Plus } from 'lucide-react'

export default function AddStaffModal({
  isOpen,
  onClose,
  searchStaffQuery,
  setSearchStaffQuery,
  staffSearchResults,
  setStaffSearchResults,
  isSearchingStaff,
  selectedStaffUser,
  setSelectedStaffUser,
  newStaffRolePreset,
  setNewStaffRolePreset,
  newStaffCustomRole,
  setNewStaffCustomRole,
  newStaffPermissions,
  setNewStaffPermissions,
  newStaffPhone,
  setNewStaffPhone,
  newStaffNotes,
  setNewStaffNotes,
  onSubmit,
  isSubmitting,
  staffModalError,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
        >
          <X size={18} />
        </button>

        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-serif text-lg font-medium text-stone-900">Add Staff to Studio Team</h3>
          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
            Search registered managers or colleagues to add to your organization directory.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {staffModalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{staffModalError}</span>
            </div>
          )}

          {/* Search Platform User */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
              Search User (Email or Name)
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Type registered manager email or full name..."
                value={searchStaffQuery}
                onChange={(e) => setSearchStaffQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              {isSearchingStaff && (
                <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {staffSearchResults.length > 0 && (
              <div className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 shadow-lg">
                {staffSearchResults.map((usr) => {
                  const isSelected = selectedStaffUser?.id === usr.id
                  return (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaffUser(usr)
                        setSearchStaffQuery(usr.email)
                        setStaffSearchResults([])
                      }}
                      className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <p className="text-stone-900 font-medium">{usr.fullName || usr.full_name || 'User'}</p>
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
          </div>

          {/* Selected User Badge */}
          {selectedStaffUser && (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-mono text-xs font-semibold flex items-center justify-center">
                  <UserCheck size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900">
                    {selectedStaffUser.fullName || selectedStaffUser.full_name || 'User'}
                  </p>
                  <p className="text-[11px] font-mono text-stone-500">{selectedStaffUser.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                Selected
              </span>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
              Studio Role & Designation
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Gate Lead & Scanner',
                'Ticket Scanner',
                'Stage Coordinator',
                'Box Office Ops',
                'VIP Host',
                'Security Lead',
                'Custom',
              ].map((preset) => {
                const isSelected = newStaffRolePreset === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewStaffRolePreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {preset}
                  </button>
                )
              })}
            </div>

            {newStaffRolePreset === 'Custom' && (
              <input
                type="text"
                placeholder="Enter custom role designation..."
                value={newStaffCustomRole}
                onChange={(e) => setNewStaffCustomRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 mt-2"
              />
            )}
          </div>

          {/* Default Permissions */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="block text-xs font-mono uppercase text-stone-700 font-medium">
              Default Gate & Event Permissions
            </span>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newStaffPermissions.canCheck}
                  onChange={(e) =>
                    setNewStaffPermissions((prev) => ({ ...prev, canCheck: e.target.checked }))
                  }
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <div>
                  <span className="font-medium">Scan & Check-In Tickets</span>
                  <p className="text-[11px] text-stone-400 font-mono">
                    Allows scanning digital QR tickets and check-in at venue gates.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newStaffPermissions.canView}
                  onChange={(e) =>
                    setNewStaffPermissions((prev) => ({ ...prev, canView: e.target.checked }))
                  }
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <div>
                  <span className="font-medium">View Guest List & Attendees</span>
                  <p className="text-[11px] text-stone-400 font-mono">
                    Allows viewing attendee name rosters and ticket tier details.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newStaffPermissions.canEdit}
                  onChange={(e) =>
                    setNewStaffPermissions((prev) => ({ ...prev, canEdit: e.target.checked }))
                  }
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <div>
                  <span className="font-medium">Edit Attendee Notes & Information</span>
                  <p className="text-[11px] text-stone-400 font-mono">
                    Allows adding check-in notes or modifying attendee records.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
            <div>
              <label className="block text-[11px] font-mono text-stone-600 mb-1">Direct Phone (Optional)</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-600 mb-1">Internal Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. VIP line coordinator"
                value={newStaffNotes}
                onChange={(e) => setNewStaffNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStaffUser}
              className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>Add to Studio Roster</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
