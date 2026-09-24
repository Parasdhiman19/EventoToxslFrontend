import React from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

export default function ViewAssignedEventsModal({
  viewingAssignedMember,
  onClose,
}) {
  if (!viewingAssignedMember) return null

  const assignedEvents = viewingAssignedMember.assignedEvents || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 shadow-2xl border border-stone-200 p-6 space-y-4 relative max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
        >
          <X size={18} />
        </button>

        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-serif text-base font-semibold text-stone-900">
            Assigned Events ({viewingAssignedMember.name})
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Events currently staffed by {viewingAssignedMember.email}
          </p>
        </div>

        <div className="space-y-2">
          {assignedEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400 font-mono">
              Not assigned to any individual events yet.
            </div>
          ) : (
            assignedEvents.map((ev) => (
              <div
                key={ev.eventId || ev.id}
                className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/60 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-900">{ev.eventTitle || ev.title}</p>
                  <p className="text-[11px] font-mono text-stone-500">Role: {ev.roleTitle || 'Staff'}</p>
                </div>
                <Link
                  to={`/manager/events/${ev.eventId || ev.id}`}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-50 text-[10px] font-mono hover:bg-stone-800 transition shrink-0"
                >
                  View Dashboard
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-mono hover:bg-stone-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
