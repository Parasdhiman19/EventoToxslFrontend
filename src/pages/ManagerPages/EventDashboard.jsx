import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Edit3,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  Trash2,
  Shield,
} from 'lucide-react'
import API from '../../services/api'
import DeleteArchiveEventModal from '../../components/modals/DeleteArchiveEventModal'
import {
  EventOverviewStats,
  EventTierBreakdown,
  EventStaffTab,
  AddEventStaffModal,
} from './EventDashboard/index'

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
        const res = await API.get(
          `events/manager/staff/users/search/?q=${encodeURIComponent(searchUserQuery.trim())}`
        )
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
      const msg =
        err.response?.data?.detail || err.response?.data?.message || 'Could not assign studio staff members.'
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

      setStaffList((prev) => prev.map((s) => (s.id === staffId ? res.data : s)))
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
    const totalRevenueNum = tiers.reduce(
      (acc, t) => acc + (parseFloat(t.price) || 0) * (t.soldCount || t.sold_count || 0),
      0
    )
    if (sold > 0) {
      avgPrice = `$${(totalRevenueNum / sold).toFixed(2)}`
    } else {
      const avgTierPrice = tiers.reduce((acc, t) => acc + (parseFloat(t.price) || 0), 0) / tiers.length
      avgPrice = `$${avgTierPrice.toFixed(2)}`
    }
  }

  const venueLabel = event.is_online
    ? 'Virtual / Online Stream'
    : [event.venueName || event.venue || event.venue_name, event.city].filter(Boolean).join(' • ') ||
      'Location TBA'
  const dateDisplay = event.dateFormatted || event.date || 'Date TBA'
  const timeDisplay =
    event.time || (event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : '')

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
            to="/discover"
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
            onClick={() => setIsDeleteModalOpen(true)}
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
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
              event.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : event.status === 'draft'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {event.status === 'published' ? 'Active' : event.status === 'draft' ? 'Draft' : 'Ended'}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">{event.title}</h1>
        <div className="flex flex-wrap items-center gap-5 mt-2.5 text-xs text-stone-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-stone-400" /> {dateDisplay}{' '}
            {timeDisplay && `• ${timeDisplay}`}
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
          <EventOverviewStats
            grossTotal={grossTotal}
            sold={sold}
            totalCap={totalCap}
            percentage={percentage}
            tiers={tiers}
            avgPrice={avgPrice}
          />

          {/* Ticket Tier Breakdown Table */}
          <EventTierBreakdown eventId={eventId} tiers={tiers} />
        </>
      ) : (
        /* Event Staff & Gate Crew Tab */
        <EventStaffTab
          staffList={staffList}
          isLoadingStaff={isLoadingStaff}
          staffActionLoadingId={staffActionLoadingId}
          onOpenAddStaffModal={handleOpenAddStaffModal}
          onTogglePermission={handleTogglePermission}
          onRemoveStaff={handleRemoveStaff}
        />
      )}

      {/* Assign Staff Modal */}
      <AddEventStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        eventTitle={event.title}
        assignModalTab={assignModalTab}
        setAssignModalTab={setAssignModalTab}
        addStaffError={addStaffError}
        setAddStaffError={setAddStaffError}
        isLoadingStudioStaff={isLoadingStudioStaff}
        studioStaffList={studioStaffList}
        staffList={staffList}
        selectedStudioStaffIds={selectedStudioStaffIds}
        setSelectedStudioStaffIds={setSelectedStudioStaffIds}
        onBulkAssignStudioStaff={handleBulkAssignStudioStaff}
        isSubmittingStaff={isSubmittingStaff}
        searchUserQuery={searchUserQuery}
        setSearchUserQuery={setSearchUserQuery}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        isSearchingUsers={isSearchingUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        newStaffRoleTitle={newStaffRoleTitle}
        setNewStaffRoleTitle={setNewStaffRoleTitle}
        newStaffPermissions={newStaffPermissions}
        setNewStaffPermissions={setNewStaffPermissions}
        saveToStudio={saveToStudio}
        setSaveToStudio={setSaveToStudio}
        onAddStaffSubmit={handleAddStaffSubmit}
      />

      {/* Delete / Archive Event Modal */}
      <DeleteArchiveEventModal
        isOpen={isDeleteModalOpen}
        event={{ id: eventId, title: event?.title || 'Untitled Stage' }}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => navigate('/manager/events')}
      />
    </div>
  )
}