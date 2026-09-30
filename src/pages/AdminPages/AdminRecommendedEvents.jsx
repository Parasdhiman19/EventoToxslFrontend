import React, { useState, useEffect } from 'react'
import API from '../../services/api'
import {
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Calendar,
  RefreshCw,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export default function AdminRecommendedEvents() {
  const [recommendations, setRecommendations] = useState([])
  const [availableEvents, setAvailableEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState('')
  const [priorityRank, setPriorityRank] = useState(1)
  const [searchEvent, setSearchEvent] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const [rRes, eRes] = await Promise.all([
        API.get('admin/recommended-events/'),
        API.get('events/?page_size=100'),
      ])
      setRecommendations(rRes.data)
      setAvailableEvents(eRes.data.results || eRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!selectedEventId) return
    setIsSubmitting(true)
    try {
      await API.post('admin/recommended-events/', {
        eventId: selectedEventId,
        priorityRank: Number(priorityRank),
        isActive: true,
      })
      setFeedback('Stage added to public recommendations.')
      setIsDrawerOpen(false)
      setSelectedEventId('')
      fetchRecommendations()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add recommended event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`admin/recommended-events/${id}/`)
      setFeedback('Removed from recommendations.')
      fetchRecommendations()
    } catch (err) {
      alert('Failed to remove.')
    }
  }

  const handleMoveOrder = async (index, direction) => {
    const newItems = [...recommendations]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Update ranks
    const orderPayload = newItems.map((r, i) => ({ id: r.id, priorityRank: i + 1 }))
    setRecommendations(newItems)

    try {
      await API.post('admin/recommended-events/reorder/', { order: orderPayload })
    } catch (err) {
      fetchRecommendations()
    }
  }

  const filteredEvents = availableEvents.filter((ev) => {
    const isAlreadyRecommended = recommendations.some((r) => r.eventId === ev.id)
    const matchesSearch = !searchEvent || ev.title.toLowerCase().includes(searchEvent.toLowerCase())
    return !isAlreadyRecommended && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Recommended Events Curation
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Curate and prioritize stages appearing in the public &ldquo;Recommended For You&rdquo; discovery feed.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchRecommendations}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl transition shadow-2xs active:scale-95 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              setPriorityRank(recommendations.length + 1)
              setIsDrawerOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-medium transition shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Spotlight</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-stone-500 bg-white rounded-xl border border-stone-200/80 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <span>Loading recommended stages...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-20 text-center text-xs font-mono text-stone-400 bg-white rounded-xl border border-stone-200/80">
            No recommended events curated yet. Click "Add Spotlight" to feature events.
          </div>
        ) : (
          recommendations.map((r, idx) => (
            <div
              key={r.id}
              className="p-3.5 sm:p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:border-stone-900 transition"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex flex-col items-center gap-0.5 shrink-0 text-stone-400">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(idx, -1)}
                    className="p-1 hover:text-stone-900 disabled:opacity-20 transition"
                    title="Promote Rank"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    #{idx + 1}
                  </span>
                  <button
                    disabled={idx === recommendations.length - 1}
                    onClick={() => handleMoveOrder(idx, 1)}
                    className="p-1 hover:text-stone-900 disabled:opacity-20 transition"
                    title="Demote Rank"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {r.eventBanner ? (
                  <img
                    src={r.eventBanner}
                    alt=""
                    className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                  />
                ) : (
                  <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200 shrink-0">
                    <Calendar size={16} />
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-sm text-stone-900 truncate">{r.eventTitle}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {r.eventStatus}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 font-mono truncate max-w-md">
                    Host: <span className="text-stone-800 font-medium">{r.organizerName}</span> &bull; {r.eventCategory} &bull; {r.eventCity || 'Online'}
                  </div>
                  <div className="text-[11px] font-mono text-stone-400">
                    Date: {r.eventDate || 'TBA'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 sm:p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  title="Remove Recommendation"
                >
                  <Trash2 size={15} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Recommendation Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-stone-700" />
                  <h2 className="font-serif text-lg font-bold text-stone-900">Add Recommended Stage</h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdd} id="rec-form" className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Filter Live Events</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by event title..."
                      value={searchEvent}
                      onChange={(e) => setSearchEvent(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Select Event *</label>
                  <select
                    required
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                  >
                    <option value="">-- Choose an event to feature --</option>
                    {filteredEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.city || 'Online'} &bull; {ev.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Priority Rank Position</label>
                  <input
                    type="number"
                    min="1"
                    value={priorityRank}
                    onChange={(e) => setPriorityRank(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition font-mono"
                  />
                  <p className="text-[10px] text-stone-500 font-mono">Rank #1 appears at the very beginning of the recommended feed.</p>
                </div>
              </form>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-stone-600 hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="rec-form"
                disabled={isSubmitting || !selectedEventId}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-mono font-medium transition shadow-2xs disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add to Recommendations'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


