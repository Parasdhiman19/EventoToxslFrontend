import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Ticket, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  Minus,
  Plus,
  Lock,
  ChevronRight,
  Armchair,
  Layers,
  CreditCard,
  Timer,
  X
} from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import API from '../../services/api'
import VenueSeatPicker from '../../components/seating/VenueSeatPicker'

class PayPalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('PayPal SDK Error caught safely by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <AlertCircle size={14} className="text-amber-600" />
            <span>PayPal Sandbox Unavailable</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Please configure your PayPal Sandbox Client ID or use the Instant Pass option below.
          </p>
          <button
            type="button"
            onClick={this.props.onFallbackToDirect}
            className="w-full py-2.5 px-3 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition cursor-pointer"
          >
            Switch to Instant Pass
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

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
  const [paymentMethod, setPaymentMethod] = useState('paypal') // 'paypal' | 'instant'
  const [reservationHold, setReservationHold] = useState(null) // { orderId, paypalOrderId, expiresAt }
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(null)

  // Load Event details and Seating Map from Backend API
  useEffect(() => {
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
            const firstAvailable = eventRes.data.tiers.find((t) => t.capacity - (t.sold_count || t.soldCount || 0) > 0)
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
  }, [user])

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
    const sold = selectedTier.sold_count ?? selectedTier.soldCount ?? 0
    return Math.max(0, selectedTier.capacity - sold)
  }, [hasAssignedSeating, seatingData, selectedTier])

  const isSoldOut = remainingSpots === 0
  const isEventEnded = event?.isEnded || event?.is_ended || event?.status === 'past'

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
      navigate('/account/login')
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
      navigate('/account/login')
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
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Could not initiate PayPal session. Please try again.'
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg)
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
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Payment capture failed. Please try again.'
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg)
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
      navigate('/account/login')
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
      const errMsg = 
        err.response?.data?.seatIds ||
        err.response?.data?.quantity || 
        err.response?.data?.eventId || 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Could not complete ticket purchase. Please verify seat availability.'
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBuyTicket = handleDirectCheckout

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
          to="/user/discover"
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
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-950 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Stages</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Share event link"
          >
            <Share2 size={13} />
            <span className="text-[11px] font-mono">{copiedLink ? 'Copied Link!' : 'Share'}</span>
          </button>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-md border transition text-xs flex items-center gap-1 cursor-pointer shadow-2xs ${
              isBookmarked
                ? 'border-stone-900 bg-stone-900 text-stone-50'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
            title="Bookmark event"
          >
            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span className="text-[11px] font-mono">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Event Showcase Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-100 shadow-xl min-h-[340px] sm:min-h-[400px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img
            src={event.image || event.banner || event.banner_image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}
            alt={event.title}
            className="w-full h-full object-cover opacity-40 filter saturate-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/20" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 space-y-3 sm:space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-stone-800/90 border border-stone-700 text-[10px] font-mono uppercase tracking-wider text-amber-400">
              <Sparkles size={11} />
              {event.category || 'Curated Experience'}
            </span>
            {event.is_featured && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Featured Stage
              </span>
            )}
            {hasAssignedSeating && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                <Armchair size={11} /> Visual Seating Map
              </span>
            )}
            {isEventEnded && (
              <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[10px] font-mono uppercase tracking-wider text-red-300">
                Stage Completed (Past)
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight text-stone-50">
            {event.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl line-clamp-3">
            {event.description || 'Join us for this curated gathering featuring live performances, immersive audio-visual production, and community experiences.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-stone-300 pt-2 border-t border-stone-800/80">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              <span>{event.dateFormatted || event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              <span>{event.time || event.startTime || 'Doors Open TBA'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-400" />
              <span>{event.is_online ? 'Virtual Stream' : `${event.venueName || event.venue || 'Venue'}, ${event.city}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: If Assigned Seating -> Seating Picker spans Top, followed by Details & Checkout */}
      {hasAssignedSeating && (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
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
            seatingLayout={seatingData.seatingLayout || seatingData.seating_layout || event.seating_layout || {}}
            seats={seatingData.seats || []}
            selectedSeatIds={selectedSeatIds}
            onSeatToggle={handleSeatToggle}
            maxSelectable={8}
            isEventEnded={isEventEnded}
          />
        </div>
      )}

      {/* Two Column Layout: Details on Left, Booking Ticket Terminal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Event Context, Venue, Organizer */}
        <div className="lg:col-span-7 space-y-6">
          {/* About Section */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-4">
            <h2 className="font-serif text-xl font-medium text-stone-900 border-b border-stone-100 pb-3">
              About This Experience
            </h2>
            <div className="prose prose-stone text-xs leading-relaxed text-stone-600 space-y-3">
              <p>
                {event.description || 'Experience a curated production with state-of-the-art stage engineering, sound design, and live engagement.'}
              </p>
              <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/70 space-y-2 font-mono text-[11px] text-stone-700">
                <div className="flex items-center gap-2 text-stone-900 font-semibold">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Guaranteed Direct Gate Admission</span>
                </div>
                <p className="text-stone-500 font-sans text-xs">
                  Passes include instantaneous cryptographic door QR barcodes delivered to your <strong>My Tickets</strong> dashboard upon purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Location & Host Studio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-medium text-xs font-mono uppercase tracking-wider">
                <MapPin size={14} className="text-stone-500" />
                <span>Venue &amp; Location</span>
              </div>
              <p className="font-medium text-stone-900 text-sm">{event.venueName || event.venue || 'Main Venue'}</p>
              <p className="text-xs text-stone-500">{event.address || `${event.city}, India`}</p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-medium text-xs font-mono uppercase tracking-wider">
                <Building2 size={14} className="text-stone-500" />
                <span>Curated By Host</span>
              </div>
              <p className="font-medium text-stone-900 text-sm">{event.organizer || 'Nexus Productions'}</p>
              <p className="text-xs text-stone-500 font-mono">Verified Studio Host</p>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Buying Terminal */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
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

            <form onSubmit={handleBuyTicket} className="p-5 sm:p-6 space-y-5">
              
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

                  {event.tiers && event.tiers.length > 0 ? (
                    event.tiers.map((tier) => {
                      const sold = tier.sold_count ?? tier.soldCount ?? 0
                      const spots = Math.max(0, tier.capacity - sold)
                      const soldOut = spots === 0
                      const isSelected = selectedTierId === tier.id

                      return (
                        <div
                          key={tier.id}
                          onClick={() => {
                            if (!soldOut && !isEventEnded) {
                              setSelectedTierId(tier.id)
                              setQuantity(1)
                            }
                          }}
                          className={`p-3.5 rounded-lg border transition-all relative ${
                            soldOut || isEventEnded
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
                                soldOut ? 'text-red-600 font-bold' : spots <= 5 ? 'text-amber-600 font-medium' : 'text-stone-400'
                              }`}>
                                {soldOut ? 'Sold Out' : `${spots} Left`}
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
                            onClick={() => handleQuantityChange(quantity - 1)}
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
                            onClick={() => handleQuantityChange(quantity + 1)}
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
                      onClick={() => setPaymentMethod('paypal')}
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
                      onClick={() => setPaymentMethod('instant')}
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
                  <PayPalErrorBoundary onFallbackToDirect={() => setPaymentMethod('instant')}>
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
                            createOrder={handlePayPalCreateOrder}
                            onApprove={handlePayPalApprove}
                            onCancel={handlePayPalCancel}
                            onError={handlePayPalError}
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
                      onClick={() => navigate('/account/login')}
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
                  onClick={handleDirectCheckout}
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
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {orderSuccess && (() => {
        const confirmedCount = orderSuccess.qty || orderSuccess.quantity || (orderSuccess.ticketIds && orderSuccess.ticketIds.length) || activeQuantity || quantity || 1
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden p-6 sm:p-8 text-center space-y-5 relative">
              {/* Close / Cross Button - Redirects to Home */}
              <button
                type="button"
                onClick={() => navigate('/')}
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
                  <span className="text-stone-900 font-medium truncate max-w-[200px]">{event.title}</span>
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
                  onClick={() => navigate('/user/tickets')}
                  className="flex-1 py-3 px-4 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <span>View My Passes</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/user/orders')}
                  className="flex-1 py-3 px-4 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-mono font-medium hover:bg-stone-50 transition cursor-pointer"
                >
                  View Order Receipt
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
