import React from 'react'
import { Sparkles, CheckCircle2, X } from 'lucide-react'

export default function BecomeOrganizerModal({
  isOpen,
  onClose,
  orgSuccess,
  orgError,
  orgForm,
  setOrgForm,
  isSubmittingOrg,
  onSubmit,
  onNavigateCreate,
  onNavigateOverview,
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {orgSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-stone-900">
                Welcome to Evento Studio!
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Your account has been upgraded with full organizer capabilities. You can now host events, publish ticket tiers, check in attendees, and request direct payouts.
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={onNavigateCreate}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-sm cursor-pointer"
              >
                + Host Your First Event
              </button>
              <button
                type="button"
                onClick={onNavigateOverview}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-mono font-medium hover:bg-stone-50 transition cursor-pointer"
              >
                Go to Manager Studio &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">Become an Organizer</h3>
                  <p className="text-[11px] text-stone-500">Enable host &amp; ticketing features on your existing account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
              {orgError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {orgError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Organization / Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Music Collective, City Tech Summits"
                  value={orgForm.organizationName}
                  onChange={(e) => setOrgForm({ ...orgForm, organizationName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                    Public Support Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@brand.io"
                    value={orgForm.supportEmail}
                    onChange={(e) => setOrgForm({ ...orgForm, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                    Organizer Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={orgForm.supportPhone}
                    onChange={(e) => setOrgForm({ ...orgForm, supportPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Studio Bio / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what kinds of experiences, concerts, or workshops you host..."
                  value={orgForm.bio}
                  onChange={(e) => setOrgForm({ ...orgForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  You keep all existing tickets and orders. You can switch freely between Attendee View and Host Studio anytime using this same account.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrg}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                >
                  {isSubmittingOrg ? 'Activating Studio...' : 'Activate Studio \u2192'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
