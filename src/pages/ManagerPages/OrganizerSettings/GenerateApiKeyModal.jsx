import React from 'react'

export default function GenerateApiKeyModal({
  isOpen,
  onClose,
  newKeyName,
  setNewKeyName,
  onSubmit,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-serif text-lg font-medium text-stone-900">Generate Developer API Key</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-700 font-medium">
              Key Name / Gateway <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Venue Gate Scanner App, Custom CRM Sync"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs cursor-pointer"
            >
              Generate Key &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
