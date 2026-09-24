import React from 'react'
import { Shield, RefreshCw } from 'lucide-react'

export default function TicketingPoliciesSection({
  ticketingSettings,
  setTicketingSettings,
  handleSaveSettings,
  isSaving,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="font-serif text-lg font-medium text-stone-900">Default Ticketing Rules</h2>
          <p className="text-xs text-stone-500">
            Set baseline checkout and admission rules applied automatically when launching new stages.
          </p>
        </div>

        {/* Template Defaults Informative Banner */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
          <Shield size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-950 font-mono uppercase tracking-wider text-[11px]">
              Studio Template Defaults
            </span>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              These rules serve as initial default templates applied automatically when hosting new stages. Existing active stages maintain their own isolated policy settings and are never altered when updating studio templates.
            </p>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-stone-100">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Pass Platform Fee (3.5%) to Buyer</span>
              <p className="text-[11px] text-stone-500">
                When enabled, ticketing fees are added at checkout to the ticket price rather than deducted from your gross payout.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTicketingSettings((prev) => ({ ...prev, passPlatformFeeToBuyer: !prev.passPlatformFeeToBuyer }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                ticketingSettings.passPlatformFeeToBuyer ? 'bg-stone-900' : 'bg-stone-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  ticketingSettings.passPlatformFeeToBuyer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Allow Attendee Ticket Transfers</span>
              <p className="text-[11px] text-stone-500">
                Permits verified buyers to securely reassign their digital passes to another attendee email before event gate opening.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTicketingSettings((prev) => ({ ...prev, allowTicketTransfers: !prev.allowTicketTransfers }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                ticketingSettings.allowTicketTransfers ? 'bg-stone-900' : 'bg-stone-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  ticketingSettings.allowTicketTransfers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Mandatory Phone Number at Checkout</span>
              <p className="text-[11px] text-stone-500">
                Collect verified mobile numbers for SMS pass delivery and urgent door broadcast notices.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTicketingSettings((prev) => ({ ...prev, requireAttendeePhone: !prev.requireAttendeePhone }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                ticketingSettings.requireAttendeePhone ? 'bg-stone-900' : 'bg-stone-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  ticketingSettings.requireAttendeePhone ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4 */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Auto-Refund on Event Cancellation</span>
              <p className="text-[11px] text-stone-500">
                Automatically trigger PayPal refunds to attendees if an event is cancelled by the studio.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setTicketingSettings((prev) => ({
                  ...prev,
                  autoRefundCancelledEvents: !prev.autoRefundCancelledEvents,
                }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                ticketingSettings.autoRefundCancelledEvents ? 'bg-stone-900' : 'bg-stone-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  ticketingSettings.autoRefundCancelledEvents ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSaveSettings(null, 'Ticketing policies saved.')}
          className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : null}
          <span>Save Ticketing Policies</span>
        </button>
      </div>
    </div>
  )
}
