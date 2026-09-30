import React from 'react'
import { Bell, Sparkles } from 'lucide-react'

export default function NotificationEmptyState({ filter = 'all' }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-200">
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-200/80 flex items-center justify-center text-stone-400 shadow-inner">
          <Bell size={24} className="opacity-80" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
          <Sparkles size={11} />
        </div>
      </div>

      <h3 className="font-serif text-sm font-semibold text-stone-900 mb-1">
        {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
      </h3>
      <p className="text-xs text-stone-500 max-w-xs leading-relaxed font-sans">
        {filter === 'unread'
          ? 'You have reviewed all your recent activity.'
          : 'When updates, ticket orders, or announcements happen, they will appear here in real time.'}
      </p>
    </div>
  )
}
