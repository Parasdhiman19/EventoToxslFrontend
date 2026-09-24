import React from 'react'
import { 
  Ticket, 
  AlertCircle, 
  Armchair, 
  Minus, 
  Plus, 
  Timer, 
  CreditCard, 
  Sparkles, 
  Lock 
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
  paymentMethod,
  onSelectPaymentMethod,
  paypalOptions,
  onPayPalCreateOrder,
  onPayPalApprove,
  onPayPalCancel,
  onPayPalError,
  onDirectCheckout,
  isSubmitting,
  isAuthenticated,
  onNavigateToLogin
}) {
  return (
    <div className="rounded-xl border border-stone-300/80 bg-white shadow-md overflow-hidden">
      {/* Terminal Header */}
      <div className="p-5 bg-stone-900 text-stone-50 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Ticket size={16} className="text-amber-400" />
          <span className="font-serif font-medium text-base">
            {hasAssignedSeating ? 'Seat Checkout Summary' : 'Select Ticket Tier'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
          Official Checkout
        </span>
      </div>

      <form onSubmit={onDirectCheckout} className="p-5 sm:p-6 space-y-5">
        {submitError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {isEventEnded && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-mono">
            ⚠️ This event has ended. Ticket bookings are closed.
          </div>
        )}

        {/* ASSIGNED SEATING MODE SUMMARY */}
        {hasAssignedSeating ? (
          <div className="space-y-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
              Your Selected Seats ({selectedSeats.length})
            </label>

            {selectedSeats.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedSeats.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <Armchair size={13} className="text-stone-700" />
                      <span className="font-semibold text-stone-900">
                        Row {s.row} • Seat {s.seat_number || s.seatNumber}
                      </span>
                      <span className="text-stone-500 text-[11px]">({s.tierName})</span>
                    </div>
                    <span className="font-semibold text-stone-900">{s.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-800 text-center font-mono">
                👆 Click seats on the map above to select your passes.
              </div>
            )}
          </div>
        ) : (
          /* FLAT TIER SELECTION RADIO CARDS (FOR OPEN FLOOR) */
          <div className="space-y-2.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
              Available Passes &amp; Tiers
            </label>

            {event?.tiers && event.tiers.length > 0 ? (
              event.tiers.map((tier) => {
                const sold = tier.sold_count ?? tier.soldCount ?? 0
                const spots = Math.max(0, tier.capacity - sold)
                const tierSoldOut = spots === 0
                const isSelected = selectedTierId === tier.id

                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      if (!tierSoldOut && !isEventEnded) {
                        onSelectTier(tier.id)
                      }
                    }}
                    className={`p-3.5 rounded-lg border transition-all relative ${
                      tierSoldOut || isEventEnded
                        ? 'opacity-60 bg-stone-50 border-stone-200 cursor-not-allowed'
                        : isSelected
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900 cursor-pointer shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-stone-400 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900 text-xs sm:text-sm">
                            {tier.name || tier.tierName}
                          </span>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                          )}
                        </div>
                        {tier.description && (
                          <p className="text-[11px] text-stone-500 leading-snug">
                            {tier.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-semibold text-stone-900 text-sm sm:text-base block">
                          {parseFloat(tier.price) > 0 ? `$${parseFloat(tier.price).toFixed(2)}` : 'Free Entry'}
                        </span>
                        <span className={`text-[10px] font-mono uppercase tracking-wider block mt-0.5 ${
                          tierSoldOut ? 'text-red-600 font-bold' : spots <= 5 ? 'text-amber-600 font-medium' : 'text-stone-400'
                        }`}>
                          {tierSoldOut ? 'Sold Out' : `${spots} Left`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-4 rounded-lg bg-stone-50 text-center text-xs text-stone-500 font-mono">
                General Admission pass included with entry.
              </div>
            )}

            {/* Quantity Picker for GA */}
            {!isEventEnded && !isSoldOut && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium">
                    Number of Passes
                  </label>
                  <span className="text-[11px] font-mono text-stone-400">
                    Max {Math.min(8, remainingSpots)} per order
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2.5 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-mono font-semibold text-sm text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(quantity + 1)}
                      disabled={quantity >= Math.min(8, remainingSpots)}
                      className="p-2.5 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Cost Breakdown */}
        <div className="rounded-lg bg-stone-50 border border-stone-200/80 p-4 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-stone-600">
            <span>Subtotal ({activeQuantity} {activeQuantity === 1 ? 'pass' : 'passes'})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-stone-500 text-[11px]">
            <span>Platform &amp; Gate Service {platformFee > 0 ? '(3.5%)' : ''}</span>
            <span>{platformFee > 0 ? `$${platformFee.toFixed(2)}` : '$0.00 (Covered by host)'}</span>
          </div>
          <div className="border-t border-stone-200 pt-2 flex items-center justify-between font-semibold text-stone-900 text-sm">
            <span>Total Amount</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Temporary Seat Hold Countdown Banner */}
        {reservationHold && holdSecondsLeft !== null && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-amber-600 animate-pulse" />
              <span className="text-[11px] font-mono font-medium">Reservation Hold Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700">Expires in:</span>
              <span className="font-mono text-xs font-bold bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                {formatHoldTimer(holdSecondsLeft)}
              </span>
            </div>
          </div>
        )}

        {/* Payment Method Selector */}
        {grandTotal > 0 && !isEventEnded && (
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-medium block">
              Select Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectPaymentMethod('paypal')}
                className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <CreditCard size={13} />
                <span>PayPal Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectPaymentMethod('instant')}
                className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'instant'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Sparkles size={13} />
                <span>Instant Pass</span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Action: PayPal Smart Buttons vs Direct Submit */}
        {paymentMethod === 'paypal' && grandTotal > 0 && !isEventEnded && (
          <div className="pt-2 space-y-2">
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
                <div className="h-11 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-mono text-stone-400 animate-pulse">
                  Loading PayPal Gateway...
                </div>
              )}
            </PayPalErrorBoundary>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-2.5 px-4 rounded-lg bg-stone-100 text-stone-800 text-xs font-mono font-medium hover:bg-stone-200 transition cursor-pointer text-center"
              >
                Sign In to Unlock PayPal Checkout
              </button>
            )}
          </div>
        )}

        {(paymentMethod === 'instant' || grandTotal === 0 || isEventEnded) && (
          <button
            type="button"
            onClick={onDirectCheckout}
            disabled={isSubmitting || (hasAssignedSeating ? selectedSeats.length === 0 : isSoldOut) || isEventEnded}
            className="w-full py-3.5 px-4 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-400 border-t-stone-50 animate-spin" />
                <span>Issuing Passes...</span>
              </>
            ) : isEventEnded ? (
              <span>Stage Completed</span>
            ) : hasAssignedSeating && selectedSeats.length === 0 ? (
              <span>Select Seats Above</span>
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

        <p className="text-[10px] text-center text-stone-400 font-mono">
          Instant cryptographic digital delivery to your account.
        </p>
      </form>
    </div>
  )
}
