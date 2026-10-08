import React from 'react'
import {
  ShieldCheck,
  AlertCircle,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'

export default function ProfileSecuritySection({
  passwordForm,
  setPasswordForm,
  showOldPassword,
  setShowOldPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordError,
  pwdStrength,
  isChangingPassword,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
  )
}
