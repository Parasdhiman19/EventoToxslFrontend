import React, { useState, useEffect } from 'react'
import API from '../../services/api'
import {
  Sliders,
  Save,
  RefreshCw,
  X,
  CheckCircle2,
  Shield,
  DollarSign,
  Clock,
  Mail,
  AlertTriangle,
  Globe,
  Lock,
  Percent,
} from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await API.get('admin/settings/')
      const dict = {}
      res.data.forEach((s) => {
        dict[s.key] = s.value
      })
      setSettings(dict)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await API.patch('admin/settings/', { settings })
      setFeedback('Platform configurations synchronized successfully.')
    } catch (err) {
      alert('Failed to save platform settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              System Control
            </span>
            <span className="text-stone-400 text-xs font-mono">• Global Parameters</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Platform Operational Settings</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Control platform service fees, seat hold expiration windows, and system-wide configurations.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-mono rounded-xl border border-stone-200 shadow-2xs transition active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Reload Config</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-xl border border-stone-200/80">
          <RefreshCw className="w-5 h-5 text-stone-400 animate-spin mx-auto" />
          <div className="text-xs font-mono text-stone-400">Loading system parameters...</div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
          {/* Financial & Fee Rules */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-stone-200/80 shadow-2xs space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-sm text-stone-900">Monetization & Fee Structure</h2>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Universal fees applied automatically at buyer ticket checkout.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Platform Service Fee
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={settings.platform_fee_percentage || '3.5'}
                    onChange={(e) =>
                      setSettings({ ...settings, platform_fee_percentage: e.target.value })
                    }
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition pr-8"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-stone-400 font-mono">%</span>
                </div>
                <p className="text-[10px] text-stone-400 font-mono">
                  Applied to ticket checkout gross subtotal across all published stages.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Seat Hold Lock Timeout
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={settings.seat_hold_timeout_minutes || '10'}
                    onChange={(e) =>
                      setSettings({ ...settings, seat_hold_timeout_minutes: e.target.value })
                    }
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition pr-12"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-stone-400 font-mono">min</span>
                </div>
                <p className="text-[10px] text-stone-400 font-mono">
                  Duration before abandoned cart seats release back to available capacity.
                </p>
              </div>
            </div>
          </div>

          {/* System & Support Config */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-stone-200/80 shadow-2xs space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-sm text-stone-900">Brand & Support Dispatch</h2>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Public branding names and system notification recipient addresses.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Platform Brand Name
                </label>
                <input
                  type="text"
                  value={settings.platform_name || 'Evento'}
                  onChange={(e) =>
                    setSettings({ ...settings, platform_name: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-stone-700 font-semibold uppercase text-[11px]">
                  Master Support Email
                </label>
                <input
                  type="email"
                  value={settings.platform_support_email || 'support@evento.com'}
                  onChange={(e) =>
                    setSettings({ ...settings, platform_support_email: e.target.value })
                  }
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-stone-900 transition"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-start sm:items-center gap-3">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.maintenance_mode === 'true'}
                onChange={(e) =>
                  setSettings({ ...settings, maintenance_mode: e.target.checked ? 'true' : 'false' })
                }
                className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300 mt-0.5 sm:mt-0"
              />
              <label htmlFor="maintenance" className="text-xs font-mono text-stone-800 cursor-pointer select-none">
                Enable Global Maintenance Notice across discovery and studio portals
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-semibold transition shadow-xs disabled:opacity-50 w-full sm:w-auto"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Persist System Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

