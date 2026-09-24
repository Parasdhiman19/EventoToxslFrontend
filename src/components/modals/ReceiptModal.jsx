import React from 'react'
import { X, Printer } from 'lucide-react'

/**
 * Reusable Invoice Receipt Modal for attendee checkout orders and manager sales transactions.
 * 
 * @param {Object} props
 * @param {Object|null} props.receipt - Receipt/Order data object
 * @param {Function} props.onClose - Modal close handler
 */
export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null

  const orderId = receipt.id || receipt.orderId || receipt.order_number
  const title = receipt.eventTitle || receipt.event || 'Evento Experience'
  const date = receipt.eventDate || receipt.date || 'N/A'
  const time = receipt.time || ''
  const venue = receipt.venue || receipt.venueName || 'Main Venue'
  const tierName = receipt.tier || receipt.tierName || 'Standard Pass'
  const quantity = receipt.quantity || receipt.qty || 1
  const unitPrice = receipt.unitPrice || receipt.unit_price || '$0.00'
  const fees = receipt.fees || '$0.00'
  const total = receipt.total || receipt.totalPaid || receipt.total_amount || '$0.00'
  const paymentMethod = receipt.paymentMethod || receipt.payment_method || 'Instant Pass'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
        >
          <X size={18} />
        </button>

        {/* Receipt Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-stone-900 text-stone-50 flex items-center justify-center font-sans font-bold text-xs">
              E
            </span>
            <span className="font-serif font-semibold text-base">Evento Checkout</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-stone-400 block">Receipt</span>
            <span className="text-xs font-mono font-medium text-stone-900">{orderId}</span>
          </div>
        </div>

        {/* Event Summary */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            Event Experience
          </span>
          <h3 className="font-serif text-lg font-medium text-stone-900">{title}</h3>
          <p className="text-xs text-stone-500">{venue}</p>
          <p className="text-xs font-mono text-stone-500">
            Date: {date} {time ? `• ${time}` : ''}
          </p>
        </div>

        {/* Line Items Breakdown */}
        <div className="rounded-md bg-stone-50 border border-stone-200/80 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="text-stone-600">
              {tierName} (&times;{quantity})
            </span>
            <span className="text-stone-900 font-medium">{unitPrice}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-stone-500">
            <span>Platform &amp; Gate Service Fees</span>
            <span>{fees}</span>
          </div>
          <div className="border-t border-stone-200 pt-2 flex items-center justify-between font-mono font-semibold text-stone-900 text-sm">
            <span>Total Amount Paid</span>
            <span>{total}</span>
          </div>
        </div>

        {/* Payment Meta */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-stone-100 pt-2">
          <div>
            <span className="text-stone-400 text-[10px] uppercase block">Payment Method</span>
            <span className="text-stone-700">{paymentMethod}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-400 text-[10px] uppercase block">Timestamp</span>
            <span className="text-stone-700">
              {date} {time ? `• ${time}` : ''}
            </span>
          </div>
        </div>

        {/* Print / Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-stone-300 px-4 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer size={13} />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
