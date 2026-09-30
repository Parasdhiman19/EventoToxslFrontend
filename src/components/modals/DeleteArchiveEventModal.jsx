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
  const [deleteMode, setDeleteMode] = useState('archive') // 'archive' | 'cancel' | 'permanent'
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  if (!isOpen || !event) return null

  const hasSales = (event.ticketsSold || 0) > 0 || (event.tickets_sold || 0) > 0

  const handleDeleteSubmit = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const isPermanent = deleteMode === 'permanent'
      const res = await API.delete(`events/manager/${event.id}/?action=${deleteMode}&permanent=${isPermanent}`)
      if (onSuccess) {
        onSuccess({
          eventId: event.id,
          action: deleteMode,
          isPermanent,
          deleted: isPermanent || res.data?.deleted,
          status: isPermanent ? null : (res.data?.status || deleteMode),
          data: res.data,
        })
      }
      onClose()
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to process event request. Please check details and try again.'
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
                Manage Event Lifecycle
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Choose how you want to archive, cancel, or remove this stage.
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
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                Selected Stage
              </span>
              <p className="font-medium text-xs sm:text-sm text-stone-900 mt-0.5">
                {event.title}
              </p>
            </div>
            {hasSales && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold shrink-0">
                {event.ticketsSold || 0} Tickets Sold
              </span>
            )}
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
                  Concludes the event, stops new sales, and moves funds to Cleared status for withdrawal. Preserves all attendee check-in and transaction histories.
                </p>
              </div>
            </div>

            {/* Option 2: Cancel Event */}
            <div
              onClick={() => setDeleteMode('cancel')}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                deleteMode === 'cancel'
                  ? 'border-amber-700 bg-amber-50/40 ring-1 ring-amber-700'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteMode === 'cancel'}
                  onChange={() => setDeleteMode('cancel')}
                  className="text-amber-700 focus:ring-amber-700 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-900">
                    Cancel Event
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Event Cancellation
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Marks the stage as cancelled and stops all sales. Ticket revenue is held in refund reserve and excluded from withdrawable balances.
                </p>
              </div>
            </div>

            {/* Option 3: Permanent Delete */}
            <div
              onClick={() => {
                if (!hasSales) setDeleteMode('permanent')
              }}
              className={`p-3.5 rounded-xl border transition flex items-start gap-3 ${
                hasSales
                  ? 'opacity-50 cursor-not-allowed bg-stone-50 border-stone-200'
                  : deleteMode === 'permanent'
                  ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600 cursor-pointer'
                  : 'border-stone-200 hover:border-stone-300 bg-white cursor-pointer'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="deleteMode"
                  disabled={hasSales}
                  checked={deleteMode === 'permanent'}
                  onChange={() => {
                    if (!hasSales) setDeleteMode('permanent')
                  }}
                  className="text-red-600 focus:ring-red-600 cursor-pointer disabled:opacity-40"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-700">
                    Permanently Delete
                  </span>
                  {hasSales ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 border border-stone-300">
                      Blocked (Sales Exist)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">
                      Destructive
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {hasSales
                    ? 'Events with confirmed ticket sales cannot be permanently deleted to preserve financial and attendee records.'
                    : 'Permanently erases the stage and tier configuration. Only available for empty drafts with zero ticket sales.'}
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
            Close
          </button>
          <button
            type="button"
            onClick={handleDeleteSubmit}
            disabled={isDeleting}
            className={`px-4 py-2 text-xs font-mono font-medium text-white transition rounded-xl shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              deleteMode === 'permanent'
                ? 'bg-red-600 hover:bg-red-700'
                : deleteMode === 'cancel'
                ? 'bg-amber-700 hover:bg-amber-800'
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
            ) : deleteMode === 'cancel' ? (
              <>
                <AlertTriangle size={13} />
                <span>Confirm Cancellation</span>
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
