import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CreditCard,
  Users,
  Key,
  Bell,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Shield,
  Phone,
  Mail,
  Globe,
  AtSign,
  UserPlus,
  Edit3,
  Search,
  X,
  Eye,
  Sliders,
  Sparkles,
  QrCode,
  UserCheck,
  Calendar,
} from 'lucide-react'
import API from '../../services/api'

export default function OrganizerSettings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotification, setSavedNotification] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Studio Profile State
  const [profileData, setProfileData] = useState({
    organizationName: '',
    handle: '',
    supportEmail: '',
    supportPhone: '',
    website: '',
    instagram: '',
    bio: '',
    logoUrl: '',
  })

  const [logoPreview, setLogoPreview] = useState('')
  const fileInputRef = useRef(null)

  // Ticketing Policies State
  const [ticketingSettings, setTicketingSettings] = useState({
    passPlatformFeeToBuyer: true,
    allowTicketTransfers: true,
    requireAttendeePhone: true,
    autoRefundCancelledEvents: true,
  })

  // Alerts & Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    instantSaleAlerts: true,
    dailySummaryDigest: true,
    payoutDisbursementEmail: true,
  })

  // Settlement Accounts State
  const [settlementAccounts, setSettlementAccounts] = useState([])
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [newPaypalEmail, setNewPaypalEmail] = useState('')
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false)
  const [accountError, setAccountError] = useState('')

  // Team Roster State
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [teamSearchFilter, setTeamSearchFilter] = useState('')

  // Add Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [searchStaffQuery, setSearchStaffQuery] = useState('')
  const [staffSearchResults, setStaffSearchResults] = useState([])
  const [isSearchingStaff, setIsSearchingStaff] = useState(false)
  const [selectedStaffUser, setSelectedStaffUser] = useState(null)
  const [newStaffRolePreset, setNewStaffRolePreset] = useState('Gate Lead & Scanner')
  const [newStaffCustomRole, setNewStaffCustomRole] = useState('')
  const [newStaffPermissions, setNewStaffPermissions] = useState({
    canView: true,
    canCheck: true,
    canEdit: false,
  })
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [newStaffNotes, setNewStaffNotes] = useState('')
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false)
  const [staffModalError, setStaffModalError] = useState('')

  // Edit Staff Modal State
  const [editingStaffMember, setEditingStaffMember] = useState(null)
  const [editRoleTitle, setEditRoleTitle] = useState('')
  const [editPermissions, setEditPermissions] = useState({
    canView: true,
    canCheck: true,
    canEdit: false,
  })
  const [editPhone, setEditPhone] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isSavingEditStaff, setIsSavingEditStaff] = useState(false)
  const [editStaffError, setEditStaffError] = useState('')

  // Delete Staff Modal State
  const [deletingStaffMember, setDeletingStaffMember] = useState(null)
  const [isDeletingStaff, setIsDeletingStaff] = useState(false)

  // View Assigned Events Modal State
  const [viewingAssignedMember, setViewingAssignedMember] = useState(null)

  // Developer API Keys State
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('evento_organizer_api_keys')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback to default initial key
      }
    }
    return [
      {
        id: 1,
        name: 'Production Webhook Gateway',
        key: 'ev_live_99f0' + Math.random().toString(36).substring(2, 10),
        created: 'Active',
        lastUsed: 'Just now',
      },
    ]
  })
  const [copiedKeyId, setCopiedKeyId] = useState(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [isGenerateKeyOpen, setIsGenerateKeyOpen] = useState(false)

  // 1. Fetch initial settings on component mount
  const fetchSettings = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await API.get('auth/settings/')
      const profile = res.data.profile || {}
      setProfileData({
        organizationName: profile.organizationName || profile.organization_name || '',
        handle: profile.handle || '',
        supportEmail: profile.supportEmail || profile.support_email || '',
        supportPhone: profile.supportPhone || profile.support_phone || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        bio: profile.bio || '',
        logoUrl: profile.logoUrl || profile.logo_url || '',
      })
      if (profile.logoUrl || profile.logo_url) {
        setLogoPreview(profile.logoUrl || profile.logo_url)
      }

      setTicketingSettings({
        passPlatformFeeToBuyer: profile.passPlatformFeeToBuyer ?? profile.pass_platform_fee_to_buyer ?? true,
        allowTicketTransfers: profile.allowTicketTransfers ?? profile.allow_ticket_transfers ?? true,
        requireAttendeePhone: profile.requireAttendeePhone ?? profile.require_attendee_phone ?? true,
        autoRefundCancelledEvents: profile.autoRefundCancelledEvents ?? profile.auto_refund_cancelled_events ?? true,
      })

      setNotificationSettings({
        instantSaleAlerts: profile.instantSaleAlerts ?? profile.instant_sale_alerts ?? true,
        dailySummaryDigest: profile.dailySummaryDigest ?? profile.daily_summary_digest ?? true,
        payoutDisbursementEmail: profile.payoutDisbursementEmail ?? profile.payout_disbursement_email ?? true,
      })

      setSettlementAccounts(res.data.settlementAccounts || [])
    } catch (err) {
      console.error('Failed to load organizer settings:', err)
      setErrorMessage('Failed to load organizer settings from server. Please try refreshing.')
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Fetch Team overview when team tab is opened
  const fetchTeamOverview = async () => {
    setIsLoadingTeam(true)
    try {
      const res = await API.get('events/manager/staff-overview/')
      setTeamMembers(res.data || [])
    } catch (err) {
      console.error('Failed to load staff roster:', err)
    } finally {
      setIsLoadingTeam(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeSection === 'team') {
      fetchTeamOverview()
    }
  }, [activeSection])

  // Save API keys to local storage whenever changed
  useEffect(() => {
    localStorage.setItem('evento_organizer_api_keys', JSON.stringify(apiKeys))
  }, [apiKeys])

  // Handle Logo Upload & Preview
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Logo artwork size must be less than 3MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target.result)
        setProfileData((prev) => ({ ...prev, logoUrl: event.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Generic Save Handler for Profile, Ticketing, and Alerts
  const handleSaveSettings = async (overrideData = null, successMsg = 'Changes saved successfully') => {
    setIsSaving(true)
    setErrorMessage('')

    const payload = overrideData || {
      organizationName: profileData.organizationName,
      handle: profileData.handle,
      supportEmail: profileData.supportEmail,
      supportPhone: profileData.supportPhone,
      website: profileData.website,
      instagram: profileData.instagram,
      bio: profileData.bio,
      logoUrl: profileData.logoUrl,
      passPlatformFeeToBuyer: ticketingSettings.passPlatformFeeToBuyer,
      allowTicketTransfers: ticketingSettings.allowTicketTransfers,
      requireAttendeePhone: ticketingSettings.requireAttendeePhone,
      autoRefundCancelledEvents: ticketingSettings.autoRefundCancelledEvents,
      instantSaleAlerts: notificationSettings.instantSaleAlerts,
      dailySummaryDigest: notificationSettings.dailySummaryDigest,
      payoutDisbursementEmail: notificationSettings.payoutDisbursementEmail,
    }

    try {
      const res = await API.patch('auth/settings/', payload)
      const updated = res.data.profile || {}
      setProfileData((prev) => ({
        ...prev,
        organizationName: updated.organizationName || prev.organizationName,
        handle: updated.handle || prev.handle,
        supportEmail: updated.supportEmail || prev.supportEmail,
        supportPhone: updated.supportPhone || prev.supportPhone,
        website: updated.website || prev.website,
        instagram: updated.instagram || prev.instagram,
        bio: updated.bio || prev.bio,
        logoUrl: updated.logoUrl || prev.logoUrl,
      }))
      if (updated.logoUrl) {
        setLogoPreview(updated.logoUrl)
      }

      setSavedNotification(successMsg)
      setTimeout(() => setSavedNotification(''), 4000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      const errDetail =
        err.response?.data?.handle?.[0] ||
        err.response?.data?.organization_name?.[0] ||
        err.response?.data?.support_email?.[0] ||
        err.response?.data?.detail ||
        'Failed to save settings. Please verify your fields.'
      setErrorMessage(errDetail)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Adding Settlement Account
  const handleAddSettlementAccount = async (e) => {
    e.preventDefault()
    if (!newPaypalEmail.trim()) {
      setAccountError('Please provide a valid PayPal email address.')
      return
    }
    setIsSubmittingAccount(true)
    setAccountError('')

    try {
      const res = await API.post('auth/settlement-accounts/', {
        methodType: 'paypal',
        paypalEmail: newPaypalEmail.trim(),
        isPrimary: settlementAccounts.length === 0,
      })
      setSettlementAccounts((prev) => [...prev, res.data])
      setNewPaypalEmail('')
      setIsAddAccountOpen(false)
      setSavedNotification('PayPal payout account connected successfully.')
      setTimeout(() => setSavedNotification(''), 4000)
    } catch (err) {
      setAccountError(err.response?.data?.paypalEmail?.[0] || 'Failed to add settlement account.')
    } finally {
      setIsSubmittingAccount(false)
    }
  }

  // Handle Deleting Settlement Account
  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to remove this settlement account?')) return
    try {
      await API.delete(`auth/settlement-accounts/${accountId}/`)
      setSettlementAccounts((prev) => prev.filter((a) => a.id !== accountId))
      setSavedNotification('Settlement account removed.')
      setTimeout(() => setSavedNotification(''), 3000)
    } catch (err) {
      alert('Failed to remove account. Please try again.')
    }
  }

  // Handle Setting Primary Account
  const handleSetPrimaryAccount = async (accountId) => {
    try {
      await API.patch(`auth/settlement-accounts/${accountId}/`, { isPrimary: true })
      setSettlementAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          isPrimary: a.id === accountId,
          is_primary: a.id === accountId,
          status: a.id === accountId ? 'Primary' : 'Verified',
        }))
      )
      setSavedNotification('Primary settlement method updated.')
      setTimeout(() => setSavedNotification(''), 3000)
    } catch (err) {
      alert('Failed to update primary account.')
    }
  }

  // -------------------------------------------------------------
  // STUDIO TEAM & STAFF DIRECTORY HANDLERS
  // -------------------------------------------------------------

  // Search users to add as staff
  useEffect(() => {
    if (!isAddStaffOpen) {
      setSearchStaffQuery('')
      setStaffSearchResults([])
      setSelectedStaffUser(null)
      setStaffModalError('')
      return
    }

    if (!searchStaffQuery.trim() || searchStaffQuery.trim().length < 2) {
      setStaffSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingStaff(true)
      try {
        const res = await API.get(`events/manager/staff/users/search/?q=${encodeURIComponent(searchStaffQuery.trim())}`)
        setStaffSearchResults(res.data || [])
      } catch (err) {
        console.error('Failed searching platform users:', err)
      } finally {
        setIsSearchingStaff(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [searchStaffQuery, isAddStaffOpen])

  // Add Staff Submit
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStaffUser) {
      setStaffModalError('Please search and select a registered manager or user.')
      return
    }

    const finalRole = newStaffRolePreset === 'Custom'
      ? (newStaffCustomRole.trim() || 'Stage Coordinator')
      : newStaffRolePreset

    setIsSubmittingStaff(true)
    setStaffModalError('')

    try {
      await API.post('auth/studio-staff/', {
        userId: selectedStaffUser.id,
        roleTitle: finalRole,
        defaultCanViewAttendees: newStaffPermissions.canView,
        defaultCanCheckIn: newStaffPermissions.canCheck,
        defaultCanEditAttendees: newStaffPermissions.canEdit,
        phone: newStaffPhone.trim(),
        notes: newStaffNotes.trim(),
      })

      setIsAddStaffOpen(false)
      setSelectedStaffUser(null)
      setSearchStaffQuery('')
      setNewStaffPhone('')
      setNewStaffNotes('')
      setSavedNotification(`${selectedStaffUser.fullName || selectedStaffUser.email} added to studio team.`)
      setTimeout(() => setSavedNotification(''), 4000)
      fetchTeamOverview()
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to add staff member.'
      setStaffModalError(detail)
    } finally {
      setIsSubmittingStaff(false)
    }
  }

  // Open Edit Staff Modal
  const handleOpenEditStaff = (member) => {
    setEditingStaffMember(member)
    setEditRoleTitle(member.roleTitle || member.role || 'Stage Coordinator')
    setEditPermissions({
      canView: member.defaultCanViewAttendees ?? member.canViewAttendees ?? true,
      canCheck: member.defaultCanCheckIn ?? member.canCheckIn ?? true,
      canEdit: member.defaultCanEditAttendees ?? member.canEditAttendees ?? false,
    })
    setEditPhone(member.phone || '')
    setEditNotes(member.notes || '')
    setEditStaffError('')
  }

  // Save Edit Staff Submit
  const handleSaveEditStaff = async (e) => {
    e.preventDefault()
    if (!editingStaffMember) return

    setIsSavingEditStaff(true)
    setEditStaffError('')

    try {
      if (editingStaffMember.studioStaffId) {
        await API.patch(`auth/studio-staff/${editingStaffMember.studioStaffId}/`, {
          roleTitle: editRoleTitle.trim(),
          defaultCanViewAttendees: editPermissions.canView,
          defaultCanCheckIn: editPermissions.canCheck,
          defaultCanEditAttendees: editPermissions.canEdit,
          phone: editPhone.trim(),
          notes: editNotes.trim(),
        })
      } else {
        // Create studio staff record if it was originally an event-only assignment
        await API.post('auth/studio-staff/', {
          userId: editingStaffMember.id,
          roleTitle: editRoleTitle.trim(),
          defaultCanViewAttendees: editPermissions.canView,
          defaultCanCheckIn: editPermissions.canCheck,
          defaultCanEditAttendees: editPermissions.canEdit,
          phone: editPhone.trim(),
          notes: editNotes.trim(),
        })
      }

      setEditingStaffMember(null)
      setSavedNotification(`Staff settings updated for ${editingStaffMember.name}.`)
      setTimeout(() => setSavedNotification(''), 4000)
      fetchTeamOverview()
    } catch (err) {
      setEditStaffError(err.response?.data?.detail || 'Failed to update staff member.')
    } finally {
      setIsSavingEditStaff(false)
    }
  }

  // Delete Staff Member
  const handleDeleteStaffConfirm = async () => {
    if (!deletingStaffMember) return
    setIsDeletingStaff(true)
    try {
      if (deletingStaffMember.studioStaffId) {
        await API.delete(`auth/studio-staff/${deletingStaffMember.studioStaffId}/`)
      }
      setDeletingStaffMember(null)
      setSavedNotification(`Removed ${deletingStaffMember.name} from studio team.`)
      setTimeout(() => setSavedNotification(''), 4000)
      fetchTeamOverview()
    } catch (err) {
      alert('Failed to remove staff member. Please try again.')
    } finally {
      setIsDeletingStaff(false)
    }
  }

  // Generate New API Key
  const handleGenerateApiKey = (e) => {
    e.preventDefault()
    const name = newKeyName.trim() || 'Custom API Gateway'
    const newKey = {
      id: Date.now(),
      name,
      key: 'ev_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8),
      created: 'Just now',
      lastUsed: 'Never',
    }
    setApiKeys((prev) => [newKey, ...prev])
    setNewKeyName('')
    setIsGenerateKeyOpen(false)
    setSavedNotification(`API key "${name}" created.`)
    setTimeout(() => setSavedNotification(''), 4000)
  }

  const handleRevokeApiKey = (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key? Gate scanners using it will stop working.')) return
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId))
    setSavedNotification('API key revoked.')
    setTimeout(() => setSavedNotification(''), 3000)
  }

  const handleCopyKey = (keyText, id) => {
    navigator.clipboard.writeText(keyText)
    setCopiedKeyId(id)
    setTimeout(() => setCopiedKeyId(null), 2500)
  }

  const sections = [
    { id: 'profile', label: 'Studio Profile', icon: Building2 },
    { id: 'ticketing', label: 'Ticketing & Checkout', icon: Shield },
    { id: 'payouts', label: 'Payouts & Banking', icon: CreditCard },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'api', label: 'API & Gateways', icon: Key },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ]

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-500">
        <RefreshCw size={24} className="animate-spin text-stone-700" />
        <p className="text-xs font-mono uppercase tracking-wider">Loading Studio Settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-400 mb-1">
            <Link to="/manager/overview" className="hover:text-stone-700 transition-colors">
              Studio
            </Link>
            <span>/</span>
            <span className="text-stone-700">Settings</span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Organizer Settings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure host identity, default ticketing policies, settlement accounts, and gate staff credentials.
          </p>
        </div>

        {savedNotification && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fade-in shadow-2xs">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-shake">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80 w-full sm:w-fit overflow-x-auto">
        {sections.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSection(tab.id)
                setErrorMessage('')
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${isActive
                ? 'bg-stone-900 text-stone-50 shadow-sm'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
            >
              <Icon size={14} className={isActive ? 'text-stone-50' : 'text-stone-400'} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: STUDIO PROFILE */}
      {/* ========================================================================= */}
      {activeSection === 'profile' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveSettings(null, 'Studio profile updated successfully.')
          }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif text-lg font-medium text-stone-900">Host Brand Identity</h2>
              <p className="text-xs text-stone-500">
                This information is displayed publicly on your event stages, host badge, and ticket receipts.
              </p>
            </div>

            {/* Brand Logo Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="h-16 w-16 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-2xl font-bold overflow-hidden shrink-0 border border-stone-300 shadow-2xs">
                {logoPreview ? (
                  <img src={logoPreview} alt="Brand Logo" className="h-full w-full object-cover" />
                ) : (
                  profileData.organizationName?.charAt(0)?.toUpperCase() || 'E'
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-stone-800 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>Upload Brand Logo</span>
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview('')
                        setProfileData((prev) => ({ ...prev, logoUrl: '' }))
                      }}
                      className="text-xs font-mono text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-stone-400 font-mono">
                  Recommended 400x400 PNG, JPG, or SVG artwork (up to 3MB)
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Organization / Studio Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profileData.organizationName}
                    onChange={(e) => setProfileData({ ...profileData, organizationName: e.target.value })}
                    placeholder="e.g. Apex Music Collective"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Public Studio Handle <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-stone-300 bg-stone-50 focus-within:border-stone-900 focus-within:ring-1 focus-within:ring-stone-900 overflow-hidden">
                  <span className="px-3 py-2.5 text-xs text-stone-400 font-mono bg-stone-100 border-r border-stone-200 select-none">
                    evento.com/@
                  </span>
                  <input
                    type="text"
                    required
                    value={profileData.handle}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      })
                    }
                    placeholder="apex_live"
                    className="w-full bg-white px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Attendee Support Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profileData.supportEmail}
                    onChange={(e) => setProfileData({ ...profileData, supportEmail: e.target.value })}
                    placeholder="support@apexproductions.io"
                    className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Organizer Contact Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profileData.supportPhone}
                    onChange={(e) => setProfileData({ ...profileData, supportPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <Phone size={14} className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Official Website
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://apexproductions.io"
                    className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <Globe size={14} className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                  Instagram Handle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.instagram}
                    onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                    placeholder="@apex_music"
                    className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  />
                  <AtSign size={14} className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
                Studio Bio & Manifest
              </label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Briefly describe what kinds of live music, arts exhibitions, or conferences your studio curates..."
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: TICKETING & CHECKOUT POLICIES */}
      {/* ========================================================================= */}
      {activeSection === 'ticketing' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif text-lg font-medium text-stone-900">Default Ticketing Rules</h2>
              <p className="text-xs text-stone-500">
                Set baseline checkout and admission rules applied automatically when launching new stages.
              </p>
            </div>

            {/* Template Defaults Informative Banner */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
              <Shield size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-amber-950 font-mono uppercase tracking-wider text-[11px]">
                  Studio Template Defaults
                </span>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  These rules serve as initial default templates applied automatically when hosting new stages. Existing active stages maintain their own isolated policy settings and are never altered when updating studio templates.
                </p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-stone-100">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5 pr-6">
                  <span className="text-xs font-medium text-stone-900">Pass Platform Fee (3.5%) to Buyer</span>
                  <p className="text-[11px] text-stone-500">
                    When enabled, ticketing fees are added at checkout to the ticket price rather than deducted from your gross payout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTicketingSettings((prev) => ({ ...prev, passPlatformFeeToBuyer: !prev.passPlatformFeeToBuyer }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${ticketingSettings.passPlatformFeeToBuyer ? 'bg-stone-900' : 'bg-stone-200'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ticketingSettings.passPlatformFeeToBuyer ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-6">
                  <span className="text-xs font-medium text-stone-900">Allow Attendee Ticket Transfers</span>
                  <p className="text-[11px] text-stone-500">
                    Permits verified buyers to securely reassign their digital passes to another attendee email before event gate opening.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTicketingSettings((prev) => ({ ...prev, allowTicketTransfers: !prev.allowTicketTransfers }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${ticketingSettings.allowTicketTransfers ? 'bg-stone-900' : 'bg-stone-200'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ticketingSettings.allowTicketTransfers ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-6">
                  <span className="text-xs font-medium text-stone-900">Mandatory Phone Number at Checkout</span>
                  <p className="text-[11px] text-stone-500">
                    Collect verified mobile numbers for SMS pass delivery and urgent door broadcast notices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTicketingSettings((prev) => ({ ...prev, requireAttendeePhone: !prev.requireAttendeePhone }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${ticketingSettings.requireAttendeePhone ? 'bg-stone-900' : 'bg-stone-200'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ticketingSettings.requireAttendeePhone ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Toggle 4 */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5 pr-6">
                  <span className="text-xs font-medium text-stone-900">Auto-Refund on Event Cancellation</span>
                  <p className="text-[11px] text-stone-500">
                    Automatically trigger PayPal refunds to attendees if an event is cancelled by the studio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTicketingSettings((prev) => ({
                      ...prev,
                      autoRefundCancelledEvents: !prev.autoRefundCancelledEvents,
                    }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${ticketingSettings.autoRefundCancelledEvents ? 'bg-stone-900' : 'bg-stone-200'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ticketingSettings.autoRefundCancelledEvents ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSettings(null, 'Ticketing policies saved.')}
              className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>Save Ticketing Policies</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: SETTLEMENT & PAYOUT ACCOUNTS */}
      {/* ========================================================================= */}
      {activeSection === 'payouts' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-medium text-stone-900">Payout Settlement Methods</h2>
                <p className="text-xs text-stone-500">
                  Connect your PayPal business email or direct bank deposit account to receive ticket sale disbursements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAccountError('')
                  setIsAddAccountOpen(true)
                }}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 self-start"
              >
                <Plus size={14} />
                <span>Connect PayPal</span>
              </button>
            </div>

            {/* Accounts List */}
            {settlementAccounts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-stone-50 border border-dashed border-stone-300 space-y-2">
                <CreditCard size={32} className="mx-auto text-stone-400" />
                <p className="text-xs font-medium text-stone-800">No payout method connected</p>
                <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                  Connect your PayPal merchant account so you can receive ticket revenue disbursements automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {settlementAccounts.map((account) => {
                  const isPrimary = account.isPrimary || account.is_primary || account.status === 'Primary'
                  return (
                    <div
                      key={account.id}
                      className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-stone-900">
                              {account.displayTitle || account.bankName || 'PayPal Account'}
                            </span>
                            {isPrimary && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                                Primary Payout
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                            {account.paypalEmail || account.maskedAccount || account.accountNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryAccount(account.id)}
                            className="text-xs font-mono text-stone-700 hover:text-stone-900 underline underline-offset-2 cursor-pointer"
                          >
                            Make Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-md transition cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Connect PayPal Modal */}
          {isAddAccountOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
              <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-medium text-stone-900">Connect PayPal Account</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(false)}
                    className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                {accountError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {accountError}
                  </div>
                )}

                <form onSubmit={handleAddSettlementAccount} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      PayPal Account Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="merchant@yourbusiness.com"
                      value={newPaypalEmail}
                      onChange={(e) => setNewPaypalEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />
                    <p className="text-[11px] text-stone-400 font-mono">
                      Ticket revenues captured via PayPal sandbox / live will be settled to this account.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAccountOpen(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAccount}
                      className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                    >
                      {isSubmittingAccount ? 'Connecting...' : 'Connect PayPal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: TEAM MEMBERS & ROLES */}
      {/* ========================================================================= */}
      {activeSection === 'team' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-medium text-stone-900">Studio Team & Staff Directory</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Save your trusted staff roster once with default gate credentials and quick-assign them to any event in 1 click.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStaffModalError('')
                    setSelectedStaffUser(null)
                    setSearchStaffQuery('')
                    setStaffSearchResults([])
                    setNewStaffPhone('')
                    setNewStaffNotes('')
                    setNewStaffRolePreset('Gate Lead & Scanner')
                    setNewStaffCustomRole('')
                    setNewStaffPermissions({ canView: true, canCheck: true, canEdit: false })
                    setIsAddStaffOpen(true)
                  }}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <UserPlus size={14} />
                  <span>Add Staff Member</span>
                </button>
                <Link
                  to="/manager/events"
                  className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  title="Manage Events"
                >
                  <Calendar size={14} />
                  <span className="hidden sm:inline">Event Assignments</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Total Team Pool</span>
                <p className="text-lg font-mono font-semibold text-stone-900 mt-1">
                  {teamMembers.length} <span className="text-xs font-sans text-stone-500 font-normal">members</span>
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 block">Gate Scanners</span>
                <p className="text-lg font-mono font-semibold text-emerald-900 mt-1">
                  {teamMembers.filter((m) => !m.isOwner && (m.defaultCanCheckIn !== false && m.canCheckIn !== false)).length} <span className="text-xs font-sans text-emerald-700 font-normal">active scanners</span>
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Active Event Assignments</span>
                <p className="text-lg font-mono font-semibold text-stone-900 mt-1">
                  {teamMembers.reduce((acc, m) => acc + (m.assignedEventsCount || 0), 0)} <span className="text-xs font-sans text-stone-500 font-normal">slots assigned</span>
                </p>
              </div>
            </div>

            {/* Search Filter */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Filter team by name, email or role..."
                  value={teamSearchFilter}
                  onChange={(e) => setTeamSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                {teamSearchFilter && (
                  <button
                    type="button"
                    onClick={() => setTeamSearchFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={fetchTeamOverview}
                disabled={isLoadingTeam}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                title="Refresh Team Roster"
              >
                <RefreshCw size={14} className={isLoadingTeam ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Team Roster List */}
            {isLoadingTeam ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-stone-500">
                <RefreshCw size={18} className="animate-spin text-stone-400" />
                <span className="font-mono">Syncing studio team roster...</span>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {teamMembers
                  .filter((member) => {
                    if (!teamSearchFilter.trim()) return true
                    const q = teamSearchFilter.toLowerCase()
                    return (
                      (member.name || '').toLowerCase().includes(q) ||
                      (member.email || '').toLowerCase().includes(q) ||
                      (member.roleTitle || member.role || '').toLowerCase().includes(q)
                    )
                  })
                  .map((member) => {
                    const canView = member.defaultCanViewAttendees ?? member.canViewAttendees ?? true
                    const canCheck = member.defaultCanCheckIn ?? member.canCheckIn ?? true
                    const canEdit = member.defaultCanEditAttendees ?? member.canEditAttendees ?? false
                    const assignedCount = member.assignedEventsCount || (member.assignedEvents ? member.assignedEvents.length : 0)

                    return (
                      <div
                        key={member.id}
                        className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-stone-50/40 px-2 rounded-xl transition-colors"
                      >
                        {/* Member Identity */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-stone-100 text-stone-800 font-mono text-xs font-semibold flex items-center justify-center shrink-0 border border-stone-200 shadow-2xs">
                            {member.avatar || 'ST'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(() => {
                                const rawName = member.name || member.fullName || member.full_name
                                const displayName = (rawName && rawName.trim() && rawName !== member.email)
                                  ? rawName.trim()
                                  : (member.username || (member.email ? member.email.split('@')[0] : 'Staff'))
                                return <span className="text-xs font-semibold text-stone-900 truncate">{displayName}</span>
                              })()}
                              {member.isOwner ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-900 text-stone-50 font-medium">
                                  Owner & Host
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-700 font-medium border border-stone-200/80">
                                  {member.roleTitle || member.role || 'Stage Coordinator'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono mt-0.5">
                              <span className="truncate">{member.email}</span>
                              {member.phone && (
                                <>
                                  <span>•</span>
                                  <span>{member.phone}</span>
                                </>
                              )}
                            </div>
                            {member.notes && (
                              <p className="text-[11px] text-stone-500 italic mt-1 line-clamp-1">
                                &quot;{member.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Permissions & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                          {/* Permissions Pill */}
                          {!member.isOwner && (
                            <div className="flex items-center gap-1 text-[10px] font-mono">
                              <span
                                className={`px-2 py-0.5 rounded-md border ${
                                  canCheck
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-stone-50 text-stone-400 border-stone-200'
                                }`}
                                title="Gate Check-In / Scanning Permission"
                              >
                                Scan: {canCheck ? 'Yes' : 'No'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md border ${
                                  canView
                                    ? 'bg-stone-100 text-stone-800 border-stone-200'
                                    : 'bg-stone-50 text-stone-400 border-stone-200'
                                }`}
                                title="Attendee List Access"
                              >
                                Guest List: {canView ? 'Yes' : 'No'}
                              </span>
                            </div>
                          )}

                          {/* Assigned Events Badge */}
                          <button
                            type="button"
                            onClick={() => setViewingAssignedMember(member)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-[11px] font-mono font-medium transition cursor-pointer flex items-center gap-1"
                            title="Click to view assigned events"
                          >
                            <Calendar size={12} className="text-stone-500" />
                            <span>{assignedCount} {assignedCount === 1 ? 'Event' : 'Events'}</span>
                          </button>

                          {/* Edit / Delete Buttons */}
                          {!member.isOwner && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditStaff(member)}
                                className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                                title="Edit Staff Role & Permissions"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingStaffMember(member)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Remove from Studio Team"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MODAL 1: ADD STAFF MEMBER */}
          {/* ========================================================================= */}
          {isAddStaffOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-lg rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
                >
                  <X size={18} />
                </button>

                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-medium text-stone-900">Add Staff to Studio Team</h3>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                    Search registered managers or colleagues to add to your organization directory.
                  </p>
                </div>

                <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                  {staffModalError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{staffModalError}</span>
                    </div>
                  )}

                  {/* Search Platform User */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      Search User (Email or Name)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Type registered manager email or full name..."
                        value={searchStaffQuery}
                        onChange={(e) => setSearchStaffQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                      />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      {isSearchingStaff && (
                        <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {staffSearchResults.length > 0 && (
                      <div className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 shadow-lg">
                        {staffSearchResults.map((usr) => {
                          const isSelected = selectedStaffUser?.id === usr.id
                          return (
                            <button
                              key={usr.id}
                              type="button"
                              onClick={() => {
                                setSelectedStaffUser(usr)
                                setSearchStaffQuery(usr.email)
                                setStaffSearchResults([])
                              }}
                              className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                              }`}
                            >
                              <div>
                                <p className="text-stone-900 font-medium">{usr.fullName || usr.full_name || 'User'}</p>
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
                  </div>

                  {/* Selected User Badge */}
                  {selectedStaffUser && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 font-mono text-xs font-semibold flex items-center justify-center">
                          <UserCheck size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-900">{selectedStaffUser.fullName || selectedStaffUser.full_name || 'User'}</p>
                          <p className="text-[11px] font-mono text-stone-500">{selectedStaffUser.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        Selected
                      </span>
                    </div>
                  )}

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      Studio Role & Designation
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Gate Lead & Scanner',
                        'Ticket Scanner',
                        'Stage Coordinator',
                        'Box Office Ops',
                        'VIP Host',
                        'Security Lead',
                        'Custom',
                      ].map((preset) => {
                        const isSelected = newStaffRolePreset === preset
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setNewStaffRolePreset(preset)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                              isSelected
                                ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-2xs'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            {preset}
                          </button>
                        )
                      })}
                    </div>

                    {newStaffRolePreset === 'Custom' && (
                      <input
                        type="text"
                        placeholder="Enter custom role designation..."
                        value={newStaffCustomRole}
                        onChange={(e) => setNewStaffCustomRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 mt-2"
                      />
                    )}
                  </div>

                  {/* Default Permissions */}
                  <div className="space-y-2 pt-1 border-t border-stone-100">
                    <span className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      Default Gate & Event Permissions
                    </span>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.canCheck}
                          onChange={(e) =>
                            setNewStaffPermissions((prev) => ({ ...prev, canCheck: e.target.checked }))
                          }
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <div>
                          <span className="font-medium">Scan & Check-In Tickets</span>
                          <p className="text-[11px] text-stone-400 font-mono">
                            Allows scanning digital QR tickets and check-in at venue gates.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.canView}
                          onChange={(e) =>
                            setNewStaffPermissions((prev) => ({ ...prev, canView: e.target.checked }))
                          }
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <div>
                          <span className="font-medium">View Guest List & Attendees</span>
                          <p className="text-[11px] text-stone-400 font-mono">
                            Allows viewing attendee name rosters and ticket tier details.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newStaffPermissions.canEdit}
                          onChange={(e) =>
                            setNewStaffPermissions((prev) => ({ ...prev, canEdit: e.target.checked }))
                          }
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <div>
                          <span className="font-medium">Edit Attendee Notes & Information</span>
                          <p className="text-[11px] text-stone-400 font-mono">
                            Allows adding check-in notes or modifying attendee records.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Phone & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Direct Phone (Optional)</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Internal Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. VIP line coordinator"
                        value={newStaffNotes}
                        onChange={(e) => setNewStaffNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsAddStaffOpen(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingStaff || !selectedStaffUser}
                      className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isSubmittingStaff ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                      <span>Add to Studio Roster</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 2: EDIT STAFF MEMBER */}
          {/* ========================================================================= */}
          {editingStaffMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-lg rounded-2xl bg-white text-stone-900 overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setEditingStaffMember(null)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
                >
                  <X size={18} />
                </button>

                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-medium text-stone-900">Edit Staff Member</h3>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                    Updating credentials for {editingStaffMember.name} ({editingStaffMember.email})
                  </p>
                </div>

                <form onSubmit={handleSaveEditStaff} className="space-y-4">
                  {editStaffError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {editStaffError}
                    </div>
                  )}

                  {/* Role Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      Role & Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={editRoleTitle}
                      onChange={(e) => setEditRoleTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  {/* Permissions */}
                  <div className="space-y-2 pt-1 border-t border-stone-100">
                    <span className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      Default Permissions
                    </span>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editPermissions.canCheck}
                          onChange={(e) => setEditPermissions((p) => ({ ...p, canCheck: e.target.checked }))}
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <span className="font-medium">Scan & Check-In Tickets at Gate</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editPermissions.canView}
                          onChange={(e) => setEditPermissions((p) => ({ ...p, canView: e.target.checked }))}
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <span className="font-medium">View Guest List & Attendees</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-stone-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editPermissions.canEdit}
                          onChange={(e) => setEditPermissions((p) => ({ ...p, canEdit: e.target.checked }))}
                          className="rounded border-stone-300 text-stone-900 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <span className="font-medium">Edit Attendee Notes & Records</span>
                      </label>
                    </div>
                  </div>

                  {/* Phone & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Direct Phone</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 mb-1">Internal Note</label>
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingStaffMember(null)}
                      className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEditStaff}
                      className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isSavingEditStaff ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 3: DELETE CONFIRMATION */}
          {/* ========================================================================= */}
          {deletingStaffMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 shadow-2xl border border-stone-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-stone-900">Remove Staff Member?</h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">{deletingStaffMember.name}</p>
                  </div>
                </div>

                <p className="text-xs text-stone-600">
                  Are you sure you want to remove <span className="font-semibold text-stone-900">{deletingStaffMember.name}</span> from your studio team roster? Past event logs will remain preserved.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingStaffMember(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingStaff}
                    onClick={handleDeleteStaffConfirm}
                    className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-mono font-medium hover:bg-red-700 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                  >
                    {isDeletingStaff ? 'Removing...' : 'Remove Member'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 4: VIEW ASSIGNED EVENTS */}
          {/* ========================================================================= */}
          {viewingAssignedMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl bg-white text-stone-900 shadow-2xl border border-stone-200 p-6 space-y-4 relative max-h-[85vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setViewingAssignedMember(null)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 p-1 cursor-pointer font-mono"
                >
                  <X size={18} />
                </button>

                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-base font-semibold text-stone-900">
                    Assigned Events ({viewingAssignedMember.name})
                  </h3>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    Events currently staffed by {viewingAssignedMember.email}
                  </p>
                </div>

                <div className="space-y-2">
                  {(!viewingAssignedMember.assignedEvents || viewingAssignedMember.assignedEvents.length === 0) ? (
                    <div className="text-center py-6 text-xs text-stone-400 font-mono">
                      Not assigned to any individual events yet.
                    </div>
                  ) : (
                    viewingAssignedMember.assignedEvents.map((ev) => (
                      <div
                        key={ev.eventId || ev.id}
                        className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/60 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-stone-900">{ev.eventTitle || ev.title}</p>
                          <p className="text-[11px] font-mono text-stone-500">Role: {ev.roleTitle || 'Staff'}</p>
                        </div>
                        <Link
                          to={`/manager/events/${ev.eventId || ev.id}`}
                          className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-50 text-[10px] font-mono hover:bg-stone-800 transition shrink-0"
                        >
                          View Dashboard
                        </Link>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setViewingAssignedMember(null)}
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-mono hover:bg-stone-200 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: DEVELOPER API & WEBHOOK GATEWAYS */}
      {/* ========================================================================= */}
      {activeSection === 'api' && (
        <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-900">Developer API Keys</h2>
              <p className="text-xs text-stone-500">
                Use API credentials to integrate gate scanners, custom checkouts, or private CRM dashboards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGenerateKeyOpen(true)}
              className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 self-start"
            >
              <Plus size={14} />
              <span>Generate Key</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-medium text-stone-900">{k.name}</div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200 inline-block select-all">
                      {k.key}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(k.key, k.id)}
                      className="p-1 text-stone-400 hover:text-stone-800 rounded transition cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedKeyId === k.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    Created {k.created} • Status: Active
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRevokeApiKey(k.id)}
                  className="text-xs font-mono text-red-600 hover:underline cursor-pointer self-end sm:self-auto"
                >
                  Revoke Key
                </button>
              </div>
            ))}
          </div>

          {/* Generate Key Modal */}
          {isGenerateKeyOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
              <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-lg font-medium text-stone-900">Generate Developer API Key</h3>
                  <button
                    type="button"
                    onClick={() => setIsGenerateKeyOpen(false)}
                    className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleGenerateApiKey} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                      Key Name / Gateway <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Venue Gate Scanner App, Custom CRM Sync"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsGenerateKeyOpen(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs cursor-pointer"
                    >
                      Generate Key &rarr;
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: ALERTS & NOTIFICATIONS */}
      {/* ========================================================================= */}
      {activeSection === 'notifications' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif text-lg font-medium text-stone-900">Host Communication Channels</h2>
              <p className="text-xs text-stone-500">Choose when and how Evento dispatches stage alerts.</p>
            </div>

            <div className="space-y-4 divide-y divide-stone-100">
              <div className="flex items-center justify-between pt-3">
                <div className="pr-6">
                  <span className="text-xs font-medium text-stone-900">Instant Order Notifications</span>
                  <p className="text-[11px] text-stone-500">
                    Receive an email alert whenever an attendee buys a ticket.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.instantSaleAlerts}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, instantSaleAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="pr-6">
                  <span className="text-xs font-medium text-stone-900">Daily Sales & Velocity Digest</span>
                  <p className="text-[11px] text-stone-500">
                    Summary of total sold quotas and gross earnings sent each morning.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.dailySummaryDigest}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, dailySummaryDigest: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="pr-6">
                  <span className="text-xs font-medium text-stone-900">Payout & Settlement Confirmations</span>
                  <p className="text-[11px] text-stone-500">
                    Receive confirmation receipts automatically when funds are disbursed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.payoutDisbursementEmail}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, payoutDisbursementEmail: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSettings(null, 'Notification preferences saved.')}
              className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}