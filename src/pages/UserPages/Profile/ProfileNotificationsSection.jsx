import React from 'react'
import { Bell } from 'lucide-react'

export default function ProfileNotificationsSection({
  emailNotifications,
  onToggleNotifications,
}) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-stone-700" />
          <h3 className="font-serif text-lg font-bold text-stone-900">Email Alerts &amp; Digest</h3>
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          Choose which notifications you wish to receive on your registered email address.
        </p>
      </div>

      <div className="divide-y divide-stone-100 space-y-4">
        <div className="pt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-stone-900">Order Receipts &amp; Pass Invoices</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Receive instant PDF invoices and QR codes upon ticket purchase.
            </p>
          </div>
          <input
            type="checkbox"
            checked={true}
            disabled
            className="h-4 w-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300 cursor-not-allowed opacity-70"
          />
        </div>

        <div className="pt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-stone-900">Stage Updates &amp; Event Reminders</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Receive notifications 24h before event starts with entry gate instructions.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => onToggleNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-stone-900" />
          </label>
        </div>
      </div>
    </div>
  )
}
