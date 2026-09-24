import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CreditCard,
  Users,
  Key,
  Bell,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Shield,
} from 'lucide-react'
import API from '../../services/api'
import {
  StudioProfileSection,
  TicketingPoliciesSection,
  SettlementAccountsSection,
  AddSettlementAccountModal,
  TeamRosterSection,
  AddStaffModal,
  EditStaffModal,
  DeleteStaffModal,
  ViewAssignedEventsModal,
  ApiKeysSection,
  GenerateApiKeyModal,
  NotificationSettingsSection,
} from './OrganizerSettings/index'

export default function OrganizerSettings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotification, setSavedNotification] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Studio Profile State
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

  // 2. Ticketing Policies State
  const [ticketingSettings, setTicketingSettings] = useState({
    passPlatformFeeToBuyer: true,
    allowTicketTransfers: true,
    requireAttendeePhone: true,
    autoRefundCancelledEvents: true,
  })

  // 3. Alerts & Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    instantSaleAlerts: true,
    dailySummaryDigest: true,
    payoutDisbursementEmail: true,
  })

  // 4. Settlement Accounts State
  const [settlementAccounts, setSettlementAccounts] = useState([])
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [newPaypalEmail, setNewPaypalEmail] = useState('')
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false)
  const [accountError, setAccountError] = useState('')

  // 5. Team Roster State
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

  // 6. Developer API Keys State
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

  // Fetch initial settings on component mount
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

  // Fetch Team overview when team tab is opened
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

  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Handle Logo Upload & Preview
  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo artwork size must be less than 5MB.')
        return
      }
      setLogoPreview(URL.createObjectURL(file))
      setIsUploadingLogo(true)
      try {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('folder', 'organizers/logos')

        const res = await API.post('events/upload/image/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const uploadedUrl = res.data.url || res.data.secure_url
        setLogoPreview(uploadedUrl)
        setProfileData((prev) => ({ ...prev, logoUrl: uploadedUrl }))
      } catch (err) {
        console.error('Failed to upload logo to Cloudinary:', err)
        alert(err.response?.data?.detail || 'Failed to upload studio logo. Please try again.')
      } finally {
        setIsUploadingLogo(false)
      }
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
        organizationName: updated.organizationName || updated.organization_name || prev.organizationName,
        handle: updated.handle || prev.handle,
        supportEmail: updated.supportEmail || updated.support_email || prev.supportEmail,
        supportPhone: updated.supportPhone || updated.support_phone || prev.supportPhone,
        website: updated.website || prev.website,
        instagram: updated.instagram || prev.instagram,
        bio: updated.bio || prev.bio,
        logoUrl: updated.logoUrl || updated.logo_url || (payload.logoUrl === '' ? '' : prev.logoUrl),
      }))
      setLogoPreview(updated.logoUrl || updated.logo_url || (payload.logoUrl === '' ? '' : ''))

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

    const finalRole =
      newStaffRolePreset === 'Custom'
        ? newStaffCustomRole.trim() || 'Stage Coordinator'
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
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

      {/* SECTION 1: STUDIO PROFILE */}
      {activeSection === 'profile' && (
        <StudioProfileSection
          profileData={profileData}
          setProfileData={setProfileData}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          fileInputRef={fileInputRef}
          handleLogoChange={handleLogoChange}
          handleSaveSettings={handleSaveSettings}
          isSaving={isSaving}
          isUploadingLogo={isUploadingLogo}
        />
      )}

      {/* SECTION 2: TICKETING & CHECKOUT POLICIES */}
      {activeSection === 'ticketing' && (
        <TicketingPoliciesSection
          ticketingSettings={ticketingSettings}
          setTicketingSettings={setTicketingSettings}
          handleSaveSettings={handleSaveSettings}
          isSaving={isSaving}
        />
      )}

      {/* SECTION 3: SETTLEMENT & PAYOUT ACCOUNTS */}
      {activeSection === 'payouts' && (
        <SettlementAccountsSection
          settlementAccounts={settlementAccounts}
          onOpenAddAccount={() => {
            setAccountError('')
            setIsAddAccountOpen(true)
          }}
          onSetPrimaryAccount={handleSetPrimaryAccount}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* SECTION 4: TEAM MEMBERS & ROLES */}
      {activeSection === 'team' && (
        <TeamRosterSection
          teamMembers={teamMembers}
          isLoadingTeam={isLoadingTeam}
          teamSearchFilter={teamSearchFilter}
          setTeamSearchFilter={setTeamSearchFilter}
          onRefreshTeam={fetchTeamOverview}
          onOpenAddStaff={() => {
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
          onOpenEditStaff={handleOpenEditStaff}
          onOpenDeleteStaff={(member) => setDeletingStaffMember(member)}
          onOpenViewAssigned={(member) => setViewingAssignedMember(member)}
        />
      )}

      {/* SECTION 5: DEVELOPER API & WEBHOOK GATEWAYS */}
      {activeSection === 'api' && (
        <ApiKeysSection
          apiKeys={apiKeys}
          copiedKeyId={copiedKeyId}
          onCopyKey={handleCopyKey}
          onRevokeKey={handleRevokeApiKey}
          onOpenGenerateKey={() => setIsGenerateKeyOpen(true)}
        />
      )}

      {/* SECTION 6: ALERTS & NOTIFICATIONS */}
      {activeSection === 'notifications' && (
        <NotificationSettingsSection
          notificationSettings={notificationSettings}
          setNotificationSettings={setNotificationSettings}
          handleSaveSettings={handleSaveSettings}
          isSaving={isSaving}
        />
      )}

      {/* MODALS */}
      <AddSettlementAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        accountError={accountError}
        newPaypalEmail={newPaypalEmail}
        setNewPaypalEmail={setNewPaypalEmail}
        onSubmit={handleAddSettlementAccount}
        isSubmitting={isSubmittingAccount}
      />

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        searchStaffQuery={searchStaffQuery}
        setSearchStaffQuery={setSearchStaffQuery}
        staffSearchResults={staffSearchResults}
        setStaffSearchResults={setStaffSearchResults}
        isSearchingStaff={isSearchingStaff}
        selectedStaffUser={selectedStaffUser}
        setSelectedStaffUser={setSelectedStaffUser}
        newStaffRolePreset={newStaffRolePreset}
        setNewStaffRolePreset={setNewStaffRolePreset}
        newStaffCustomRole={newStaffCustomRole}
        setNewStaffCustomRole={setNewStaffCustomRole}
        newStaffPermissions={newStaffPermissions}
        setNewStaffPermissions={setNewStaffPermissions}
        newStaffPhone={newStaffPhone}
        setNewStaffPhone={setNewStaffPhone}
        newStaffNotes={newStaffNotes}
        setNewStaffNotes={setNewStaffNotes}
        onSubmit={handleAddStaffSubmit}
        isSubmitting={isSubmittingStaff}
        staffModalError={staffModalError}
      />

      <EditStaffModal
        editingStaffMember={editingStaffMember}
        onClose={() => setEditingStaffMember(null)}
        editRoleTitle={editRoleTitle}
        setEditRoleTitle={setEditRoleTitle}
        editPermissions={editPermissions}
        setEditPermissions={setEditPermissions}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        onSubmit={handleSaveEditStaff}
        isSaving={isSavingEditStaff}
        editStaffError={editStaffError}
      />

      <DeleteStaffModal
        deletingStaffMember={deletingStaffMember}
        onClose={() => setDeletingStaffMember(null)}
        onConfirm={handleDeleteStaffConfirm}
        isDeleting={isDeletingStaff}
      />

      <ViewAssignedEventsModal
        viewingAssignedMember={viewingAssignedMember}
        onClose={() => setViewingAssignedMember(null)}
      />

      <GenerateApiKeyModal
        isOpen={isGenerateKeyOpen}
        onClose={() => setIsGenerateKeyOpen(false)}
        newKeyName={newKeyName}
        setNewKeyName={setNewKeyName}
        onSubmit={handleGenerateApiKey}
      />
    </div>
  )
}