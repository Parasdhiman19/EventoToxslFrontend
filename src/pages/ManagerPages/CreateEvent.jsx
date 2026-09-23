import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { AlertCircle, Loader2, Armchair, Users, Sparkles, ShieldCheck, Shield } from 'lucide-react'
import API from '../../services/api'
import SeatingStudio from '../../components/seating/SeatingStudio'

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
      status: 'published', // 'published' | 'draft'
    },
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
                messages.push(`${key}: ${val.map((v) => (typeof v === 'object' ? Object.values(v).flat().join(', ') : v)).join(', ')}`)
              } else if (typeof val === 'object' && val !== null) {
                const nested = Object.values(val).flat().map((v) => (typeof v === 'object' ? JSON.stringify(v) : v)).join(', ')
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
        <div className="border-b border-stone-100 pb-3">
          <h2 className="font-serif text-base font-medium text-stone-900">Stage Overview</h2>
          <p className="text-xs text-stone-500">Essential details shown across discovery and search</p>
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
            placeholder="e.g. Symphony at Twilight"
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

        {/* Category & Online Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
              Event Format
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-md border border-stone-200/80">
              <button
                type="button"
                onClick={() => formik.setFieldValue('isOnline', false)}
                className={`py-1.5 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                  !formik.values.isOnline ? 'bg-stone-900 text-stone-50 shadow-sm' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                In-Person Venue
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue('isOnline', true)}
                className={`py-1.5 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                  formik.values.isOnline ? 'bg-stone-900 text-stone-50 shadow-sm' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Virtual / Stream
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
            ) : (
              <div className="space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.22a.75.75 0 0 0-1.06 0l-1.91 1.91-4.72-4.72a.75.75 0 0 0-1.06 0L2.5 11.06Zm10-4.06a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-stone-600">
                  <label htmlFor="file-upload" className="font-medium text-stone-900 underline underline-offset-2 cursor-pointer hover:text-stone-700">
                    Upload image asset
                  </label>
                  <span> or drag and drop</span>
                </div>
                <p className="text-[10px] font-mono text-stone-400">16:9 ratio recommended (up to 5MB)</p>
                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: SCHEDULE & LOCATION */}
      <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="border-b border-stone-100 pb-3">
          <h2 className="font-serif text-base font-medium text-stone-900">Schedule &amp; Location</h2>
          <p className="text-xs text-stone-500">Date, timings, and geographic door check-in details</p>
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

        {/* Assigned Seating Studio Component */}
        {hasAssignedSeating && !formik.values.isOnline ? (
          <SeatingStudio
            onChange={(layout) => {
              setSeatingLayout(layout)
              setTierError(null)
            }}
          />
        ) : (
          /* Standard Tier List (Open Floor / Virtual Events) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">
                Define pass categories and quantity limits for open floor admission.
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
              {ticketTiers.map((tier, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md border border-stone-200/80 bg-stone-50/60 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                      Pass Tier #{index + 1}
                    </span>
                    {ticketTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer text-xs font-mono"
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
                        placeholder="e.g. Early Bird Pass"
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
                      <label className="block text-[11px] font-mono text-stone-600">Available Quantity</label>
                      <input
                        type="number"
                        min="1"
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
                      placeholder="e.g. Includes access to open floor &amp; refreshments"
                      value={tier.description}
                      onChange={(e) => updateTier(index, 'description', e.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              ))}
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
              Select members from your saved Studio Team Directory to assign them gate scanner access and check-in duties.
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
                You can save reusable crew members in Organizer Settings &gt; Team &amp; Roles, or assign staff to this event anytime after creation.
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

      {/* SECTION 5: TICKETING & CHECKOUT POLICIES */}
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

          {/* Toggle 4: Auto-Refund Cancelled Events */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5 pr-6">
              <span className="text-xs font-medium text-stone-900">Auto-Refund on Event Cancellation</span>
              <p className="text-[11px] text-stone-500">
                Automatically trigger refunds to attendees if this stage is cancelled or archived.
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

      {/* Bottom Action Panel */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <Link
          to="/manager/events"
          className="text-xs font-mono text-stone-500 hover:text-stone-900 transition-colors text-center sm:text-left py-2"
        >
          &larr; Cancel and return to overview
        </Link>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              formik.setFieldValue('status', 'draft')
              formik.handleSubmit()
            }}
            className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer text-center disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={() => formik.setFieldValue('status', 'published')}
            className="rounded-md bg-stone-900 px-5 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer text-center disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Saving Stage...
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