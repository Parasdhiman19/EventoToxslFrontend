import React, { useState, useEffect } from 'react'
import { Bell, CheckCheck, Filter, Sparkles, Loader2 } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationItem from '../../components/notifications/NotificationItem'
import NotificationEmptyState from '../../components/notifications/NotificationEmptyState'

export default function UserNotifications() {
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const [page, setPage] = useState(1)

  const {
    notifications,
    unreadCount,
    wsStatus,
    isLoading,
    hasMore,
    totalCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  // Refetch when filter changes
  useEffect(() => {
    setPage(1)
    fetchNotifications({
      page: 1,
      unreadOnly: filter === 'unread',
      append: false,
    })
  }, [filter, fetchNotifications])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications({
      page: nextPage,
      unreadOnly: filter === 'unread',
      append: true,
    })
  }

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-stone-900 text-stone-50">
              <Bell size={16} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
              Activity &amp; Updates
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
            Notifications
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Status */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs font-mono text-stone-600 shadow-2xs"
            title={`WebSocket status: ${wsStatus}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : wsStatus === 'connecting'
                  ? 'bg-amber-500 animate-spin'
                  : 'bg-stone-300'
              }`}
            />
            <span>{wsStatus === 'connected' ? 'Live Stream' : 'Reconnecting'}</span>
          </span>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-mono font-medium transition shadow-xs cursor-pointer active:scale-95"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 my-6">
        <div className="inline-flex p-1 bg-stone-200/70 rounded-full border border-stone-300/60">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs font-mono text-stone-400 hidden sm:inline-block">
          {totalCount} total item{totalCount === 1 ? '' : 's'}
        </span>
      </div>

      {/* Notifications List */}
      <div className="bg-stone-100/50 rounded-3xl border border-stone-200/80 p-2 sm:p-3 shadow-2xs divide-y divide-stone-200/60">
        {isLoading && filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-stone-700" />
            <span className="text-xs font-mono">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        ) : (
          <NotificationEmptyState filter={filter} />
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 text-xs font-mono font-semibold transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Loading...' : 'Load Earlier Notifications'}
          </button>
        </div>
      )}
    </div>
  )
}
