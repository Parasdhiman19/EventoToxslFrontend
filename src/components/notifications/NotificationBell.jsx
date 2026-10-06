import React, { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell({ variant = 'light' }) {
  const [isOpen, setIsOpen] = useState(false)
  const bellRef = useRef(null)

  const {
    notifications,
    unreadCount,
    wsStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  // Close dropdown on outside click or touch
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const isDark = variant === 'dark'

  return (
    <div className="relative inline-block" ref={bellRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 active:scale-95 ${
          isDark
            ? 'text-stone-300 hover:text-stone-50 hover:bg-stone-800 focus:ring-stone-700'
            : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/90 border border-stone-200/80 bg-white/80 backdrop-blur-xs shadow-2xs focus:ring-stone-900/10'
        }`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell size={18} className="transition-transform group-hover:scale-105" />

        {/* Dynamic Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-stone-950 font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="absolute inset-0 rounded-full bg-amber-400 opacity-75 animate-ping pointer-events-none" />
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          wsStatus={wsStatus}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          onDelete={deleteNotification}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
