import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Loader2,
  Armchair,
  Users,
} from 'lucide-react'
import API from '../../services/api'
import SeatingStudio from '../../components/seating/SeatingStudio'
import DeleteArchiveEventModal from '../../components/modals/DeleteArchiveEventModal'
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

export default function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [bannerData, setBannerData] = useState('')
  const [hasAssignedSeating, setHasAssignedSeating] = useState(true)
  const [seatingLayout, setSeatingLayout] = useState(null)
  const [ticketTiers, setTicketTiers] = useState([])
  const [tierError, setTierError] = useState(null)

  // Ticketing & Checkout Policies state
  const [ticketingPolicies, setTicketingPolicies] = useState({
    passPlatformFeeToBuyer: true,
    allowTicketTransfers: true,
    requireAttendeePhone: true,
    autoRefundCancelledEvents: true,
  })

  // Delete / Archive Event Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Studio Staff & Assigned Crew state
  const [studioStaffList, setStudioStaffList] = useState([])
  const [selectedStaffIds, setSelectedStaffIds] = useState([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)

  const formik = useFormik({
    initialValues: defaultEventInitialValues,
    enableReinitialize: true,
    validationSchema: eventValidationSchema,
    onSubmit: async (values) => {
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
          const cap = parseInt(t.capacity, 10)
          const sold = t.soldCount || t.sold_count || 0
          if (isNaN(cap) || cap <= 0) {
            setTierError(`Tier #${i + 1} must have a positive available capacity.`)
            return
          }
          if (cap < sold) {
            setTierError(`Tier '${t.name}' capacity cannot be less than tickets already sold (${sold}).`)
            return
          }
        }
      }

      setTierError(null)
      setIsLoading(true)
      setServerError(null)

      try {
        const cleanStaffIds = selectedStaffIds
          .map((id) => (typeof id === 'object' && id !== null ? id.userId || id.user_id || id.user || id.id : id))
          .filter((id) => typeof id === 'number' && Number.isInteger(id))

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
            id: tier.id || undefined,
            name: tier.name.trim() || 'General Admission',
            price: Math.max(0, parseFloat(tier.price) || 0),
            capacity: Math.max(1, parseInt(tier.capacity, 10) || 100),
            description: (tier.description || '').trim(),
          }))
        }

        await API.patch(`events/manager/${eventId}/`, payload)
        navigate(`/manager/events/${eventId}`)
      } catch (err) {
        const errData = err.response?.data
        const status = err.response?.status
        let msg = 'Failed to update event. Please check details and try again.'

        if (status === 401) {
          msg = 'Your session has expired or you are not signed in. Please log in again.'
        } else if (status === 403) {
          msg = 'You must have an Organizer account to edit events. Please activate your organizer profile in Settings.'
        } else if (errData) {
          if (typeof errData === 'string') {
            msg = errData
          } else if (errData.detail) {
            msg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail)
          } else if (errData.message) {
            msg = typeof errData.message === 'string' ? errData.message : JSON.stringify(errData.message)
          } else if (errData.title) {
            msg = Array.isArray(errData.title) ? errData.title[0] : errData.title
            formik.setFieldError('title', msg)
          } else {
            const firstKey = Object.keys(errData)[0]
            if (firstKey) {
              const val = errData[firstKey]
              if (typeof val === 'string') {
                msg = `${firstKey}: ${val}`
              } else if (Array.isArray(val)) {
                const firstItem = val[0]
                msg = typeof firstItem === 'string' ? `${firstKey}: ${firstItem}` : `${firstKey}: ${JSON.stringify(firstItem)}`
              } else if (typeof val === 'object' && val !== null) {
                const nestedKey = Object.keys(val)[0]
                const nestedVal = val[nestedKey]
                if (Array.isArray(nestedVal)) {
                  msg = `${firstKey} (${nestedKey}): ${nestedVal[0]}`
                } else if (typeof nestedVal === 'string') {
                  msg = `${firstKey} (${nestedKey}): ${nestedVal}`
                } else {
                  msg = `${firstKey}: ${JSON.stringify(val)}`
                }
              } else {
                msg = `${firstKey}: ${String(val)}`
              }
            }
          }
        }
        setServerError(msg)
      } finally {
        setIsLoading(false)
      }
    },
  })

  // Load Event Details, Studio Team Directory, and Assigned Event Staff
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setIsFetching(true)
      setIsLoadingStaff(true)
      setFetchError(null)
      try {
        const [eventRes, studioStaffRes, eventStaffRes] = await Promise.allSettled([
          API.get(`events/manager/${eventId}/`),
          API.get('auth/studio-staff/'),
          API.get(`events/manager/${eventId}/staff/`),
        ])

        if (eventRes.status === 'fulfilled') {
          const data = eventRes.value.data
          if (isMounted) {
            formik.setValues({
              title: data.title || '',
              category: data.category || 'Music & Concerts',
              description: data.description || '',
              date: data.date ? (typeof data.date === 'string' && data.date.includes('T') ? data.date.split('T')[0] : data.date) : '',
              startTime: data.startTime || (data.start_time ? data.start_time.slice(0, 5) : ''),
              endTime: data.endTime || (data.end_time ? data.end_time.slice(0, 5) : ''),
              venueName: data.venueName || data.venue_name || '',
              address: data.address || '',
              city: data.city || '',
              isOnline: Boolean(data.is_online),
              status: data.status || 'published',
            })
            if (data.image || data.banner || data.banner_image) {
              setBannerPreview(data.image || data.banner || data.banner_image)
            }
            setHasAssignedSeating(data.has_assigned_seating ?? data.hasAssignedSeating ?? true)
            if (data.seating_layout || data.seatingLayout) {
              setSeatingLayout(data.seating_layout || data.seatingLayout)
            }
            setTicketingPolicies({
              passPlatformFeeToBuyer: data.passPlatformFeeToBuyer ?? data.pass_platform_fee_to_buyer ?? true,
              allowTicketTransfers: data.allowTicketTransfers ?? data.allow_ticket_transfers ?? true,
              requireAttendeePhone: data.requireAttendeePhone ?? data.require_attendee_phone ?? true,
              autoRefundCancelledEvents: data.autoRefundCancelledEvents ?? data.auto_refund_cancelled_events ?? true,
            })
            if (data.tiers && Array.isArray(data.tiers)) {
              setTicketTiers(
                data.tiers.map((t) => ({
                  id: t.id,
                  name: t.name || t.tierName || 'General Admission',
                  price: t.price ? String(t.price).replace('$', '') : '0.00',
                  capacity: String(t.capacity || 100),
                  soldCount: t.soldCount || t.sold_count || 0,
                  description: t.description || '',
                }))
              )
            }
          }
        } else {
          if (isMounted) {
            setFetchError(eventRes.reason?.response?.data?.detail || 'Event not found or access denied.')
          }
        }

        if (studioStaffRes.status === 'fulfilled' && isMounted && Array.isArray(studioStaffRes.value.data)) {
          setStudioStaffList(studioStaffRes.value.data)
        }

        if (eventStaffRes.status === 'fulfilled' && isMounted && Array.isArray(eventStaffRes.value.data)) {
          const assignedIds = eventStaffRes.value.data
            .map((s) => s.userId || s.user_id || (typeof s.user === 'number' ? s.user : s.user?.id))
            .filter((id) => typeof id === 'number' && Number.isInteger(id))
          setSelectedStaffIds(assignedIds)
        }
      } catch (err) {
        if (isMounted) {
          setFetchError('Failed to load event information.')
        }
      } finally {
        if (isMounted) {
          setIsFetching(false)
          setIsLoadingStaff(false)
        }
      }
    }

    if (eventId) {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [eventId])

  const addTier = () => {
    setTierError(null)
    setTicketTiers((prev) => [
      ...prev,
      { name: '', price: '0.00', capacity: '100', soldCount: 0, description: '' },
    ])
  }

  const removeTier = (index) => {
    const targetTier = ticketTiers[index]
    if (targetTier && (targetTier.soldCount > 0 || targetTier.sold_count > 0)) {
      setTierError(`Cannot delete tier '${targetTier.name}' because it already has sold tickets.`)
      return
    }
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

  if (isFetching) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="animate-spin text-stone-500" />
        <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Loading event details...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <p className="font-semibold">{fetchError}</p>
        </div>
        <Link
          to="/manager/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 text-xs font-mono rounded hover:bg-stone-800 transition"
        >
          <ArrowLeft size={14} /> Return to My Events
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <Link
            to={`/manager/events/${eventId}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-stone-500 hover:text-stone-950 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Event Dashboard
          </Link>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Edit Event Details
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Update stage schedules, location details, status, and venue seating architecture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-mono uppercase tracking-wider rounded-md transition cursor-pointer"
          >
            <Trash2 size={13} /> Delete / Archive
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-mono uppercase tracking-wider rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={13} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Server Error Banner */}
      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error saving changes</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* SECTION 1: BASIC INFORMATION */}
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

      {/* SECTION 3: VENUE SEATING & PASS TIERS */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-base font-medium text-stone-900">Seating &amp; Ticketing Architecture</h2>
            <p className="text-xs text-stone-500">Configure passes, pricing, and visual seat layouts</p>
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

        {/* Assigned Seating Studio */}
        {hasAssignedSeating && !formik.values.isOnline ? (
          <SeatingStudio
            initialLayout={seatingLayout}
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
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-mono uppercase tracking-wider rounded-md transition cursor-pointer"
        >
          <Trash2 size={13} /> Delete / Archive
        </button>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link
            to="/manager/events"
            className="text-xs font-mono text-stone-500 hover:text-stone-800 transition-colors px-3 py-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-mono uppercase tracking-wider rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={13} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delete / Archive Event Modal */}
      <DeleteArchiveEventModal
        isOpen={isDeleteModalOpen}
        event={{ id: eventId, title: formik.values.title || 'Untitled Stage' }}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => navigate('/manager/events')}
      />
    </form>
  )
}