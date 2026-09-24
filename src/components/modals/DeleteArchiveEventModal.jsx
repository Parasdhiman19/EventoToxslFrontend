import React, { useState } from 'react'
import { Trash2, Archive, AlertTriangle, AlertCircle, X, Loader2 } from 'lucide-react'
import API from '../../services/api'

/**
 * Reusable modal for archiving or permanently deleting an event stage.
 * Handles API call, safety warnings, and loading/error states.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Object} props.event - The event object ({ id, title })
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSuccess - Callback after successful archive/deletion
 */
export default function DeleteArchiveEventModal({
  isOpen,
  event,
  onClose,
  onSuccess,
}) {
  const [deleteMode, setDeleteMode] = useState('archive') // 'archive' | 'permanent'
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  if (!isOpen || !event) return null

  const handleDeleteSubmit = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const isPermanent = deleteMode === 'permanent'
      const res = await API.delete(`events/manager/${event.id}/?permanent=${isPermanent}`)
      if (onSuccess) {
        onSuccess({
          eventId: event.id,
          isPermanent,
          deleted: isPermanent || res.data?.deleted,
          status: isPermanent ? null : 'past',
          data: res.data,
        })
      }
      onClose()
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete event. Please check details and try again.'
      setDeleteError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 divide-y divide-stone-100 relative">
        {/* Header */}
        <div className="p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Manage Event Status
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Choose whether to safely archive or permanently delete this stage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Target Event Info */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
              Selected Stage
            </span>
            <p className="font-medium text-xs sm:text-sm text-stone-900 mt-0.5">
              {event.title}
            </p>
          </div>

          {/* Error Notice */}
          {deleteError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle size={14} className="shrink-0 text-red-600 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2.5">
            {/* Option 1: Safe Archive */}
            <div
              onClick={() => setDeleteMode('archive')}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                deleteMode === 'archive'
                  ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'archive'}
                  onChange={() => setDeleteMode('archive')}
                  className="text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-900">
                    Archive &amp; End Stage
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Safe (Recommended)
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Ends ticket sales immediately and sets status to Ended. Preserves all attendee check-in records, past bookings, and financial transaction histories.
                </p>
              </div>
            </div>

            {/* Option 2: Permanent Delete */}
            <div
              onClick={() => setDeleteMode('permanent')}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                deleteMode === 'permanent'
                  ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'permanent'}
                  onChange={() => setDeleteMode('permanent')}
                  className="text-red-600 focus:ring-red-600 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-700">
                    Permanently Erase Stage
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">
                    Destructive
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Permanently erases the stage, tier quotas, and assigned gate roster from the database. This action cannot be undone and is blocked if sales exist.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-mono text-stone-600 hover:text-stone-900 transition rounded-xl border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteSubmit}
            disabled={isDeleting}
            className={`px-4 py-2 text-xs font-mono font-medium text-white transition rounded-xl shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              deleteMode === 'permanent'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-stone-900 hover:bg-stone-800'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : deleteMode === 'permanent' ? (
              <>
                <Trash2 size={13} />
                <span>Permanently Delete</span>
              </>
            ) : (
              <>
                <Archive size={13} />
                <span>Archive Stage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
