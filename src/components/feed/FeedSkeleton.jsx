import React from 'react'

export default function FeedSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-stone-200/90 bg-white overflow-hidden shadow-sm animate-pulse space-y-0">
      {/* Visual Canvas Skeleton */}
      <div className="h-72 sm:h-96 w-full bg-stone-200/80 relative">
        <div className="absolute top-4 left-4 h-12 w-12 bg-stone-300/80 rounded-2xl" />
        <div className="absolute top-4 right-4 h-9 w-9 bg-stone-300/80 rounded-full" />
        <div className="absolute bottom-4 left-4 h-6 w-28 bg-stone-300/80 rounded-md" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 sm:p-8 space-y-5">
        {/* Organizer & Date */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-stone-200 rounded-md" />
          <div className="h-4 w-28 bg-stone-200 rounded-md" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-7 w-3/4 bg-stone-200 rounded-lg" />
          <div className="h-4 w-full bg-stone-200/60 rounded-md" />
          <div className="h-4 w-2/3 bg-stone-200/60 rounded-md" />
        </div>

        {/* Logistics capsule */}
        <div className="h-12 w-full bg-stone-100 rounded-xl" />

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="h-6 w-24 bg-stone-200 rounded-md" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-stone-200 rounded-xl" />
            <div className="h-9 w-32 bg-stone-300 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
