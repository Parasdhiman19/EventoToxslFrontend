import React, { useState, useMemo, useRef } from 'react'
import { TrendingUp, DollarSign, Ticket, Calendar, BarChart3, Layers, ArrowUpRight } from 'lucide-react'

export default function RevenueVelocityChart({
  chartData = [],
  timeframe = '30d',
  onTimeframeChange,
  financials = {},
  loading = false,
}) {
  const [metric, setMetric] = useState('gross') // 'gross' | 'platformFee' | 'tickets'
  const [hoverState, setHoverState] = useState(null) // { svgX, svgY, index, point }
  const svgRef = useRef(null)

  const maxVal = useMemo(() => {
    if (!chartData || chartData.length === 0) return 100
    const values = chartData.map((d) => d[metric] || 0)
    return Math.max(...values, 10)
  }, [chartData, metric])

  const totals = useMemo(() => {
    if (!chartData) return { gross: 0, platformFee: 0, tickets: 0 }
    return chartData.reduce(
      (acc, d) => ({
        gross: acc.gross + (d.gross || 0),
        platformFee: acc.platformFee + (d.platformFee || 0),
        tickets: acc.tickets + (d.tickets || 0),
      }),
      { gross: 0, platformFee: 0, tickets: 0 }
    )
  }, [chartData])

  // SVG Dimension Definitions
  const svgWidth = 800
  const svgHeight = 220
  const paddingX = 35
  const paddingY = 25
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingY * 2

  const points = useMemo(() => {
    if (!chartData || chartData.length === 0) return []
    const count = chartData.length
    const stepX = chartWidth / (count - 1 || 1)

    return chartData.map((d, index) => {
      const val = d[metric] || 0
      const x = paddingX + index * stepX
      const y = paddingY + chartHeight - (val / maxVal) * chartHeight
      return { x, y, data: d, index, val }
    })
  }, [chartData, metric, maxVal, chartWidth, chartHeight])

  // Smooth curved SVG paths
  const areaPath = useMemo(() => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cpX = (p0.x + p1.x) / 2
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`
    }

    const lastX = points[points.length - 1].x
    const firstX = points[0].x
    const bottomY = paddingY + chartHeight
    d += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
    return d
  }, [points, chartHeight])

  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cpX = (p0.x + p1.x) / 2
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return d
  }, [points])

  // Precise tracking directly bound to SVG bounds
  const handlePointerMove = (e) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX

    // Screen pixel relative to SVG element
    const relX = clientX - rect.left
    const percentOnSvg = Math.max(0, Math.min(1, relX / rect.width))

    // Direct SVG coordinate matching mouse position
    const rawSvgX = percentOnSvg * svgWidth
    const clampedSvgX = Math.max(paddingX, Math.min(svgWidth - paddingX, rawSvgX))

    // Exact index calculation based on data points
    const chartFraction = Math.max(0, Math.min(1, (clampedSvgX - paddingX) / chartWidth))
    const exactIndex = chartFraction * (points.length - 1)
    const closestIndex = Math.round(exactIndex)
    const activePoint = points[closestIndex]

    setHoverState({
      svgX: activePoint.x,
      svgY: activePoint.y,
      index: closestIndex,
      point: activePoint,
    })
  }

  const activePoint = hoverState ? hoverState.point : null
  const currentSvgX = hoverState ? hoverState.svgX : null
  const currentSvgY = hoverState ? hoverState.svgY : null

  // Active or Default Values for Hero Header
  const activeValue = activePoint ? activePoint.data[metric] : totals[metric]
  const activeDate = activePoint ? activePoint.data.date : `Active Period (${timeframe.toUpperCase()})`
  const activeSubtext = activePoint
    ? `Fee Share: $${Number(activePoint.data.platformFee || 0).toFixed(2)} • ${activePoint.data.tickets || 0} tickets`
    : `Total Fee Capture: $${totals.platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • ${totals.tickets.toLocaleString()} tickets`

  const formatHeaderValue = (val) => {
    if (metric === 'tickets') return `${Number(val || 0).toLocaleString()} Passes`
    return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sm:space-y-5">
      {/* Dynamic Hero Metric Header (Synchronized to Mouse Position) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-medium">
              {activePoint ? 'Point Telemetry' : 'Platform Velocity'}
            </span>
            <span className="text-stone-400 text-xs font-mono">• {activeDate}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 transition-all duration-75">
              {formatHeaderValue(activeValue)}
            </div>
            {activePoint && (
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Cursor
              </span>
            )}
          </div>

          <p className="text-xs text-stone-500 font-mono mt-1">
            {activeSubtext}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
            <button
              onClick={() => setMetric('gross')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                metric === 'gross'
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Gross
            </button>
            <button
              onClick={() => setMetric('platformFee')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                metric === 'platformFee'
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Fee Cut (3.5%)
            </button>
            <button
              onClick={() => setMetric('tickets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                metric === 'tickets'
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Tickets
            </button>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1Y' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange && onTimeframeChange(tf.id)}
                disabled={loading}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-stone-900 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative w-full overflow-visible pt-2 pb-2 cursor-crosshair select-none">
        {/* Floating Tooltip Badge (Pinned Directly to Active Data Point) */}
        {activePoint && currentSvgX !== null && currentSvgY !== null && (
          <div
            style={{
              left: `${(currentSvgX / svgWidth) * 100}%`,
              top: `${(currentSvgY / svgHeight) * 100}%`,
              transform: currentSvgY < 60
                ? 'translate(-50%, 14px)'
                : 'translate(-50%, -100%) translateY(-12px)',
            }}
            className="absolute pointer-events-none z-30 transition-all duration-75"
          >
            <div className="bg-stone-900 text-stone-100 px-2.5 py-1 rounded-lg shadow-xl border border-stone-800 text-[11px] font-mono whitespace-nowrap flex items-center gap-1.5">
              <span className="font-bold text-white">
                {metric === 'tickets' ? `${activePoint.data.tickets} tix` : `$${Number(activePoint.data[metric] || 0).toFixed(2)}`}
              </span>
              <span className="text-stone-400 text-[10px]">• {activePoint.data.shortDate || activePoint.data.date}</span>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onPointerLeave={() => setHoverState(null)}
          onMouseLeave={() => setHoverState(null)}
          className="w-full h-48 sm:h-64 overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1917" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#1c1917" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + chartHeight * (1 - ratio)
            const labelVal = maxVal * ratio
            return (
              <g key={i} className="text-stone-300">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  className="text-stone-200"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono"
                >
                  {metric === 'tickets' ? Math.round(labelVal) : `$${Math.round(labelVal)}`}
                </text>
              </g>
            )
          })}

          {/* Area Fill */}
          <path
            d={areaPath}
            fill={metric === 'platformFee' ? 'url(#feeGradient)' : 'url(#grossGradient)'}
          />

          {/* Line Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={metric === 'platformFee' ? '#059669' : '#1c1917'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Static Data Point Dots */}
          {points.map((p, idx) => {
            const isClosest = hoverState?.index === idx
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isClosest ? 5 : 2}
                  className={`transition-all duration-150 ${
                    metric === 'platformFee' ? 'fill-emerald-600' : 'fill-stone-900'
                  } ${isClosest ? 'opacity-100 fill-emerald-500 stroke-white stroke-2' : 'opacity-60'}`}
                />

                {/* X Axis Date Labels */}
                {(points.length <= 12 || idx % Math.ceil(points.length / 8) === 0 || idx === points.length - 1) && (
                  <text
                    x={p.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-stone-400 font-mono"
                  >
                    {p.data.shortDate || p.data.date}
                  </text>
                )}
              </g>
            )
          })}

          {/* Vertical Crosshair Line (Tracks Active Data Point) */}
          {currentSvgX !== null && (
            <line
              x1={currentSvgX}
              y1={paddingY}
              x2={currentSvgX}
              y2={paddingY + chartHeight}
              stroke="#78716c"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* Glowing Cursor Dot On The Curve */}
          {currentSvgX !== null && currentSvgY !== null && (
            <g className="pointer-events-none">
              <circle
                cx={currentSvgX}
                cy={currentSvgY}
                r={6.5}
                className={metric === 'platformFee' ? 'fill-emerald-500' : 'fill-stone-950'}
                stroke="white"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Full-coverage Transparent Hit Surface to Capture All Pointer Events */}
          <rect
            x={0}
            y={0}
            width={svgWidth}
            height={svgHeight}
            fill="transparent"
            className="cursor-crosshair"
          />
        </svg>
      </div>

      {/* Summary Footer Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-stone-100 font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
          <span className="text-[10px] text-stone-500 uppercase block">Total Period Volume</span>
          <span className="font-serif font-bold text-stone-900 text-sm">
            ${totals.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
          <span className="text-[10px] text-emerald-800 uppercase block">Retained Fee Cut</span>
          <span className="font-serif font-bold text-emerald-700 text-sm">
            +${totals.platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
          <span className="text-[10px] text-stone-500 uppercase block">Total Tickets Issued</span>
          <span className="font-serif font-bold text-stone-900 text-sm">
            {totals.tickets.toLocaleString()} passes
          </span>
        </div>
      </div>
    </div>
  )
}
