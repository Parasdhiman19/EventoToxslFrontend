import React from 'react'
import {
  BadgeCheck,
  Clock,
  ShieldCheck,
  Zap,
  Lock,
  Copy,
  Check,
  ArrowRight,
  DollarSign,
} from 'lucide-react'
import { PayPalIcon, ChipGraphic } from './PayoutGraphics'

export default function PayPalSettlementHub({
  payoutMethods,
  primaryAccount,
  availableBalanceNumeric,
  copiedEmail,
  onCopyEmail,
  onOpenAddMethod,
  onOpenWithdraw,
}) {
  const primaryEmail = primaryAccount?.paypalEmail || primaryAccount?.paypal_email

  return (
    <div className="rounded-3xl border border-stone-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden relative">
      {/* Brand Accent Bar */}

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Settlement Architecture & Flow */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Verified Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070BA]/8 border border-[#0070BA]/20 text-[#003087] text-[11px] font-mono font-medium">
              <BadgeCheck size={14} className="text-[#0070BA]" />
              <span>PayPal Commerce Partner Integration</span>
            </div>

            {payoutMethods.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Settlement Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-mono font-semibold">
                <Clock size={11} className="text-amber-600" />
                Action Required
              </span>
            )}
          </div>

          {/* Heading & Rationale */}
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 leading-tight">
              {payoutMethods.length > 0
                ? 'Direct Revenue Settlement to Your PayPal Wallet'
                : 'Connect Your PayPal Account for Instant Disbursements'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
              Evento processes ticket earnings with zero intermediary hold-ups. Cleared ticket revenue transfers
              directly into your personal or business PayPal wallet on-demand with no wire transfer fees.
            </p>
          </div>

          {/* 3-Step Human Process Timeline Strip */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold mb-3">
              How Settlement Works
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-50 text-[10px] font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-semibold text-stone-900">Link PayPal ID</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal pl-7">
                  Enter your verified PayPal account email. No password needed.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-50 text-[10px] font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-semibold text-stone-900">Stage Escrow</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal pl-7">
                  Ticket sales accumulate safely in escrow as attendees register.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-semibold text-stone-900">Instant Transfer</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal pl-7">
                  Withdraw cleared balance straight into your PayPal wallet balance.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Guarantees */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-100">
            <span className="inline-flex items-center gap-1.5 text-stone-700">
              <ShieldCheck size={13} className="text-[#0070BA]" />
              Direct PayPal REST API
            </span>
            <span className="inline-flex items-center gap-1.5 text-stone-700">
              <Zap size={13} className="text-amber-500" />
              Zero Platform Wire Fees
            </span>
            <span className="inline-flex items-center gap-1.5 text-stone-700">
              <Lock size={13} className="text-emerald-600" />
              256-bit Encrypted Handshake
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Digital Merchant Pass / Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-[#0b1324] text-white p-5 sm:p-6 shadow-xl border border-stone-700/60 relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0079C1]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#003087]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Pass Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <PayPalIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block leading-tight">
                    Merchant Settlement Pass
                  </span>
                  <span className="text-xs font-semibold tracking-tight text-white">
                    Evento Payouts Gateway
                  </span>
                </div>
              </div>

              <ChipGraphic />
            </div>

            {/* Middle Pass Information */}
            <div className="space-y-1 relative z-10 pt-2 pb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                Primary Destination Account
              </span>

              {primaryAccount ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-medium text-blue-100 truncate">
                      {primaryEmail}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Ready for Automatic Disbursement</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(primaryEmail)}
                    className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
                    title="Copy PayPal Email"
                  >
                    {copiedEmail === primaryEmail ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/5 border border-dashed border-white/15 text-stone-400 text-xs font-mono">
                  <span className="block text-stone-300">No destination linked</span>
                  <span className="text-[10px] text-stone-400">Add a PayPal email to receive payouts</span>
                </div>
              )}
            </div>

            {/* Pass Footer / Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                  Available Balance
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  ${availableBalanceNumeric.toFixed(2)} USD
                </span>
              </div>

              {payoutMethods.length === 0 ? (
                <button
                  type="button"
                  onClick={onOpenAddMethod}
                  className="px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-mono font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Link PayPal</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenWithdraw}
                  className="px-4 py-2 rounded-xl bg-white text-stone-950 hover:bg-stone-100 text-xs font-mono font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <DollarSign size={13} className="text-emerald-600" />
                  <span>Withdraw</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
