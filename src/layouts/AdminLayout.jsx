import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/slice/authSlice'
import API from '../services/api'
import { getAvatarInitials } from '../utils/avatar'
import NotificationBell from '../components/notifications/NotificationBell'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Receipt,
  CreditCard,
  QrCode,
  Image,
  Star,
  Flag,
  FileText,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Compass,
} from 'lucide-react'

const navGroups = [
  {
    group: 'CORE',
    items: [
      { path: '/admin/dashboard', label: 'Overview & Metrics', icon: LayoutDashboard },
    ],
  },
  {
    group: 'PLATFORM MANAGEMENT',
    items: [
      { path: '/admin/events', label: 'All Events', icon: Calendar },
      { path: '/admin/users', label: 'Users Directory', icon: Users },
      { path: '/admin/organizers', label: 'Organizers / Studios', icon: Building2 },
    ],
  },
  {
    group: 'FINANCIALS & VENUE',
    items: [
      { path: '/admin/transactions', label: 'Transaction Ledger', icon: Receipt },
      { path: '/admin/payouts', label: 'Payout Requests', icon: CreditCard },
      { path: '/admin/attendance', label: 'Gate & Attendance', icon: QrCode },
    ],
  },
  {
    group: 'HOMEPAGE & CONTENT',
    items: [
      { path: '/admin/banners', label: 'Hero Banners', icon: Image },
      { path: '/admin/recommendations', label: 'Recommended Events', icon: Star },
    ],
  },
  {
    group: 'GOVERNANCE & SYSTEM',
    items: [
      { path: '/admin/reports', label: 'Moderation Reports', icon: Flag },
      { path: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
      { path: '/admin/settings', label: 'Platform Settings', icon: Sliders },
    ],
  },
]

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const displayName = user?.fullName || user?.full_name || user?.email?.split('@')[0] || 'Super Admin'
  const userInitials = getAvatarInitials(displayName, 'SA')

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route changes & lock body scroll when open
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    setIsProfileOpen(false)
    try {
      await API.post('auth/logout/')
    } catch {
      // ignore
    } finally {
      dispatch(logout())
      navigate('/account/login')
    }
  }

  const currentPathSegment = location.pathname.replace('/admin/', '').replace('/', ' ') || 'DASHBOARD'

  return (
    <div className="min-h-screen w-full bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-stone-50 flex flex-col lg:flex-row antialiased">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-stone-300 hover:text-stone-100 p-1.5 -ml-1.5 rounded-lg hover:bg-stone-800 active:scale-90 transition-all focus:outline-none cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 font-serif text-base font-medium tracking-tight active:scale-95 transition-transform">
            <span className="h-6 w-6 rounded bg-stone-100 text-stone-950 flex items-center justify-center font-sans text-xs font-bold shadow-xs">
              E
            </span>
            Evento <span className="text-stone-400 font-sans text-[10px] uppercase tracking-wider">Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell variant="dark" />

          {/* Mobile Profile Toggle */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-stone-800 transition focus:outline-none"
            >
              <div className="h-7 w-7 rounded-full bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center font-mono text-xs font-medium">
                {userInitials}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-xl py-1.5 text-xs text-stone-700 z-50">
                <div className="px-4 py-2 border-b border-stone-100">
                  <div className="font-medium text-stone-900 truncate">{displayName}</div>
                  <div className="text-[11px] font-mono text-stone-500 truncate">{user?.email}</div>
                </div>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 transition"
                >
                  <Sliders size={14} className="text-stone-500" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/admin/audit-logs"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 transition"
                >
                  <FileText size={14} className="text-stone-500" />
                  <span>Audit Trail</span>
                </Link>
                <div className="border-t border-stone-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen shrink-0 bg-stone-900 text-stone-100 flex-col justify-between border-r border-stone-800 sticky top-0">
        <div className="p-5 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
          {/* Brand Logo & Super Admin Pill */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2.5 font-serif text-xl tracking-tight font-semibold text-white hover:opacity-90 transition">
              <span className="h-7 w-7 rounded-lg bg-stone-100 text-stone-950 flex items-center justify-center font-sans font-bold text-xs shadow-xs">
                E
              </span>
              <span>Evento</span>
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700/80 font-medium">
              Super Admin
            </span>
          </div>

          {/* Quick Context Switchers */}
          <div className="pt-4 pb-2 space-y-2">
            <Link
              to="/discover"
              target="_blank"
              className="w-full inline-flex items-center justify-between gap-2 rounded-xl bg-stone-950/40 border border-stone-800/80 px-3 py-2 text-xs font-mono text-stone-300 hover:text-white hover:bg-stone-800/70 hover:border-stone-700/80 transition shadow-2xs group"
            >
              <span className="flex items-center gap-2">
                <Compass size={14} className="text-stone-400 group-hover:text-stone-300" />
                <span>Public Discovery</span>
              </span>
              <ExternalLink size={12} className="text-stone-500 group-hover:text-stone-400" />
            </Link>

            <Link
              to="/manager"
              className="w-full inline-flex items-center justify-between gap-2 rounded-xl bg-stone-950/40 border border-stone-800/80 px-3 py-2 text-xs font-mono text-stone-300 hover:text-white hover:bg-stone-800/70 hover:border-stone-700/80 transition shadow-2xs group"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-stone-400 group-hover:text-stone-300" />
                <span>Manager Studio</span>
              </span>
              <span className="text-[10px] text-stone-500 group-hover:text-stone-400 font-mono">Switch &rarr;</span>
            </Link>
          </div>

          {/* Grouped Nav Items */}
          <nav className="flex-1 py-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-semibold tracking-wider text-stone-500 uppercase">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-stone-800 text-white font-semibold shadow-xs ring-1 ring-white/10'
                          : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/50'
                      }`}
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 transition-transform duration-150 ${
                          isActive ? 'text-white' : 'text-stone-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Profile Widget */}
        <div className="p-3.5 sm:p-4 border-t border-stone-800/80 bg-stone-950/60">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-stone-800 border border-stone-700/80 text-stone-200 flex items-center justify-center font-mono text-xs font-semibold shrink-0 ring-1 ring-white/5">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-stone-100 truncate">{displayName}</div>
                <div className="text-[10px] font-mono text-stone-400 truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800/80 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-4/5 max-w-xs bg-stone-900 text-stone-100 h-full flex flex-col justify-between p-5 border-r border-stone-800 shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 font-serif text-lg font-medium">
                  <span className="h-6 w-6 rounded bg-stone-100 text-stone-950 flex items-center justify-center font-sans font-bold text-xs">
                    E
                  </span>
                  Evento Admin
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Quick Switchers */}
              <div className="pt-4 pb-2 space-y-2">
                <Link
                  to="/discover"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-between gap-2 rounded-xl bg-stone-950/40 border border-stone-800/80 px-3 py-2 text-xs font-mono text-stone-300 hover:text-white hover:bg-stone-800/70 transition"
                >
                  <span className="flex items-center gap-2">
                    <Compass size={14} className="text-stone-400" />
                    <span>Public Discovery</span>
                  </span>
                  <ExternalLink size={12} className="text-stone-500" />
                </Link>

                <Link
                  to="/manager"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-between gap-2 rounded-xl bg-stone-950/40 border border-stone-800/80 px-3 py-2 text-xs font-mono text-stone-300 hover:text-white hover:bg-stone-800/70 transition"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-stone-400" />
                    <span>Manager Studio</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Switch &rarr;</span>
                </Link>
              </div>

              <nav className="py-3 space-y-5">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <div className="px-3 text-[10px] font-mono font-semibold tracking-wider text-stone-500 uppercase">
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                            isActive
                              ? 'bg-stone-800 text-white font-semibold shadow-xs ring-1 ring-white/10'
                              : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/50'
                          }`}
                        >
                          <Icon size={15} className={isActive ? 'text-white' : 'text-stone-400'} />
                          <span>{item.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-stone-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center font-mono text-xs font-medium shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-stone-100 truncate">{displayName}</div>
                  <div className="text-[10px] font-mono text-stone-400 truncate">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-stone-800 text-xs font-mono text-stone-200 hover:bg-rose-900/40 hover:text-rose-200 transition"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header (Hidden on mobile to avoid double headers) */}
        <header className="hidden lg:flex bg-white border-b border-stone-200/80 px-6 lg:px-8 py-3.5 items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
            <span>ADMIN CONSOLE</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold uppercase tracking-wider">
              {currentPathSegment}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 px-3 py-1.5 rounded-lg text-xs text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">System Live (3.5% fee active)</span>
            </div>

            {/* Notification Bell in Header */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition focus:outline-none cursor-pointer"
              >
                <div className="h-7 w-7 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-mono text-xs font-medium">
                  {userInitials}
                </div>
                <ChevronDown size={14} className="text-stone-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-lg py-1.5 text-xs text-stone-700 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <div className="font-medium text-stone-900 truncate">{displayName}</div>
                    <div className="text-[11px] font-mono text-stone-500 truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 transition"
                  >
                    <Sliders size={14} className="text-stone-500" />
                    <span>Platform Settings</span>
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-stone-700 transition"
                  >
                    <FileText size={14} className="text-stone-500" />
                    <span>Audit Trail</span>
                  </Link>
                  <div className="border-t border-stone-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


