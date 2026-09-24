import React, { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, 
  ExternalLink, 
  HelpCircle, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X,
  Compass,
  ArrowUpRight
} from 'lucide-react'
import API from '../services/api'
import { logout } from '../redux/slice/authSlice'

export default function ManagerLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  // Automatically close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setIsProfileOpen(false)
    try {
      await API.post('auth/logout/')
    } catch {
      // Ignore network error on logout
    }
    dispatch(logout())
    navigate('/account/login')
  }


  // Lock body scroll when mobile full-screen drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

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

  const navItems = [
    {
      name: 'Overview',
      path: '/manager/overview',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75H4.25a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h2a.75.75 0 0 1 0 1.5h-2A2.25 2.25 0 0 1 2 15.75V4.25Z" />
          <path d="M10 9a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75V9Z" />
        </svg>
      ),
    },
    {
      name: 'My Events',
      path: '/manager/events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Ticket Sales',
      path: '/manager/tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V8a2 2 0 0 1 0 4v2.5A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5V12a2 2 0 0 1 0-4V5.5A1.5 1.5 0 0 0 17.5 4h-15ZM13 7.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Attendees',
      path: '/manager/attendees',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.115-.53c0-2.362 2.44-4.398 5.5-4.398 3.06 0 5.5 2.036 5.5 4.398 0 .185-.04.364-.115.53a8.958 8.958 0 0 1-5.385 1.572c-1.99 0-3.83-.604-5.385-1.572ZM13.882 11.666A6.29 6.29 0 0 1 18.5 15.9c0 .184-.04.364-.115.53A8.932 8.932 0 0 1 15 17.653a7.353 7.353 0 0 0 .5-2.653c0-1.423-.623-2.698-1.618-3.334Z" />
        </svg>
      ),
    },
    {
      name: 'Payouts & Revenue',
      path: '/manager/payouts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm0 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-6Zm12 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: 'Organizer Settings',
      path: '/manager/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen w-full bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-stone-50 flex flex-col lg:flex-row antialiased">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 sticky top-0 z-30 shadow-md">
        <Link to="/manager/overview" className="inline-flex items-center gap-2 font-serif text-base font-medium tracking-tight active:scale-95 transition-transform">
          <span className="h-6 w-6 rounded-lg bg-stone-100 text-stone-950 flex items-center justify-center font-sans text-xs font-bold shadow-xs">
            E
          </span>
          Evento <span className="text-stone-400 font-sans text-[10px] uppercase tracking-wider ml-0.5">Manager</span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Quick Create Event Mobile Button */}
          <Link
            to="/manager/events/create"
            className="p-1.5 rounded-lg bg-stone-800 text-stone-200 hover:text-stone-50 hover:bg-stone-700 active:scale-90 transition shadow-2xs"
            title="Create Event"
            aria-label="Create New Event"
          >
            <Plus size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-stone-300 hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-800 active:scale-90 transition-all duration-300 focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Menu
                size={18}
                className={`absolute inset-0 m-auto transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                size={18}
                className={`absolute inset-0 m-auto transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Desktop Persistent Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:flex w-72 h-screen shrink-0 bg-stone-900 text-stone-100 flex-col justify-between border-r border-stone-800 static">
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <Link to="/manager/overview" className="inline-flex items-center gap-2.5 font-serif text-xl tracking-tight font-medium">
              <span className="h-7 w-7 rounded bg-stone-100 text-stone-950 flex items-center justify-center font-sans font-bold text-xs">
                E
              </span>
              Evento
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
              Host Studio
            </span>
          </div>

          {/* Quick Action: Create Event */}
          <div className="pt-4 pb-2">
            <Link
              to="/manager/events/create"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-stone-100 py-2.5 px-4 text-xs font-medium uppercase font-mono tracking-wider text-stone-950 hover:bg-stone-200 active:bg-stone-300 transition shadow-xs"
            >
              <Plus size={14} />
              Create New Event
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 pt-2 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 px-3 pb-2">
              Management
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-stone-800 text-stone-50 font-semibold shadow-inner'
                      : 'text-stone-400 hover:bg-stone-800/60 hover:text-stone-200'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer Account Badge */}
          <div className="pt-3 border-t border-stone-800">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-stone-800/40 border border-stone-800">
              <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-[11px] font-semibold text-stone-200 font-mono shrink-0">
                {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'NP'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-stone-200 truncate">{user?.fullName || 'Nexus Productions'}</span>
                <span className="text-[10px] text-stone-500 font-mono truncate">{user?.email || 'manager@evento.com'}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Animated Full-Screen Mobile Drawer (Mobile Only) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {/* Soft Backdrop with smooth fade */}
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sliding & Expanding Panel from top */}
        <div 
          className={`fixed inset-x-0 top-0 max-h-[92vh] w-full bg-stone-900 text-stone-100 rounded-b-3xl shadow-2xl border-b border-stone-800 overflow-y-auto transform transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-98'
          }`}
        >
          {/* Mobile Drawer Header */}
          <div className="p-4 sm:p-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Header Bar with Logo and Close button */}
              <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
                <Link 
                  to="/manager/overview" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2.5 font-serif text-xl tracking-tight font-medium active:scale-95 transition-transform"
                >
                  <span className="h-7 w-7 rounded-lg bg-stone-100 text-stone-950 flex items-center justify-center font-sans font-bold text-xs shadow-xs">
                    E
                  </span>
                  Evento
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700 ml-1">
                    Host Studio
                  </span>
                </Link>
                
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-stone-400 hover:text-stone-100 p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 active:scale-90 hover:rotate-90 transition-all duration-200 focus:outline-none cursor-pointer"
                  aria-label="Close Navigation"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Action: Create New Event */}
              <div className="pt-4 pb-3">
                <Link
                  to="/manager/events/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-stone-100 py-3 px-4 text-xs font-semibold uppercase font-mono tracking-wider text-stone-950 hover:bg-stone-200 active:bg-stone-300 transition shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  Host New Event
                </Link>
              </div>

              {/* Navigation Items with Comfortable Touch Targets */}
              <nav className="space-y-1.5 pt-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 px-3 pb-1.5">
                  Management
                </p>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-stone-800 text-stone-50 font-semibold shadow-inner border border-stone-700/60'
                          : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}

                {/* Mobile Portal Switcher & Help */}
                <div className="pt-4 border-t border-stone-800 space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 px-3 pb-1">
                    Portals &amp; Views
                  </p>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono font-medium text-stone-300 bg-stone-800/80 hover:bg-stone-800 hover:text-stone-100 border border-stone-700/60 transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <Compass size={15} className="text-stone-400" />
                      <span>Switch to User Mode</span>
                    </span>
                    <ArrowUpRight size={14} className="text-stone-400" />
                  </Link>
                  <Link
                    to="/manager/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                  >
                    <HelpCircle size={15} />
                    <span>Help &amp; Support</span>
                  </Link>
                </div>
              </nav>
            </div>

            {/* Footer Profile & Logout Area */}
            <div className="pt-4 border-t border-stone-800 space-y-3 mt-6">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-800/60 border border-stone-800">
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-xs font-semibold text-stone-200 font-mono shrink-0">
                  {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'NP'}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-stone-200 truncate">{user?.fullName || 'Nexus Productions'}</span>
                  <span className="text-[11px] text-stone-400 font-mono truncate">{user?.email || 'manager@evento.com'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-950/50 text-red-300 hover:bg-red-900/60 text-xs font-mono font-medium transition border border-red-900/40 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-y-auto">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex border-b border-stone-200/80 bg-white/90 backdrop-blur-md px-6 sm:px-8 py-2.5 sticky top-0 z-20 items-center justify-between">
          {/* Left: Environment Mode Tag */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Host Console</span>
            </span>
          </div>

          {/* Right: Actions, Links, and Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Redesigned Switch to User Mode Navbar Pill Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/90 text-stone-800 hover:text-stone-950 text-xs font-mono font-medium border border-stone-300/80 transition-all shadow-2xs group cursor-pointer"
              title="Switch to Attendee / User View"
            >
              <Compass size={14} className="text-stone-500 group-hover:text-stone-900 transition-colors" />
              <span>Switch to User Mode</span>
              <ArrowUpRight size={13} className="text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="h-4 w-px bg-stone-200" />

            <Link
              to="/manager/settings"
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-950 text-xs font-medium transition-colors px-2 py-1 rounded-md hover:bg-stone-50"
            >
              <HelpCircle size={14} className="text-stone-400" />
              <span>Support</span>
            </Link>

            <div className="h-4 w-px bg-stone-200" />

            {/* Profile Dropdown Component */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-full border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 transition shadow-2xs cursor-pointer focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-stone-900 text-stone-50 text-[11px] font-medium flex items-center justify-center font-mono">
                  {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'NP'}
                </div>
                <span className="text-xs font-medium text-stone-800">
                  {user?.fullName || 'Nexus Productions'}
                </span>
                <ChevronDown size={13} className={`text-stone-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Modal */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-stone-200 shadow-lg py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="font-medium text-stone-900 truncate">{user?.fullName || 'Nexus Productions'}</p>
                    <p className="text-[11px] font-mono text-stone-400 truncate">{user?.email || 'manager@evento.com'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/manager/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition"
                    >
                      <User size={14} className="text-stone-400" />
                      Organizer Profile
                    </Link>
                    <Link
                      to="/manager/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition"
                    >
                      <Settings size={14} className="text-stone-400" />
                      Account Settings
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50 transition border-t border-stone-100"
                    >
                      <Compass size={14} className="text-stone-400" />
                      Switch to User Mode
                    </Link>
                  </div>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
                    >
                      <LogOut size={14} className="text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet with Responsive Mobile Padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}