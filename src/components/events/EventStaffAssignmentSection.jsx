import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Loader2 } from 'lucide-react'

export default function EventStaffAssignmentSection({
  studioStaffList,
  selectedStaffIds,
  setSelectedStaffIds,
  isLoadingStaff,
}) {
  return (
    <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <h2 className="font-serif text-base text-stone-900 flex items-center gap-2">
            <Users size={16} className="text-stone-700" />
            <span>Operational Event Staff &amp; Crew</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select crew members from your saved Studio Team directory to grant door check-in &amp; scanner access for this event.
          </p>
        </div>
        <Link
          to="/manager/settings"
          target="_blank"
          className="text-stone-900 font-mono text-[11px] underline shrink-0 hover:text-stone-700 cursor-pointer self-start sm:self-auto"
        >
          Manage Studio Team &rarr;
        </Link>
      </div>

      {isLoadingStaff ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 text-stone-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-mono text-xs">Loading studio staff roster...</span>
        </div>
      ) : studioStaffList.length === 0 ? (
        <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-stone-800">No saved Studio Team members found</p>
            <p className="text-stone-500 text-[11px] mt-0.5">
              You can save reusable crew members in Organizer Settings &gt; Team &amp; Roles, or assign staff to this event anytime after creation.
            </p>
          </div>
          <Link
            to="/manager/settings"
            target="_blank"
            className="text-stone-900 font-mono text-[11px] underline shrink-0 hover:text-stone-700 cursor-pointer"
          >
            Open Settings &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {studioStaffList.map((member) => {
            const staffUid =
              member.userId ||
              member.user_id ||
              (typeof member.user === 'number' ? member.user : member.user?.id)
            const isSelected = staffUid ? selectedStaffIds.includes(staffUid) : false
            const canView = member.defaultCanViewAttendees ?? member.default_can_view_attendees
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
                  if (!staffUid) return
                  if (isSelected) {
                    setSelectedStaffIds((prev) => prev.filter((id) => id !== staffUid))
                  } else {
                    setSelectedStaffIds((prev) => [...prev, staffUid])
                  }
                }}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent onClick
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{displayName}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          isSelected
                            ? 'bg-stone-800 text-stone-200 border-stone-700'
                            : 'bg-white text-stone-600 border-stone-200'
                        }`}
                      >
                        {member.roleTitle || member.role_title || 'Staff'}
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {member.email}
                    </div>
                  </div>
                </div>

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
      )}
    </div>
  )
}
