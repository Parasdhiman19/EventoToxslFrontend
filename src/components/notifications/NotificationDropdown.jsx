import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCheck, ExternalLink, X } from 'lucide-react'
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
    <>
      {/* Mobile Dimmed Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-50 sm:hidden animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Card: Top Slide-down for Mobile, Anchored Popover for Desktop */}
      <div
        className="fixed inset-x-3.5 top-[60px] z-50 w-auto max-w-[calc(100vw-28px)] rounded-2xl bg-white/98 backdrop-blur-xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[min(460px,calc(100dvh-80px))] animate-in fade-in slide-in-from-top-2 duration-200 sm:fixed-none sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-[380px] sm:max-w-[380px] sm:max-h-[520px] sm:rounded-2xl sm:border sm:border-stone-200/90 sm:shadow-2xl sm:animate-in sm:fade-in sm:zoom-in-95 sm:duration-150"
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
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
                className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600 hover:text-stone-950 font-medium px-2 py-0.5 rounded-md hover:bg-stone-200/70 transition cursor-pointer active:scale-95"
              >
                <CheckCheck size={13} className="text-stone-500" />
                <span className="hidden xs:inline">Mark all read</span>
                <span className="xs:hidden">All read</span>
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-1 -mr-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 transition cursor-pointer active:scale-90"
              aria-label="Close Notifications"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List / Scrollable Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 overscroll-contain">
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
        <div className="p-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs shrink-0">
          <Link
            to={allNotificationsUrl}
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl font-mono text-xs font-semibold text-stone-900 bg-white border border-stone-200/80 hover:bg-stone-100 transition shadow-2xs inline-flex items-center justify-center gap-1.5 text-center group active:scale-[0.99]"
          >
            <span>View All Notifications</span>
            <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </>
  )
}
