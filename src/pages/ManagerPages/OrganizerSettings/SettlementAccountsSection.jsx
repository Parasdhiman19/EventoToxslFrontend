import React from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'

export default function SettlementAccountsSection({
  settlementAccounts,
  onOpenAddAccount,
  onSetPrimaryAccount,
  onDeleteAccount,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-lg font-medium text-stone-900">Payout Settlement Methods</h2>
            <p className="text-xs text-stone-500">
              Connect your PayPal business email or direct bank deposit account to receive ticket sale disbursements.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddAccount}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 self-start"
          >
            <Plus size={14} />
            <span>Connect PayPal</span>
          </button>
        </div>

        {/* Accounts List */}
        {settlementAccounts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-stone-50 border border-dashed border-stone-300 space-y-2">
            <CreditCard size={32} className="mx-auto text-stone-400" />
            <p className="text-xs font-medium text-stone-800">No payout method connected</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Connect your PayPal merchant account so you can receive ticket revenue disbursements automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlementAccounts.map((account) => {
              const isPrimary = account.isPrimary || account.is_primary || account.status === 'Primary'
              return (
                <div
                  key={account.id}
                  className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-900">
                          {account.displayTitle || account.bankName || 'PayPal Account'}
                        </span>
                        {isPrimary && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                            Primary Payout
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {account.paypalEmail || account.maskedAccount || account.accountNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryAccount(account.id)}
                        className="text-xs font-mono text-stone-700 hover:text-stone-900 underline underline-offset-2 cursor-pointer"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteAccount(account.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition cursor-pointer"
                      title="Remove Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
