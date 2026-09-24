import React from 'react'
import { Plus, Check, Copy } from 'lucide-react'

export default function ApiKeysSection({
  apiKeys,
  copiedKeyId,
  onCopyKey,
  onRevokeKey,
  onOpenGenerateKey,
}) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-stone-900">Developer API Keys</h2>
          <p className="text-xs text-stone-500">
            Use API credentials to integrate gate scanners, custom checkouts, or private CRM dashboards.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenGenerateKey}
          className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 self-start"
        >
          <Plus size={14} />
          <span>Generate Key</span>
        </button>
      </div>

      <div className="space-y-3">
        {apiKeys.map((k) => (
          <div
            key={k.id}
            className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="text-xs font-medium text-stone-900">{k.name}</div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200 inline-block select-all">
                  {k.key}
                </code>
                <button
                  type="button"
                  onClick={() => onCopyKey(k.key, k.id)}
                  className="p-1 text-stone-400 hover:text-stone-800 rounded transition cursor-pointer"
                  title="Copy Key"
                >
                  {copiedKeyId === k.id ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                Created {k.created} • Status: Active
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRevokeKey(k.id)}
              className="text-xs font-mono text-red-600 hover:underline cursor-pointer self-end sm:self-auto"
            >
              Revoke Key
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
