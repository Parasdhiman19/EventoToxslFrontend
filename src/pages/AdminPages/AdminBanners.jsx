import React, { useState, useEffect } from 'react'
import API from '../../services/api'
import {
  Image as ImageIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  X,
  ExternalLink,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [previewBanner, setPreviewBanner] = useState(null)
  const [editingBanner, setEditingBanner] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    eventId: '',
    ctaText: 'Get Tickets',
    customUrl: '',
    displayOrder: 1,
    isActive: true,
    activeFrom: '',
    activeUntil: '',
  })

  const fetchBannersAndEvents = async () => {
    setLoading(true)
    try {
      const [bRes, eRes] = await Promise.all([
        API.get('admin/banners/'),
        API.get('events/?page_size=100'),
      ])
      setBanners(bRes.data)
      setEvents(eRes.data.results || eRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBannersAndEvents()
  }, [])

  const openCreateModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      eventId: events[0]?.id || '',
      ctaText: 'Get Tickets',
      customUrl: '',
      displayOrder: banners.length + 1,
      isActive: true,
      activeFrom: '',
      activeUntil: '',
    })
    setIsDrawerOpen(true)
  }

  const openEditModal = (banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      eventId: banner.eventId || '',
      ctaText: banner.ctaText || 'Get Tickets',
      customUrl: banner.customUrl || '',
      displayOrder: banner.displayOrder || 1,
      isActive: banner.isActive,
      activeFrom: banner.activeFrom ? banner.activeFrom.substring(0, 16) : '',
      activeUntil: banner.activeUntil ? banner.activeUntil.substring(0, 16) : '',
    })
    setIsDrawerOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        imageUrl: formData.imageUrl,
        eventId: formData.eventId || null,
        ctaText: formData.ctaText,
        customUrl: formData.customUrl,
        displayOrder: Number(formData.displayOrder),
        isActive: Boolean(formData.isActive),
        activeFrom: formData.activeFrom ? new Date(formData.activeFrom).toISOString() : null,
        activeUntil: formData.activeUntil ? new Date(formData.activeUntil).toISOString() : null,
      }

      if (editingBanner) {
        await API.patch(`admin/banners/${editingBanner.id}/`, payload)
        setFeedback('Hero banner updated successfully.')
      } else {
        await API.post('admin/banners/', payload)
        setFeedback('New hero banner published successfully.')
      }

      setIsDrawerOpen(false)
      fetchBannersAndEvents()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save banner.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this hero spotlight?')) return
    try {
      await API.delete(`admin/banners/${id}/`)
      setFeedback('Banner removed.')
      fetchBannersAndEvents()
    } catch (err) {
      alert('Failed to delete banner.')
    }
  }

  const handleMoveOrder = async (index, direction) => {
    const newBanners = [...banners]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newBanners.length) return

    const temp = newBanners[index]
    newBanners[index] = newBanners[targetIndex]
    newBanners[targetIndex] = temp

    const orderPayload = newBanners.map((b, i) => ({ id: b.id, displayOrder: i + 1 }))
    setBanners(newBanners)

    try {
      await API.post('admin/banners/reorder/', { order: orderPayload })
    } catch (err) {
      console.error(err)
      fetchBannersAndEvents()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Curate top-level spotlight slides, marketing callouts, and homepage carousel order.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchBannersAndEvents}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl transition shadow-2xs active:scale-95 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-medium transition shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Banner</span>
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

      {/* Banners List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-stone-500 bg-white rounded-xl border border-stone-200/80 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <span>Loading banner carousel...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-20 text-center text-xs font-mono text-stone-400 bg-white rounded-xl border border-stone-200/80">
            No banners configured yet. Click "Create Banner" to curate the first spotlight.
          </div>
        ) : (
          banners.map((b, idx) => (
            <div
              key={b.id}
              className="p-3.5 sm:p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:border-stone-900 transition"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="flex flex-col items-center gap-0.5 shrink-0 text-stone-400">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(idx, -1)}
                    className="p-1 hover:text-stone-900 disabled:opacity-20 transition"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <span className="font-mono text-xs font-bold text-stone-800">#{idx + 1}</span>
                  <button
                    disabled={idx === banners.length - 1}
                    onClick={() => handleMoveOrder(idx, 1)}
                    className="p-1 hover:text-stone-900 disabled:opacity-20 transition"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <img
                  src={b.imageUrl}
                  alt=""
                  className="w-20 h-14 sm:w-28 sm:h-16 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-sm text-stone-900 truncate">{b.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-medium border ${
                        b.isCurrentlyActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {b.isCurrentlyActive ? 'Active Now' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate max-w-md">{b.subtitle || 'No subtitle provided'}</p>
                  <div className="text-[11px] font-mono text-stone-400 flex flex-wrap items-center gap-2">
                    <span className="truncate max-w-[200px]">Linked: {b.eventTitle ? `"${b.eventTitle}"` : (b.customUrl || 'None')}</span>
                    <span>&bull;</span>
                    <span className="shrink-0 font-medium text-stone-700">CTA: {b.ctaText}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 w-full md:w-auto justify-end">
                <button
                  onClick={() => setPreviewBanner(b)}
                  className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                  title="Live Preview"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                  title="Edit Banner"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 sm:p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Banner"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Banner Create / Edit Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full sm:max-w-xl bg-white h-full max-h-screen shadow-2xl z-10 flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  {editingBanner ? 'Edit Hero Spotlight' : 'Create Hero Spotlight'}
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} id="banner-form" className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Banner Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Solstice 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Days of Live Music & Light Installations"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Artwork URL (16:9 recommended) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                  />
                  {formData.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-stone-200 h-28 sm:h-32 mt-2 bg-stone-100">
                      <img src={formData.imageUrl} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Link To Event</label>
                    <select
                      value={formData.eventId}
                      onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                    >
                      <option value="">None (Custom Link)</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.city || 'Online'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">CTA Button Label</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                    />
                  </div>
                </div>

                {!formData.eventId && (
                  <div className="space-y-1.5">
                    <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Custom Destination URL</label>
                    <input
                      type="text"
                      placeholder="/discover?category=Music"
                      value={formData.customUrl}
                      onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-stone-900 transition"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Active From</label>
                    <input
                      type="datetime-local"
                      value={formData.activeFrom}
                      onChange={(e) => setFormData({ ...formData, activeFrom: e.target.value })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">Active Until</label>
                    <input
                      type="datetime-local"
                      value={formData.activeUntil}
                      onChange={(e) => setFormData({ ...formData, activeUntil: e.target.value })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300"
                  />
                  <label htmlFor="isActive" className="text-xs font-mono font-medium text-stone-800 cursor-pointer select-none">
                    Enable and publish banner to live carousel
                  </label>
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
                form="banner-form"
                disabled={isSubmitting}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-mono font-medium transition shadow-2xs disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Banner Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full border border-stone-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative h-60 sm:h-80 w-full overflow-hidden bg-stone-950 flex items-end p-5 sm:p-8">
              <img
                src={previewBanner.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative z-10 space-y-2 text-white">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-stone-100 text-stone-950 px-2.5 py-0.5 rounded font-semibold">
                  Featured Spotlight
                </span>
                <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-white">{previewBanner.title}</h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed">{previewBanner.subtitle}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-white text-stone-950 font-semibold rounded-lg text-xs font-mono">
                    {previewBanner.ctaText} &rarr;
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


