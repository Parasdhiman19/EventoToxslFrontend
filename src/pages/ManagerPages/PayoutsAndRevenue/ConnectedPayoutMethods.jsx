import React from 'react'
import { Plus, Loader2, Trash2, Copy, Check } from 'lucide-react'
import { PayPalIcon } from './PayoutGraphics'

export default function ConnectedPayoutMethods({
  payoutMethods,
  isLoading,
  actionLoadingId,
  copiedEmail,
  onCopyEmail,
  onOpenAddMethod,
  onSetPrimaryMethod,
  onDeleteMethod,
}) {
  return (
    <section className="lg:col-span-6 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <h2 className="font-serif text-base font-medium text-stone-900 flex items-center gap-2">
            <span>Connected PayPal Wallets</span>
            <span className="text-[11px] font-mono font-normal text-stone-400">({payoutMethods.length})</span>
          </h2>
          <p className="text-xs text-stone-500">Destination accounts for automated instant revenue payouts</p>
        </div>

        <button
          type="button"
          onClick={onOpenAddMethod}
          className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-mono font-medium hover:bg-stone-100 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus size={13} />
          <span>Link PayPal</span>
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-stone-400">
            <Loader2 size={20} className="animate-spin mx-auto text-stone-400 mb-1" />
            <p className="font-mono text-xs">Loading PayPal accounts...</p>
          </div>
        ) : payoutMethods.length > 0 ? (
          payoutMethods.map((acc) => {
            const isPrimary = acc.isPrimary || acc.is_primary || acc.status === 'Primary'
            const email = acc.paypalEmail || acc.paypal_email

            return (
              <div
                key={acc.id}
                className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isPrimary
                    ? 'border-[#0070BA]/40 bg-gradient-to-r from-blue-50/40 via-white to-transparent shadow-xs ring-1 ring-[#0070BA]/10'
                    : 'border-stone-200/70 bg-stone-50/40 hover:bg-stone-50/80'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <PayPalIcon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900 truncate">
                        PayPal Wallet
                      </span>
                      {isPrimary && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#003087] text-white font-medium shrink-0 shadow-2xs">
                          Default Destination
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-medium text-stone-800 truncate">
                        {email}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopyEmail(email)}
                        className="p-1 text-stone-400 hover:text-stone-700 transition rounded-md hover:bg-stone-100 cursor-pointer"
                        title="Copy email"
                      >
                        {copiedEmail === email ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active • Instant Payouts Ready</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimaryMethod(acc.id)}
                      disabled={actionLoadingId === acc.id}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-mono text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteMethod(acc.id)}
                    disabled={actionLoadingId === acc.id}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Remove PayPal account"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center space-y-3 border border-dashed border-stone-200 rounded-2xl bg-stone-50/40">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto shadow-2xs">
              <PayPalIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-stone-900 font-serif font-medium">No PayPal Account Linked</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Link your personal or business PayPal email to receive automatic and on-demand disbursements.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddMethod}
              className="mt-1 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-black transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span>Connect PayPal Account</span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
