import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Plus, 
  Trash2, 
  Layers, 
  Sparkles, 
  Armchair, 
  Accessibility, 
  Grid, 
  Undo2, 
  RefreshCw, 
  Check, 
  Palette,
  DollarSign,
  Info,
  Maximize2
} from 'lucide-react'

// Color palette options for tiers
const TIER_COLORS = [
  { name: 'Amber Gold', hex: '#d97706', bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', light: 'bg-amber-50' },
  { name: 'Emerald Green', hex: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-50' },
  { name: 'Indigo Blue', hex: '#4f46e5', bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', light: 'bg-indigo-50' },
  { name: 'Rose Red', hex: '#e11d48', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', light: 'bg-rose-50' },
  { name: 'Violet Purple', hex: '#7c3aed', bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', light: 'bg-violet-50' },
  { name: 'Cyan Sky', hex: '#0891b2', bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-600', light: 'bg-cyan-50' },
]

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const PRESETS = [
  {
    id: 'auditorium',
    name: 'Auditorium Theater',
    desc: '8 rows x 12 cols with VIP front and 2 aisles',
    rows: 8,
    cols: 12,
    aisles: [3, 9], // gaps after col 3 and col 9 (1-indexed)
    tiers: [
      { id: 'vip', name: 'VIP Front Row', price: '75.00', color: '#d97706', description: 'Rows A-B prime center view' },
      { id: 'ga', name: 'General Admission', price: '35.00', color: '#059669', description: 'Rows C-H standard seating' },
    ],
    generateGrid: (rows, cols, aisles) => {
      const grid = []
      for (let r = 0; r < rows; r++) {
        const rowLetter = ROW_LABELS[r] || `R${r + 1}`
        const isVip = r < 2
        for (let c = 1; c <= cols; c++) {
          grid.push({
            id: `${rowLetter}-${c}`,
            row: rowLetter,
            col: c,
            seatNumber: `${c}`,
            sectionName: 'Main Hall',
            tierName: isVip ? 'VIP Front Row' : 'General Admission',
            status: 'available',
            isAccessible: r === rows - 1 && (c === 1 || c === cols),
          })
        }
      }
      return grid
    }
  },
  {
    id: 'club',
    name: 'Intimate Club',
    desc: '5 rows x 8 cols boutique stage layout',
    rows: 5,
    cols: 8,
    aisles: [4],
    tiers: [
      { id: 'premium', name: 'Stagefront Lounge', price: '60.00', color: '#7c3aed', description: 'Front rows lounge' },
      { id: 'standard', name: 'Club Seating', price: '30.00', color: '#4f46e5', description: 'Standard club view' },
    ],
    generateGrid: (rows, cols, aisles) => {
      const grid = []
      for (let r = 0; r < rows; r++) {
        const rowLetter = ROW_LABELS[r] || `R${r + 1}`
        const isPremium = r < 2
        for (let c = 1; c <= cols; c++) {
          grid.push({
            id: `${rowLetter}-${c}`,
            row: rowLetter,
            col: c,
            seatNumber: `${c}`,
            sectionName: 'Main Room',
            tierName: isPremium ? 'Stagefront Lounge' : 'Club Seating',
            status: 'available',
            isAccessible: r === 0 && (c === 1 || c === cols),
          })
        }
      }
      return grid
    }
  },
  {
    id: 'grand_hall',
    name: 'Grand Concert Hall',
    desc: '10 rows x 16 cols tiered amphitheater with 3 price bands',
    rows: 10,
    cols: 16,
    aisles: [4, 12],
    tiers: [
      { id: 'tier_vip', name: 'Platinum VIP', price: '120.00', color: '#d97706', description: 'Rows A-B Golden Circle' },
      { id: 'tier_prem', name: 'Gold Orchestra', price: '75.00', color: '#4f46e5', description: 'Rows C-F Center Orchestra' },
      { id: 'tier_std', name: 'Balcony Standard', price: '45.00', color: '#059669', description: 'Rows G-J Balcony view' },
    ],
    generateGrid: (rows, cols, aisles) => {
      const grid = []
      for (let r = 0; r < rows; r++) {
        const rowLetter = ROW_LABELS[r] || `R${r + 1}`
        let tierName = 'Balcony Standard'
        if (r < 2) tierName = 'Platinum VIP'
        else if (r < 6) tierName = 'Gold Orchestra'

        for (let c = 1; c <= cols; c++) {
          grid.push({
            id: `${rowLetter}-${c}`,
            row: rowLetter,
            col: c,
            seatNumber: `${c}`,
            sectionName: r < 6 ? 'Orchestra' : 'Balcony',
            tierName: tierName,
            status: 'available',
            isAccessible: (r === 0 || r === rows - 1) && (c === 1 || c === cols),
          })
        }
      }
      return grid
    }
  }
]

export default function SeatingStudio({ initialLayout, onChange }) {
  // Dimensions state
  const [rowsCount, setRowsCount] = useState(8)
  const [colsCount, setColsCount] = useState(12)
  const [aisles, setAisles] = useState([3, 9]) // 1-indexed column numbers after which an aisle gap exists
  const [stagePosition, setStagePosition] = useState('top')

  // Tier definitions state
  const [tiers, setTiers] = useState([
    { id: 'vip', name: 'VIP Pass', price: '75.00', color: '#d97706', description: 'Front row priority view' },
    { id: 'ga', name: 'General Admission', price: '35.00', color: '#059669', description: 'Standard stage seating' },
  ])

  // Active Tool: tier name, 'accessible', or 'empty' (aisle / empty space)
  const [activeTool, setActiveTool] = useState('VIP Pass')

  // The actual Seat Grid Map: { "A-1": { id, row, col, seatNumber, sectionName, tierName, status, isAccessible } }
  const [seatMap, setSeatMap] = useState({})
  const [isMouseDown, setIsMouseDown] = useState(false)

  // Initialize from initialLayout or Default Preset
  useEffect(() => {
    if (initialLayout && initialLayout.grid && Array.isArray(initialLayout.grid) && initialLayout.grid.length > 0) {
      const rCount = initialLayout.dimensions?.rows || 8
      const cCount = initialLayout.dimensions?.columns || 12
      setRowsCount(rCount)
      setColsCount(cCount)
      setAisles(initialLayout.aisles || [3, 9])
      setStagePosition(initialLayout.stagePosition || 'top')
      if (initialLayout.tiers && initialLayout.tiers.length > 0) {
        setTiers(initialLayout.tiers)
        setActiveTool(initialLayout.tiers[0].name)
      }

      const map = {}
      initialLayout.grid.forEach((s) => {
        if (s && s.row && s.seatNumber) {
          map[`${s.row}-${s.seatNumber}`] = {
            id: s.id || `${s.row}-${s.seatNumber}`,
            row: s.row,
            col: parseInt(s.col || s.seatNumber, 10),
            seatNumber: `${s.seatNumber}`,
            sectionName: s.sectionName || 'Main Hall',
            tierName: s.tierName || (initialLayout.tiers?.[0]?.name || 'General Admission'),
            status: s.status || 'available',
            isAccessible: !!s.isAccessible,
          }
        }
      })
      setSeatMap(map)
    } else {
      // Apply default auditorium preset
      applyPreset(PRESETS[0])
    }
  }, [])

  // Dynamic row slider change handler that preserves existing customizations & populates new seats
  const handleRowsChange = (newRows) => {
    const clampedRows = Math.max(2, Math.min(18, newRows))
    setRowsCount(clampedRows)
    setSeatMap((prev) => {
      const next = {}
      for (let r = 0; r < clampedRows; r++) {
        const rowLetter = ROW_LABELS[r] || `R${r + 1}`
        for (let c = 1; c <= colsCount; c++) {
          const key = `${rowLetter}-${c}`
          next[key] = prev[key] || {
            id: key,
            row: rowLetter,
            col: c,
            seatNumber: `${c}`,
            sectionName: 'Main Hall',
            tierName: tiers[0]?.name || 'General Admission',
            status: 'available',
            isAccessible: false,
          }
        }
      }
      return next
    })
  }

  // Dynamic columns slider change handler
  const handleColsChange = (newCols) => {
    const clampedCols = Math.max(4, Math.min(24, newCols))
    setColsCount(clampedCols)
    setSeatMap((prev) => {
      const next = {}
      for (let r = 0; r < rowsCount; r++) {
        const rowLetter = ROW_LABELS[r] || `R${r + 1}`
        for (let c = 1; c <= clampedCols; c++) {
          const key = `${rowLetter}-${c}`
          next[key] = prev[key] || {
            id: key,
            row: rowLetter,
            col: c,
            seatNumber: `${c}`,
            sectionName: 'Main Hall',
            tierName: tiers[0]?.name || 'General Admission',
            status: 'available',
            isAccessible: false,
          }
        }
      }
      return next
    })
  }

  // Propagate layout up to parent form whenever state changes
  useEffect(() => {
    const gridArray = []
    for (let r = 0; r < rowsCount; r++) {
      const rowLetter = ROW_LABELS[r] || `R${r + 1}`
      for (let c = 1; c <= colsCount; c++) {
        const key = `${rowLetter}-${c}`
        const seat = seatMap[key] || {
          id: key,
          row: rowLetter,
          col: c,
          seatNumber: `${c}`,
          sectionName: 'Main Hall',
          tierName: tiers[0]?.name || 'General Admission',
          status: 'available',
          isAccessible: false,
        }
        if (seat.status !== 'empty') {
          gridArray.push(seat)
        }
      }
    }

    const layoutPayload = {
      dimensions: { rows: rowsCount, columns: colsCount },
      aisles: aisles,
      stagePosition: stagePosition,
      tiers: tiers,
      grid: gridArray,
    }
    if (onChange) {
      onChange(layoutPayload)
    }
  }, [rowsCount, colsCount, aisles, stagePosition, tiers, seatMap])

  // Apply a preset template
  const applyPreset = (preset) => {
    setRowsCount(preset.rows)
    setColsCount(preset.cols)
    setAisles(preset.aisles)
    setTiers(preset.tiers)
    setActiveTool(preset.tiers[0].name)

    const rawGrid = preset.generateGrid(preset.rows, preset.cols, preset.aisles)
    const map = {}
    rawGrid.forEach((s) => {
      map[`${s.row}-${s.seatNumber}`] = s
    })
    setSeatMap(map)
  }

  // Handle tier addition
  const handleAddTier = () => {
    const nextColor = TIER_COLORS[tiers.length % TIER_COLORS.length].hex
    const newTier = {
      id: `tier_${Date.now()}`,
      name: `Tier ${tiers.length + 1}`,
      price: '50.00',
      color: nextColor,
      description: 'Stage pass',
    }
    setTiers([...tiers, newTier])
    setActiveTool(newTier.name)
  }

  const handleUpdateTier = (index, field, value) => {
    const oldName = tiers[index].name
    const updated = [...tiers]
    updated[index][field] = value

    if (field === 'name' && oldName !== value) {
      // Update seats that had old tier name
      setSeatMap((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((key) => {
          if (next[key].tierName === oldName) {
            next[key] = { ...next[key], tierName: value }
          }
        })
        return next
      })
      if (activeTool === oldName) {
        setActiveTool(value)
      }
    }
    setTiers(updated)
  }

  const handleDeleteTier = (index) => {
    if (tiers.length <= 1) return
    const deletedTier = tiers[index]
    const remaining = tiers.filter((_, idx) => idx !== index)
    setTiers(remaining)

    // Re-assign orphaned seats to the first remaining tier
    const fallbackTier = remaining[0].name
    setSeatMap((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => {
        if (next[key].tierName === deletedTier.name) {
          next[key] = { ...next[key], tierName: fallbackTier }
        }
      })
      return next
    })
    if (activeTool === deletedTier.name) {
      setActiveTool(fallbackTier)
    }
  }

  // Apply current tool to a specific seat
  const applyToolToSeat = useCallback((row, col) => {
    const key = `${row}-${col}`
    setSeatMap((prev) => {
      const existing = prev[key] || {
        id: key,
        row: row,
        col: col,
        seatNumber: `${col}`,
        sectionName: 'Main Hall',
        tierName: tiers[0]?.name || 'General Admission',
        status: 'available',
        isAccessible: false,
      }

      if (activeTool === 'empty') {
        // Toggle empty space / aisle
        return {
          ...prev,
          [key]: {
            ...existing,
            status: existing.status === 'empty' ? 'available' : 'empty',
          },
        }
      } else if (activeTool === 'accessible') {
        // Toggle wheelchair accessibility
        return {
          ...prev,
          [key]: {
            ...existing,
            status: 'available',
            isAccessible: !existing.isAccessible,
          },
        }
      } else {
        // Paint Tier
        return {
          ...prev,
          [key]: {
            ...existing,
            tierName: activeTool,
            status: 'available',
          },
        }
      }
    })
  }, [activeTool, tiers])

  // Bulk Row Actions
  const fillRowWithTool = (row) => {
    setSeatMap((prev) => {
      const next = { ...prev }
      for (let c = 1; c <= colsCount; c++) {
        const key = `${row}-${c}`
        const existing = next[key] || {
          id: key,
          row: row,
          col: c,
          seatNumber: `${c}`,
          sectionName: 'Main Hall',
          tierName: tiers[0]?.name || 'General Admission',
          status: 'available',
          isAccessible: false,
        }
        if (activeTool === 'empty') {
          next[key] = { ...existing, status: 'empty' }
        } else if (activeTool === 'accessible') {
          next[key] = { ...existing, isAccessible: true, status: 'available' }
        } else {
          next[key] = { ...existing, tierName: activeTool, status: 'available' }
        }
      }
      return next
    })
  }

  // Toggle Aisle Position
  const toggleAisle = (col) => {
    setAisles((prev) => 
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col].sort((a, b) => a - b)
    )
  }

  // Color lookup helper
  const getTierColor = (tierName) => {
    const tier = tiers.find((t) => t.name === tierName)
    return tier ? tier.color : '#059669'
  }

  // Real-time Telemetry Metrics calculated over the active (rowsCount x colsCount) matrix
  const telemetry = useMemo(() => {
    let totalSeats = 0
    let totalRevenue = 0
    let accessibleCount = 0
    const breakdown = {}

    tiers.forEach((t) => {
      breakdown[t.name] = { count: 0, price: parseFloat(t.price) || 0, color: t.color }
    })

    for (let r = 0; r < rowsCount; r++) {
      const rowLetter = ROW_LABELS[r] || `R${r + 1}`
      for (let c = 1; c <= colsCount; c++) {
        const key = `${rowLetter}-${c}`
        const s = seatMap[key] || {
          id: key,
          row: rowLetter,
          col: c,
          seatNumber: `${c}`,
          tierName: tiers[0]?.name || 'General Admission',
          status: 'available',
          isAccessible: false,
        }

        if (s.status !== 'empty') {
          totalSeats++
          if (s.isAccessible) accessibleCount++
          const tierName = s.tierName
          if (breakdown[tierName]) {
            breakdown[tierName].count++
            totalRevenue += breakdown[tierName].price
          } else if (tiers.length > 0) {
            const firstTier = tiers[0]
            if (breakdown[firstTier.name]) {
              breakdown[firstTier.name].count++
              totalRevenue += breakdown[firstTier.name].price
            }
          }
        }
      }
    }

    return { totalSeats, totalRevenue, accessibleCount, breakdown }
  }, [rowsCount, colsCount, seatMap, tiers])

  return (
    <div className="space-y-6">
      
      {/* Studio Banner & Preset Chooser */}
      <div className="p-4 sm:p-5 rounded-xl bg-stone-900 text-stone-100 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Armchair size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-50">Interactive Seating Studio</h3>
              <p className="text-xs text-stone-400">Design your venue layout, paint seat tiers, and configure pricing.</p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 hidden sm:inline">
              Preset:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition cursor-pointer border border-stone-700 hover:border-stone-500"
                  title={p.desc}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Studio Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-800 text-xs font-mono">
          <div className="p-2.5 rounded bg-stone-800/60 border border-stone-700/50">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Total Capacity</span>
            <span className="text-base font-semibold text-stone-100">{telemetry.totalSeats} Seats</span>
          </div>

          <div className="p-2.5 rounded bg-stone-800/60 border border-stone-700/50">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Gross Capacity Value</span>
            <span className="text-base font-semibold text-emerald-400">${telemetry.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="p-2.5 rounded bg-stone-800/60 border border-stone-700/50">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Pricing Tiers</span>
            <span className="text-base font-semibold text-amber-400">{tiers.length} Active Tiers</span>
          </div>

          <div className="p-2.5 rounded bg-stone-800/60 border border-stone-700/50">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Accessible (♿)</span>
            <span className="text-base font-semibold text-cyan-400">{telemetry.accessibleCount} Spots</span>
          </div>
        </div>
      </div>

      {/* Grid Configuration Controls & Tier Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Dimensions & Tier Palette */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Grid Dimensions */}
          <div className="p-4 rounded-xl border border-stone-200/90 bg-white shadow-2xs space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-stone-700 font-semibold flex items-center gap-1.5">
              <Grid size={14} className="text-stone-500" />
              <span>Venue Dimensions</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-stone-500">Rows (A-Z)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="18"
                    value={rowsCount}
                    onChange={(e) => handleRowsChange(parseInt(e.target.value, 10))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-semibold text-stone-900 w-6 text-right">
                    {rowsCount}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-stone-500">Seats per Row</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={colsCount}
                    onChange={(e) => handleColsChange(parseInt(e.target.value, 10))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-semibold text-stone-900 w-6 text-right">
                    {colsCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
              <span>Click column header below to toggle aisle spacing</span>
            </div>
          </div>

          {/* Pricing Tiers & Color Palette */}
          <div className="p-4 rounded-xl border border-stone-200/90 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-stone-700 font-semibold flex items-center gap-1.5">
                <Palette size={14} className="text-stone-500" />
                <span>Ticket Tiers &amp; Pricing</span>
              </h4>
              <button
                type="button"
                onClick={handleAddTier}
                className="text-xs font-mono font-medium text-stone-900 hover:text-stone-600 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Tier
              </button>
            </div>

            {/* List of Tiers */}
            <div className="space-y-3">
              {tiers.map((tier, idx) => {
                const isSelectedTool = activeTool === tier.name
                const stats = telemetry.breakdown[tier.name] || { count: 0 }

                return (
                  <div
                    key={tier.id || idx}
                    className={`p-3 rounded-lg border transition-all ${
                      isSelectedTool
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setActiveTool(tier.name)}
                        className="flex items-center gap-2 cursor-pointer text-left"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="font-medium text-stone-900 text-xs">
                          {tier.name}
                        </span>
                        {isSelectedTool && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-stone-900 text-stone-50">
                            Active Brush
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-stone-700">
                          {stats.count} Seats
                        </span>
                        {tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(idx)}
                            className="text-stone-400 hover:text-red-600 transition cursor-pointer p-0.5"
                            title="Delete tier"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-stone-500 block">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                          className="w-full rounded border border-stone-300 px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-stone-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-stone-500 block">Price (USD $)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={tier.price}
                          onChange={(e) => handleUpdateTier(idx, 'price', e.target.value)}
                          className="w-full rounded border border-stone-300 px-2 py-1 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Painting Brush Selector */}
          <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-50 space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold block">
              Active Drawing Tool (Click / Drag Canvas)
            </span>

            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setActiveTool(tier.name)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                    activeTool === tier.name
                      ? 'bg-stone-900 text-stone-50 shadow-xs'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span>Paint {tier.name}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setActiveTool('accessible')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                  activeTool === 'accessible'
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Accessibility size={13} className="text-cyan-600" />
                <span>Toggle ♿ Accessible</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('empty')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                  activeTool === 'empty'
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-stone-400" />
                <span>Toggle Aisle / Space</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Seating Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl border border-stone-300/80 bg-stone-900 text-stone-100 shadow-xl space-y-6 overflow-x-auto select-none">
            
            {/* Visual Stage Marker */}
            <div className="max-w-md mx-auto py-2.5 px-6 rounded-lg bg-stone-800 border border-stone-700 text-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10" />
              <span className="relative font-mono text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center justify-center gap-2">
                <Sparkles size={14} />
                <span>STAGE / PERFORMANCE AREA</span>
                <Sparkles size={14} />
              </span>
            </div>

            {/* Scrollable Seating Grid Canvas */}
            <div className="w-full overflow-x-auto pb-4">
              <div className="w-max min-w-full flex flex-col items-center py-2 px-6">
                
                {/* Column numbers bar */}
                <div className="flex items-center gap-1.5 mb-2 pl-7 pr-7">
                  {Array.from({ length: colsCount }, (_, i) => i + 1).map((colNum) => {
                    const isAisle = aisles.includes(colNum)
                    return (
                      <React.Fragment key={`col-hdr-${colNum}`}>
                        <button
                          type="button"
                          onClick={() => toggleAisle(colNum)}
                          title={`Toggle aisle after column ${colNum}`}
                          className={`w-6 sm:w-7 text-center font-mono text-[10px] transition cursor-pointer ${
                            isAisle ? 'text-amber-400 font-bold' : 'text-stone-500 hover:text-stone-200'
                          }`}
                        >
                          {colNum}
                        </button>
                        {isAisle && (
                          <div className="w-3 text-center text-[9px] font-mono text-amber-400/60 font-bold">
                            |
                          </div>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>

                {/* Rows Grid */}
                <div
                  className="space-y-1.5"
                  onMouseDown={() => setIsMouseDown(true)}
                  onMouseUp={() => setIsMouseDown(false)}
                  onMouseLeave={() => setIsMouseDown(false)}
                >
                  {Array.from({ length: rowsCount }, (_, r) => ROW_LABELS[r] || `R${r + 1}`).map((rowLetter) => (
                    <div key={`row-${rowLetter}`} className="flex items-center gap-1.5">
                      
                      {/* Left Row Label with Quick Fill Action */}
                      <button
                        type="button"
                        onClick={() => fillRowWithTool(rowLetter)}
                        title={`Fill Row ${rowLetter} with active brush`}
                        className="w-6 text-center font-mono text-xs font-semibold text-stone-400 hover:text-amber-400 transition cursor-pointer"
                      >
                        {rowLetter}
                      </button>

                      {/* Seat Nodes */}
                      {Array.from({ length: colsCount }, (_, c) => c + 1).map((colNum) => {
                        const key = `${rowLetter}-${colNum}`
                        const seat = seatMap[key] || {
                          id: key,
                          row: rowLetter,
                          col: colNum,
                          seatNumber: `${colNum}`,
                          tierName: tiers[0]?.name || 'General Admission',
                          status: 'available',
                          isAccessible: false,
                        }
                        const isAisle = aisles.includes(colNum)
                        const isEmpty = seat.status === 'empty'
                        const tierColor = getTierColor(seat.tierName)

                        return (
                          <React.Fragment key={key}>
                            <div
                              onClick={() => applyToolToSeat(rowLetter, colNum)}
                              onMouseEnter={() => {
                                if (isMouseDown) applyToolToSeat(rowLetter, colNum)
                              }}
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-mono text-[10px] transition-all transform hover:scale-110 cursor-pointer relative group ${
                                isEmpty
                                  ? 'border border-dashed border-stone-700 bg-transparent text-stone-600 hover:border-stone-500'
                                  : 'text-stone-950 font-bold shadow-xs hover:ring-2 hover:ring-white'
                              }`}
                              style={{
                                backgroundColor: isEmpty ? 'transparent' : tierColor,
                              }}
                              title={
                                isEmpty
                                  ? `Row ${rowLetter}, Space ${colNum} (Empty / Aisle)`
                                  : `Row ${rowLetter}, Seat ${colNum} • ${seat.tierName}${seat.isAccessible ? ' (Accessible ♿)' : ''}`
                              }
                            >
                              {isEmpty ? (
                                <span className="opacity-20 text-[9px]">&times;</span>
                              ) : seat.isAccessible ? (
                                <Accessibility size={12} className="text-stone-950" />
                              ) : (
                                <span>{colNum}</span>
                              )}
                            </div>

                            {/* Visual Aisle Gap */}
                            {isAisle && <div className="w-3" />}
                          </React.Fragment>
                        )
                      })}

                      {/* Right Row Label */}
                      <button
                        type="button"
                        onClick={() => fillRowWithTool(rowLetter)}
                        title={`Fill Row ${rowLetter} with active brush`}
                        className="w-6 text-center font-mono text-xs font-semibold text-stone-400 hover:text-amber-400 transition cursor-pointer"
                      >
                        {rowLetter}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Legend */}
            <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-stone-400">
              {tiers.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded shadow-xs" style={{ backgroundColor: t.color }} />
                  <span>{t.name} (${parseFloat(t.price).toFixed(2)})</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-stone-800 border border-stone-600 flex items-center justify-center text-[10px] text-stone-300">
                  ♿
                </span>
                <span>Wheelchair Accessible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-dashed border-stone-600" />
                <span>Aisle / Corridor Space</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
