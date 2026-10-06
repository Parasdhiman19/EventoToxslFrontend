import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Trash2, ArrowUpRight } from 'lucide-react'
import { getNotificationConfig } from '../../utils/notificationConfig'

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onCloseDropdown,
  compact = false,
}) {
  const navigate = useNavigate()
  const config = getNotificationConfig(notification.notificationType)
  const Icon = config.icon
  const actionUrl = config.getActionUrl(notification.data)

  const handleClick = (e) => {
    // If clicking action buttons, do not trigger navigation
    if (e.target.closest('button[data-action]')) {
      return
    }

    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id)
    }

    if (actionUrl) {
      if (onCloseDropdown) onCloseDropdown()
      navigate(actionUrl)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3.5 transition-all duration-200 cursor-pointer ${
        compact ? 'p-3 hover:bg-stone-50' : 'p-4 rounded-2xl hover:bg-white hover:shadow-sm'
      } ${
        !notification.isRead
          ? 'bg-amber-500/[0.04] border-l-2 border-amber-500'
          : 'bg-transparent border-l-2 border-transparent'
      }`}
    >
      {/* Icon Badge or Actor Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${config.bg} ${config.border} ${config.color}`}
        >
          <Icon size={17} />
        </div>
        {notification.actorAvatar && (
          <img
            src={notification.actorAvatar}
            alt={notification.actorName || 'User'}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1 sm:pr-2">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span
            className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${config.badgeClass}`}
          >
            {config.badge}
          </span>
          <span className="text-[11px] font-mono text-stone-400">
            {notification.timeAgo}
          </span>
        </div>

        <h4
          className={`text-xs leading-snug font-medium text-stone-900 line-clamp-2 ${
            !notification.isRead ? 'font-semibold text-stone-950' : 'text-stone-700'
          }`}
        >
          {notification.title}
        </h4>

        <p className="text-[11.5px] text-stone-500 leading-relaxed line-clamp-2 mt-0.5">
          {notification.message}
        </p>

        {actionUrl && (
          <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-medium text-stone-700 group-hover:text-amber-900 transition-colors">
            <span>{config.actionLabel || 'View Details'}</span>
            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Unread Status Dot & Action Buttons */}
      <div className="shrink-0 flex items-center gap-1 self-start mt-0.5">
        {!notification.isRead && (
          <span
            className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200/80 animate-pulse sm:group-hover:hidden"
            title="Unread"
          />
        )}

        {/* Action buttons (Visible on hover on desktop, always accessible with subtle styling or compact button on mobile) */}
        <div className="flex sm:hidden sm:group-hover:flex items-center gap-0.5">
          {!notification.isRead && onMarkRead && (
            <button
              data-action="mark-read"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead(notification.id)
              }}
              title="Mark as read"
              className="p-1 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 active:scale-90 transition cursor-pointer"
            >
              <Check size={13} />
            </button>
          )}
          {onDelete && (
            <button
              data-action="delete"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
              title="Delete notification"
              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
