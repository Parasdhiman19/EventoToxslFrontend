import React, { useMemo } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  Timer,
  AlertTriangle,
  Plus,
  Moon,
  Sun,
} from 'lucide-react'
import EventTimePicker, { format24hToDisplay } from './EventTimePicker'

// Popular start time presets for quick selection
const POPULAR_START_PRESETS = [
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '14:00', label: '2:00 PM' },
]

// Calculate curfew time by adding hours to start time
function addHoursToTime(startTime24, hoursToAdd) {
  if (!startTime24 || !startTime24.includes(':')) return ''
  const [hStr, mStr] = startTime24.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr || '0', 10)
  if (isNaN(h)) return ''

  let newH = h + hoursToAdd
  let newM = m
  if (newH >= 24) {
    newH = 23
    newM = 59
  }
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

// Compute human duration between startTime and endTime
function computeDuration(startTime24, endTime24) {
  if (!startTime24 || !endTime24 || !startTime24.includes(':') || !endTime24.includes(':')) {
    return null
  }
  const [sH, sM] = startTime24.split(':').map((x) => parseInt(x, 10))
  const [eH, eM] = endTime24.split(':').map((x) => parseInt(x, 10))
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return null

  const startTotalMins = sH * 60 + sM
  const endTotalMins = eH * 60 + eM
  const diffMins = endTotalMins - startTotalMins

  if (diffMins <= 0) {
    return {
      isValid: false,
      text: 'Curfew must be later than doors open time on the same date.',
    }
  }

  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  const parts = []
  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? '' : 's'}`)
  if (mins > 0) parts.push(`${mins} min${mins === 1 ? '' : 's'}`)

  return {
    isValid: true,
    totalMins: diffMins,
    text: parts.join(' ') || '0 mins',
  }
}

export default function EventFormScheduleVenueSection({ formik }) {
  const durationInfo = useMemo(
    () => computeDuration(formik.values.startTime, formik.values.endTime),
    [formik.values.startTime, formik.values.endTime]
  )

  const handleApplyCurfewDuration = (hours) => {
    if (!formik.values.startTime) {
      // Default to 7:00 PM start if no start time selected yet
      formik.setFieldValue('startTime', '19:00')
      formik.setFieldValue('endTime', addHoursToTime('19:00', hours))
    } else {
      const calculatedEnd = addHoursToTime(formik.values.startTime, hours)
      formik.setFieldValue('endTime', calculatedEnd)
    }
  }

  const handleApplyMidnightCurfew = () => {
    formik.setFieldValue('endTime', '23:59')
  }

  const handleClearCurfew = () => {
    formik.setFieldValue('endTime', '')
  }

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-serif text-base font-medium text-stone-900">Schedule &amp; Timings</h2>
          <p className="text-xs text-stone-500">Date, stage door opening, and curfew schedule</p>
        </div>

        {/* Live Duration Badge */}
        {formik.values.startTime && formik.values.endTime && durationInfo && (
          <div>
            {durationInfo.isValid ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs animate-in fade-in">
                <Timer size={13} className="text-emerald-600" />
                <span>
                  <strong>{durationInfo.text}</strong> duration ({format24hToDisplay(formik.values.startTime)} &ndash;{' '}
                  {format24hToDisplay(formik.values.endTime)})
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs animate-in fade-in">
                <AlertTriangle size={13} className="text-amber-600" />
                <span>End time must be after start time</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date & Interactive Time Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* 1. Date */}
        <div className="space-y-1.5">
          <label
            htmlFor="date"
            className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
          >
            Event Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="date"
              name="date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                formik.touched.date && formik.errors.date
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
              }`}
            />
            <Calendar
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
          </div>
          {formik.touched.date && formik.errors.date && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.date}</p>
          )}
        </div>

        {/* 2. Doors Open / Start Time */}
        <div className="space-y-1.5">
          <EventTimePicker
            id="startTime"
            name="startTime"
            label="Doors Open / Start"
            placeholder="e.g. 07:30 PM"
            value={formik.values.startTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.startTime}
            touched={formik.touched.startTime}
            presets={POPULAR_START_PRESETS}
          />
        </div>

        {/* 3. Curfew / End Time */}
        <div className="space-y-1.5">
          <EventTimePicker
            id="endTime"
            name="endTime"
            label="Curfew / End (Optional)"
            placeholder="e.g. 11:00 PM"
            value={formik.values.endTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.endTime}
            touched={formik.touched.endTime}
            allowClear={true}
            presets={[
              { value: '22:00', label: '10:00 PM' },
              { value: '22:30', label: '10:30 PM' },
              { value: '23:00', label: '11:00 PM' },
              { value: '23:30', label: '11:30 PM' },
              { value: '23:59', label: '11:59 PM (Midnight)' },
            ]}
          />
        </div>
      </div>

      {/* Quick Time Helpers & Duration Adders Bar */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
        {/* Row A: Quick Start Time Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Sun size={12} className="text-amber-500" />
            Quick Start:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_START_PRESETS.slice(0, 5).map((slot) => {
              const isSelected = formik.values.startTime === slot.value
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => formik.setFieldValue('startTime', slot.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-stone-900 text-stone-50 font-bold shadow-2xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-200/80'
                  }`}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Row B: Smart Curfew Duration Adders */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/60">
          <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Moon size={12} className="text-indigo-500" />
            Add Curfew:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[2, 3, 4, 5].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => handleApplyCurfewDuration(hrs)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-200/80 transition cursor-pointer active:scale-95 inline-flex items-center gap-1"
                title={`Set end time to ${hrs} hours after start`}
              >
                <Plus size={11} className="text-stone-400" />
                <span>+{hrs}h</span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleApplyMidnightCurfew}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-200/80 transition cursor-pointer active:scale-95"
            >
              Until Midnight
            </button>

            {formik.values.endTime && (
              <button
                type="button"
                onClick={handleClearCurfew}
                className="px-2 py-1 rounded-lg text-[11px] font-mono text-stone-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                No Curfew (Open End)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Physical Address Fields (Conditional for In-Person Events) */}
      {!formik.values.isOnline && (
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Venue / Stage Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="venueName"
                className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
              >
                Venue / Stage Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="venueName"
                  name="venueName"
                  type="text"
                  placeholder="e.g. Grand Theatre Hall 4"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.venueName}
                  className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                    formik.touched.venueName && formik.errors.venueName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
                  }`}
                />
                <Building2
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
              </div>
              {formik.touched.venueName && formik.errors.venueName && (
                <p className="text-xs text-red-600 tracking-tight">{formik.errors.venueName}</p>
              )}
            </div>

            {/* City & State */}
            <div className="space-y-1.5">
              <label
                htmlFor="city"
                className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
              >
                City &amp; State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Chandigarh, Punjab"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.city}
                  className={`w-full rounded-xl border bg-white pl-9 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 ${
                    formik.touched.city && formik.errors.city
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
                  }`}
                />
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
              </div>
              {formik.touched.city && formik.errors.city && (
                <p className="text-xs text-red-600 tracking-tight">{formik.errors.city}</p>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="address"
              className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
            >
              Street Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="e.g. Sector 17, Main City Center Plaza"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>
      )}
    </div>
  )
}
