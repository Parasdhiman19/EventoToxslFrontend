import React from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  Loader2,
  Sparkles,
  MapPin,
  Trash2,
  Ticket,
  Bookmark,
  Receipt,
  Building2,
  ArrowRight,
} from 'lucide-react'

export default function ProfileHeroCard({
  formData,
  user,
  isOrganizerUser,
  isUploadingAvatar,
  fileInputRef,
  onAvatarFileChange,
  onRemoveAvatar,
  formattedJoinDate,
}) {
  return (
    <>
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
              onChange={onAvatarFileChange}
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
                    onClick={onRemoveAvatar}
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
        <div className="flex items-center justify-around gap-1.5 sm:gap-3 bg-stone-50/80 p-1.5 sm:p-2.5 rounded-2xl border border-stone-200/80 w-full md:w-auto shrink-0 z-10">
          <Link
            to="/user/tickets"
            className="flex-1 md:flex-none flex flex-col items-center justify-center p-2.5 sm:px-4 rounded-xl hover:bg-white hover:shadow-2xs transition text-center group"
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
            className="flex-1 md:flex-none flex flex-col items-center justify-center p-2.5 sm:px-4 rounded-xl hover:bg-white hover:shadow-2xs transition text-center group"
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
            className="flex-1 md:flex-none flex flex-col items-center justify-center p-2.5 sm:px-4 rounded-xl hover:bg-white hover:shadow-2xs transition text-center group"
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
    </>
  )
}
