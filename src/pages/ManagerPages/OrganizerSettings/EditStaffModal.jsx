import React from 'react'
import { X, RefreshCw, Check } from 'lucide-react'

export default function EditStaffModal({
  editingStaffMember,
  onClose,
  editRoleTitle,
  setEditRoleTitle,
  editPermissions,
  setEditPermissions,
  editPhone,
  setEditPhone,
  editNotes,
  setEditNotes,
  onSubmit,
  isSaving,
  editStaffError,
}) {
  if (!editingStaffMember) return null

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
          <h3 className="font-serif text-lg font-medium text-stone-900">Edit Staff Member</h3>
          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
            Updating credentials for {editingStaffMember.name} ({editingStaffMember.email})
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {editStaffError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {editStaffError}
            </div>
          )}

          {/* Role Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
              Role & Designation
            </label>
            <input
              type="text"
              required
              value={editRoleTitle}
              onChange={(e) => setEditRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Permissions */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="block text-xs font-mono uppercase text-stone-700 font-medium">
              Default Permissions
            </span>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editPermissions.canCheck}
                  onChange={(e) => setEditPermissions((p) => ({ ...p, canCheck: e.target.checked }))}
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <span className="font-medium">Scan & Check-In Tickets at Gate</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editPermissions.canView}
                  onChange={(e) => setEditPermissions((p) => ({ ...p, canView: e.target.checked }))}
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <span className="font-medium">View Guest List & Attendees</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editPermissions.canEdit}
                  onChange={(e) => setEditPermissions((p) => ({ ...p, canEdit: e.target.checked }))}
                  className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <span className="font-medium">Edit Attendee Notes & Records</span>
              </label>
            </div>
          </div>

          {/* Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
            <div>
              <label className="block text-[11px] font-mono text-stone-600 mb-1">Direct Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-600 mb-1">Internal Note</label>
              <input
                type="text"
                placeholder="Notes..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
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
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
