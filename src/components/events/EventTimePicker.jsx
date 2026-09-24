import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Clock, ChevronDown, X, Check, Sparkles } from 'lucide-react'

// Convert 24h "HH:MM" string to 12h parts { hour12, minute, period }
export function parse24hTo12h(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return { hour12: 7, minute: '00', period: 'PM' }
  }
  const [hStr, mStr] = timeStr.split(':')
  let h = parseInt(hStr, 10)
  const m = (mStr || '00').slice(0, 2).padStart(2, '0')
  if (isNaN(h)) h = 19
  const period = h >= 12 ? 'PM' : 'AM'
  let hour12 = h % 12
  if (hour12 === 0) hour12 = 12
  return { hour12, minute: m, period }
}

// Convert 12h parts { hour12, minute, period } to 24h "HH:MM" string
export function format12hTo24h(hour12, minute, period) {
  let h = parseInt(hour12, 10)
  if (isNaN(h) || h < 1 || h > 12) h = 12
  const m = String(minute || '00').slice(0, 2).padStart(2, '0')
  if (period === 'PM') {
    if (h !== 12) h += 12
  } else if (period === 'AM') {
    if (h === 12) h = 0
  }
  return `${String(h).padStart(2, '0')}:${m}`
}

// Convert 24h "HH:MM" string to friendly display "07:30 PM"
export function format24hToDisplay(timeStr) {
  if (!timeStr) return ''
  const { hour12, minute, period } = parse24hTo12h(timeStr)
  return `${String(hour12).padStart(2, '0')}:${minute} ${period}`
}

export default function EventTimePicker({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = 'Select time',
  label,
  error,
  touched,
  presets = [],
  allowClear = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Internal 12-hour state
  const current12 = useMemo(() => parse24hTo12h(value), [value])
  const [selectedHour, setSelectedHour] = useState(current12.hour12)
  const [selectedMinute, setSelectedMinute] = useState(current12.minute)
  const [selectedPeriod, setSelectedPeriod] = useState(current12.period)

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const parsed = parse24hTo12h(value)
      setSelectedHour(parsed.hour12)
      setSelectedMinute(parsed.minute)
      setSelectedPeriod(parsed.period)
    }
  }, [value])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        if (onBlur && name) {
          onBlur({ target: { name } })
        }
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onBlur, name])

  const commitTime = (h, m, p) => {
    const time24 = format12hTo24h(h, m, p)
    if (onChange) {
      onChange({ target: { name, value: time24 } })
    }
  }

  const handleSelectHour = (h) => {
    setSelectedHour(h)
    commitTime(h, selectedMinute, selectedPeriod)
  }

  const handleSelectMinute = (m) => {
    setSelectedMinute(m)
    commitTime(selectedHour, m, selectedPeriod)
  }

  const handleSelectPeriod = (p) => {
    setSelectedPeriod(p)
    commitTime(selectedHour, selectedMinute, p)
  }

  const handleSelectPreset = (presetTime24) => {
    const parsed = parse24hTo12h(presetTime24)
    setSelectedHour(parsed.hour12)
    setSelectedMinute(parsed.minute)
    setSelectedPeriod(parsed.period)
    commitTime(parsed.hour12, parsed.minute, parsed.period)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (onChange) {
      onChange({ target: { name, value: '' } })
    }
  }

  const hoursList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const minutesList = ['00', '15', '30', '45']
  const allMinutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

  const displayString = value ? format24hToDisplay(value) : ''

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
        >
          {label}
        </label>
      )}

      {/* Trigger Button / Input Box */}
      <div
        id={id || name}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen)
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className={`w-full flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-xs transition cursor-pointer select-none shadow-2xs ${
          disabled
            ? 'bg-stone-100/70 border-stone-200 text-stone-400 cursor-not-allowed'
            : touched && error
            ? 'border-red-500 ring-1 ring-red-500'
            : isOpen
            ? 'border-stone-900 ring-2 ring-stone-900/10'
            : 'border-stone-300 hover:border-stone-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock
            size={14}
            className={`shrink-0 transition-colors ${
              value ? 'text-stone-900' : 'text-stone-400'
            }`}
          />
          {displayString ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-stone-900 text-xs sm:text-[13px]">
                {displayString.slice(0, 5)}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-stone-900 text-stone-50">
                {displayString.slice(6)}
              </span>
            </div>
          ) : (
            <span className="text-stone-400 font-sans">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {allowClear && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              title="Clear time"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-stone-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-stone-900' : ''
            }`}
          />
        </div>
      </div>

      {touched && error && (
        <p className="text-xs text-red-600 tracking-tight font-sans">{error}</p>
      )}

      {/* Popover Dropdown Picker */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-80 top-full mt-2 z-50 bg-white/98 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-2xl p-4 text-stone-900 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
          {/* Preset Quick-Picks */}
          {presets && presets.length > 0 && (
            <div className="space-y-1.5 pb-2 border-b border-stone-100">
              <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                Popular Slots
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => {
                  const isSelected = value === preset.value
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleSelectPreset(preset.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-stone-50 font-bold shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                      }`}
                    >
                      {preset.label || format24hToDisplay(preset.value)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* AM / PM Segmented Control */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-500 font-medium">Period</span>
            <div className="flex p-0.5 bg-stone-100 rounded-xl border border-stone-200/80">
              <button
                type="button"
                onClick={() => handleSelectPeriod('AM')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedPeriod === 'AM'
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                AM (Morning/Day)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPeriod('PM')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedPeriod === 'PM'
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                PM (Evening/Night)
              </button>
            </div>
          </div>

          {/* Hour & Minute Pickers Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Hour Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-500 font-medium">Hour</span>
                <span className="text-[10px] font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.2 rounded">
                  {selectedHour}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto p-1 bg-stone-50/80 rounded-xl border border-stone-200/70">
                {hoursList.map((h) => {
                  const isSel = selectedHour === h
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={`py-1.5 text-xs font-mono rounded-lg transition cursor-pointer text-center ${
                        isSel
                          ? 'bg-stone-900 text-stone-50 font-bold shadow-xs'
                          : 'text-stone-700 hover:bg-stone-200/80'
                      }`}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Minute Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-500 font-medium">Minute</span>
                <span className="text-[10px] font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.2 rounded">
                  :{selectedMinute}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto p-1 bg-stone-50/80 rounded-xl border border-stone-200/70">
                {allMinutesList.map((m) => {
                  const isSel = selectedMinute === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={`py-1.5 text-xs font-mono rounded-lg transition cursor-pointer text-center ${
                        isSel
                          ? 'bg-stone-900 text-stone-50 font-bold shadow-xs'
                          : 'text-stone-700 hover:bg-stone-200/80'
                      }`}
                    >
                      :{m}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Popover Footer with Active Selection Preview & Done Button */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="text-[11px] font-mono text-stone-500">
              Set:{' '}
              <span className="font-bold text-stone-900">
                {String(selectedHour).padStart(2, '0')}:{selectedMinute} {selectedPeriod}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs inline-flex items-center gap-1 cursor-pointer"
            >
              <Check size={12} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
