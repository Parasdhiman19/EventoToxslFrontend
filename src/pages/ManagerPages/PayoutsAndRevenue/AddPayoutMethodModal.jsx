import React from 'react'
import { X, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { PayPalIcon } from './PayoutGraphics'

export default function AddPayoutMethodModal({
  isOpen,
  onClose,
  currentUser,
  paypalForm,
  setPaypalForm,
  methodModalError,
  onSubmit,
  isSubmitting,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center">
              <PayPalIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-stone-900 leading-none">
                Connect PayPal Account
              </h3>
              <p className="text-[11px] text-stone-500 mt-1">
                Direct automated settlement for ticket proceeds
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Security Pill Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0070BA]/5 border border-[#0070BA]/20 text-[11px] text-stone-700">
            <ShieldCheck size={16} className="text-[#0070BA] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-stone-900 block">Security Guarantee</span>
              <span className="text-stone-600 leading-relaxed block">
                We only require your registered PayPal email address to disburse funds. Evento will never ask for your password or API keys.
              </span>
            </div>
          </div>

          {methodModalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{methodModalError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-800">
                  PayPal Account Email <span className="text-red-500">*</span>
                </label>
                {currentUser?.email && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaypalForm({
                        ...paypalForm,
                        email: currentUser.email,
                        confirmEmail: currentUser.email,
                      })
                    }}
                    className="text-[11px] font-mono text-[#0070BA] hover:underline cursor-pointer"
                  >
                    Use login email ({currentUser.email.split('@')[0]}...)
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. host.organizer@paypal.com"
                  value={paypalForm.email}
                  onChange={(e) => setPaypalForm({ ...paypalForm, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 focus:border-[#0070BA] transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Confirm PayPal Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="Re-enter your PayPal email address"
                  value={paypalForm.confirmEmail}
                  onChange={(e) => setPaypalForm({ ...paypalForm, confirmEmail: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 focus:border-[#0070BA] transition font-mono"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={paypalForm.isPrimary}
                  onChange={(e) => setPaypalForm({ ...paypalForm, isPrimary: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900 focus:ring-0"
                />
                <span>Designate as primary default payout destination</span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-mono font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <PayPalIcon className="w-3.5 h-3.5" />
                    <span>Connect PayPal Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
