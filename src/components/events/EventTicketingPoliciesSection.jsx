import React from 'react'
import { Shield } from 'lucide-react'

export default function EventTicketingPoliciesSection({
  ticketingPolicies,
  setTicketingPolicies,
}) {
  return (
    <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <h2 className="font-serif text-base text-stone-900 flex items-center gap-2">
            <Shield size={16} className="text-stone-700" />
            <span>Ticketing &amp; Checkout Policies</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Customize fees, transferability, and door rules for this stage. Pre-filled with your studio defaults.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/80 self-start sm:self-auto">
          Stage Snapshot
        </span>
      </div>

      <div className="space-y-4 divide-y divide-stone-100">
        {/* Toggle 1: Pass Platform Fee */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5 pr-6">
            <span className="text-xs font-medium text-stone-900">Pass Platform Fee (3.5%) to Buyer</span>
            <p className="text-[11px] text-stone-500">
              When enabled, ticketing fees are added at checkout to the ticket price rather than deducted from your gross payout.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setTicketingPolicies((prev) => ({ ...prev, passPlatformFeeToBuyer: !prev.passPlatformFeeToBuyer }))
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
              ticketingPolicies.passPlatformFeeToBuyer ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                ticketingPolicies.passPlatformFeeToBuyer ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Allow Ticket Transfers */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-0.5 pr-6">
            <span className="text-xs font-medium text-stone-900">Allow Attendee Ticket Transfers</span>
            <p className="text-[11px] text-stone-500">
              Permits buyers to securely reassign their digital pass to another attendee before gate check-in.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setTicketingPolicies((prev) => ({ ...prev, allowTicketTransfers: !prev.allowTicketTransfers }))
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
              ticketingPolicies.allowTicketTransfers ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                ticketingPolicies.allowTicketTransfers ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Mandatory Phone Number */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-0.5 pr-6">
            <span className="text-xs font-medium text-stone-900">Require Attendee Phone Number at Checkout</span>
            <p className="text-[11px] text-stone-500">
              Collect verified mobile numbers for SMS pass delivery and urgent door broadcast notices.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setTicketingPolicies((prev) => ({ ...prev, requireAttendeePhone: !prev.requireAttendeePhone }))
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
              ticketingPolicies.requireAttendeePhone ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                ticketingPolicies.requireAttendeePhone ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 4: Auto Refund Cancelled */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-0.5 pr-6">
            <span className="text-xs font-medium text-stone-900">Auto-Refund on Event Cancellation</span>
            <p className="text-[11px] text-stone-500">
              Automatically trigger PayPal refunds to registered attendees if this event is cancelled.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setTicketingPolicies((prev) => ({
                ...prev,
                autoRefundCancelledEvents: !prev.autoRefundCancelledEvents,
              }))
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
              ticketingPolicies.autoRefundCancelledEvents ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                ticketingPolicies.autoRefundCancelledEvents ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
