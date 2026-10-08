import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  User,
  KeyRound,
  Bell,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import API from '../../services/api'
import { updateUser } from '../../redux/slice/authSlice'

import ProfileHeroCard from './Profile/ProfileHeroCard'
import ProfileInfoSection from './Profile/ProfileInfoSection'
import ProfileSecuritySection from './Profile/ProfileSecuritySection'
import ProfileNotificationsSection from './Profile/ProfileNotificationsSection'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, isOrganizer } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState('profile')
  const [, setIsLoadingProfile] = useState(false)
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
  const handleSaveProfile = async (e, overrides = {}) => {
    e?.preventDefault?.()
    setIsSavingProfile(true)
    setErrorMessage('')

    const merged = { ...formData, ...overrides }
    try {
      const payload = {
        fullName: (merged.fullName || '').trim(),
        username: (merged.username || '').trim().toLowerCase().replace(/^@/, ''),
        bio: (merged.bio || '').trim(),
        phone: (merged.phone || '').trim(),
        city: (merged.city || '').trim(),
        emailNotifications: merged.emailNotifications,
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
      <ProfileHeroCard
        formData={formData}
        user={user}
        isOrganizerUser={isOrganizerUser}
        isUploadingAvatar={isUploadingAvatar}
        fileInputRef={fileInputRef}
        onAvatarFileChange={handleAvatarFileChange}
        onRemoveAvatar={handleRemoveAvatar}
        formattedJoinDate={formattedJoinDate}
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/80 w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile')
            setErrorMessage('')
          }}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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
        <ProfileInfoSection
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSaveProfile}
          isSavingProfile={isSavingProfile}
        />
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <ProfileSecuritySection
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          showOldPassword={showOldPassword}
          setShowOldPassword={setShowOldPassword}
          showNewPassword={showNewPassword}
          setShowNewPassword={setShowNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          passwordError={passwordError}
          pwdStrength={pwdStrength}
          isChangingPassword={isChangingPassword}
          onSubmit={handleChangePassword}
        />
      )}

      {/* TAB 3: NOTIFICATIONS & ALERTS */}
      {activeTab === 'notifications' && (
        <ProfileNotificationsSection
          emailNotifications={formData.emailNotifications}
          onToggleNotifications={(nextVal) => {
            setFormData((prev) => ({ ...prev, emailNotifications: nextVal }))
            handleSaveProfile(null, { emailNotifications: nextVal })
          }}
        />
      )}
    </div>
  )
}
