import React from 'react'
import { X, DollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { PayPalIcon } from './PayoutGraphics'

export default function RequestPayoutModal({
  isOpen,
  onClose,
  payoutModalSuccess,
  payoutModalError,
  payoutMethods,
  availableBalanceNumeric,
  selectedMethodId,
  setSelectedMethodId,
  withdrawAmount,
  setWithdrawAmount,
  onSetPercentage,
  onSubmit,
  isRequestingPayout,
  onOpenAddMethod,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-50 flex items-center justify-center shadow-xs">
              <DollarSign size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-stone-900 leading-none">
                Withdraw Revenue
              </h3>
              <p className="text-[11px] text-stone-500 mt-1">Direct transfer to your linked PayPal wallet</p>
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

        <div className="p-6 space-y-4">
          {payoutModalSuccess ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 size={30} />
              </div>
              <h4 className="font-serif text-2xl font-medium text-stone-900">Disbursement Complete</h4>
              <p className="text-xs text-stone-600 leading-relaxed font-sans max-w-sm mx-auto">
                {payoutModalSuccess}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-semibold hover:bg-black transition cursor-pointer shadow-sm"
              >
                Done &rarr;
              </button>
            </div>
          ) : payoutMethods.length === 0 ? (
            <div className="text-center space-y-3 py-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0070BA]/10 flex items-center justify-center mx-auto shadow-2xs border border-[#0070BA]/20">
                <PayPalIcon className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-xl font-medium text-stone-900">PayPal Account Required</h4>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                Please connect your PayPal email address to receive instant stage disbursements.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenAddMethod()
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-mono font-bold transition cursor-pointer inline-flex items-center justify-center gap-2 shadow-md"
              >
                <PayPalIcon className="w-4 h-4" />
                <span>Connect PayPal Account &rarr;</span>
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {payoutModalError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{payoutModalError}</span>
                </div>
              )}

              {/* Available Balance Summary */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-stone-50 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  Available for Withdrawal
                </span>
                <div className="font-serif text-3xl font-semibold text-white">
                  ${availableBalanceNumeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-stone-300 font-mono">
                  Cleared ticket funds • $10.00 minimum
                </p>
              </div>

              {/* Destination PayPal Account Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  Destination PayPal Wallet <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMethodId || ''}
                  onChange={(e) => setSelectedMethodId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 font-mono"
                >
                  {payoutMethods.map((m) => (
                    <option key={m.id} value={m.id}>
                      PayPal ({m.paypalEmail || m.paypal_email}) {m.isPrimary ? '• Default' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Withdrawal Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  Withdrawal Amount ($ USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-stone-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="10.00"
                    max={availableBalanceNumeric}
                    required
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition"
                  />
                </div>

                {/* Quick Percentage Selectors */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: '25%', val: 0.25 },
                    { label: '50%', val: 0.5 },
                    { label: '75%', val: 0.75 },
                    { label: 'Max (100%)', val: 1.0 },
                  ].map((pct) => (
                    <button
                      key={pct.label}
                      type="button"
                      onClick={() => onSetPercentage(pct.val)}
                      className="py-1.5 px-2 rounded-lg bg-stone-100 text-[11px] font-mono font-medium text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition cursor-pointer"
                    >
                      {pct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown Card */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1.5 text-[11px] font-mono text-stone-600">
                <div className="flex items-center justify-between">
                  <span>Platform Transfer Fee:</span>
                  <span className="text-emerald-700 font-semibold">$0.00 (Platform Covered)</span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200/40 pt-1.5 font-semibold text-stone-900">
                  <span>Net Disbursed:</span>
                  <span>${(parseFloat(withdrawAmount) || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRequestingPayout || availableBalanceNumeric <= 0}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-bold hover:bg-black disabled:opacity-50 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  {isRequestingPayout ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Disbursing...</span>
                    </>
                  ) : (
                    <span>Confirm Transfer &rarr;</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
