import React from 'react'
import { CheckCircle2, ChevronRight, X } from 'lucide-react'

export default function OrderSuccessModal({
  orderSuccess,
  event,
  hasAssignedSeating,
  selectedTier,
  activeQuantity,
  quantity,
  grandTotal,
  onClose,
  onViewPasses,
  onViewReceipt,
}) {
  if (!orderSuccess) return null

  const confirmedCount = 
    orderSuccess.qty || 
    orderSuccess.quantity || 
    (orderSuccess.ticketIds && orderSuccess.ticketIds.length) || 
    activeQuantity || 
    quantity || 
    1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden p-6 sm:p-8 text-center space-y-5 relative">
        {/* Close / Cross Button - Redirects to Home */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and return to home"
          title="Return to Home"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Order Confirmed
          </span>
          <h3 className="font-serif text-2xl font-medium text-stone-900 pt-1">
            You&apos;re Going to the Stage!
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Your order <strong>{orderSuccess.id}</strong> has been confirmed with {confirmedCount} verified digital admission pass{confirmedCount > 1 ? 'es' : ''}.
          </p>
        </div>

        {/* Receipt Summary Card */}
        <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-4 space-y-2 text-xs font-mono text-left">
          <div className="flex justify-between text-stone-500">
            <span>Event</span>
            <span className="text-stone-900 font-medium truncate max-w-[200px]">{event?.title}</span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>Passes</span>
            <span className="text-stone-900 font-medium">
              {hasAssignedSeating
                ? `${confirmedCount} Assigned Seat${confirmedCount > 1 ? 's' : ''}`
                : `${orderSuccess.tier || selectedTier?.name || 'General'} × ${confirmedCount}`}
            </span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>Total Paid</span>
            <span className="text-stone-900 font-semibold">{orderSuccess.total || `$${grandTotal.toFixed(2)}`}</span>
          </div>
        </div>

        {/* Next Steps Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onViewPasses}
            className="flex-1 py-3 px-4 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <span>View My Passes</span>
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={onViewReceipt}
            className="flex-1 py-3 px-4 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-mono font-medium hover:bg-stone-50 transition cursor-pointer"
          >
            View Order Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
