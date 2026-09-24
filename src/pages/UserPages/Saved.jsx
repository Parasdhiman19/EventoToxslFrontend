import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Sparkles, AlertCircle } from 'lucide-react'
import API from '../../services/api'

export default function Saved() {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchSavedEvents = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const res = await API.get('events/saved/')
        if (isMounted && Array.isArray(res.data)) {
          setBookmarkedEvents(res.data)
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.detail || 'Could not load bookmarked stages.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchSavedEvents()

    return () => {
      isMounted = false
    }
  }, [])

  const removeBookmark = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarkedEvents((prev) => prev.filter((item) => item.id !== id))
    try {
      await API.post(`events/${id}/bookmark/`)
    } catch {
      // Ignore error on optimistic update
    }
  }

  const clearAllBookmarks = async () => {
    setBookmarkedEvents([])
    try {
      await API.delete('events/saved/clear/')
    } catch {
      // Ignore error
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Saved Stages &amp; Bookmarks
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Curated list of experiences, talks, and live stages you&apos;re monitoring.
          </p>
        </div>

        {bookmarkedEvents.length > 0 && (
          <button
            type="button"
            onClick={clearAllBookmarks}
            className="rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 hover:text-red-600 transition-colors cursor-pointer w-full sm:w-fit text-center"
          >
            Clear All Saved
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="h-44 w-full bg-stone-200 rounded-lg" />
              <div className="h-5 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-xs text-red-700 space-y-2">
          <p className="font-semibold">{fetchError}</p>
        </div>
      ) : bookmarkedEvents.length > 0 ? (
        /* Grid of Saved Events */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>{bookmarkedEvents.length} Saved experiences</span>
            <span>Instant checkout available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedEvents.map((ev) => (
              <Link
                key={ev.id}
                to={`/events/${ev.id}`}
                className="group flex flex-col rounded-xl border border-stone-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md hover:border-stone-300 transition-all"
              >
                {/* Event Image */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={ev.image || ev.banner || '/emptybanner.jpg'}
                    alt={ev.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Remove Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => removeBookmark(ev.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/80 backdrop-blur-sm text-stone-100 hover:bg-stone-900 transition-all cursor-pointer"
                    title="Remove from saved"
                    aria-label="Remove bookmark"
                  >
                    <Bookmark size={14} fill="currentColor" />
                  </button>

                  <span className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-stone-200 border border-stone-700">
                    {ev.category || 'Event'}
                  </span>
                </div>

                {/* Event Information */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                      {ev.dateFormatted || ev.date} • {ev.time || ev.startTime || ''}
                    </div>
                    <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-stone-700 transition-colors leading-snug line-clamp-2">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {ev.venueName || ev.venue || 'Venue'} • {ev.city || 'Chandigarh'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-stone-400 block">
                        Price
                      </span>
                      <span className="font-mono text-sm font-semibold text-stone-900">
                        {ev.startingPrice || 'Free'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-stone-900 group-hover:underline">
                      Reserve &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-stone-300 p-16 text-center space-y-4 bg-white">
          <div className="h-12 w-12 mx-auto rounded-full bg-stone-100 text-stone-500 flex items-center justify-center">
            <Bookmark size={24} />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg font-medium text-stone-900">No saved stages yet</p>
            <p className="text-xs text-stone-500">
              Bookmark upcoming concerts, summits, and gatherings to track their ticket availability.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-block rounded-md bg-stone-900 px-5 py-2.5 text-xs font-mono font-medium uppercase tracking-wider text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs"
          >
            Explore Events &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}