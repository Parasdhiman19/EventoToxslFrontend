import React, { useState, useMemo } from 'react'
import { 
  Sparkles, 
  Accessibility, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Lock, 
  X,
  Info
} from 'lucide-react'

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function VenueSeatPicker({
  seatingLayout,
  seats = [],
  selectedSeatIds = [],
  onSeatToggle,
  maxSelectable = 8,
  isEventEnded = false,
}) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hoveredSeat, setHoveredSeat] = useState(null)

  const dimensions = seatingLayout?.dimensions || { rows: 8, columns: 12 }
  const aisles = seatingLayout?.aisles || [3, 9]
  const tiers = seatingLayout?.tiers || []

  // Create a lookup map for seats by "row-col" or "row-seat_number"
  const seatLookup = useMemo(() => {
    const map = {}
    seats.forEach((s) => {
      const key = `${s.row}-${s.seat_number || s.seatNumber}`
      map[key] = s
    })
    return map
  }, [seats])

  // Color lookup helper
  const getTierColor = (tierName) => {
    const tier = tiers.find((t) => t.name === tierName)
    return tier?.color || '#059669'
  }

  // Selected seats objects list
  const selectedSeatsList = useMemo(() => {
    return seats.filter((s) => selectedSeatIds.includes(s.id))
  }, [seats, selectedSeatIds])

  const handleSeatClick = (seat) => {
    if (isEventEnded || seat.status !== 'available') return
    if (onSeatToggle) {
      onSeatToggle(seat)
    }
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7))
  const handleResetZoom = () => setZoomLevel(1)

  return (
    <div className="space-y-4 select-none">
      
      {/* Top Map Toolbar: Zoom Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-900 text-stone-200 border border-stone-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-stone-400">Map Controls:</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
          <span className="text-[10px] text-stone-500 font-mono">{Math.round(zoomLevel * 100)}%</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {tiers.map((t) => (
            <div key={t.id || t.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-600 opacity-60" />
            <span>Sold</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage & Seating Canvas Container */}
      <div className="relative rounded-2xl border border-stone-300/80 bg-stone-950 text-stone-100 p-6 sm:p-8 shadow-xl overflow-x-auto min-h-[380px] flex flex-col justify-between">
        
        {/* Stage Marker */}
        <div className="max-w-xs sm:max-w-md mx-auto mb-8 py-3 px-6 rounded-xl bg-stone-900 border border-stone-800 text-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10" />
          <span className="relative font-mono text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center justify-center gap-2">
            <Sparkles size={14} />
            <span>STAGE / PERFORMANCE AREA</span>
            <Sparkles size={14} />
          </span>
        </div>

        {/* Zoomable Seating Grid */}
        <div className="w-full overflow-x-auto my-auto py-4">
          <div 
            className="w-max min-w-full flex flex-col items-center px-6 transition-transform duration-150 ease-out origin-top"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Rows */}
            <div className="space-y-2">
              {Array.from({ length: dimensions.rows }, (_, r) => ROW_LABELS[r] || `R${r + 1}`).map((rowLetter) => (
                <div key={`picker-row-${rowLetter}`} className="flex items-center gap-2">
                  
                  {/* Left Row Label */}
                  <span className="w-5 text-center font-mono text-xs font-semibold text-stone-400">
                    {rowLetter}
                  </span>

                  {/* Seat Nodes */}
                  {Array.from({ length: dimensions.columns }, (_, c) => c + 1).map((colNum) => {
                    const key = `${rowLetter}-${colNum}`
                    const seat = seatLookup[key]
                    const isAisle = aisles.includes(colNum)

                    // If seat does not exist in backend (was left empty/aisle in designer)
                    if (!seat) {
                      return (
                        <React.Fragment key={key}>
                          <div className="w-7 h-7" />
                          {isAisle && <div className="w-3" />}
                        </React.Fragment>
                      )
                    }

                    const isSelected = selectedSeatIds.includes(seat.id)
                    const isBooked = seat.status === 'booked' || seat.status === 'reserved' || seat.status === 'blocked'
                    const tierColor = getTierColor(seat.tierName)

                    return (
                      <React.Fragment key={key}>
                        <button
                          type="button"
                          disabled={isBooked || isEventEnded}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center font-mono text-[10px] transition-all transform cursor-pointer relative ${
                            isBooked
                              ? 'bg-stone-800 text-stone-500 border border-stone-800 cursor-not-allowed opacity-40'
                              : isSelected
                              ? 'bg-emerald-400 text-stone-950 font-bold shadow-md ring-2 ring-white scale-110'
                              : 'text-stone-950 font-bold hover:scale-115 hover:ring-2 hover:ring-stone-200 shadow-xs'
                          }`}
                          style={{
                            backgroundColor: isBooked ? undefined : isSelected ? '#34d399' : tierColor,
                          }}
                          aria-label={`Row ${seat.row}, Seat ${seat.seat_number}, ${seat.tierName}, ${seat.price}`}
                        >
                          {isBooked ? (
                            <Lock size={10} className="text-stone-600" />
                          ) : isSelected ? (
                            <Check size={13} className="stroke-[3]" />
                          ) : seat.is_accessible || seat.isAccessible ? (
                            <Accessibility size={13} className="text-stone-950" />
                          ) : (
                            <span>{seat.seat_number || seat.seatNumber}</span>
                          )}
                        </button>

                        {/* Visual Aisle Gap */}
                        {isAisle && <div className="w-3" />}
                      </React.Fragment>
                    )
                  })}

                  {/* Right Row Label */}
                  <span className="w-5 text-center font-mono text-xs font-semibold text-stone-400">
                    {rowLetter}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover Tooltip / Status Display Bar */}
        <div className="mt-6 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400 min-h-[28px]">
          {hoveredSeat ? (
            <div className="flex items-center gap-2 text-stone-200 animate-in fade-in duration-100">
              <span className="font-semibold text-white">
                Row {hoveredSeat.row} • Seat {hoveredSeat.seat_number || hoveredSeat.seatNumber}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-stone-950" style={{ backgroundColor: getTierColor(hoveredSeat.tierName) }}>
                {hoveredSeat.tierName}
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-400">{hoveredSeat.price}</span>
              {hoveredSeat.status === 'booked' && (
                <span className="text-red-400 font-semibold">(Sold / Unavailable)</span>
              )}
              {(hoveredSeat.is_accessible || hoveredSeat.isAccessible) && (
                <span className="text-cyan-400 flex items-center gap-1">
                  <Accessibility size={12} /> Accessible
                </span>
              )}
            </div>
          ) : (
            <span className="text-stone-500 flex items-center gap-1.5">
              <Info size={13} />
              Hover or tap on any available seat to inspect tier &amp; price.
            </span>
          )}

          <div className="text-right text-[11px] text-stone-400">
            <span>Selected: <strong>{selectedSeatIds.length}</strong> / {maxSelectable} max</span>
          </div>
        </div>
      </div>

      {/* Selected Seats Chips & Quick Tray */}
      {selectedSeatsList.length > 0 && (
        <div className="p-4 rounded-xl border border-stone-300 bg-stone-50 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="uppercase tracking-wider text-stone-700 font-semibold">
              Selected Seats ({selectedSeatsList.length})
            </span>
            <button
              type="button"
              onClick={() => selectedSeatsList.forEach((s) => onSeatToggle && onSeatToggle(s))}
              className="text-stone-500 hover:text-red-600 transition cursor-pointer underline"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSeatsList.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-mono shadow-2xs"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTierColor(s.tierName) }} />
                <span className="font-semibold text-stone-900">
                  Row {s.row}-{s.seat_number || s.seatNumber}
                </span>
                <span className="text-stone-500">({s.tierName})</span>
                <span className="font-semibold text-stone-900">{s.price}</span>
                <button
                  type="button"
                  onClick={() => onSeatToggle && onSeatToggle(s)}
                  className="text-stone-400 hover:text-stone-900 cursor-pointer"
                  title="Remove seat"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
