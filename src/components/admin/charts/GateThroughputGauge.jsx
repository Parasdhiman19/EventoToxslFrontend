import React from 'react'
import { QrCode, CheckCircle2, Clock, Users, ArrowUpRight } from 'lucide-react'

export default function GateThroughputGauge({ admissions = {} }) {
  const total = admissions.totalTickets || 0
  const checkedIn = admissions.checkedIn || 0
  const pending = admissions.pending || 0
  const rate = admissions.checkInRate || (total > 0 ? Math.round((checkedIn / total) * 100) : 0)

  // Circular progress calculations
  const size = 150
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, rate)) / 100) * circumference
  const center = size / 2

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <QrCode size={14} />
          </span>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
              Gate Admissions & Turnout
            </h3>
            <p className="text-[11px] text-stone-500 font-sans">
              Venue entry scanner telemetry
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          Live Scanners
        </span>
      </div>

      {/* Radial Meter & Breakdown */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
        {/* Radial SVG Gauge */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f5f5f4"
              strokeWidth={strokeWidth}
            />

            {/* Progress Stroke */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#059669"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-serif font-bold text-stone-900 leading-none">
              {rate}%
            </span>
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider mt-1">
              Conversion
            </span>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="w-full sm:w-auto flex-1 space-y-2 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-[11px] font-semibold">Admitted at Gates</span>
            </div>
            <span className="font-bold text-emerald-950 text-sm">{checkedIn.toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-900">
              <Clock size={13} className="text-amber-600" />
              <span className="text-[11px] font-semibold">Pending Entry</span>
            </div>
            <span className="font-bold text-amber-950 text-sm">{pending.toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-stone-700">
              <Users size={13} className="text-stone-500" />
              <span className="text-[11px] font-semibold">Total Issued Passes</span>
            </div>
            <span className="font-bold text-stone-900 text-sm">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] font-mono text-stone-600 flex items-center justify-between">
        <span>Gate Verification Status</span>
        <span className="font-bold text-stone-900">Cryptographic QR Scanner Active</span>
      </div>
    </div>
  )
}
