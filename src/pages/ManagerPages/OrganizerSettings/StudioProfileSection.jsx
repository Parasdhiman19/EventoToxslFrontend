import React from 'react'
import { Upload, Mail, Phone, Globe, AtSign, RefreshCw } from 'lucide-react'

export default function StudioProfileSection({
  profileData,
  setProfileData,
  logoPreview,
  setLogoPreview,
  fileInputRef,
  handleLogoChange,
  handleSaveSettings,
  isSaving,
  isUploadingLogo = false,
}) {
  return (
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
          <div className="h-16 w-16 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-2xl font-bold overflow-hidden shrink-0 border border-stone-300 shadow-2xs relative">
            {isUploadingLogo ? (
              <RefreshCw size={20} className="animate-spin text-stone-300" />
            ) : logoPreview ? (
              <img src={logoPreview} alt="Brand Logo" className="h-full w-full object-cover" />
            ) : (
              profileData.organizationName?.charAt(0)?.toUpperCase() || 'E'
            )}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isUploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                {isUploadingLogo ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                <span>{isUploadingLogo ? 'Uploading to Cloud...' : 'Upload Brand Logo'}</span>
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
  )
}
