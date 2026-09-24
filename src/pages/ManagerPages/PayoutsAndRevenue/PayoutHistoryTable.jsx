import React from 'react'
import { PayPalIcon } from './PayoutGraphics'

export default function PayoutHistoryTable({
  filteredHistory,
  isLoading,
  selectedRange,
  setSelectedRange,
}) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-medium text-stone-900">Disbursement History</h2>
          <p className="text-xs text-stone-500">Completed disbursements to your PayPal wallet</p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/80 w-fit">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded-lg transition-all cursor-pointer ${
                selectedRange === range
                  ? 'bg-stone-900 text-stone-50 shadow-2xs font-medium'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
            <tr>
              <th className="px-5 py-3.5 font-medium">Payout ID &amp; Date</th>
              <th className="px-5 py-3.5 font-medium">PayPal Account</th>
              <th className="px-5 py-3.5 font-medium">Gross Total</th>
              <th className="px-5 py-3.5 font-medium">Net Disbursed</th>
              <th className="px-5 py-3.5 font-medium">PayPal Batch Reference</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-normal">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-stone-400 font-mono text-xs">
                  Loading payout history...
                </td>
              </tr>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((payout) => (
                <tr key={payout.id || payout.payoutNumber} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-mono font-medium text-stone-900">{payout.id || payout.payoutNumber}</div>
                    <div className="text-[11px] font-mono text-stone-400">{payout.date}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <PayPalIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono font-medium text-stone-800">
                        {payout.method || payout.destinationAccount || 'PayPal Account'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-stone-600 whitespace-nowrap">
                    {payout.amount || payout.grossTotal}
                  </td>
                  <td className="px-5 py-4 font-mono font-medium text-stone-900 whitespace-nowrap">
                    {payout.netAmount || payout.netDisbursed}
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                    {payout.paypalBatchId || payout.reference || payout.utrReference || 'Completed'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {payout.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-stone-400">
                  <p className="font-serif text-sm text-stone-600">No payout disbursements recorded</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Completed ticket sales will be eligible for instant PayPal transfers.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((payout, idx) => (
            <div key={payout.id || payout.payoutNumber} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-semibold text-xs text-stone-900 block">
                    {payout.id || payout.payoutNumber}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">{payout.date}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {payout.status || 'Completed'}
                </span>
              </div>

              <div className="text-xs font-medium text-stone-800">
                {payout.method || payout.destinationAccount}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-stone-100/60 border border-stone-200/40">
                  <span className="text-[10px] uppercase text-stone-400 block">Gross Total</span>
                  <span className="text-stone-700 font-medium">{payout.amount || payout.grossTotal}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-100/60 border border-stone-200/40">
                  <span className="text-[10px] uppercase text-stone-400 block">Net Disbursed</span>
                  <span className="font-semibold text-stone-900">{payout.netAmount || payout.netDisbursed}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-stone-400">
            <p className="font-serif text-sm text-stone-600">No payout disbursements recorded</p>
          </div>
        )}
      </div>
    </section>
  )
}
