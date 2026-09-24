import React from 'react'
import { RefreshCw } from 'lucide-react'

export default function NotificationSettingsSection({
  notificationSettings,
  setNotificationSettings,
  handleSaveSettings,
  isSaving,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="font-serif text-lg font-medium text-stone-900">Host Communication Channels</h2>
          <p className="text-xs text-stone-500">Choose when and how Evento dispatches stage alerts.</p>
        </div>

        <div className="space-y-4 divide-y divide-stone-100">
          <div className="flex items-center justify-between pt-3">
            <div className="pr-6">
              <span className="text-xs font-medium text-stone-900">Instant Order Notifications</span>
              <p className="text-[11px] text-stone-500">
                Receive an email alert whenever an attendee buys a ticket.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.instantSaleAlerts}
              onChange={(e) =>
                setNotificationSettings({ ...notificationSettings, instantSaleAlerts: e.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="pr-6">
              <span className="text-xs font-medium text-stone-900">Daily Sales & Velocity Digest</span>
              <p className="text-[11px] text-stone-500">
                Summary of total sold quotas and gross earnings sent each morning.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.dailySummaryDigest}
              onChange={(e) =>
                setNotificationSettings({ ...notificationSettings, dailySummaryDigest: e.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="pr-6">
              <span className="text-xs font-medium text-stone-900">Payout & Settlement Confirmations</span>
              <p className="text-[11px] text-stone-500">
                Receive confirmation receipts automatically when funds are disbursed.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.payoutDisbursementEmail}
              onChange={(e) =>
                setNotificationSettings({ ...notificationSettings, payoutDisbursementEmail: e.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSaveSettings(null, 'Notification preferences saved.')}
          className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-2"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : null}
          <span>Save Notification Preferences</span>
        </button>
      </div>
    </div>
  )
}
