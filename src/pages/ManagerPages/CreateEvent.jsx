import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { AlertCircle, Loader2, Armchair, Users } from 'lucide-react'
import API from '../../services/api'
import SeatingStudio from '../../components/seating/SeatingStudio'
import {
  eventValidationSchema,
  defaultEventInitialValues,
  EventFormOverviewSection,
  EventFormScheduleVenueSection,
  EventBannerUploader,
  EventTicketingPoliciesSection,
  EventStaffAssignmentSection,
  EventFlatTierEditor,
} from '../../components/events'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [bannerPreview, setBannerPreview] = useState(null)
  const [bannerData, setBannerData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  // Studio Staff Directory Roster state
  const [studioStaffList, setStudioStaffList] = useState([])
  const [selectedStaffIds, setSelectedStaffIds] = useState([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)

  // Assigned Seating Layout state
  const [hasAssignedSeating, setHasAssignedSeating] = useState(true)
  const [seatingLayout, setSeatingLayout] = useState(null)

  // Ticketing & Checkout Policies state (Pre-populated from studio defaults)
  const [ticketingPolicies, setTicketingPolicies] = useState({
    passPlatformFeeToBuyer: true,
    allowTicketTransfers: true,
    requireAttendeePhone: true,
    autoRefundCancelledEvents: true,
  })

  // Fallback flat ticket tiers state (for open floor / general admission)
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: '35.00', capacity: '100', description: 'Standard stage entry pass' },
    { name: 'VIP Pass', price: '75.00', capacity: '30', description: 'Priority lane access + lounge entry' },
  ])
  const [tierError, setTierError] = useState(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingStaff(true)
      try {
        const [staffRes, settingsRes] = await Promise.allSettled([
          API.get('auth/studio-staff/'),
          API.get('auth/settings/'),
        ])
        if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value.data)) {
          setStudioStaffList(staffRes.value.data)
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.profile) {
          const profile = settingsRes.value.data.profile
          setTicketingPolicies({
            passPlatformFeeToBuyer: profile.passPlatformFeeToBuyer ?? profile.pass_platform_fee_to_buyer ?? true,
            allowTicketTransfers: profile.allowTicketTransfers ?? profile.allow_ticket_transfers ?? true,
            requireAttendeePhone: profile.requireAttendeePhone ?? profile.require_attendee_phone ?? true,
            autoRefundCancelledEvents: profile.autoRefundCancelledEvents ?? profile.auto_refund_cancelled_events ?? true,
          })
        }
      } catch (err) {
        console.error('Failed to load initial studio data:', err)
      } finally {
        setIsLoadingStaff(false)
      }
    }
    fetchInitialData()
  }, [])

  const formik = useFormik({
    initialValues: defaultEventInitialValues,
    validationSchema: eventValidationSchema,
    onSubmit: async (values) => {
      // Validate seating or tiers
      if (hasAssignedSeating && !values.isOnline) {
        if (!seatingLayout || !seatingLayout.grid || seatingLayout.grid.length === 0) {
          setTierError('Please design a seating layout with at least one active seat.')
          return
        }
      } else {
        if (!ticketTiers || ticketTiers.length === 0) {
          setTierError('Please add at least one ticket tier.')
          return
        }
        for (let i = 0; i < ticketTiers.length; i++) {
          const t = ticketTiers[i]
          if (!t.name || !t.name.trim()) {
            setTierError(`Tier #${i + 1} must have a valid name.`)
            return
          }
          if (t.capacity === '' || parseInt(t.capacity, 10) <= 0) {
            setTierError(`Tier #${i + 1} must have a positive available capacity.`)
            return
          }
        }
      }

      setTierError(null)
      setIsLoading(true)
      setServerError(null)

      try {
        const cleanStaffIds = selectedStaffIds.filter((id) => typeof id === 'number' && Number.isInteger(id))
        const payload = {
          title: values.title.trim(),
          category: values.category,
          description: values.description.trim(),
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime || null,
          venueName: values.isOnline ? 'Virtual Stream' : (values.venueName || '').trim(),
          city: values.isOnline ? 'Online' : (values.city || '').trim(),
          address: values.isOnline ? '' : (values.address || '').trim(),
          isOnline: Boolean(values.isOnline),
          status: values.status || 'published',
          banner: bannerData || bannerPreview || '',
          hasAssignedSeating: Boolean(hasAssignedSeating && !values.isOnline),
          assignedStaffIds: cleanStaffIds,
          passPlatformFeeToBuyer: ticketingPolicies.passPlatformFeeToBuyer,
          allowTicketTransfers: ticketingPolicies.allowTicketTransfers,
          requireAttendeePhone: ticketingPolicies.requireAttendeePhone,
          autoRefundCancelledEvents: ticketingPolicies.autoRefundCancelledEvents,
        }

        if (hasAssignedSeating && !values.isOnline && seatingLayout) {
          payload.seatingLayout = seatingLayout
        } else {
          payload.tiers = ticketTiers.map((tier) => ({
            name: tier.name.trim() || 'General Admission',
            price: Math.max(0, parseFloat(tier.price) || 0),
            capacity: Math.max(1, parseInt(tier.capacity, 10) || 100),
            description: (tier.description || '').trim(),
          }))
        }

        const res = await API.post('events/manager/', payload)
        navigate(`/manager/events/${res.data.id}`)
      } catch (err) {
        const errData = err.response?.data
        const status = err.response?.status
        let msg = 'Failed to create event. Please verify details and try again.'

        if (status === 401) {
          msg = 'Your session has expired or you are not signed in. Please log in again.'
        } else if (status === 403) {
          msg = 'You must have an Organizer account to host events. Please activate your organizer profile in Settings.'
        } else if (errData) {
          if (typeof errData === 'string') {
            msg = errData
          } else if (errData.detail) {
            msg = errData.detail
          } else if (errData.message) {
            msg = errData.message
          } else if (errData.title) {
            msg = Array.isArray(errData.title) ? errData.title[0] : errData.title
            formik.setFieldError('title', msg)
          } else {
            const messages = []
            for (const [key, val] of Object.entries(errData)) {
              if (typeof val === 'string') {
                messages.push(`${key}: ${val}`)
              } else if (Array.isArray(val)) {
                messages.push(
                  `${key}: ${val
                    .map((v) => (typeof v === 'object' ? Object.values(v).flat().join(', ') : v))
                    .join(', ')}`
                )
              } else if (typeof val === 'object' && val !== null) {
                const nested = Object.values(val)
                  .flat()
                  .map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))
                  .join(', ')
                messages.push(`${key}: ${nested}`)
              }
            }
            if (messages.length > 0) {
              msg = messages.join(' | ')
            }
          }
        }
        setServerError(msg)
      } finally {
        setIsLoading(false)
      }
    },
  })

  const addTier = () => {
    setTierError(null)
    setTicketTiers((prev) => [
      ...prev,
      { name: '', price: '0.00', capacity: '100', description: '' },
    ])
  }

  const removeTier = (index) => {
    if (ticketTiers.length <= 1) return
    setTierError(null)
    setTicketTiers((prev) => prev.filter((_, idx) => idx !== index))
  }

  const updateTier = (index, field, value) => {
    setTierError(null)
    setTicketTiers((prev) => {
      const updated = [...prev]
      updated[index][field] = value
      return updated
    })
  }

  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setServerError('Cover banner file size must be less than 10MB.')
        return
      }
      setBannerPreview(URL.createObjectURL(file))
      setIsUploadingBanner(true)
      setServerError(null)

      try {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('folder', 'banners')

        const res = await API.post('events/upload/image/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const uploadedUrl = res.data.url || res.data.secure_url
        setBannerData(uploadedUrl)
        setBannerPreview(uploadedUrl)
      } catch (err) {
        console.error('Failed to upload banner to Cloudinary:', err)
        setServerError(err.response?.data?.detail || 'Failed to upload banner image. Please try again.')
      } finally {
        setIsUploadingBanner(false)
      }
    }
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-400 mb-1">
            <Link to="/manager/events" className="hover:text-stone-700 transition-colors">
              Events
            </Link>
            <span>/</span>
            <span>New Stage</span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Host New Event
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Set event logistics, design interactive venue seating layouts, and publish your stage live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              formik.setFieldValue('status', 'draft')
              formik.handleSubmit()
            }}
            className="rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading && formik.values.status === 'draft' ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Saving...
              </span>
            ) : (
              'Save as Draft'
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => formik.setFieldValue('status', 'published')}
            className="rounded-md bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading && formik.values.status === 'published' ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Publishing...
              </span>
            ) : (
              'Publish Live Stage \u2192'
            )}
          </button>
        </div>
      </div>

      {/* Global Server Error Banner */}
      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error saving event</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* SECTION 1: EVENT DETAILS */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
        <EventFormOverviewSection formik={formik} />
        <EventBannerUploader
          bannerPreview={bannerPreview}
          onImageChange={handleImageChange}
          onRemoveImage={() => {
            setBannerPreview(null)
            setBannerData('')
          }}
        />
      </div>

      {/* SECTION 2: SCHEDULE & LOCATION */}
      <EventFormScheduleVenueSection formik={formik} />

      {/* SECTION 3: VENUE SEATING STUDIO & PASSES */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-base font-medium text-stone-900">Seating &amp; Ticketing Architecture</h2>
            <p className="text-xs text-stone-500">Configure visual seat plans, tier pricing, and capacity allocations</p>
          </div>

          {!formik.values.isOnline && (
            <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-lg border border-stone-200/80">
              <button
                type="button"
                onClick={() => setHasAssignedSeating(true)}
                className={`py-1 px-3 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition cursor-pointer ${
                  hasAssignedSeating
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Armchair size={13} />
                <span>Assigned Seating Plan</span>
              </button>
              <button
                type="button"
                onClick={() => setHasAssignedSeating(false)}
                className={`py-1 px-3 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition cursor-pointer ${
                  !hasAssignedSeating
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users size={13} />
                <span>Open Floor / GA Only</span>
              </button>
            </div>
          )}
        </div>

        {tierError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 font-mono">
            {tierError}
          </div>
        )}

        {hasAssignedSeating && !formik.values.isOnline ? (
          <SeatingStudio
            onChange={(layout) => {
              setSeatingLayout(layout)
              setTierError(null)
            }}
          />
        ) : (
          <EventFlatTierEditor
            ticketTiers={ticketTiers}
            addTier={addTier}
            removeTier={removeTier}
            updateTier={updateTier}
          />
        )}
      </div>

      {/* SECTION 4: OPERATIONAL STAFF & GATE CREW */}
      <EventStaffAssignmentSection
        studioStaffList={studioStaffList}
        selectedStaffIds={selectedStaffIds}
        setSelectedStaffIds={setSelectedStaffIds}
        isLoadingStaff={isLoadingStaff}
      />

      {/* SECTION 5: TICKETING & CHECKOUT POLICIES */}
      <EventTicketingPoliciesSection
        ticketingPolicies={ticketingPolicies}
        setTicketingPolicies={setTicketingPolicies}
      />

      {/* Bottom Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
        <Link
          to="/manager/events"
          className="text-xs font-mono text-stone-500 hover:text-stone-800 transition-colors"
        >
          &larr; Back to Events
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              formik.setFieldValue('status', 'draft')
              formik.handleSubmit()
            }}
            className="w-full sm:w-auto rounded-md border border-stone-300 bg-white px-4 py-2.5 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading && formik.values.status === 'draft' ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Saving...
              </span>
            ) : (
              'Save as Draft'
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => formik.setFieldValue('status', 'published')}
            className="w-full sm:w-auto rounded-md bg-stone-900 px-5 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading && formik.values.status === 'published' ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Publishing...
              </span>
            ) : (
              'Publish Live Stage \u2192'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}