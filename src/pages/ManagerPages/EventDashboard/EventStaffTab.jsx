import React from 'react'
import { UserPlus, Users, Trash2, Check, X } from 'lucide-react'

export default function EventStaffTab({
  staffList,
  isLoadingStaff,
  staffActionLoadingId,
  onOpenAddStaffModal,
  onTogglePermission,
  onRemoveStaff,
}) {
  return (
    <section className="bg-white border border-stone-200/80 rounded-lg overflow-hidden shadow-2xs space-y-4">
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg text-stone-900">Assigned Operational Staff</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Assign crew members from your saved Studio Team or platform directory to scan tickets and manage admission for this event.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddStaffModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs cursor-pointer shrink-0"
        >
          <UserPlus size={14} />
          <span>+ Assign Staff Member</span>
        </button>
      </div>

      {isLoadingStaff && staffList.length === 0 ? (
        <div className="p-8 space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-14 w-full bg-stone-100 rounded-md animate-pulse" />
          ))}
        </div>
      ) : staffList.length > 0 ? (
        <>
          {/* Desktop Staff Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-stone-700">
              <thead>
                <tr className="bg-stone-50/80 font-mono text-[10px] uppercase text-stone-500 tracking-wider border-b border-stone-200/80">
                  <th className="py-3 px-5 font-medium">Staff Member &amp; Role</th>
                  <th className="py-3 px-5 font-medium text-center">View Guests</th>
                  <th className="py-3 px-5 font-medium text-center">Gate Check-In</th>
                  <th className="py-3 px-5 font-medium text-center">Edit Info</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {staffList.map((st) => {
                  const isActionLoading = staffActionLoadingId === st.id
                  const canView = st.canViewAttendees ?? st.can_view_attendees
                  const canCheck = st.canCheckIn ?? st.can_check_in
                  const canEdit = st.canEditAttendees ?? st.can_edit_attendees
                  const roleTitle = st.roleTitle || st.role_title || 'Stage Staff'
                  const rawName = st.fullName || st.full_name || st.name
                  const displayName =
                    rawName && rawName.trim() && rawName !== st.email
                      ? rawName.trim()
                      : st.username || (st.email ? st.email.split('@')[0] : 'Staff')

                  return (
                    <tr key={st.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900">{displayName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/80">
                            {roleTitle}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-stone-400">{st.email}</div>
                      </td>

                      {/* Permission Toggle: View Attendees */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => onTogglePermission(st.id, 'canViewAttendees', canView)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                            canView
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200/80'
                          }`}
                        >
                          {canView ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                          <span>{canView ? 'Allowed' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Permission Toggle: Gate Check-in */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => onTogglePermission(st.id, 'canCheckIn', canCheck)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                            canCheck
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200/80'
                          }`}
                        >
                          {canCheck ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                          <span>{canCheck ? 'Allowed' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Permission Toggle: Edit Attendees */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => onTogglePermission(st.id, 'canEditAttendees', canEdit)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                            canEdit
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200/80'
                          }`}
                        >
                          {canEdit ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                          <span>{canEdit ? 'Allowed' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Remove Button */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => onRemoveStaff(st.id, displayName || st.email)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Remove Staff Member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Staff Cards */}
          <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
            {staffList.map((st, idx) => {
              const isActionLoading = staffActionLoadingId === st.id
              const canView = st.canViewAttendees ?? st.can_view_attendees
              const canCheck = st.canCheckIn ?? st.can_check_in
              const canEdit = st.canEditAttendees ?? st.can_edit_attendees
              const roleTitle = st.roleTitle || st.role_title || 'Stage Staff'
              const rawName = st.fullName || st.full_name || st.name
              const displayName =
                rawName && rawName.trim() && rawName !== st.email
                  ? rawName.trim()
                  : st.username || (st.email ? st.email.split('@')[0] : 'Staff')

              return (
                <div key={st.id} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-semibold text-stone-900">{displayName}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/80">
                          {roleTitle}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-stone-400">{st.email}</p>
                    </div>
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onRemoveStaff(st.id, displayName || st.email)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-center">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-stone-400 block mb-1">Guest List</span>
                      <button
                        type="button"
                        onClick={() => onTogglePermission(st.id, 'canViewAttendees', canView)}
                        className={`w-full py-1 text-[10px] font-mono rounded border ${
                          canView
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white text-stone-400 border-stone-200'
                        }`}
                      >
                        {canView ? 'Yes' : 'No'}
                      </button>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-stone-400 block mb-1">Check-in</span>
                      <button
                        type="button"
                        onClick={() => onTogglePermission(st.id, 'canCheckIn', canCheck)}
                        className={`w-full py-1 text-[10px] font-mono rounded border ${
                          canCheck
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white text-stone-400 border-stone-200'
                        }`}
                      >
                        {canCheck ? 'Yes' : 'No'}
                      </button>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-stone-400 block mb-1">Edit Info</span>
                      <button
                        type="button"
                        onClick={() => onTogglePermission(st.id, 'canEditAttendees', canEdit)}
                        className={`w-full py-1 text-[10px] font-mono rounded border ${
                          canEdit
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white text-stone-400 border-stone-200'
                        }`}
                      >
                        {canEdit ? 'Yes' : 'No'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="py-12 px-4 text-center text-stone-400 space-y-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Users size={18} />
          </div>
          <div>
            <p className="font-serif text-sm text-stone-700 font-medium">No event staff assigned yet</p>
            <p className="text-xs text-stone-400 mt-0.5 max-w-sm mx-auto">
              Assign saved Studio Team members or platform users as event crew so they can scan attendee passes and manage admission.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddStaffModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition cursor-pointer"
          >
            <UserPlus size={13} /> Assign Staff Member
          </button>
        </div>
      )}
    </section>
  )
}
