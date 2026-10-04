import React from 'react'
import { Link } from 'react-router-dom'
import { 
  X, 
  Search, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Bell, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react'

export default function MobileDrawer({
  isOpen,
  onClose,
  headerSearch,
  setHeaderSearch,
  onSearchSubmit,
  isAuthenticated,
  user,
  isSuperAdmin,
  userHasOrganizerAccess,
  onOpenBecomeOrganizer,
  onLogout,
}) {
  return (
    <div 
      className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Soft Backdrop with smooth fade transition */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sliding & Expanding Panel from top */}
      <div 
        className={`fixed inset-x-0 top-0 max-h-[92vh] w-full bg-white text-stone-900 rounded-b-3xl shadow-2xl border-b border-stone-200 overflow-y-auto transform transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-98'
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-6">
          <div>
            {/* Header with Brand Logo & Close Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
              <Link 
                to="/" 
                onClick={onClose}
                className="inline-flex items-center gap-2 font-serif text-xl tracking-tight font-semibold active:scale-95 transition-transform"
              >
                <span className="h-7 w-7 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center font-sans font-bold text-xs shadow-2xs">
                  E
                </span>
                Evento
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-950 hover:bg-stone-100 active:scale-90 hover:rotate-90 transition-all duration-200 focus:outline-none cursor-pointer"
                aria-label="Close Navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search Form */}
            <form 
              onSubmit={onSearchSubmit} 
              className="mt-4 relative group"
            >
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white focus:ring-2 focus:ring-stone-900/5 transition-all duration-200"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
            </form>

            {/* Authenticated User Badge in Mobile Drawer */}
            {isAuthenticated ? (
              <Link
                to="/user/profile"
                onClick={onClose}
                className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 shadow-2xs transition active:scale-[0.98] group"
              >
                <div className="h-11 w-11 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-xs font-mono font-bold shrink-0 overflow-hidden border border-stone-200 shadow-2xs">
                  {user?.avatarUrl || user?.avatar_url ? (
                    <img
                      src={user.avatarUrl || user.avatar_url}
                      alt={user?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'ME'}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-900 truncate group-hover:text-amber-900 transition-colors">
                      {user?.fullName || 'Attendee'}
                    </span>
                    {(isSuperAdmin || user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin') ? (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-200/80">
                        Admin
                      </span>
                    ) : userHasOrganizerAccess ? (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-900 text-stone-50 font-medium">
                        Host
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 truncate">
                    {user?.username ? `@${user.username}` : user?.email}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-stone-400 group-hover:text-stone-900 transition-colors">
                  Edit &rarr;
                </span>
              </Link>
            ) : null}

            {/* Role Portals & Administration */}
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 px-1">
                Portals &amp; Roles
              </p>

              {/* Super Admin Console (Mobile) */}
              {(isSuperAdmin || user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin') && (
                <Link
                  to="/admin/dashboard"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider font-semibold shadow-sm hover:bg-stone-800 active:scale-[0.98] transition border border-stone-800"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-amber-400" />
                    <span>Super Admin Console</span>
                  </span>
                  <span className="text-stone-400 font-mono">&rarr;</span>
                </Link>
              )}

              {/* Manager Mode or Become Organizer */}
              {userHasOrganizerAccess ? (
                <Link
                  to="/manager/overview"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-900 text-xs font-mono uppercase tracking-wider font-semibold border border-stone-200/90 active:scale-[0.98] transition shadow-2xs"
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 size={16} className="text-stone-700" />
                    <span>Manager Dashboard</span>
                  </span>
                  <span className="text-stone-400 font-mono">&rarr;</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onOpenBecomeOrganizer}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 text-amber-950 text-xs font-mono uppercase tracking-wider font-semibold border border-amber-200/90 hover:bg-amber-100/80 active:scale-[0.98] transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-amber-600" />
                    <span>Become an Organizer</span>
                  </span>
                  <span className="text-amber-700 font-mono">&rarr;</span>
                </button>
              )}
            </div>

            {/* Account Actions & Utilities */}
            {isAuthenticated && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 px-1 pb-1">
                  Account &amp; Settings
                </p>
                <Link
                  to="/user/notifications"
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition"
                >
                  <span className="flex items-center gap-3">
                    <Bell size={16} className="text-stone-500" />
                    <span>Notifications</span>
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">&rarr;</span>
                </Link>
                <Link
                  to="/user/profile"
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition"
                >
                  <span className="flex items-center gap-3">
                    <UserIcon size={16} className="text-stone-500" />
                    <span>Profile &amp; Settings</span>
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">&rarr;</span>
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Actions: Sign Out or Auth Buttons */}
          <div className="pt-4 border-t border-stone-200 pb-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 active:scale-[0.98] text-xs font-medium font-mono transition border border-red-200 cursor-pointer"
              >
                <LogOut size={15} className="text-red-600" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/account/login"
                  onClick={onClose}
                  className="py-3 text-center text-xs font-medium text-stone-700 border border-stone-300 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/account/signup"
                  onClick={onClose}
                  className="py-3 text-center text-xs font-medium text-stone-50 bg-stone-900 rounded-xl hover:bg-stone-800 shadow-2xs active:scale-95 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
