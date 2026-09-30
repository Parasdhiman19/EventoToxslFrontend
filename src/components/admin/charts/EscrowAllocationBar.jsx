import React, { useState } from 'react'
import { DollarSign, Shield, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react'

export default function EscrowAllocationBar({ settlement = {} }) {
  const [activeSegment, setActiveSegment] = useState(null)

  const gross = settlement.gross || 0
  const disbursed = settlement.disbursed || 0
  const platformFee = settlement.platformFee || 0
  const pendingEscrow = settlement.pendingEscrow || 0
  const refunded = settlement.refunded || 0

  const safeGross = gross > 0 ? gross : 1

  const segments = [
    {
      id: 'disbursed',
      label: 'Disbursed Payouts',
      amount: disbursed,
      pct: Math.round((disbursed / safeGross) * 100),
      color: 'bg-stone-900',
      textColor: 'text-stone-900',
      badgeColor: 'bg-stone-50 border-stone-200/80',
      desc: 'Settled via PayPal REST API',
    },
    {
      id: 'escrow',
      label: 'Escrow Reserves',
      amount: pendingEscrow,
      pct: Math.round((pendingEscrow / safeGross) * 100),
      color: 'bg-amber-600',
      textColor: 'text-amber-900',
      badgeColor: 'bg-amber-50/50 border-amber-200/80',
      desc: 'Awaiting host withdrawal request',
    },
    {
      id: 'fee',
      label: 'Platform Retained Fee',
      amount: platformFee,
      pct: Math.round((platformFee / safeGross) * 100),
      color: 'bg-emerald-600',
      textColor: 'text-emerald-950',
      badgeColor: 'bg-emerald-50/50 border-emerald-200/80',
      desc: '3.5% retainage on ticket checkout',
    },
    {
      id: 'refund',
      label: 'Refund Volume',
      amount: refunded,
      pct: Math.round((refunded / safeGross) * 100),
      color: 'bg-rose-600',
      textColor: 'text-rose-950',
      badgeColor: 'bg-rose-50/50 border-rose-200/80',
      desc: 'Chargebacks and canceled tickets',
    },
  ]

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            <DollarSign size={14} />
          </span>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
              Treasury Liquidity & Settlement Allocation
            </h3>
            <p className="text-[11px] text-stone-500 font-sans">
              Distribution of gross capture between creator payouts, platform cuts, and escrow
            </p>
          </div>
        </div>
        <div className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          Gross Volume: ${gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Multi-segmented Progress Bar with Proportional Flex */}
      <div className="space-y-3">
        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden flex gap-1 p-0.5 border border-stone-200">
          {segments.map((seg) => {
            const flexValue = Math.max(0.05, seg.amount / safeGross)
            const isHovered = activeSegment === seg.id
            return (
              <div
                key={seg.id}
                style={{ flex: flexValue }}
                onMouseEnter={() => setActiveSegment(seg.id)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`${seg.color} h-full rounded-full transition-all duration-300 cursor-pointer ${
                  isHovered ? 'ring-2 ring-stone-950 ring-offset-1 scale-y-110' : 'opacity-90 hover:opacity-100'
                }`}
                title={`${seg.label}: $${seg.amount.toFixed(2)} (${seg.pct}%)`}
              />
            )
          })}
        </div>

        {/* Interactive Legend Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
          {segments.map((seg) => {
            const isHovered = activeSegment === seg.id
            return (
              <div
                key={seg.id}
                onMouseEnter={() => setActiveSegment(seg.id)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer space-y-1 ${seg.badgeColor} ${
                  isHovered ? 'ring-1 ring-stone-900 shadow-xs' : ''
                }`}
              >
                <div className="flex items-center gap-1.5 text-stone-700">
                  <span className={`w-2 h-2 rounded-full ${seg.color}`} />
                  <span className="text-[10px] uppercase font-semibold truncate">{seg.label}</span>
                </div>
                <div className={`font-serif font-bold text-sm ${seg.textColor}`}>
                  ${seg.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-stone-500 font-sans truncate">{seg.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
