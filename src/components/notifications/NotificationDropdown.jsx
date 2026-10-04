import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCheck, ExternalLink, Sparkles } from 'lucide-react'
import NotificationItem from './NotificationItem'
import NotificationEmptyState from './NotificationEmptyState'

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  wsStatus = 'connected',
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClose,
}) {
  const location = useLocation()
  const isManagerSection = location.pathname.startsWith('/manager')
  const allNotificationsUrl = isManagerSection
    ? '/manager/notifications'
    : '/user/notifications'

  const displayList = notifications.slice(0, 5)

  return (
    <div
      className="absolute right-0 sm:right-0 top-full mt-2.5 w-[calc(100vw-24px)] sm:w-[380px] max-w-[380px] rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-label="Notification Center"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-sm font-semibold text-stone-900 tracking-tight">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold shadow-2xs">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time status pill */}
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-400"
            title={`WebSocket: ${wsStatus}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : wsStatus === 'connecting'
                  ? 'bg-amber-500 animate-spin'
                  : 'bg-stone-300'
              }`}
            />
            <span>{wsStatus === 'connected' ? 'Live' : 'Syncing'}</span>
          </span>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600 hover:text-stone-950 font-medium px-2 py-0.5 rounded-md hover:bg-stone-200/70 transition cursor-pointer"
            >
              <CheckCheck size={13} className="text-stone-500" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* List / Scrollable Container */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-stone-100">
        {displayList.length > 0 ? (
          displayList.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
              onCloseDropdown={onClose}
              compact={true}
            />
          ))
        ) : (
          <NotificationEmptyState />
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
        <Link
          to={allNotificationsUrl}
          onClick={onClose}
          className="w-full py-2 px-3 rounded-xl font-mono text-xs font-semibold text-stone-900 bg-white border border-stone-200/80 hover:bg-stone-100 transition shadow-2xs inline-flex items-center justify-center gap-1.5 text-center group"
        >
          <span>View All Notifications</span>
          <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
