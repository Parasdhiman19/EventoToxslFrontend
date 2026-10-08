import React from 'react'
import {
  User,
  AtSign,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from 'lucide-react'

export default function ProfileInfoSection({
  formData,
  setFormData,
  onSubmit,
  isSavingProfile,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
  )
}
