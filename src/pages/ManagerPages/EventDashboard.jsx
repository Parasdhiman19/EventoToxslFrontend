import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, ExternalLink, Edit3, 
  TrendingUp, Calendar, MapPin, 
  AlertCircle, Loader2, DollarSign, Users, Ticket, Tag,
  UserPlus, ShieldCheck, Trash2, Check, X, Search, Shield, QrCode,
  Layers, CheckSquare, Square, Archive, AlertTriangle
} from 'lucide-react'
import API from '../../services/api'

export default function EventDashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Active sub-tab: 'overview' | 'staff'
  const [activeTab, setActiveTab] = useState('overview')

  // Delete / Archive Event Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState('archive') // 'archive' | 'permanent'
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleDeleteSubmit = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const isPermanent = deleteMode === 'permanent'
      await API.delete(`events/manager/${eventId}/?permanent=${isPermanent}`)
      navigate('/manager/events')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to delete event. Please try again.'
      setDeleteError(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Staff State
  const [staffList, setStaffList] = useState([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [staffActionLoadingId, setStaffActionLoadingId] = useState(null)
  
  // Add Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [assignModalTab, setAssignModalTab] = useState('studio') // 'studio' | 'search'
  const [studioStaffList, setStudioStaffList] = useState([])
  const [isLoadingStudioStaff, setIsLoadingStudioStaff] = useState(false)
  const [selectedStudioStaffIds, setSelectedStudioStaffIds] = useState([])
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newStaffRoleTitle, setNewStaffRoleTitle] = useState('Stage Coordinator')
  const [saveToStudio, setSaveToStudio] = useState(true)
  const [newStaffPermissions, setNewStaffPermissions] = useState({
    canViewAttendees: true,
    canCheckIn: true,
    canEditAttendees: false,
  })
  const [addStaffError, setAddStaffError] = useState(null)
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false)

  const fetchEvent = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await API.get(`events/manager/${eventId}/`)
      setEvent(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Event not found or access denied.')
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  const fetchStaff = useCallback(async () => {
    setIsLoadingStaff(true)
    try {
      const res = await API.get(`events/manager/${eventId}/staff/`)
      if (Array.isArray(res.data)) {
        setStaffList(res.data)
      }
    } catch (err) {
      console.error('Failed to load event staff roster:', err)
    } finally {
      setIsLoadingStaff(false)
    }
  }, [eventId])

  const fetchStudioStaff = useCallback(async () => {
    setIsLoadingStudioStaff(true)
    try {
      const res = await API.get('auth/studio-staff/')
      if (Array.isArray(res.data)) {
        setStudioStaffList(res.data)
      }
    } catch (err) {
      console.error('Failed to load studio staff directory:', err)
    } finally {
      setIsLoadingStudioStaff(false)
    }
  }, [])

  useEffect(() => {
    if (eventId) {
      fetchEvent()
      fetchStaff()
    }
  }, [eventId, fetchEvent, fetchStaff])

  const handleOpenAddStaffModal = () => {
    setAddStaffError(null)
    setSelectedUser(null)
    setSearchUserQuery('')
    setSelectedStudioStaffIds([])
    setNewStaffRoleTitle('Stage Coordinator')
    setSaveToStudio(true)
    setAssignModalTab('studio')
    setIsAddStaffOpen(true)
    fetchStudioStaff()
  }

  // Search users to add as staff
  useEffect(() => {
    let active = true
    const searchUsers = async () => {
      if (searchUserQuery.trim().length < 2) {
        setSearchResults([])
        return
      }
      setIsSearchingUsers(true)
      try {
        const res = await API.get(`events/manager/staff/users/search/?q=${encodeURIComponent(searchUserQuery.trim())}`)
        if (active && Array.isArray(res.data)) {
          setSearchResults(res.data)
        }
      } catch (err) {
        if (active) setSearchResults([])
      } finally {
        if (active) setIsSearchingUsers(false)
      }
    }

    const timer = setTimeout(searchUsers, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [searchUserQuery])

  // Bulk Assign selected Studio Staff
  const handleBulkAssignStudioStaff = async () => {
    const cleanIds = selectedStudioStaffIds
      .map((id) => (typeof id === 'object' && id !== null ? id.userId || id.user_id || id.user || id.id : id))
      .filter((id) => typeof id === 'number' && Number.isInteger(id))

    if (cleanIds.length === 0) {
      setAddStaffError('Please select at least one staff member from your studio team.')
      return
    }

    setIsSubmittingStaff(true)
    setAddStaffError(null)

    try {
      const res = await API.post(`events/manager/${eventId}/staff/bulk-assign/`, {
        staffUserIds: cleanIds,
      })
      if (Array.isArray(res.data)) {
        setStaffList(res.data)
      } else {
        await fetchStaff()
      }
      setIsAddStaffOpen(false)
      setSelectedStudioStaffIds([])
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Could not assign studio staff members.'
      setAddStaffError(msg)
    } finally {
      setIsSubmittingStaff(false)
    }
  }

  // Handle Add Staff Submit (Single user search)
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUser) {
      setAddStaffError('Please select a registered user to assign.')
      return
    }

    setIsSubmittingStaff(true)
    setAddStaffError(null)

    try {
      const payload = {
        userId: selectedUser.id,
        roleTitle: newStaffRoleTitle.trim() || 'Stage Coordinator',
        canViewAttendees: newStaffPermissions.canViewAttendees,
        canCheckIn: newStaffPermissions.canCheckIn,
        canEditAttendees: newStaffPermissions.canEditAttendees,
        saveToStudio: saveToStudio,
      }
      const res = await API.post(`events/manager/${eventId}/staff/`, payload)
      setStaffList((prev) => [res.data, ...prev.filter((s) => s.id !== res.data.id)])
      setIsAddStaffOpen(false)
      setSelectedUser(null)
      setSearchUserQuery('')
      setNewStaffPermissions({ canViewAttendees: true, canCheckIn: true, canEditAttendees: false })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Could not assign staff member.'
      setAddStaffError(msg)
    } finally {
      setIsSubmittingStaff(false)
    }
  }

  // Toggle permission for existing staff
  const handleTogglePermission = async (staffId, permKey, currentValue) => {
    setStaffActionLoadingId(staffId)
    try {
      const updatedValue = !currentValue
      const payload = { [permKey]: updatedValue }
      const res = await API.patch(`events/manager/${eventId}/staff/${staffId}/`, payload)

      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? res.data : s))
      )
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update staff permissions.')
    } finally {
      setStaffActionLoadingId(null)
    }
  }

  // Remove staff member
  const handleRemoveStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to remove ${staffName} from this event's staff team?`)) {
      return
    }

    setStaffActionLoadingId(staffId)
    try {
      await API.delete(`events/manager/${eventId}/staff/${staffId}/`)
      setStaffList((prev) => prev.filter((s) => s.id !== staffId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove staff member.')
    } finally {
      setStaffActionLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="animate-spin text-stone-400" />
        <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">
          Loading stage performance telemetry...
        </p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to display stage dashboard</p>
            <p className="mt-0.5">{error || 'Event could not be found.'}</p>
          </div>
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

  const totalCap = event.totalCapacity || 0
  const sold = event.ticketsSold || 0
  const percentage = totalCap > 0 ? Math.round((sold / totalCap) * 100) : 0
  const grossTotal = event.grossRevenue || '$0.00'

  // Calculate average ticket price
  const tiers = Array.isArray(event.tiers) ? event.tiers : []
  let avgPrice = '$0.00'
  if (tiers.length > 0) {
    const totalRevenueNum = tiers.reduce((acc, t) => acc + (parseFloat(t.price) || 0) * (t.soldCount || t.sold_count || 0), 0)
    if (sold > 0) {
      avgPrice = `$${(totalRevenueNum / sold).toFixed(2)}`
    } else {
      const avgTierPrice = tiers.reduce((acc, t) => acc + (parseFloat(t.price) || 0), 0) / tiers.length
      avgPrice = `$${avgTierPrice.toFixed(2)}`
    }
  }

  const venueLabel = event.is_online
    ? 'Virtual / Online Stream'
    : [event.venueName || event.venue || event.venue_name, event.city].filter(Boolean).join(' • ') || 'Location TBA'
  const dateDisplay = event.dateFormatted || event.date || 'Date TBA'
  const timeDisplay = event.time || (event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : '')

  return (
    <div className="space-y-6 pb-12">
      {/* Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link 
          to="/manager/events" 
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-stone-500 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft size={14} /> Back to My Events
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            to={`/user/discover`}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-stone-300 hover:border-stone-900 text-xs font-mono uppercase tracking-wider rounded-md bg-white text-stone-700 transition cursor-pointer"
          >
            <ExternalLink size={13} /> Discover View
          </Link>
          <Link 
            to={`/manager/events/${eventId}/edit`}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-mono uppercase tracking-wider rounded-md transition shadow-2xs"
          >
            <Edit3 size={13} /> Edit Event
          </Link>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null)
              setDeleteMode('archive')
              setIsDeleteModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 hover:border-red-300 hover:bg-red-50 text-xs font-mono uppercase tracking-wider rounded-md bg-white text-red-600 transition cursor-pointer"
            title="Delete / Archive Event"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Event Header Banner */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono text-stone-400">EV-{event.id}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            • {event.category || 'General'}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
            event.status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : event.status === 'draft'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}>
            {event.status === 'published' ? 'Active' : event.status === 'draft' ? 'Draft' : 'Ended'}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-5 mt-2.5 text-xs text-stone-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-stone-400" /> {dateDisplay} {timeDisplay && `• ${timeDisplay}`}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-stone-400" /> {venueLabel}
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-stone-900 text-stone-950'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          Performance &amp; Tiers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'border-stone-900 text-stone-950'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Shield size={13} />
          <span>Event Staff &amp; Crew</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-sans">
            {staffList.length}
          </span>
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Gross Revenue</p>
              <h3 className="text-2xl font-serif text-stone-900 mt-1.5">{grossTotal}</h3>
              <p className="text-[11px] font-mono text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> Live sales synced
              </p>
            </div>

            <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Tickets Sold</p>
              <div className="flex items-baseline justify-between mt-1.5">
                <h3 className="text-2xl font-serif text-stone-900">
                  {sold} <span className="text-xs font-sans text-stone-400">/ {totalCap}</span>
                </h3>
                <span className="font-mono text-xs font-semibold text-stone-700">{percentage}%</span>
              </div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-stone-900 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, percentage)}%` }} 
                />
              </div>
            </div>

            <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Inventory Spots Left</p>
              <h3 className="text-2xl font-serif text-stone-900 mt-1.5">
                {Math.max(0, totalCap - sold)}
              </h3>
              <p className="text-[11px] font-mono text-stone-400 mt-2">
                Across {tiers.length} active tier{tiers.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="p-5 bg-white border border-stone-200/80 rounded-lg shadow-2xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Average Ticket Price</p>
              <h3 className="text-2xl font-serif text-stone-900 mt-1.5">{avgPrice}</h3>
              <p className="text-[11px] font-mono text-stone-400 mt-2">Blended Tier Average</p>
            </div>
          </div>

          {/* Ticket Tier Breakdown Table */}
          <section className="bg-white border border-stone-200/80 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-serif text-lg text-stone-900">Tier Inventory &amp; Sales</h2>
              <Link 
                to={`/manager/events/${eventId}/edit`}
                className="text-xs font-mono uppercase text-stone-500 hover:text-stone-900 transition cursor-pointer"
              >
                Manage Tiers &rarr;
              </Link>
            </div>

            {tiers.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-stone-700">
                    <thead>
                      <tr className="bg-stone-50/80 font-mono text-[10px] uppercase text-stone-500 tracking-wider border-b border-stone-200/80">
                        <th className="py-3 px-5 font-medium">Tier Name</th>
                        <th className="py-3 px-5 font-medium">Price</th>
                        <th className="py-3 px-5 font-medium">Sold / Total</th>
                        <th className="py-3 px-5 font-medium">Gross</th>
                        <th className="py-3 px-5 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-sans">
                      {tiers.map((tier) => {
                        const tierSold = tier.soldCount || tier.sold_count || 0
                        const tierCap = tier.capacity || 0
                        const isSoldOut = tierCap > 0 && tierSold >= tierCap
                        const priceNum = parseFloat(tier.price) || 0
                        const priceDisplay = priceNum > 0 ? `$${priceNum.toFixed(2)}` : 'Free'
                        const grossDisplay = tier.gross || `$${(priceNum * tierSold).toFixed(2)}`

                        return (
                          <tr key={tier.id || tier.name} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="font-medium text-stone-900">{tier.name || tier.tierName}</div>
                              {tier.description && (
                                <div className="text-[11px] text-stone-400 mt-0.5">{tier.description}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-stone-600">{priceDisplay}</td>
                            <td className="py-3.5 px-5 font-mono text-stone-600">
                              {tierSold} / {tierCap}
                            </td>
                            <td className="py-3.5 px-5 font-mono font-semibold text-stone-900">{grossDisplay}</td>
                            <td className="py-3.5 px-5 text-right">
                              <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                                isSoldOut
                                  ? 'bg-stone-100 text-stone-600 border-stone-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {isSoldOut ? 'Sold Out' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Tier Cards View */}
                <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
                  {tiers.map((tier, idx) => {
                    const tierSold = tier.soldCount || tier.sold_count || 0
                    const tierCap = tier.capacity || 0
                    const isSoldOut = tierCap > 0 && tierSold >= tierCap
                    const tierPct = tierCap > 0 ? Math.round((tierSold / tierCap) * 100) : 0
                    const priceNum = parseFloat(tier.price) || 0
                    const priceDisplay = priceNum > 0 ? `$${priceNum.toFixed(2)}` : 'Free'
                    const grossDisplay = tier.gross || `$${(priceNum * tierSold).toFixed(2)}`

                    return (
                      <div key={tier.id || tier.name} className={idx > 0 ? 'pt-3 space-y-2' : 'space-y-2'}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-semibold text-stone-900">{tier.name || tier.tierName}</h3>
                            {tier.description && (
                              <p className="text-[10px] text-stone-400 mt-0.5">{tier.description}</p>
                            )}
                          </div>
                          <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border shrink-0 ${
                            isSoldOut
                              ? 'bg-stone-100 text-stone-600 border-stone-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isSoldOut ? 'Sold Out' : 'Active'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-md bg-stone-50 border border-stone-200/60 text-xs">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-stone-400 block">Price</span>
                            <span className="font-mono font-medium text-stone-800">{priceDisplay}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-stone-400 block">Gross Sales</span>
                            <span className="font-mono font-semibold text-stone-900">{grossDisplay}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-stone-500">Sold:</span>
                            <span className="font-medium text-stone-900">
                              {tierSold} / {tierCap} ({tierPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-stone-900 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, tierPct)}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <p className="font-serif text-sm text-stone-600">No ticket tiers configured</p>
                <p className="text-xs text-stone-400">Add tiers to start selling tickets for this stage.</p>
                <div className="pt-2">
                  <Link
                    to={`/manager/events/${eventId}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-stone-900 text-stone-50 text-xs font-mono"
                  >
                    <Edit3 size={12} /> Configure Tiers
                  </Link>
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Event Staff & Gate Crew Tab */
        <section className="bg-white border border-stone-200/80 rounded-lg overflow-hidden shadow-2xs space-y-4">
          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg text-stone-900">Assigned Operational Staff</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Assign crew members from your saved Studio Team or platform directory to scan tickets and manage admission for this event.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddStaffModal}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs cursor-pointer shrink-0"
            >
              <UserPlus size={14} />
              <span>+ Assign Staff Member</span>
            </button>
          </div>

          {isLoadingStaff && staffList.length === 0 ? (
            <div className="p-8 space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-14 w-full bg-stone-100 rounded-md animate-pulse" />
              ))}
            </div>
          ) : staffList.length > 0 ? (
            <>
              {/* Desktop Staff Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-stone-700">
                  <thead>
                    <tr className="bg-stone-50/80 font-mono text-[10px] uppercase text-stone-500 tracking-wider border-b border-stone-200/80">
                      <th className="py-3 px-5 font-medium">Staff Member &amp; Role</th>
                      <th className="py-3 px-5 font-medium text-center">View Guests</th>
                      <th className="py-3 px-5 font-medium text-center">Gate Check-In</th>
                      <th className="py-3 px-5 font-medium text-center">Edit Info</th>
                      <th className="py-3 px-5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {staffList.map((st) => {
                      const isActionLoading = staffActionLoadingId === st.id
                      const canView = st.canViewAttendees ?? st.can_view_attendees
                      const canCheck = st.canCheckIn ?? st.can_check_in
                      const canEdit = st.canEditAttendees ?? st.can_edit_attendees
                      const roleTitle = st.roleTitle || st.role_title || 'Stage Staff'
                      const rawName = st.fullName || st.full_name || st.name
                      const displayName = (rawName && rawName.trim() && rawName !== st.email)
                        ? rawName.trim()
                        : (st.username || (st.email ? st.email.split('@')[0] : 'Staff'))

                      return (
                        <tr key={st.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-stone-900">{displayName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/80">
                                {roleTitle}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-stone-400">{st.email}</div>
                          </td>

                          {/* Permission Toggle: View Attendees */}
                          <td className="py-3.5 px-5 text-center">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleTogglePermission(st.id, 'canViewAttendees', canView)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                                canView
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200/80'
                              }`}
                            >
                              {canView ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                              <span>{canView ? 'Allowed' : 'Disabled'}</span>
                            </button>
                          </td>

                          {/* Permission Toggle: Gate Check-in */}
                          <td className="py-3.5 px-5 text-center">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleTogglePermission(st.id, 'canCheckIn', canCheck)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                                canCheck
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200/80'
                              }`}
                            >
                              {canCheck ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                              <span>{canCheck ? 'Allowed' : 'Disabled'}</span>
                            </button>
                          </td>

                          {/* Permission Toggle: Edit Attendees */}
                          <td className="py-3.5 px-5 text-center">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleTogglePermission(st.id, 'canEditAttendees', canEdit)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer border ${
                                canEdit
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200/80'
                              }`}
                            >
                              {canEdit ? <Check size={12} className="text-emerald-600" /> : <X size={12} />}
                              <span>{canEdit ? 'Allowed' : 'Disabled'}</span>
                            </button>
                          </td>

                          {/* Remove Button */}
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleRemoveStaff(st.id, displayName || st.email)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Remove Staff Member"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Staff Cards */}
              <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
                {staffList.map((st, idx) => {
                  const isActionLoading = staffActionLoadingId === st.id
                  const canView = st.canViewAttendees ?? st.can_view_attendees
                  const canCheck = st.canCheckIn ?? st.can_check_in
                  const canEdit = st.canEditAttendees ?? st.can_edit_attendees
                  const roleTitle = st.roleTitle || st.role_title || 'Stage Staff'
                  const rawName = st.fullName || st.full_name || st.name
                  const displayName = (rawName && rawName.trim() && rawName !== st.email)
                    ? rawName.trim()
                    : (st.username || (st.email ? st.email.split('@')[0] : 'Staff'))

                  return (
                    <div key={st.id} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-semibold text-stone-900">{displayName}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/80">
                              {roleTitle}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-stone-400">{st.email}</p>
                        </div>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleRemoveStaff(st.id, displayName || st.email)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-center">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-stone-400 block mb-1">Guest List</span>
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(st.id, 'canViewAttendees', canView)}
                            className={`w-full py-1 text-[10px] font-mono rounded border ${
                              canView ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-stone-400 border-stone-200'
                            }`}
                          >
                            {canView ? 'Yes' : 'No'}
                          </button>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase text-stone-400 block mb-1">Check-in</span>
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(st.id, 'canCheckIn', canCheck)}
                            className={`w-full py-1 text-[10px] font-mono rounded border ${
                              canCheck ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-stone-400 border-stone-200'
                            }`}
                          >
                            {canCheck ? 'Yes' : 'No'}
                          </button>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase text-stone-400 block mb-1">Edit Info</span>
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(st.id, 'canEditAttendees', canEdit)}
                            className={`w-full py-1 text-[10px] font-mono rounded border ${
                              canEdit ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-stone-400 border-stone-200'
                            }`}
                          >
                            {canEdit ? 'Yes' : 'No'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="py-12 px-4 text-center text-stone-400 space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Users size={18} />
              </div>
              <div>
                <p className="font-serif text-sm text-stone-700 font-medium">No event staff assigned yet</p>
                <p className="text-xs text-stone-400 mt-0.5 max-w-sm mx-auto">
                  Assign saved Studio Team members or platform users as event crew so they can scan attendee passes and manage admission.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddStaffModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition cursor-pointer"
              >
                <UserPlus size={13} /> Assign Staff Member
              </button>
            </div>
          )}
        </section>
      )}

      {/* Assign Staff Modal (with Studio Team Roster + Platform User Search Tabs) */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-5 relative max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setIsAddStaffOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
            >
              <X size={18} />
            </button>

            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-medium text-stone-900">Assign Event Staff</h3>
              <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                Grant gate permissions and scan access for &quot;{event.title}&quot;
              </p>

              {/* Tabs Navigation */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAssignModalTab('studio')
                    setAddStaffError(null)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                    assignModalTab === 'studio'
                      ? 'bg-stone-900 text-white font-medium shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                  }`}
                >
                  <Users size={13} />
                  <span>Studio Team Roster ({studioStaffList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssignModalTab('search')
                    setAddStaffError(null)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                    assignModalTab === 'search'
                      ? 'bg-stone-900 text-white font-medium shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                  }`}
                >
                  <Search size={13} />
                  <span>Search Platform Users</span>
                </button>
              </div>
            </div>

            {addStaffError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 shrink-0">
                {addStaffError}
              </div>
            )}

            {/* TAB 1: FROM STUDIO TEAM ROSTER */}
            {assignModalTab === 'studio' && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                {isLoadingStudioStaff ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2 text-stone-400">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="font-mono text-xs">Loading saved studio team...</span>
                  </div>
                ) : studioStaffList.length === 0 ? (
                  <div className="py-8 px-4 text-center border border-dashed border-stone-200 rounded-xl space-y-3">
                    <Users size={24} className="mx-auto text-stone-400" />
                    <div>
                      <p className="font-serif text-sm font-medium text-stone-800">No saved Studio Team members</p>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        Save staff once in Organizer Settings &gt; Team &amp; Roles to quickly assign them to any event in one click.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Link
                        to="/manager/settings"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono transition cursor-pointer"
                      >
                        Manage Studio Directory
                      </Link>
                      <button
                        type="button"
                        onClick={() => setAssignModalTab('search')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono transition cursor-pointer"
                      >
                        Search Platform User
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-100 pb-2">
                      <span>Select staff to assign to this event:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const unassignedUserIds = studioStaffList
                              .map((sm) => sm.userId || sm.user_id || (typeof sm.user === 'number' ? sm.user : sm.user?.id))
                              .filter(
                                (uid) =>
                                  typeof uid === 'number' &&
                                  Number.isInteger(uid) &&
                                  !staffList.some((st) => (st.userId || st.user_id || st.user) === uid)
                              )
                            setSelectedStudioStaffIds(unassignedUserIds)
                          }}
                          className="text-stone-700 hover:text-stone-900 underline text-[11px] cursor-pointer"
                        >
                          Select All Unassigned
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedStudioStaffIds([])}
                          className="text-stone-400 hover:text-stone-600 text-[11px] cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {studioStaffList.map((member) => {
                        const staffUid = member.userId || member.user_id || (typeof member.user === 'number' ? member.user : member.user?.id)
                        const isAlreadyAssigned = staffList.some(
                          (st) => (st.userId || st.user_id || st.user) === staffUid || st.email === member.email
                        )
                        const isSelected = staffUid ? selectedStudioStaffIds.includes(staffUid) : false
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
                              if (isAlreadyAssigned || !staffUid) return
                              if (isSelected) {
                                setSelectedStudioStaffIds((prev) => prev.filter((id) => id !== staffUid))
                              } else {
                                setSelectedStudioStaffIds((prev) => [...prev, staffUid])
                              }
                            }}
                            className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                              isAlreadyAssigned
                                ? 'bg-stone-50/60 border-stone-200/60 opacity-65 cursor-not-allowed'
                                : isSelected
                                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs cursor-pointer'
                                : 'bg-white border-stone-200 hover:border-stone-400 cursor-pointer text-stone-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="shrink-0">
                                {isAlreadyAssigned ? (
                                  <Check size={16} className="text-stone-400" />
                                ) : isSelected ? (
                                  <CheckSquare size={16} className="text-white" />
                                ) : (
                                  <Square size={16} className="text-stone-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs">{displayName}</span>
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                      isSelected
                                        ? 'bg-stone-800 text-stone-200 border-stone-700'
                                        : 'bg-stone-100 text-stone-600 border-stone-200'
                                    }`}
                                  >
                                    {member.roleTitle || member.role_title || 'Staff'}
                                  </span>
                                  {isAlreadyAssigned && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-600">
                                      Assigned
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[11px] font-mono ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                                  {member.email} {member.phone ? `• ${member.phone}` : ''}
                                </div>
                              </div>
                            </div>

                            {/* Permissions Pill Preview */}
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

                    {/* Bulk Action Footer */}
                    <div className="pt-3 flex items-center justify-between border-t border-stone-100">
                      <span className="text-xs font-mono text-stone-500">
                        {selectedStudioStaffIds.length} member{selectedStudioStaffIds.length === 1 ? '' : 's'} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddStaffOpen(false)}
                          className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSubmittingStaff || selectedStudioStaffIds.length === 0}
                          onClick={handleBulkAssignStudioStaff}
                          className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {isSubmittingStaff ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                          <span>Assign Selected ({selectedStudioStaffIds.length}) to Event</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: SEARCH PLATFORM USERS */}
            {assignModalTab === 'search' && (
              <form onSubmit={handleAddStaffSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
                {/* User Search & Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                    Search Registered Manager / Colleague (Email or Name)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type colleague email or full name..."
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    {isSearchingUsers && (
                      <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />
                    )}
                  </div>

                  {/* Search Results Dropdown List */}
                  {searchResults.length > 0 && (
                    <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 shadow-sm">
                      {searchResults.map((usr) => {
                        const isSelected = selectedUser?.id === usr.id
                        const usrRawName = usr.fullName || usr.full_name || usr.name
                        const usrDisplayName = (usrRawName && usrRawName.trim() && usrRawName !== usr.email)
                          ? usrRawName.trim()
                          : (usr.username || (usr.email ? usr.email.split('@')[0] : 'User'))

                        return (
                          <button
                            key={usr.id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(usr)
                              setSearchUserQuery(usr.email)
                              setSearchResults([])
                            }}
                            className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                            }`}
                          >
                            <div>
                              <p className="text-stone-900 font-medium">{usrDisplayName}</p>
                              <p className="text-[11px] font-mono text-stone-400">{usr.email}</p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                              Select
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Selected User Pill */}
                  {selectedUser && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs mt-2">
                      <div>
                        {(() => {
                          const selRawName = selectedUser.fullName || selectedUser.full_name || selectedUser.name
                          const selDisplayName = (selRawName && selRawName.trim() && selRawName !== selectedUser.email)
                            ? selRawName.trim()
                            : (selectedUser.username || (selectedUser.email ? selectedUser.email.split('@')[0] : 'User'))
                          return <span className="font-semibold text-emerald-900">{selDisplayName}</span>
                        })()}
                        <span className="block text-[11px] font-mono text-emerald-700">{selectedUser.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="text-emerald-700 hover:text-emerald-950 font-mono text-[11px] underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Role Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                    Role Title for this Event
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gate Lead, Scanner Lead, VIP Host"
                    value={newStaffRoleTitle}
                    onChange={(e) => setNewStaffRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Gate Lead', 'Ticketing Host', 'VIP Concierge', 'Scanner Lead', 'Security & Access'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewStaffRoleTitle(preset)}
                        className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-mono text-stone-600 transition cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Permission Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <p className="text-xs font-mono uppercase tracking-wider text-stone-500 font-medium">
                    Event Permissions
                  </p>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStaffPermissions.canViewAttendees}
                      onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canViewAttendees: e.target.checked })}
                      className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">View Attendee Guest List</span>
                      <span className="text-[11px] text-stone-500">Allows viewing registered guests and ticket tiers.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStaffPermissions.canCheckIn}
                      onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canCheckIn: e.target.checked })}
                      className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Gate Check-In &amp; Scanner Access</span>
                      <span className="text-[11px] text-stone-500">Allows barcode scanning and toggling admission at the door.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStaffPermissions.canEditAttendees}
                      onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canEditAttendees: e.target.checked })}
                      className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Edit Attendee Information</span>
                      <span className="text-[11px] text-stone-500">Allows updating guest gate/seat assignments or details.</span>
                    </div>
                  </label>
                </div>

                {/* Save to Studio Team Directory Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-stone-100/70 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToStudio}
                      onChange={(e) => setSaveToStudio(e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                    />
                    <span className="text-xs text-stone-700 font-medium">
                      Also save this staff member to my Studio Team Directory for future events
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingStaff || !selectedUser}
                    className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isSubmittingStaff ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                    <span>Confirm Assignment</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
                    EV-{eventId} • {event.title}
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
                      name="deleteModeDashboard"
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
                      name="deleteModeDashboard"
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
    </div>
  )
}