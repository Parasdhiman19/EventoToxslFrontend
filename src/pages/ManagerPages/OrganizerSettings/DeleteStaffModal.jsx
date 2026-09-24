import React from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteStaffModal({
  deletingStaffMember,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!deletingStaffMember) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 shadow-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-stone-900">Remove Staff Member?</h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{deletingStaffMember.name}</p>
          </div>
        </div>

        <p className="text-xs text-stone-600">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-stone-900">{deletingStaffMember.name}</span> from your studio team roster?
          Past event logs will remain preserved.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-mono font-medium hover:bg-red-700 disabled:opacity-50 transition shadow-2xs cursor-pointer"
          >
            {isDeleting ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  )
}
