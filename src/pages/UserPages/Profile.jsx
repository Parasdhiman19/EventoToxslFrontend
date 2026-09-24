import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  User,
  AtSign,
  Phone,
  MapPin,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Bell,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  Bookmark,
  Receipt,
  Sparkles,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'
import API from '../../services/api'
import { updateUser } from '../../redux/slice/authSlice'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, isOrganizer } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState('profile')
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [toastMessage, setToastMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const fileInputRef = useRef(null)

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    city: user?.city || '',
    emailNotifications: user?.emailNotifications ?? user?.email_notifications ?? true,
    avatarUrl: user?.avatarUrl || user?.avatar_url || '',
  })

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sync state when user in Redux updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || user.full_name || prev.fullName,
        username: user.username || prev.username,
        email: user.email || prev.email,
        bio: user.bio !== undefined ? user.bio : prev.bio,
        phone: user.phone !== undefined ? user.phone : prev.phone,
        city: user.city !== undefined ? user.city : prev.city,
        emailNotifications: user.emailNotifications !== undefined ? user.emailNotifications : (user.email_notifications !== undefined ? user.email_notifications : prev.emailNotifications),
        avatarUrl: user.avatarUrl || user.avatar_url || prev.avatarUrl,
      }))
    }
  }, [user])

  // Fetch latest profile from /api/auth/me/ on page mount
  const loadFreshProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const res = await API.get('auth/me/')
      const data = res.data || {}
      dispatch(updateUser(data))
      setFormData({
        fullName: data.fullName || data.full_name || '',
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || '',
        phone: data.phone || '',
        city: data.city || '',
        emailNotifications: data.emailNotifications ?? data.email_notifications ?? true,
        avatarUrl: data.avatarUrl || data.avatar_url || '',
      })
    } catch {
      // Ignore background load error
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    loadFreshProfile()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle Avatar Image File Upload to Cloudinary
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Avatar image size must be less than 5MB.')
      return
    }

    setIsUploadingAvatar(true)
    setErrorMessage('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)
      uploadFormData.append('folder', 'evento/users/avatars')

      const uploadRes = await API.post('events/upload/image/', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const secureUrl = uploadRes.data.url || uploadRes.data.secure_url
      setFormData((prev) => ({ ...prev, avatarUrl: secureUrl }))

      // Save immediately to backend user profile
      const patchRes = await API.patch('auth/me/', { avatarUrl: secureUrl })
      dispatch(updateUser(patchRes.data.user || patchRes.data))
      showToast('Avatar image updated successfully!')
    } catch (err) {
      console.error('Avatar upload error:', err)
      setErrorMessage(
        err.response?.data?.detail || 'Failed to upload profile picture. Please try again.'
      )
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!formData.avatarUrl) return
    setIsUploadingAvatar(true)
    setErrorMessage('')

    try {
      const patchRes = await API.patch('auth/me/', { avatar: '' })
      setFormData((prev) => ({ ...prev, avatarUrl: '' }))
      dispatch(updateUser(patchRes.data.user || patchRes.data))
      showToast('Profile picture removed.')
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to remove avatar.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Save Profile Details
  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    setIsSavingProfile(true)
    setErrorMessage('')

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase().replace(/^@/, ''),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        emailNotifications: formData.emailNotifications,
      }

      const res = await API.patch('auth/me/', payload)
      const updatedUser = res.data.user || res.data
      dispatch(updateUser(updatedUser))
      showToast('Profile information saved successfully!')
    } catch (err) {
      console.error('Profile update error:', err)
      const errDetail =
        err.response?.data?.username?.[0] ||
        err.response?.data?.fullName?.[0] ||
        err.response?.data?.bio?.[0] ||
        err.response?.data?.detail ||
        'Failed to save profile. Please check your details.'
      setErrorMessage(errDetail)
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (!passwordForm.oldPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match. Please re-enter.')
      return
    }

    setIsChangingPassword(true)

    try {
      await API.post('auth/change-password/', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      showToast('Account password changed successfully!')
    } catch (err) {
      const errDetail =
        err.response?.data?.oldPassword?.[0] ||
        err.response?.data?.newPassword?.[0] ||
        err.response?.data?.detail ||
        'Failed to update password. Please verify current password.'
      setPasswordError(errDetail)
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Password strength calculation helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-stone-200' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 4) return { score, label: 'Strong', color: 'bg-blue-500' }
    return { score, label: 'Very Strong', color: 'bg-emerald-500' }
  }

  const pwdStrength = getPasswordStrength(passwordForm.newPassword)
  const isOrganizerUser = isOrganizer || user?.isOrganizer || user?.role === 'manager'

  const formattedJoinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member'

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Breadcrumb & Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-stone-400 mb-1">
            <Link to="/" className="hover:text-stone-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-700">Profile &amp; Settings</span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Account Profile
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your personal attendee identity, unique handle, notification preferences, and login security.
          </p>
        </div>

        {toastMessage && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs animate-in fade-in zoom-in-95">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hero Profile Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-amber-200/20 via-stone-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
          {/* Avatar with Hover Upload Action */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-stone-200 bg-stone-900 shadow-md flex items-center justify-center transition-all group-hover:border-stone-400">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-stone-50 font-serif font-bold text-3xl select-none">
                  {formData.fullName
                    ? formData.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'EV'}
                </span>
              )}

              {/* Upload Loader Overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1">
                  <Loader2 size={20} className="animate-spin text-amber-400" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* Camera Overlay Button */}
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-md ring-2 ring-white active:scale-95 transition cursor-pointer"
              title="Change Profile Picture"
            >
              <Camera size={14} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          {/* User Details & Badges */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                {formData.fullName || 'Attendee'}
              </h2>

              {isOrganizerUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-stone-900 text-stone-50 shadow-2xs">
                  <Sparkles size={10} className="text-amber-400" />
                  Host
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  Attendee
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-stone-500">
              @{formData.username || 'user'} &bull;{' '}
              <span className="text-stone-400">{formData.email}</span>
            </p>

            {formData.bio && (
              <p className="text-xs text-stone-600 max-w-lg leading-relaxed pt-1">
                &ldquo;{formData.bio}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] font-mono text-stone-400">
              <span>Member since {formattedJoinDate}</span>
              {formData.city && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-stone-600">
                    <MapPin size={12} className="text-stone-400" />
                    {formData.city}
                  </span>
                </>
              )}
              {formData.avatarUrl && (
                <>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Remove avatar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Attendee Activity Quick Stats Counters */}
        <div className="flex items-center gap-2 sm:gap-3 bg-stone-50/80 p-2 sm:p-2.5 rounded-2xl border border-stone-200/80 shrink-0 z-10">
          <Link
            to="/user/tickets"
            className="flex flex-col items-center justify-center p-3 sm:px-4 rounded-xl hover:bg-white hover:shadow-2xs transition text-center group"
          >
            <div className="flex items-center gap-1.5 text-stone-400 group-hover:text-stone-900 transition-colors">
              <Ticket size={14} />
              <span className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {user?.ticketsCount ?? 0}
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-500 uppercase mt-0.5">Passes</span>
          </Link>

          <div className="h-8 w-px bg-stone-200" />

          <Link
            to="/user/saved"
            className="flex flex-col items-center justify-center p-3 sm:px-4 rounded-xl hover:bg-white hover:shadow-2xs transition text-center group"
          >
            <div className="flex items-center gap-1.5 text-stone-400 group-hover:text-stone-900 transition-colors">
              <Bookmark size={14} />
              <span className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {user?.savedCount ?? 0}
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-500 uppercase mt-0.5">Saved</span>
          </Link>

          <div className="h-8 w-px bg-stone-200" />

          <Link
            to="/user/orders"
            className="flex flex-col items-center justify-center p-3 sm:px-4 rounded-xl hover:bg-white hover:shadow-2xs transition text-center group"
          >
            <div className="flex items-center gap-1.5 text-stone-400 group-hover:text-stone-900 transition-colors">
              <Receipt size={14} />
              <span className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {user?.ordersCount ?? 0}
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-500 uppercase mt-0.5">Orders</span>
          </Link>
        </div>
      </div>

      {/* Cross-Link Banner: Organizer vs Attendee */}
      {isOrganizerUser ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 text-stone-50 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center shrink-0 border border-stone-700">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-stone-200">
                Host Studio Profile &amp; Payouts
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Looking to customize your organization logo, ticketing policies, or connected PayPal/Bank accounts?
              </p>
            </div>
          </div>

          <Link
            to="/manager/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-stone-900 text-xs font-mono font-semibold hover:bg-stone-100 transition shrink-0 shadow-2xs group"
          >
            <span>Open Studio Settings</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      ) : null}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/80 w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile')
            setErrorMessage('')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-stone-900 text-stone-50 shadow-sm font-semibold'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
          }`}
        >
          <User size={14} />
          <span>Personal Details</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('security')
            setErrorMessage('')
            setPasswordError('')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'bg-stone-900 text-stone-50 shadow-sm font-semibold'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
          }`}
        >
          <KeyRound size={14} />
          <span>Security &amp; Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('notifications')
            setErrorMessage('')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-stone-900 text-stone-50 shadow-sm font-semibold'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
          }`}
        >
          <Bell size={14} />
          <span>Notifications &amp; Alerts</span>
        </button>
      </div>

      {/* TAB 1: PERSONAL DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Personal Information</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Your public identity across comments, reviews, and event registrations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Full Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paras Dhiman"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              {/* Username Handle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Unique Username Handle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="parasdhiman"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      })
                    }
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
                <p className="text-[11px] text-stone-400 font-mono">
                  evento.com/@{formData.username || 'username'} (letters, numbers, underscore)
                </p>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                    Registered Email
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Verified
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100/70 text-xs text-stone-500 font-mono cursor-not-allowed"
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              {/* Preferred City */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Preferred Discovery City
                </label>
                <div className="relative max-w-sm">
                  <input
                    type="text"
                    placeholder="e.g. Chandigarh, Delhi, Mumbai, Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              {/* Bio / About */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                    Personal Bio
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.bio.length > 280 ? 'text-amber-600 font-bold' : 'text-stone-400'
                    }`}
                  >
                    {formData.bio.length} / 300
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="Tell event organizers and fellow attendees about your music taste, conferences you enjoy, or community interests..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSavingProfile && <Loader2 size={13} className="animate-spin" />}
                <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 max-w-2xl">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-stone-700" />
                <h3 className="font-serif text-lg font-bold text-stone-900">Change Password</h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passwordForm.newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                      <span>Password strength</span>
                      <span className="font-semibold">{pwdStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            pwdStrength.score >= lvl ? pwdStrength.color : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition"
                  />
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 disabled:opacity-50 transition shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isChangingPassword && <Loader2 size={13} className="animate-spin" />}
                <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: NOTIFICATIONS & ALERTS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 max-w-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-stone-700" />
              <h3 className="font-serif text-lg font-bold text-stone-900">Email Alerts &amp; Digest</h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Choose which notifications you wish to receive on your registered email address.
            </p>
          </div>

          <div className="divide-y divide-stone-100 space-y-4">
            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-stone-900">Order Receipts &amp; Pass Invoices</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Receive instant PDF invoices and QR codes upon ticket purchase.
                </p>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="h-4 w-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300 cursor-not-allowed opacity-70"
              />
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-stone-900">Stage Updates &amp; Event Reminders</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Receive notifications 24h before event starts with entry gate instructions.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => {
                    setFormData({ ...formData, emailNotifications: e.target.checked })
                    handleSaveProfile()
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-stone-900" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
