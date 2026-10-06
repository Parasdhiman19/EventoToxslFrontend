import { useState, useRef, useEffect, useMemo } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Menu, 
  X, 
  Home as HomeIcon,
  Compass, 
  Ticket, 
  Bookmark, 
  Receipt,
  Search,
  Sparkles,
  CheckCircle2,
  Building2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Bell,
  HelpCircle
} from 'lucide-react'
import API from '../services/api'
import { logout, updateUser } from '../redux/slice/authSlice'
import Footer from '../components/layout/Footer'
import MobileDrawer from '../components/layout/MobileDrawer'
import BecomeOrganizerModal from '../components/layout/BecomeOrganizerModal'
import { useAuthPrompt } from '../context/AuthPromptContext'
import NotificationBell from '../components/notifications/NotificationBell'


export default function UserLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isBecomeOrganizerOpen, setIsBecomeOrganizerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Global Header Search State
  const [headerSearch, setHeaderSearch] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cachedEvents, setCachedEvents] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // Track scrolling / movement on mobile to trigger expanding and contracting animation
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY
          setIsScrolled(currentY > 18)
          ticking = false
        })
        ticking = true
      }
    }

    // Also listen to custom feed scroll events from mobile snap feeds
    const handleCustomScroll = (e) => {
      const top = e.detail?.scrollTop ?? e.target?.scrollTop ?? 0
      setIsScrolled(top > 18)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('feedscroll', handleCustomScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('feedscroll', handleCustomScroll)
    }
  }, [])

  const [orgForm, setOrgForm] = useState({
    organizationName: '',
    supportEmail: '',
    supportPhone: '',
    bio: '',
  })
  const [isSubmittingOrg, setIsSubmittingOrg] = useState(false)
  const [orgSuccess, setOrgSuccess] = useState(false)
  const [orgError, setOrgError] = useState(null)

  const profileRef = useRef(null)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user, isOrganizer, isSuperAdmin, isAuthenticated } = useSelector((state) => state.auth)
  const { openAuthPrompt } = useAuthPrompt()

  // Load events for instant search dropdown
  const loadSearchEvents = async () => {
    if (cachedEvents.length > 0) return
    setIsLoadingEvents(true)
    try {
      const res = await API.get('events/')
      if (Array.isArray(res.data)) {
        setCachedEvents(res.data)
      }
    } catch {
      // Ignore background error
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Real-time search matches
  const searchResults = useMemo(() => {
    const q = headerSearch.toLowerCase().trim()
    if (!q) return []
    return cachedEvents
      .filter((ev) => {
        const title = (ev.title || '').toLowerCase()
        const venue = (ev.venueName || ev.venue || '').toLowerCase()
        const city = (ev.city || '').toLowerCase()
        const cat = (ev.category || '').toLowerCase()
        const org = (ev.organizer || '').toLowerCase()
        return title.includes(q) || venue.includes(q) || city.includes(q) || cat.includes(q) || org.includes(q)
      })
      .slice(0, 5)
  }, [headerSearch, cachedEvents])

  // Automatically close mobile menu & search on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname, location.search])

  // Global keyboard shortcut ('/' or 'Cmd+K') to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is currently typing in an input, textarea, or contentEditable
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return
      }

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchOpen(true)
        loadSearchEvents()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cachedEvents])

  // Close search and profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when mobile drawer or onboarding modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isBecomeOrganizerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isBecomeOrganizerOpen])

  const handleHeaderSearchSubmit = (e) => {
    e?.preventDefault()
    setIsSearchOpen(false)
    const q = headerSearch.trim()
    if (q) {
      navigate(`/discover?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/discover')
    }
  }

  const handleSelectSearchResult = (eventId) => {
    setIsSearchOpen(false)
    setHeaderSearch('')
    navigate(`/events/${eventId}`)
  }

  const handleLogout = async () => {
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
    try {
      await API.post('auth/logout/')
    } catch {
      // Ignore network error on logout
    }
    dispatch(logout())
    navigate('/account/login')
  }

  const handleOpenBecomeOrganizer = () => {
    setIsMobileMenuOpen(false)
    if (!isAuthenticated) {
      openAuthPrompt({
        actionType: 'host',
        title: 'Host Experiences on Evento',
        subtitle: 'Sign in or create an organizer account to host events, design seating plans, and sell passes.',
      })
      return
    }
    setOrgForm({
      organizationName: user?.fullName ? `${user.fullName}'s Studio` : 'My Event Studio',
      supportEmail: user?.email || '',
      supportPhone: '',
      bio: '',
    })
    setOrgSuccess(false)
    setOrgError(null)
    setIsBecomeOrganizerOpen(true)
  }

  // Automatically trigger Become Organizer Modal if redirected from protected route or URL action
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'become-host' || location.state?.openBecomeOrganizer) {
      if (isAuthenticated && !isOrganizer) {
        handleOpenBecomeOrganizer()
      } else if (!isAuthenticated) {
        openAuthPrompt({
          actionType: 'host',
          redirectPath: '/manager/events/create',
        })
      }
    }
  }, [location.search, location.state, isAuthenticated, isOrganizer])

  const handleBecomeOrganizerSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingOrg(true)
    setOrgError(null)

    try {
      const res = await API.post('auth/become-organizer/', {
        organizationName: orgForm.organizationName,
        supportEmail: orgForm.supportEmail,
        supportPhone: orgForm.supportPhone,
        bio: orgForm.bio,
      })

      // Update Redux state with verified organizer status
      dispatch(updateUser(res.data.user))
      setOrgSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Could not activate organizer profile. Please try again.'
      setOrgError(msg)
    } finally {
      setIsSubmittingOrg(false)
    }
  }

  const navLinks = useMemo(() => {
    if (isAuthenticated) {
      return [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Discover', path: '/discover', icon: Compass },
        { name: 'My Tickets', path: '/user/tickets', icon: Ticket },
        { name: 'Saved', path: '/user/saved', icon: Bookmark },
        { name: 'Orders', path: '/user/orders', icon: Receipt },
      ]
    }
    return [
      { name: 'Home', path: '/', icon: HomeIcon },
      { name: 'Discover', path: '/discover', icon: Compass },
      { name: 'About', path: '/about', icon: Sparkles },
    ]
  }, [isAuthenticated])

  const mobileBottomLinks = useMemo(() => {
    if (isAuthenticated) {
      return [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Discover', path: '/discover', icon: Compass },
        { name: 'Tickets', path: '/user/tickets', icon: Ticket },
        { name: 'Saved', path: '/user/saved', icon: Bookmark },
        { name: 'Orders', path: '/user/orders', icon: Receipt },
      ]
    }
    return [
      { name: 'Home', path: '/', icon: HomeIcon },
      { name: 'Discover', path: '/discover', icon: Compass },
      { name: 'Saved', path: '/user/saved', icon: Bookmark, isAuthGated: true, authAction: 'bookmark' },
      { name: 'About', path: '/about', icon: Sparkles },
      { name: 'Sign In', path: '/account/login', icon: UserIcon },
    ]
  }, [isAuthenticated])

  const userHasOrganizerAccess = isOrganizer || user?.isOrganizer || user?.role === 'manager'
  const isDiscoverPage = location.pathname.includes('/discover')

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-stone-50 font-sans">
      {/* Top Global Navigation Bar */}
      <header className={`sticky top-0 z-40 border-b transition-all duration-200 ${
        isScrolled 
          ? 'border-stone-300/80 bg-white/95 backdrop-blur-xl shadow-xs' 
          : 'border-stone-200/80 bg-white/90 backdrop-blur-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
            
            {/* Left: Brand Logo & Desktop Nav */}
            <div className="flex items-center gap-2 lg:gap-6 shrink-0">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 text-stone-50 font-serif font-bold shadow-xs ring-1 ring-stone-900/10 group-hover:scale-105 group-hover:shadow-md transition-all duration-200 w-8 h-8 text-base">
                  <span>E</span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold tracking-tight text-stone-900 leading-none group-hover:text-stone-700 transition-colors text-xl">
                    Evento
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 leading-tight mt-0.5">
                    Live Stages
                  </span>
                </div>
              </Link>

              {/* Desktop & Tablet Nav Links (Always visible from md breakpoint onwards) */}
              <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 bg-stone-100/70 rounded-full border border-stone-200/70 backdrop-blur-xs">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
                          isActive
                            ? 'bg-stone-900 text-stone-50 shadow-xs font-semibold'
                            : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
                        }`
                      }
                    >
                      <Icon size={13} className="shrink-0" />
                      <span>{link.name}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Middle: Working Interactive Search Bar (Responsive sizing on tablet/desktop) */}
            <div className="hidden md:flex flex-1 min-w-0 max-w-[160px] lg:max-w-xs xl:max-w-md relative" ref={searchRef}>
              <form onSubmit={handleHeaderSearchSubmit} className="w-full relative group">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search events, artists, venues..."
                  value={headerSearch}
                  onFocus={() => {
                    setIsSearchOpen(true)
                    loadSearchEvents()
                  }}
                  onChange={(e) => {
                    setHeaderSearch(e.target.value)
                    setIsSearchOpen(true)
                    loadSearchEvents()
                  }}
                  className="w-full pl-9 pr-12 py-2 text-xs rounded-full border border-stone-200/90 bg-stone-100/60 placeholder:text-stone-400 text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 hover:bg-stone-100/90 transition-all duration-200 shadow-2xs"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                
                {headerSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderSearch('')
                      searchInputRef.current?.focus()
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer rounded-full hover:bg-stone-200 transition"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase bg-white text-stone-400 px-1.5 py-0.5 rounded-md border border-stone-200 shadow-2xs pointer-events-none">
                    /
                  </kbd>
                )}
              </form>

              {/* Live Search Instant Results Popover */}
              {isSearchOpen && headerSearch.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500 bg-stone-50/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles size={12} className="text-amber-600" />
                      {isLoadingEvents ? 'Searching live stages...' : `${searchResults.length} match${searchResults.length === 1 ? '' : 'es'} found`}
                    </span>
                    <button
                      type="button"
                      onClick={handleHeaderSearchSubmit}
                      className="text-stone-900 hover:underline font-semibold cursor-pointer"
                    >
                      View all &rarr;
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {isLoadingEvents && searchResults.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2.5">
                        <Loader2 size={16} className="animate-spin text-stone-600" />
                        <span>Searching database...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => handleSelectSearchResult(ev.id)}
                          className="w-full p-3 text-left hover:bg-stone-50 transition-colors flex items-center gap-3.5 cursor-pointer group"
                        >
                          <img
                            src={ev.image || ev.banner || '/emptybanner.jpg'}
                            alt={ev.title}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/80 shadow-2xs group-hover:scale-102 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-stone-900 truncate group-hover:text-amber-900 transition-colors">
                              {ev.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400 mt-1">
                              <span>{ev.dateFormatted || ev.date || 'TBA'}</span>
                              <span>•</span>
                              <span className="truncate">{ev.venueName || ev.venue || 'Venue'}</span>
                            </div>
                          </div>
                          <span className="text-xs font-serif font-bold text-stone-900 shrink-0 px-2 py-1 rounded-md bg-stone-100 border border-stone-200 font-mono">
                            {ev.startingPrice || 'Free'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center space-y-1">
                        <p className="text-xs text-stone-700 font-serif font-medium text-sm">No experiences found</p>
                        <p className="text-[11px] text-stone-400">
                          Try searching for &quot;Music&quot;, &quot;Concerts&quot;, or a city name.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center">
                    <button
                      type="button"
                      onClick={handleHeaderSearchSubmit}
                      className="w-full py-2 px-3 rounded-xl text-xs font-mono font-medium text-stone-800 bg-white border border-stone-200/80 hover:bg-stone-100 transition shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore all matching &quot;{headerSearch}&quot;</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Host/Switch Button & Profile */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Host/Switch Mode Trigger */}
              {userHasOrganizerAccess ? (
                <Link
                  to="/manager/overview"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition-all shadow-xs group"
                >
                  <Building2 size={13} className="text-stone-300" />
                  <span>Manager Mode</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenBecomeOrganizer}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/70 text-amber-900 text-xs font-medium hover:border-amber-400 hover:bg-amber-50/80 transition-all shadow-2xs cursor-pointer group"
                >
                  <Sparkles size={13} className="text-amber-600 group-hover:rotate-12 transition-transform" />
                  <span>Become a Host</span>
                </button>
              )}

              <div className="h-5 w-px bg-stone-200 mx-0.5" />

              {/* Notification Bell (Desktop) */}
              {isAuthenticated && (
                <NotificationBell />
              )}

              {/* Profile Dropdown */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50 transition shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 text-stone-50 text-[11px] font-bold flex items-center justify-center font-mono shadow-2xs overflow-hidden">
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
                    <span className="text-xs font-medium text-stone-800 max-w-[110px] truncate hidden xl:inline-block">
                      {user?.fullName || (user?.username ? `@${user.username}` : 'Attendee')}
                    </span>
                    <ChevronDown size={13} className={`text-stone-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-stone-900' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 divide-y divide-stone-100">
                      <div className="px-4 py-3 bg-stone-50/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-900 text-stone-50 font-bold flex items-center justify-center text-xs font-mono shadow-2xs overflow-hidden shrink-0 border border-stone-200">
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-semibold text-stone-900 truncate">{user?.fullName || 'Attendee'}</p>
                            {userHasOrganizerAccess && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-900 text-stone-50 font-medium shrink-0">
                                Host
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-stone-500 truncate">
                            {user?.username ? `@${user.username}` : user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="py-1.5 px-1.5 space-y-0.5">
                        <Link
                          to="/user/notifications"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition font-medium"
                        >
                          <Bell size={14} className="text-stone-500" />
                          <span>Notifications</span>
                        </Link>
                        <Link
                          to="/user/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition font-medium"
                        >
                          <UserIcon size={14} className="text-stone-500" />
                          <span>Profile &amp; Settings</span>
                        </Link>
                        <Link
                          to="/user/tickets"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition font-medium"
                        >
                          <Ticket size={14} className="text-stone-400" />
                          <span>My Digital Passes</span>
                        </Link>
                        <Link
                          to="/user/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition font-medium"
                        >
                          <Receipt size={14} className="text-stone-400" />
                          <span>Order Invoices</span>
                        </Link>
                        <Link
                          to="/user/saved"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition font-medium"
                        >
                          <Bookmark size={14} className="text-stone-400" />
                          <span>Saved Experiences</span>
                        </Link>
                        <Link
                          to="/user/support"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition font-medium"
                        >
                          <HelpCircle size={14} className="text-stone-400" />
                          <span>Help &amp; Support</span>
                        </Link>
                      </div>

                      <div className="p-1.5 space-y-1">
                        {(isSuperAdmin || user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin') && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-900 font-semibold bg-stone-100 hover:bg-stone-200/80 transition border border-stone-200"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-amber-600" />
                              <span className="font-mono text-xs uppercase tracking-wide">Super Admin Console</span>
                            </span>
                            <span className="text-stone-400 font-mono">&rarr;</span>
                          </Link>
                        )}

                        {userHasOrganizerAccess ? (
                          <Link
                            to="/manager/overview"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-stone-900 font-semibold bg-stone-100 hover:bg-stone-200/70 transition"
                          >
                            <span className="flex items-center gap-2">
                              <Building2 size={14} className="text-stone-700" />
                              Manager Dashboard
                            </span>
                            <span>&rarr;</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={handleOpenBecomeOrganizer}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-amber-900 font-semibold bg-amber-50 hover:bg-amber-100/70 transition text-left cursor-pointer border border-amber-200/80"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles size={14} className="text-amber-600" />
                              Become an Organizer
                            </span>
                            <span>&rarr;</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1.5 px-1.5">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition cursor-pointer text-left font-medium"
                        >
                          <LogOut size={14} className="text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/account/login"
                    state={{ from: location }}
                    className="px-3.5 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-700 hover:text-stone-950 text-xs font-medium transition shadow-2xs cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/account/signup"
                    state={{ from: location }}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium transition shadow-xs group cursor-pointer active:scale-95"
                  >
                    <span>Sign Up</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle & Mobile Notification Bell */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && (
                <NotificationBell />
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`rounded-full border border-stone-200 bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 active:scale-90 hover:scale-105 transition-all duration-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-stone-900/10 cursor-pointer ${
                  isScrolled ? 'p-1.5' : 'p-2'
                }`}
                aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                  <Menu
                    size={isScrolled ? 16 : 18}
                    className={`absolute inset-0 m-auto transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X
                    size={isScrolled ? 16 : 18}
                    className={`absolute inset-0 m-auto transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                    }`}
                  />
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Full-Screen Animated Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        headerSearch={headerSearch}
        setHeaderSearch={setHeaderSearch}
        onSearchSubmit={(e) => {
          e.preventDefault()
          setIsMobileMenuOpen(false)
          navigate(`/discover?q=${encodeURIComponent(headerSearch.trim())}`)
        }}
        isAuthenticated={isAuthenticated}
        user={user}
        isSuperAdmin={isSuperAdmin}
        userHasOrganizerAccess={userHasOrganizerAccess}
        onOpenBecomeOrganizer={handleOpenBecomeOrganizer}
        onLogout={handleLogout}
      />

      {/* Become an Organizer Onboarding Modal */}
      <BecomeOrganizerModal
        isOpen={isBecomeOrganizerOpen}
        onClose={() => setIsBecomeOrganizerOpen(false)}
        orgSuccess={orgSuccess}
        orgError={orgError}
        orgForm={orgForm}
        setOrgForm={setOrgForm}
        isSubmittingOrg={isSubmittingOrg}
        onSubmit={handleBecomeOrganizerSubmit}
        onNavigateCreate={() => {
          setIsBecomeOrganizerOpen(false)
          navigate('/manager/events/create')
        }}
        onNavigateOverview={() => {
          setIsBecomeOrganizerOpen(false)
          navigate('/manager/overview')
        }}
      />

      {/* Main Content Area */}
      {(() => {
        const isDiscoverPage = location.pathname.includes('/discover')
        return (
          <>
            <main className={`flex-1 w-full max-w-[1600px] mx-auto ${
              isDiscoverPage 
                ? 'px-0 py-0 lg:px-8 lg:py-8' 
                : 'px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-8'
            }`}>
              <Outlet context={{ openBecomeOrganizer: handleOpenBecomeOrganizer }} />
            </main>

            {/* Reusable Detailed Footer (hidden on mobile discover to allow 100dvh full-screen feed, visible on desktop and other pages) */}
            <Footer 
              onOpenBecomeOrganizer={handleOpenBecomeOrganizer}
              className={`mt-auto pb-28 md:pb-0 ${isDiscoverPage ? 'hidden lg:block' : ''}`} 
            />

            {/* Instagram-Style Mobile Bottom Navigation Bar */}
            <nav 
              aria-label="Mobile Bottom Navigation"
              className="fixed bottom-0 inset-x-0 z-40 md:hidden h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 flex items-center justify-center"
            >
              <div className="grid grid-cols-5 items-center justify-around w-full max-w-md mx-auto">
                {mobileBottomLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = (link.path === '/' && location.pathname === '/') || 
                                   (link.path !== '/' && location.pathname.startsWith(link.path))
                  
                  const handleClick = (e) => {
                    if (link.isAuthGated && !isAuthenticated) {
                      e.preventDefault()
                      openAuthPrompt({
                        actionType: link.authAction || 'general',
                        redirectPath: link.path,
                      })
                    }
                  }

                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={handleClick}
                      className={`flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all duration-200 select-none active:scale-90 ${
                        isActive
                          ? 'text-stone-950 font-semibold'
                          : 'text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <Icon 
                          size={20} 
                          className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} 
                        />
                        {isActive && (
                          <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-stone-900" />
                        )}
                      </div>
                      <span className={`text-[10px] tracking-tight leading-none ${isActive ? 'font-bold text-stone-950' : 'font-medium text-stone-400'}`}>
                        {link.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </>
        )
      })()}
    </div>
  )
}