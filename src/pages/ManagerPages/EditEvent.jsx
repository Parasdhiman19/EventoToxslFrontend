import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { 
  ArrowLeft, Save, Trash2, AlertCircle, Loader2, Info, Armchair, Users,
  Archive, AlertTriangle, X, Shield, Lock
} from 'lucide-react'
import API from '../../services/api'
import SeatingStudio from '../../components/seating/SeatingStudio'

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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState('archive') // 'archive' | 'permanent'
  const [deleteError, setDeleteError] = useState(null)

  // Studio Staff & Assigned Crew state
  const [studioStaffList, setStudioStaffList] = useState([])
  const [selectedStaffIds, setSelectedStaffIds] = useState([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)

  const handleDeleteSubmit = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const isPermanent = deleteMode === 'permanent'
      await API.delete(`events/manager/${eventId}/?permanent=${isPermanent}`)
      navigate('/manager/events')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to delete event. Please check details and try again.'
      setDeleteError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      category: 'Music & Concerts',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      venueName: '',
      address: '',
      city: '',
      isOnline: false,
      status: 'published',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().trim().required('Event title is required'),
      category: Yup.string().required('Select a category'),
      description: Yup.string().min(20, 'Provide at least 20 characters').required('Description is required'),
      date: Yup.string().required('Event date is required'),
      startTime: Yup.string().required('Start time is required'),
      endTime: Yup.string().test('is-after-start', 'End time must be later than start time', function (value) {
        const { startTime } = this.parent
        if (startTime && value) {
          return value > startTime
        }
        return true
      }),
      venueName: Yup.string().when('isOnline', {
        is: false,
        then: (schema) => schema.required('Venue name is required for in-person events'),
      }),
      city: Yup.string().when('isOnline', {
        is: false,
        then: (schema) => schema.required('City is required for in-person events'),
      }),
    }),
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setServerError('Cover banner file size must be less than 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setBannerData(event.target.result)
        setBannerPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancelEvent = async () => {
    if (!window.confirm('Are you sure you want to archive / cancel this event?')) {
      return
    }
    setIsDeleting(true)
    try {
      await API.delete(`events/manager/${eventId}/`)
      navigate('/manager/events')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Failed to cancel event.')
    } finally {
      setIsDeleting(false)
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
            disabled={isDeleting || isLoading}
            onClick={handleCancelEvent}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-mono uppercase tracking-wider rounded-md transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} /> {isDeleting ? 'Archiving...' : 'Archive Event'}
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
        <div className="border-b border-stone-100 pb-3">
          <h2 className="font-serif text-base font-medium text-stone-900">Stage Overview</h2>
          <p className="text-xs text-stone-500">Core event information visible to ticket buyers</p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
            Event Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Midnight Jazz &amp; Vinyl Showcase"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
              formik.touched.title && formik.errors.title
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
            }`}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.title}</p>
          )}
        </div>

        {/* Category & Status & Online Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Category
            </label>
            <select
              id="category"
              name="category"
              onChange={formik.handleChange}
              value={formik.values.category}
              className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            >
              <option value="Music & Concerts">Music &amp; Concerts</option>
              <option value="Tech & Conferences">Tech &amp; Conferences</option>
              <option value="Food & Tasting">Food &amp; Tasting</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Art & Exhibitions">Art &amp; Exhibitions</option>
              <option value="Workshops">Workshops</option>
              <option value="Conference">Conference</option>
              <option value="Exhibition & Tasting">Exhibition &amp; Tasting</option>
              <option value="Club Night">Club Night</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="status" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Status
            </label>
            <select
              id="status"
              name="status"
              onChange={formik.handleChange}
              value={formik.values.status}
              className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            >
              <option value="published">Published (Live on Discover)</option>
              <option value="draft">Draft (Private)</option>
              <option value="past">Ended / Past (Archived)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Format
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-md border border-stone-200/80">
              <button
                type="button"
                onClick={() => formik.setFieldValue('isOnline', false)}
                className={`py-1.5 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                  !formik.values.isOnline ? 'bg-stone-900 text-stone-50 shadow-sm' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                In-Person
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue('isOnline', true)}
                className={`py-1.5 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                  formik.values.isOnline ? 'bg-stone-900 text-stone-50 shadow-sm' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Virtual
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
            About the Event
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the experience, line-up, special guidelines, age limits, and dress codes..."
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all leading-relaxed ${
              formik.touched.description && formik.errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
            }`}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.description}</p>
          )}
        </div>

        {/* Banner Media Upload */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
            Cover Banner Artwork
          </label>
          <div className="rounded-md border border-dashed border-stone-300 p-6 bg-stone-50/50 flex flex-col items-center justify-center text-center">
            {bannerPreview ? (
              <div className="space-y-3 w-full max-w-md">
                <img src={bannerPreview} alt="Cover Preview" className="h-44 w-full object-cover rounded border border-stone-200" />
                <div className="flex items-center justify-center gap-4">
                  <label htmlFor="file-upload-edit" className="text-xs font-mono text-stone-900 underline underline-offset-2 cursor-pointer hover:text-stone-700">
                    Replace artwork
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setBannerPreview(null)
                      setBannerData('')
                    }}
                    className="text-xs font-mono text-red-600 hover:underline cursor-pointer"
                  >
                    Remove artwork
                  </button>
                </div>
                <input id="file-upload-edit" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.22a.75.75 0 0 0-1.06 0l-1.91 1.91-4.72-4.72a.75.75 0 0 0-1.06 0L2.5 11.06Zm10-4.06a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-stone-600">
                  <label htmlFor="file-upload-edit" className="font-medium text-stone-900 underline underline-offset-2 cursor-pointer hover:text-stone-700">
                    Upload image asset
                  </label>
                  <span> or drag and drop</span>
                </div>
                <p className="text-[10px] font-mono text-stone-400">16:9 ratio recommended (up to 5MB)</p>
                <input id="file-upload-edit" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: SCHEDULE & LOCATION */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="border-b border-stone-100 pb-3">
          <h2 className="font-serif text-base font-medium text-stone-900">Schedule &amp; Location</h2>
          <p className="text-xs text-stone-500">Date, timings, and venue details</p>
        </div>

        {/* Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="date" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
              className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                formik.touched.date && formik.errors.date
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
              }`}
            />
            {formik.touched.date && formik.errors.date && (
              <p className="text-xs text-red-600 tracking-tight">{formik.errors.date}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="startTime" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Doors Open / Start
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.startTime}
              className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                formik.touched.startTime && formik.errors.startTime
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
              }`}
            />
            {formik.touched.startTime && formik.errors.startTime && (
              <p className="text-xs text-red-600 tracking-tight">{formik.errors.startTime}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="endTime" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Curfew / End (Optional)
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.endTime}
              className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                formik.touched.endTime && formik.errors.endTime
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
              }`}
            />
            {formik.touched.endTime && formik.errors.endTime && (
              <p className="text-xs text-red-600 tracking-tight">{formik.errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Physical Address Fields (Conditional) */}
        {!formik.values.isOnline && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="venueName" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Venue / Stage Name
                </label>
                <input
                  id="venueName"
                  name="venueName"
                  type="text"
                  placeholder="e.g. Grand Theatre Hall 4"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.venueName}
                  className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                    formik.touched.venueName && formik.errors.venueName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
                  }`}
                />
                {formik.touched.venueName && formik.errors.venueName && (
                  <p className="text-xs text-red-600 tracking-tight">{formik.errors.venueName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="city" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  City &amp; State
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Chandigarh, Punjab"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.city}
                  className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                    formik.touched.city && formik.errors.city
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
                  }`}
                />
                {formik.touched.city && formik.errors.city && (
                  <p className="text-xs text-red-600 tracking-tight">{formik.errors.city}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="address" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                Street Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="e.g. Sector 17 Plaza, Inner Ring Rd"
                onChange={formik.handleChange}
                value={formik.values.address}
                className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>
        )}
      </div>

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
          /* Dynamic Tier Cards */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">
                Define pass categories and capacity allocations for open floor admission.
              </span>
              <button
                type="button"
                onClick={addTier}
                className="text-xs font-mono font-medium text-stone-900 hover:underline cursor-pointer"
              >
                + Add Another Tier
              </button>
            </div>

            <div className="space-y-4">
              {ticketTiers.map((tier, index) => {
                const isSold = (tier.soldCount || tier.sold_count || 0) > 0
                const soldNum = tier.soldCount || tier.sold_count || 0

                return (
                  <div
                    key={tier.id ? `existing-${tier.id}` : `new-${index}`}
                    className="p-4 rounded-md border border-stone-200/80 bg-stone-50/60 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                          Tier #{index + 1} {tier.id ? `(ID: ${tier.id})` : '(New)'}
                        </span>
                        {isSold && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                            <Info size={11} /> {soldNum} ticket{soldNum > 1 ? 's' : ''} sold
                          </span>
                        )}
                      </div>

                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          disabled={isSold}
                          onClick={() => removeTier(index)}
                          title={isSold ? 'Cannot delete tier with sold tickets' : 'Delete Tier'}
                          className={`text-xs font-mono transition-colors ${
                            isSold
                              ? 'text-stone-300 cursor-not-allowed'
                              : 'text-stone-400 hover:text-red-600 cursor-pointer'
                          }`}
                        >
                          Delete Tier
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="block text-[11px] font-mono text-stone-600">Tier Name</label>
                        <input
                          type="text"
                          placeholder="e.g. VIP Access"
                          value={tier.name}
                          onChange={(e) => updateTier(index, 'name', e.target.value)}
                          className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-stone-600">Price (USD $)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00 for Free"
                          value={tier.price}
                          onChange={(e) => updateTier(index, 'price', e.target.value)}
                          className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-stone-600">
                          Total Capacity {isSold && `(Min: ${soldNum})`}
                        </label>
                        <input
                          type="number"
                          min={isSold ? soldNum : 1}
                          placeholder="e.g. 150"
                          value={tier.capacity}
                          onChange={(e) => updateTier(index, 'capacity', e.target.value)}
                          className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-stone-600">Perks / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Includes 2 complimentary drinks and backstage lanyard"
                        value={tier.description}
                        onChange={(e) => updateTier(index, 'description', e.target.value)}
                        className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Operational Staff & Gate Crew Card */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif text-base text-stone-900 flex items-center gap-2">
              <Users size={16} className="text-stone-700" />
              <span>Operational Staff &amp; Gate Crew</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select members from your saved Studio Team Directory to assign them gate scanner access and check-in duties for this event.
            </p>
          </div>
          {studioStaffList.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() =>
                  setSelectedStaffIds(
                    studioStaffList
                      .map((s) => s.userId || s.user_id || (typeof s.user === 'number' ? s.user : s.user?.id))
                      .filter((id) => typeof id === 'number' && Number.isInteger(id))
                  )
                }
                className="text-stone-700 hover:text-stone-900 underline cursor-pointer text-[11px]"
              >
                Select All ({studioStaffList.length})
              </button>
              <span className="text-stone-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedStaffIds([])}
                className="text-stone-400 hover:text-stone-600 cursor-pointer text-[11px]"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {isLoadingStaff ? (
          <div className="py-6 flex items-center justify-center gap-2 text-stone-400 font-mono text-xs">
            <Loader2 size={16} className="animate-spin" /> Loading studio team...
          </div>
        ) : studioStaffList.length === 0 ? (
          <div className="py-5 px-4 rounded-lg bg-stone-50 border border-stone-200/60 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-stone-800">No saved Studio Team members found</p>
              <p className="text-stone-500 text-[11px] mt-0.5">
                You can save reusable crew members in Organizer Settings &gt; Team &amp; Roles, or manage assigned staff in the Event Dashboard.
              </p>
            </div>
            <Link
              to="/manager/settings"
              target="_blank"
              className="text-stone-900 font-mono text-[11px] underline shrink-0 hover:text-stone-700 cursor-pointer"
            >
              Open Settings &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studioStaffList.map((member) => {
              const staffUid = member.userId || member.user_id || (typeof member.user === 'number' ? member.user : member.user?.id)
              const isSelected = staffUid ? selectedStaffIds.includes(staffUid) : false
              const canView = member.defaultCanViewAttendees ?? member.default_can_view_attendees
              const canCheck = member.defaultCanCheckIn ?? member.default_can_check_in
              const canEdit = member.defaultCanEditAttendees ?? member.default_can_edit_attendees
              const rawName = member.fullName || member.full_name || member.name
              const displayName = (rawName && rawName.trim() && rawName !== member.email)
                ? rawName.trim()
                : (member.username || (member.email ? member.email.split('@')[0] : 'Staff'))

              return (
                <div
                  key={member.id}
                  onClick={() => {
                    if (!staffUid) return
                    if (isSelected) {
                      setSelectedStaffIds((prev) => prev.filter((id) => id !== staffUid))
                    } else {
                      setSelectedStaffIds((prev) => [...prev, staffUid])
                    }
                  }}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent onClick
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{displayName}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            isSelected
                              ? 'bg-stone-800 text-stone-200 border-stone-700'
                              : 'bg-white text-stone-600 border-stone-200'
                          }`}
                        >
                          {member.roleTitle || member.role_title || 'Staff'}
                        </span>
                      </div>
                      <div className={`text-[11px] font-mono ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 shrink-0 text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        canView
                          ? isSelected
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-stone-400 line-through'
                      }`}
                    >
                      View
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        canCheck
                          ? isSelected
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-stone-400 line-through'
                      }`}
                    >
                      Check-in
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        canEdit
                          ? isSelected
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-stone-400 line-through'
                      }`}
                    >
                      Edit
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 5: TICKETING & CHECKOUT POLICIES (LOCKED AT CREATION) */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif text-base text-stone-900 flex items-center gap-2">
              <Shield size={16} className="text-stone-700" />
              <span>Ticketing &amp; Checkout Policies</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Snapshot of ticketing, checkout fee, and door admission rules established at stage creation.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-medium self-start sm:self-auto flex items-center gap-1.5">
            <Lock size={11} className="text-stone-500" />
            <span>Locked at Creation</span>
          </span>
        </div>

        {/* Lock Information Notice */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5 text-xs text-stone-600">
          <Info size={15} className="text-stone-500 shrink-0 mt-0.5" />
          <span>
            Ticketing and checkout policies are immutable on created stages to protect buyer purchase terms, platform fee consistency, and accounting ledgers.
          </span>
        </div>

        <div className="space-y-3.5 divide-y divide-stone-100">
          {/* Policy 1: Pass Platform Fee */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Pass Platform Fee (3.5%) to Buyer</span>
              <p className="text-[11px] text-stone-500">
                {ticketingPolicies.passPlatformFeeToBuyer
                  ? '3.5% fee is added at checkout to the ticket price paid by the buyer.'
                  : 'Platform fee is absorbed by the host and deducted from gross ticket payouts.'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border shrink-0 inline-flex items-center gap-1 ${
                ticketingPolicies.passPlatformFeeToBuyer
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              <Lock size={10} className="opacity-60" />
              <span>{ticketingPolicies.passPlatformFeeToBuyer ? 'Buyer Pays' : 'Host Absorbs'}</span>
            </span>
          </div>

          {/* Policy 2: Allow Ticket Transfers */}
          <div className="flex items-center justify-between pt-3.5">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Attendee Ticket Transfers</span>
              <p className="text-[11px] text-stone-500">
                {ticketingPolicies.allowTicketTransfers
                  ? 'Buyers can securely reassign their digital passes to another attendee.'
                  : 'Ticket transfers are restricted; original buyer must attend.'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border shrink-0 inline-flex items-center gap-1 ${
                ticketingPolicies.allowTicketTransfers
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              <Lock size={10} className="opacity-60" />
              <span>{ticketingPolicies.allowTicketTransfers ? 'Enabled' : 'Disabled'}</span>
            </span>
          </div>

          {/* Policy 3: Mandatory Phone Number */}
          <div className="flex items-center justify-between pt-3.5">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Attendee Phone Number at Checkout</span>
              <p className="text-[11px] text-stone-500">
                {ticketingPolicies.requireAttendeePhone
                  ? 'Mobile phone numbers are collected from attendees during checkout.'
                  : 'Phone numbers are optional during checkout.'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border shrink-0 inline-flex items-center gap-1 ${
                ticketingPolicies.requireAttendeePhone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              <Lock size={10} className="opacity-60" />
              <span>{ticketingPolicies.requireAttendeePhone ? 'Mandatory' : 'Optional'}</span>
            </span>
          </div>

          {/* Policy 4: Auto-Refund Cancelled Events */}
          <div className="flex items-center justify-between pt-3.5">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Auto-Refund on Event Cancellation</span>
              <p className="text-[11px] text-stone-500">
                {ticketingPolicies.autoRefundCancelledEvents
                  ? 'Automatic refunds are initiated to attendees if this stage is cancelled.'
                  : 'Refunds must be processed manually upon stage cancellation.'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border shrink-0 inline-flex items-center gap-1 ${
                ticketingPolicies.autoRefundCancelledEvents
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              <Lock size={10} className="opacity-60" />
              <span>{ticketingPolicies.autoRefundCancelledEvents ? 'Automated' : 'Manual'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6. Danger Zone Card */}
      <div className="rounded-lg border border-red-200 bg-red-50/20 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-base text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span>Danger Zone</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Archive this event to close bookings and mark it as ended, or permanently erase it from your studio portfolio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null)
              setDeleteMode('archive')
              setIsDeleteModalOpen(true)
            }}
            className="px-4 py-2 rounded-lg border border-red-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-400 font-mono text-xs font-medium transition cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 size={13} />
            <span>Delete / Archive Event</span>
          </button>
        </div>
      </div>

      {/* Bottom Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to={`/manager/events/${eventId}`}
          className="px-4 py-2 border border-stone-300 text-xs font-mono uppercase tracking-wider text-stone-600 rounded-md hover:border-stone-400 transition"
        >
          Discard
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-mono uppercase tracking-wider rounded-md transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save size={13} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DELETE / ARCHIVE EVENT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-stone-900">
                    Delete or Archive Stage
                  </h3>
                  <p className="text-[11px] font-mono text-stone-400">
                    EV-{eventId} • {formik.values.title || 'Untitled Stage'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {deleteError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-xs text-stone-600">
                Please select how you would like to handle this stage:
              </p>

              {/* Mode Selection Cards */}
              <div className="space-y-2.5">
                {/* Option 1: Archive (Recommended) */}
                <div
                  onClick={() => setDeleteMode('archive')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    deleteMode === 'archive'
                      ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="deleteModeEdit"
                      checked={deleteMode === 'archive'}
                      onChange={() => setDeleteMode('archive')}
                      className="text-stone-900 focus:ring-stone-900 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900">Archive Stage (Recommended)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Safe
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Ends ticket sales immediately and sets status to Ended. Preserves all attendee check-in records, past bookings, and financial transaction histories.
                    </p>
                  </div>
                </div>

                {/* Option 2: Permanent Delete */}
                <div
                  onClick={() => setDeleteMode('permanent')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    deleteMode === 'permanent'
                      ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="deleteModeEdit"
                      checked={deleteMode === 'permanent'}
                      onChange={() => setDeleteMode('permanent')}
                      className="text-red-600 focus:ring-red-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-700">Permanently Erase Stage</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">
                        Destructive
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Permanently erases the stage, tier quotas, and assigned gate roster from the database. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-mono text-stone-600 hover:text-stone-900 transition rounded-xl border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className={`px-4 py-2 text-xs font-mono font-medium text-white transition rounded-xl shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  deleteMode === 'permanent'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-stone-900 hover:bg-stone-800'
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : deleteMode === 'permanent' ? (
                  <>
                    <Trash2 size={13} />
                    <span>Permanently Delete</span>
                  </>
                ) : (
                  <>
                    <Archive size={13} />
                    <span>Archive Stage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}