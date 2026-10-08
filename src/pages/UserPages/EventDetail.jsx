import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  AlertCircle,
  ArrowLeft,
  Armchair
} from 'lucide-react'
import API from '../../services/api'
import VenueSeatPicker from '../../components/seating/VenueSeatPicker'
import {
  EventDetailHero,
  EventDetailAbout,
  EventDetailCheckout,
  OrderSuccessModal
} from './EventDetail/index'
import { useAuthPrompt } from '../../context/AuthPromptContext'

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { openAuthPrompt } = useAuthPrompt()

  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Seating layout & seats data from backend
  const [seatingData, setSeatingData] = useState(null)
  const [selectedSeatIds, setSelectedSeatIds] = useState([])

  // Booking state for non-assigned seating
  const [selectedTierId, setSelectedTierId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // PayPal Sandbox & Hold State
  const [paypalConfig, setPaypalConfig] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('instant') // 'instant' | 'paypal'
  const [reservationHold, setReservationHold] = useState(null) // { orderId, paypalOrderId, expiresAt }
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(null)

  // Load Event details and Seating Map from Backend API
  useEffect(() => {
    // Ensure viewport lands at the top of the event showcase hero
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    let isMounted = true
    const fetchEvent = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const [eventRes, seatingRes, paypalRes] = await Promise.all([
          API.get(`events/${eventId}/`),
          API.get(`events/${eventId}/seating/`).catch(() => ({ data: null })),
          API.get('tickets/paypal/config/').catch(() => ({ data: { clientId: 'sb', currency: 'USD', mode: 'sandbox' } })),
        ])

        if (isMounted && eventRes.data) {
          setEvent(eventRes.data)
          setIsBookmarked(!!eventRes.data.isBookmarked)
          if (seatingRes?.data?.seats?.length > 0) {
            setSeatingData(seatingRes.data)
          }
          if (paypalRes?.data) {
            setPaypalConfig(paypalRes.data)
          }

          // Default select the first available tier for GA mode
          if (eventRes.data.tiers && eventRes.data.tiers.length > 0) {
            const firstAvailable = eventRes.data.tiers.find((t) => {
              if (t.isSoldOut || t.is_sold_out) return false
              const cap = t.capacity ?? 100
              const sold = t.sold_count ?? t.soldCount ?? 0
              return cap - sold > 0
            })
            setSelectedTierId(firstAvailable ? firstAvailable.id : eventRes.data.tiers[0].id)
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.detail || 'Event could not be found or has been archived.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (eventId) {
      fetchEvent()
    }

    return () => {
      isMounted = false
    }
  }, [eventId])

  // Reservation hold countdown timer effect
  useEffect(() => {
    if (!reservationHold?.expiresAt) {
      setHoldSecondsLeft(null)
      return
    }

    const checkHold = () => {
      const diff = Math.floor((new Date(reservationHold.expiresAt).getTime() - Date.now()) / 1000)
      if (diff <= 0) {
        setHoldSecondsLeft(0)
        setReservationHold(null)
        setSubmitError('Your 10-minute temporary seat hold has expired. Please re-select your seats.')
      } else {
        setHoldSecondsLeft(diff)
      }
    }

    checkHold()
    const interval = setInterval(checkHold, 1000)
    return () => clearInterval(interval)
  }, [reservationHold])

  const formatHoldTimer = (seconds) => {
    if (seconds == null || seconds <= 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Pre-fill user attendee information when logged in
  useEffect(() => {
    if (user) {
      if (!attendeeName) setAttendeeName(user.fullName || '')
      if (!attendeeEmail) setAttendeeEmail(user.email || '')
    }
  }, [user, attendeeName, attendeeEmail])

  const hasAssignedSeating = Boolean(
    (event?.has_assigned_seating || event?.hasAssignedSeating) &&
    seatingData &&
    seatingData.seats &&
    seatingData.seats.length > 0
  )

  // Selected seats objects
  const selectedSeats = useMemo(() => {
    if (!seatingData || !seatingData.seats) return []
    return seatingData.seats.filter((s) => selectedSeatIds.includes(s.id))
  }, [seatingData, selectedSeatIds])

  // Selected tier data & remaining spots (for GA fallback)
  const selectedTier = useMemo(() => {
    if (!event || !event.tiers) return null
    return event.tiers.find((t) => t.id === selectedTierId) || event.tiers[0]
  }, [event, selectedTierId])

  const remainingSpots = useMemo(() => {
    if (hasAssignedSeating) {
      if (!seatingData?.seats) return 0
      return seatingData.seats.filter((s) => s.status === 'available').length
    }
    if (!selectedTier) return 0
    if (selectedTier.isSoldOut || selectedTier.is_sold_out) return 0
    if (selectedTier.remainingSpots !== undefined) {
      return Number(selectedTier.remainingSpots) || 0
    }
    const sold = Number(selectedTier.sold_count ?? selectedTier.soldCount ?? 0)
    const cap = Number(selectedTier.capacity ?? 100)
    return Math.max(0, cap - sold)
  }, [hasAssignedSeating, seatingData, selectedTier])

  const isSoldOut = remainingSpots === 0
  const isEventEnded = event?.isEnded || event?.is_ended || event?.status === 'past'

  // Lowest available price for mobile bar preview
  const lowestPrice = useMemo(() => {
    if (event?.tiers && event.tiers.length > 0) {
      const prices = event.tiers.map((t) => {
        const raw = typeof t.price === 'string' ? parseFloat(t.price.replace('$', '')) : Number(t.price)
        return isNaN(raw) ? 0 : raw
      })
      return Math.min(...prices)
    }
    const base = parseFloat(event?.price)
    return isNaN(base) ? 0 : base
  }, [event])

  // Pricing calculations
  const { subtotal, platformFee, grandTotal, activeQuantity } = useMemo(() => {
    const passFee = event?.passPlatformFeeToBuyer ?? event?.pass_platform_fee_to_buyer ?? true

    if (hasAssignedSeating) {
      const seatSum = selectedSeats.reduce((acc, s) => {
        const p = s.priceRaw !== undefined ? s.priceRaw : parseFloat(String(s.price).replace('$', '')) || 0
        return acc + p
      }, 0)
      const qty = selectedSeats.length
      const fee = (passFee && seatSum > 0) ? parseFloat((seatSum * 0.035).toFixed(2)) : 0
      return {
        subtotal: seatSum,
        platformFee: fee,
        grandTotal: seatSum + fee,
        activeQuantity: qty,
      }
    } else {
      const raw = typeof selectedTier?.price === 'string'
        ? parseFloat(selectedTier.price.replace('$', ''))
        : (selectedTier?.price || 0)
      const unit = isNaN(raw) ? 0 : raw
      const sum = unit * quantity
      const fee = (passFee && sum > 0) ? parseFloat((sum * 0.035).toFixed(2)) : 0
      return {
        subtotal: sum,
        platformFee: fee,
        grandTotal: sum + fee,
        activeQuantity: quantity,
      }
    }
  }, [event, hasAssignedSeating, selectedSeats, selectedTier, quantity])

  const paypalOptions = useMemo(() => {
    if (!paypalConfig?.clientId) return null
    return {
      clientId: paypalConfig.clientId,
      currency: paypalConfig.currency || 'USD',
      intent: 'capture',
      components: 'buttons'
    }
  }, [paypalConfig?.clientId, paypalConfig?.currency])

  const extractErrorMessage = (err, fallback = 'Could not complete ticket purchase. Please verify seat availability.') => {
    const data = err?.response?.data
    if (!data) return err?.message || fallback
    if (typeof data === 'string') {
      if (data.includes('<!doctype') || data.includes('<html') || data.includes('Server Error (500)')) {
        return 'Server error processing your ticket order. Please try again in a few moments.'
      }
      return data
    }
    if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : data.detail
    if (data.message) return Array.isArray(data.message) ? data.message[0] : data.message
    if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
    if (data.seatIds) return Array.isArray(data.seatIds) ? data.seatIds[0] : data.seatIds
    if (data.seat_ids) return Array.isArray(data.seat_ids) ? data.seat_ids[0] : data.seat_ids
    if (data.tierId) return Array.isArray(data.tierId) ? data.tierId[0] : data.tierId
    if (data.tier_id) return Array.isArray(data.tier_id) ? data.tier_id[0] : data.tier_id
    if (data.quantity) return Array.isArray(data.quantity) ? data.quantity[0] : data.quantity
    if (data.eventId) return Array.isArray(data.eventId) ? data.eventId[0] : data.eventId

    // First value in error object
    const values = Object.values(data)
    if (values.length > 0) {
      const firstVal = values[0]
      if (Array.isArray(firstVal) && firstVal.length > 0) return firstVal[0]
      if (typeof firstVal === 'string') {
        if (firstVal.includes('<!doctype') || firstVal.includes('<html')) {
          return 'Server error processing your ticket order. Please try again in a few moments.'
        }
        return firstVal
      }
    }
    return fallback
  }

  // Seat toggle handler for VenueSeatPicker
  const handleSeatToggle = (seat) => {
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id)
      } else {
        if (prev.length >= 8) {
          setSubmitError('Maximum 8 seats per order.')
          return prev
        }
        setSubmitError(null)
        return [...prev, seat.id]
      }
    })
  }

  const handleQuantityChange = (newQty) => {
    const clamped = Math.max(1, Math.min(newQty, Math.min(8, remainingSpots || 1)))
    setQuantity(clamped)
  }

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'bookmark',
        title: 'Save to Your Wishlist',
        subtitle: `Sign in to bookmark "${event?.title || 'this experience'}" and receive reminders before tickets sell out.`,
      })
      return
    }
    const nextState = !isBookmarked
    setIsBookmarked(nextState)
    try {
      await API.post(`events/${eventId}/bookmark/`)
    } catch {
      setIsBookmarked(!nextState)
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // PayPal Step 1: Create Order & Hold Seats
  const handlePayPalCreateOrder = async () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'checkout',
        title: 'Sign In to Book Passes',
        subtitle: `Sign in or create an account to reserve tickets for "${event?.title || 'this event'}".`,
      })
      throw new Error('Not authenticated')
    }

    if (hasAssignedSeating) {
      if (selectedSeatIds.length === 0) {
        setSubmitError('Please select at least one seat from the venue seating plan.')
        throw new Error('No seats selected')
      }
    } else {
      if (!selectedTier || isSoldOut) {
        setSubmitError('Please select an available ticket tier.')
        throw new Error('Tier unavailable')
      }
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        eventId: parseInt(eventId, 10),
        attendeeName: attendeeName || user?.fullName || 'Guest Attendee',
        attendeeEmail: attendeeEmail || user?.email || '',
      }

      if (hasAssignedSeating) {
        payload.seatIds = selectedSeatIds
      } else {
        payload.tierId = selectedTier.id
        payload.quantity = quantity
      }

      const res = await API.post('tickets/paypal/create-order/', payload)
      setReservationHold({
        orderId: res.data.orderId,
        paypalOrderId: res.data.paypalOrderId,
        expiresAt: res.data.expiresAt,
      })

      return res.data.paypalOrderId
    } catch (err) {
      const errMsg = extractErrorMessage(err, 'Could not initiate PayPal session. Please try again.')
      setSubmitError(errMsg)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  // PayPal Step 2: Capture Payment on Approval
  const handlePayPalApprove = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await API.post('tickets/paypal/capture-order/', {
        orderId: reservationHold?.orderId,
        paypalOrderId: data.orderID,
        attendeeName: attendeeName || user?.fullName || 'Guest Attendee',
        attendeeEmail: attendeeEmail || user?.email || '',
      })

      setOrderSuccess(res.data)
      setReservationHold(null)

      // Mark booked seats locally
      if (hasAssignedSeating && seatingData) {
        setSeatingData((prev) => ({
          ...prev,
          seats: prev.seats.map((s) =>
            selectedSeatIds.includes(s.id) ? { ...s, status: 'booked' } : s
          )
        }))
        setSelectedSeatIds([])
      }
    } catch (err) {
      const errMsg = extractErrorMessage(err, 'Payment capture failed. Please try again.')
      setSubmitError(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // PayPal Step 3: Cancellation Handler
  const handlePayPalCancel = async (data) => {
    if (reservationHold?.orderId) {
      try {
        await API.post('tickets/paypal/cancel-order/', {
          orderId: reservationHold.orderId,
          paypalOrderId: data?.orderID || reservationHold.paypalOrderId,
        })
      } catch {
        // ignore cancellation error
      }
    }
    setReservationHold(null)
    setSubmitError('Payment was cancelled. Your temporary seat reservation has been released.')
  }

  const handlePayPalError = (err) => {
    console.error('PayPal Smart Button error:', err)
    setSubmitError('An error occurred during PayPal checkout. You can also use the Instant Pass option.')
  }

  // Direct Mock/Instant Checkout Handler
  const handleDirectCheckout = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'checkout',
        title: 'Sign In to Book Passes',
        subtitle: `Sign in or create an account to reserve tickets for "${event?.title || 'this event'}".`,
      })
      return
    }

    if (isEventEnded) {
      setSubmitError('This event has already ended.')
      return
    }

    if (hasAssignedSeating) {
      if (selectedSeatIds.length === 0) {
        setSubmitError('Please select at least one seat from the venue seating plan.')
        return
      }
    } else {
      if (!selectedTier) {
        setSubmitError('Please choose a ticket tier.')
        return
      }
      if (isSoldOut) {
        setSubmitError('This ticket tier is currently sold out.')
        return
      }
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        eventId: parseInt(eventId, 10),
        paymentMethod: 'Instant Confirmation Pass',
        attendeeName: attendeeName || user?.fullName || 'Guest Attendee',
        attendeeEmail: attendeeEmail || user?.email || '',
      }

      if (hasAssignedSeating) {
        payload.seatIds = selectedSeatIds
      } else {
        payload.tierId = selectedTier.id
        payload.quantity = quantity
      }

      const res = await API.post('tickets/checkout/', payload)
      setOrderSuccess(res.data)

      // Mark booked seats locally
      if (hasAssignedSeating && seatingData) {
        setSeatingData((prev) => ({
          ...prev,
          seats: prev.seats.map((s) =>
            selectedSeatIds.includes(s.id) ? { ...s, status: 'booked' } : s
          )
        }))
        setSelectedSeatIds([])
      }
    } catch (err) {
      const errMsg = extractErrorMessage(err, 'Could not complete ticket purchase. Please verify seat availability.')
      setSubmitError(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-stone-200 rounded" />
        <div className="h-96 w-full bg-stone-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-8 w-3/4 bg-stone-200 rounded" />
            <div className="h-4 w-full bg-stone-200 rounded" />
            <div className="h-4 w-2/3 bg-stone-200 rounded" />
          </div>
          <div className="lg:col-span-5 h-80 bg-stone-200 rounded-xl" />
        </div>
      </div>
    )
  }

  // Error / Not Found State
  if (fetchError || !event) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl font-medium text-stone-900">Event Unavailable</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {fetchError || 'The event you requested could not be located or may have ended.'}
          </p>
        </div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs"
        >
          <ArrowLeft size={14} />
          Return to Discover
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Event Showcase Hero & Breadcrumb */}
      <EventDetailHero
        event={event}
        hasAssignedSeating={hasAssignedSeating}
        isEventEnded={isEventEnded}
        isBookmarked={isBookmarked}
        copiedLink={copiedLink}
        onNavigateBack={() => navigate(-1)}
        onShare={handleShare}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Main Layout: If Assigned Seating -> Seating Picker spans Top */}
      {hasAssignedSeating && (
        <div id="seating-picker-section" className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif text-xl font-medium text-stone-900 flex items-center gap-2">
                <Armchair size={20} className="text-amber-600" />
                <span>Interactive Venue Seat Map</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Click on any available seat to select it. Your reserved seat numbers will be printed directly on your tickets.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 font-semibold self-start sm:self-auto">
              {remainingSpots} Seats Available
            </span>
          </div>

          {/* Interactive Venue Seat Picker */}
          <VenueSeatPicker
            seatingLayout={seatingData?.seatingLayout || seatingData?.seating_layout || event?.seating_layout || {}}
            seats={seatingData?.seats || []}
            selectedSeatIds={selectedSeatIds}
            onSeatToggle={handleSeatToggle}
            maxSelectable={8}
            isEventEnded={isEventEnded}
          />
        </div>
      )}

      {/* Two Column Layout: Details on Left on Desktop, Ticket Terminal First on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Event Context, Venue, Organizer */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          <EventDetailAbout event={event} />
        </div>

        {/* Ticket Buying Terminal (Visible on BOTH mobile and desktop) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20 order-1 lg:order-2">
          <EventDetailCheckout
            event={event}
            hasAssignedSeating={hasAssignedSeating}
            selectedSeats={selectedSeats}
            selectedTier={selectedTier}
            selectedTierId={selectedTierId}
            onSelectTier={(tierId) => {
              setSelectedTierId(tierId)
              setQuantity(1)
            }}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            remainingSpots={remainingSpots}
            isSoldOut={isSoldOut}
            isEventEnded={isEventEnded}
            subtotal={subtotal}
            platformFee={platformFee}
            grandTotal={grandTotal}
            activeQuantity={activeQuantity}
            submitError={submitError}
            reservationHold={reservationHold}
            holdSecondsLeft={holdSecondsLeft}
            formatHoldTimer={formatHoldTimer}
            paymentMethod={paymentMethod}
            onSelectPaymentMethod={setPaymentMethod}
            paypalOptions={paypalOptions}
            onPayPalCreateOrder={handlePayPalCreateOrder}
            onPayPalApprove={handlePayPalApprove}
            onPayPalCancel={handlePayPalCancel}
            onPayPalError={handlePayPalError}
            onDirectCheckout={handleDirectCheckout}
            isSubmitting={isSubmitting}
            isAuthenticated={isAuthenticated}
            onNavigateToLogin={() => openAuthPrompt({
              actionType: 'checkout',
              title: 'Sign In to Book Passes',
              subtitle: `Sign in or create an account to reserve tickets for "${event?.title || 'this event'}".`,
            })}
            onRemoveSeat={handleSeatToggle}
          />
        </div>
      </div>

      {/* Sticky Mobile Quick-Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
            {hasAssignedSeating
              ? (selectedSeats.length > 0 ? `${selectedSeats.length} Selected` : 'Assigned Seating')
              : selectedTier?.name || 'Ticket Passes'}
          </div>
          <div className="font-mono font-bold text-stone-900 text-base">
            {hasAssignedSeating
              ? (selectedSeats.length > 0 ? `$${grandTotal.toFixed(2)}` : (lowestPrice > 0 ? `From $${lowestPrice.toFixed(2)}` : 'Select Seats'))
              : (grandTotal > 0 ? `$${grandTotal.toFixed(2)}` : (lowestPrice > 0 ? `From $${lowestPrice.toFixed(2)}` : 'Free Entry'))
            }
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (hasAssignedSeating && selectedSeats.length === 0) {
              const el = document.getElementById('seating-picker-section')
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                return
              }
            }
            const el = document.getElementById('checkout-terminal')
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
          disabled={isEventEnded || isSoldOut}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 font-mono text-xs font-bold uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>
            {isEventEnded
              ? 'Stage Ended'
              : isSoldOut
                ? 'Sold Out'
                : hasAssignedSeating && selectedSeats.length === 0
                  ? 'Select Seats'
                  : 'Buy Tickets'}
          </span>
        </button>
      </div>

      {/* Success Confirmation Modal */}
      <OrderSuccessModal
        orderSuccess={orderSuccess}
        event={event}
        hasAssignedSeating={hasAssignedSeating}
        selectedTier={selectedTier}
        activeQuantity={activeQuantity}
        quantity={quantity}
        grandTotal={grandTotal}
        onClose={() => navigate('/')}
        onViewPasses={() => navigate('/user/tickets')}
        onViewReceipt={() => navigate('/user/orders')}
      />
    </div>
  )
}
