import React, { useState } from 'react'
import { 
  Ticket, 
  AlertCircle, 
  Armchair, 
  Minus, 
  Plus, 
  Timer, 
  CreditCard, 
  Sparkles, 
  Lock,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import PayPalErrorBoundary from './PayPalErrorBoundary'

export default function EventDetailCheckout({
  event,
  hasAssignedSeating,
  selectedSeats,
  selectedTier,
  selectedTierId,
  onSelectTier,
  quantity,
  onQuantityChange,
  remainingSpots,
  isSoldOut,
  isEventEnded,
  subtotal,
  platformFee,
  grandTotal,
  activeQuantity,
  submitError,
  reservationHold,
  holdSecondsLeft,
  formatHoldTimer,
  paymentMethod = 'instant',
  onSelectPaymentMethod,
  paypalOptions,
  onPayPalCreateOrder,
  onPayPalApprove,
  onPayPalCancel,
  onPayPalError,
  onDirectCheckout,
  isSubmitting,
  isAuthenticated,
  onNavigateToLogin,
  onRemoveSeat
}) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  return (
    <div 
      id="checkout-terminal" 
      className="rounded-2xl border border-stone-200/90 bg-white shadow-md overflow-hidden scroll-mt-24 transition-all"
    >
      {/* Terminal Header */}
      <div className="p-4 sm:p-5 bg-stone-900 text-stone-50 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Ticket size={16} className="text-amber-400" />
          <span className="font-serif font-semibold text-sm sm:text-base">
            {hasAssignedSeating ? 'Reserved Seating Passes' : 'Select Ticket Pass'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
          Direct Entry
        </span>
      </div>

      {/* Main Form Body */}
      <form onSubmit={onDirectCheckout} className="p-4 sm:p-5 space-y-4">
        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {isEventEnded && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-mono">
            ⚠️ This event has ended. Ticket bookings are closed.
          </div>
        )}

        {/* ASSIGNED SEATING MODE SUMMARY */}
        {hasAssignedSeating ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
                Selected Seats ({selectedSeats.length})
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                Max 8 passes
              </span>
            </div>

            {selectedSeats.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedSeats.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <Armchair size={13} className="text-stone-700 shrink-0" />
                      <span className="font-semibold text-stone-900">
                        Row {s.row} • Seat {s.seat_number || s.seatNumber}
                      </span>
                      <span className="text-stone-500 text-[10px]">({s.tierName})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">{s.price}</span>
                      {onRemoveSeat && (
                        <button
                          type="button"
                          onClick={() => onRemoveSeat(s.id)}
                          className="p-1 rounded text-stone-400 hover:text-red-600 transition cursor-pointer"
                          title="Remove seat"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 text-center font-mono">
                👆 Select seats on the interactive map above to proceed.
              </div>
            )}
          </div>
        ) : (
          /* FLAT TIER SELECTION */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
                Pass Tiers
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                Tap tier to select
              </span>
            </div>

            {event?.tiers && event.tiers.length > 0 ? (
              <div className="space-y-2">
                {event.tiers.map((tier) => {
                  const sold = Number(tier.sold_count ?? tier.soldCount ?? 0)
                  const cap = Number(tier.capacity ?? 100)
                  const spots = tier.remainingSpots !== undefined ? Number(tier.remainingSpots) : Math.max(0, cap - sold)
                  const tierSoldOut = Boolean(tier.isSoldOut || tier.is_sold_out || spots === 0)
                  const isSelected = selectedTierId === tier.id

                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        if (!tierSoldOut && !isEventEnded) {
                          onSelectTier(tier.id)
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all ${
                        tierSoldOut || isEventEnded
                          ? 'opacity-60 bg-stone-50 border-stone-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-stone-900 bg-stone-50/90 ring-1 ring-stone-900 shadow-xs cursor-pointer'
                          : 'border-stone-200 bg-white hover:border-stone-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                              {tier.name || tier.tierName}
                            </span>
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-stone-900 shrink-0" />
                            )}
                          </div>
                          {tier.description && (
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {tier.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-stone-900 text-sm block">
                            {parseFloat(tier.price) > 0 ? `$${parseFloat(tier.price).toFixed(2)}` : 'Free'}
                          </span>
                          <span className={`text-[10px] font-mono uppercase tracking-wider block mt-0.5 ${
                            tierSoldOut ? 'text-red-600 font-bold' : spots <= 5 ? 'text-amber-600 font-medium' : 'text-stone-400'
                          }`}>
                            {tierSoldOut ? 'Sold Out' : `${spots} Left`}
                          </span>
                        </div>
                      </div>

                      {/* Integrated Quantity Stepper inside Active Tier Card */}
                      {isSelected && !isEventEnded && !isSoldOut && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between animate-in fade-in"
                        >
                          <span className="text-[11px] font-mono text-stone-600">
                            Quantity:
                          </span>
                          <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onQuantityChange(quantity - 1)}
                              disabled={quantity <= 1}
                              className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-xs text-stone-900">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuantityChange(quantity + 1)}
                              disabled={quantity >= Math.max(1, Math.min(8, remainingSpots || 8))}
                              className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-stone-50 text-center text-xs text-stone-500 font-mono">
                General Admission entry included with stage pass.
              </div>
            )}
          </div>
        )}

        {/* Temporary Seat Hold Countdown Banner */}
        {reservationHold && holdSecondsLeft !== null && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <Timer size={14} className="text-amber-600 animate-pulse" />
              <span className="text-[10px] font-mono font-medium">Temporary Seat Hold</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-amber-700">Expires:</span>
              <span className="font-mono text-xs font-bold bg-amber-200/90 text-amber-950 px-1.5 py-0.5 rounded border border-amber-300">
                {formatHoldTimer(holdSecondsLeft)}
              </span>
            </div>
          </div>
        )}

        {/* Collapsible Order Cost Breakdown Accordion */}
        <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-3 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-900 text-xs sm:text-sm">Total Due</span>
              <span className="text-stone-500 text-[11px]">({activeQuantity} {activeQuantity === 1 ? 'pass' : 'passes'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm sm:text-base">${grandTotal.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="inline-flex items-center gap-0.5 text-[10px] text-stone-500 hover:text-stone-900 uppercase tracking-wider p-0.5 cursor-pointer"
                aria-label="Toggle price breakdown"
              >
                {showBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {showBreakdown && (
            <div className="pt-2 border-t border-stone-200/90 space-y-1.5 text-stone-600 animate-in fade-in text-[11px]">
              <div className="flex items-center justify-between">
                <span>Pass Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-500">
                <span>Platform &amp; Gate Service {platformFee > 0 ? '(3.5%)' : ''}</span>
                <span>{platformFee > 0 ? `$${platformFee.toFixed(2)}` : '$0.00 (Covered)'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Gateway Toggle */}
        {grandTotal > 0 && !isEventEnded && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-medium block">
              Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectPaymentMethod('instant')}
                className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'instant'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs font-semibold'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Sparkles size={12} />
                <span>Instant Pass</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectPaymentMethod('paypal')}
                className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs font-semibold'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <CreditCard size={12} />
                <span>PayPal</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Button: Instant Pass vs PayPal */}
        {paymentMethod === 'paypal' && grandTotal > 0 && !isEventEnded ? (
          <div className="pt-1 space-y-2">
            <PayPalErrorBoundary onFallbackToDirect={() => onSelectPaymentMethod('instant')}>
              {paypalOptions ? (
                <PayPalScriptProvider options={paypalOptions}>
                  <div className="min-h-[44px]">
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        shape: 'rect',
                        color: 'gold',
                        height: 44,
                        label: 'pay'
                      }}
                      disabled={
                        isSubmitting || 
                        (hasAssignedSeating ? selectedSeats.length === 0 : isSoldOut) || 
                        isEventEnded || 
                        !isAuthenticated
                      }
                      createOrder={onPayPalCreateOrder}
                      onApprove={onPayPalApprove}
                      onCancel={onPayPalCancel}
                      onError={onPayPalError}
                    />
                  </div>
                </PayPalScriptProvider>
              ) : (
                <div className="h-11 rounded-xl bg-stone-100 flex items-center justify-center text-xs font-mono text-stone-400 animate-pulse">
                  Loading PayPal Gateway...
                </div>
              )}
            </PayPalErrorBoundary>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-stone-800 text-xs font-mono font-medium hover:bg-stone-200 transition cursor-pointer text-center"
              >
                Sign In to Unlock PayPal Checkout
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectPaymentMethod('instant')}
              className="w-full text-center text-[11px] font-mono text-stone-500 hover:text-stone-900 underline pt-1 cursor-pointer"
            >
              Or checkout directly with Instant Pass
            </button>
          </div>
        ) : (
          /* PRIMARY INSTANT CHECKOUT BUTTON (ALWAYS VISIBLE & PROMINENT) */
          <button
            type="button"
            onClick={onDirectCheckout}
            disabled={isSubmitting || (hasAssignedSeating ? selectedSeats.length === 0 : isSoldOut) || isEventEnded}
            className="w-full py-3.5 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider font-bold hover:bg-stone-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-400 border-t-stone-50 animate-spin" />
                <span>Issuing Passes...</span>
              </>
            ) : isEventEnded ? (
              <span>Stage Completed</span>
            ) : hasAssignedSeating && selectedSeats.length === 0 ? (
              <span>Select Seats on Map</span>
            ) : !hasAssignedSeating && isSoldOut ? (
              <span>Pass Tier Sold Out</span>
            ) : (
              <>
                <Lock size={13} />
                <span>
                  {isAuthenticated 
                    ? `Confirm ${activeQuantity} ${activeQuantity === 1 ? 'Pass' : 'Passes'} • $${grandTotal.toFixed(2)}` 
                    : 'Sign In to Buy Tickets'}
                </span>
              </>
            )}
          </button>
        )}

        <p className="text-[10px] text-center text-stone-400 font-mono pb-0.5">
          Instant cryptographic digital delivery to your account.
        </p>
      </form>
    </div>
  )
}
