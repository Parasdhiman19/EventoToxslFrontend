import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../../services/api'
import RevenueVelocityChart from '../../components/admin/charts/RevenueVelocityChart'
import CategoryDistributionChart from '../../components/admin/charts/CategoryDistributionChart'
import GateThroughputGauge from '../../components/admin/charts/GateThroughputGauge'
import EscrowAllocationBar from '../../components/admin/charts/EscrowAllocationBar'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Users,
  Calendar,
  Image,
  Star,
  Flag,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Sparkles,
  PieChart,
  Layers,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [timeframe, setTimeframe] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDashboardData = async (selectedTf = timeframe) => {
    if (!stats) setLoading(true)
    else setChartLoading(true)
    setError('')
    try {
      const [statsRes, actRes] = await Promise.all([
        API.get(`admin/dashboard/stats/?range=${selectedTf}`),
        API.get('admin/dashboard/activity/'),
      ])
      setStats(statsRes.data)
      setActivities(actRes.data.activities || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load executive metrics.')
    } finally {
      setLoading(false)
      setChartLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData(timeframe)
  }, [timeframe])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px] gap-3 px-4 text-center">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
          Loading Platform Intelligence & Analytics...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{error}</span>
        </div>
        <button
          onClick={() => fetchDashboardData(timeframe)}
          className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-mono font-medium hover:bg-rose-700 transition self-start sm:self-auto cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  const fin = stats?.financials || {}
  const ops = stats?.operations || {}
  const chartData = stats?.revenueChart || []
  const categoryBreakdown = stats?.categoryBreakdown || []
  const settlementAllocation = stats?.settlementAllocation || {}
  const admissionsFunnel = stats?.admissionsFunnel || {}

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-stone-900 text-white p-5 sm:p-8 rounded-2xl shadow-sm border border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-stone-300 text-xs font-mono tracking-widest uppercase mb-1.5">
            <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
            <span>Executive Governance Console</span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-stone-50">
            Evento Platform Ledger & Visual Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Real-time financial velocity, admissions telemetry, liquidity reserves, and genre distributions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          <button
            onClick={() => fetchDashboardData(timeframe)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-mono transition border border-stone-700 active:scale-95 cursor-pointer shadow-2xs"
          >
            <RefreshCw size={13} className={chartLoading ? 'animate-spin' : ''} />
            <span>Sync Real-Time Data</span>
          </button>
          <Link
            to="/admin/banners"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-950 font-medium rounded-xl text-xs font-mono transition shadow-xs active:scale-95"
          >
            <Image size={13} />
            <span>Hero Banners</span>
          </Link>
        </div>
      </div>

      {/* 1. FINANCIAL REVENUE OVERVIEW CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            <span>Financial Aggregates</span>
          </h2>
          <span className="text-[11px] sm:text-xs font-mono text-stone-500">Gross vs Net vs Escrow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">Gross Platform Volume</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{fin.grossVolume || '$0.00'}</div>
            <div className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
              <ArrowUpRight size={12} />
              <span>{fin.todaySales || '$0.00'} today</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs space-y-1.5 sm:space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-800">Platform Net Fee (3.5%)</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">{fin.platformFeeRevenue || '$0.00'}</div>
            <div className="text-[11px] font-mono text-emerald-700">Retained service fee</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">Disbursed to Creators</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{fin.disbursedTotal || '$0.00'}</div>
            <div className="text-[11px] font-mono text-stone-500">Settled via PayPal REST API</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">Escrow Reserve Balance</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{fin.pendingEscrow || '$0.00'}</div>
            <div className="text-[11px] font-mono text-stone-500">{fin.pendingPayouts || '$0.00'} in pending requests</div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY INTERACTIVE VELOCITY CHART */}
      <RevenueVelocityChart
        chartData={chartData}
        timeframe={timeframe}
        onTimeframeChange={(tf) => setTimeframe(tf)}
        financials={fin}
        loading={chartLoading}
      />

      {/* 3. MID-ROW VISUALIZATIONS: Genre Donut & Gate Throughput Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryDistributionChart categories={categoryBreakdown} />
        <GateThroughputGauge admissions={admissionsFunnel} />
      </div>

      {/* 4. TREASURY LIQUIDITY & ESCROW ALLOCATION BAR */}
      <EscrowAllocationBar settlement={settlementAllocation} />

      {/* 5. OPERATIONAL KPI COUNTS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
            <span>Operations & Inventory Health</span>
          </h2>
          <span className="text-[11px] sm:text-xs font-mono text-stone-500">Events, Users & Admissions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-stone-500 truncate">Total Users</div>
            <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">{ops.totalUsers || 0}</div>
            <div className="text-[10px] font-mono text-emerald-600 truncate">+{ops.newUsersThisMonth || 0} this mo.</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-stone-500 truncate">Active Studios</div>
            <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">{ops.activeOrganizers || 0}</div>
            <div className="text-[10px] font-mono text-stone-500 truncate">Verified hosts</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-stone-500 truncate">Live Stages</div>
            <div className="text-lg sm:text-xl font-bold font-serif text-emerald-700">{ops.liveEvents || 0}</div>
            <div className="text-[10px] font-mono text-stone-500 truncate">{ops.draftEvents || 0} drafts</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-stone-500 truncate">Tickets Sold</div>
            <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">{ops.totalTicketsSold || 0}</div>
            <div className="text-[10px] font-mono text-stone-500 truncate">Issued passes</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-stone-500 truncate">Gate Check-in</div>
            <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">{ops.checkInRate || '0%'}</div>
            <div className="text-[10px] font-mono text-stone-500 truncate">{ops.totalCheckedIn || 0} scanned</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-stone-500 truncate">Suspended Users</div>
            <div className="text-lg sm:text-xl font-bold font-serif text-rose-600">{ops.suspendedUsers || 0}</div>
            <div className="text-[10px] font-mono text-stone-500 truncate">Locked accounts</div>
          </div>
        </div>
      </div>

      {/* 6. REAL-TIME ACTIVITY STREAM */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">Platform Activity Stream</h3>
            <p className="text-[11px] text-stone-500 font-sans">Live ledger and operational events</p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
            Live Stream
          </span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {activities.length === 0 ? (
            <div className="text-xs font-mono text-stone-400 py-8 text-center">No recent activity logs.</div>
          ) : (
            activities.map((act, i) => (
              <div key={i} className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-stone-900 truncate">{act.title}</span>
                  <span className="text-[10px] font-mono text-stone-400 shrink-0">
                    {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2">{act.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 7. QUICK JUMP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/admin/events"
          className="p-4 bg-white rounded-xl border border-stone-200/80 hover:border-stone-900 transition flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 group-hover:bg-stone-900 group-hover:text-white transition shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Manage Events</div>
              <div className="text-[11px] font-mono text-stone-500">Approve, hide & moderate</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-stone-400 group-hover:text-stone-900 transition shrink-0" />
        </Link>

        <Link
          to="/admin/banners"
          className="p-4 bg-white rounded-xl border border-stone-200/80 hover:border-stone-900 transition flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 group-hover:bg-stone-900 group-hover:text-white transition shrink-0">
              <Image size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Hero Banners</div>
              <div className="text-[11px] font-mono text-stone-500">Carousel visual curator</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-stone-400 group-hover:text-stone-900 transition shrink-0" />
        </Link>

        <Link
          to="/admin/payouts"
          className="p-4 bg-white rounded-xl border border-stone-200/80 hover:border-stone-900 transition flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 group-hover:bg-stone-900 group-hover:text-white transition shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Payout Requests</div>
              <div className="text-[11px] font-mono text-stone-500">Disburse studio earnings</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-stone-400 group-hover:text-stone-900 transition shrink-0" />
        </Link>

        <Link
          to="/admin/reports"
          className="p-4 bg-white rounded-xl border border-stone-200/80 hover:border-stone-900 transition flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 group-hover:bg-stone-900 group-hover:text-white transition shrink-0">
              <Flag size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Moderation Reports</div>
              <div className="text-[11px] font-mono text-stone-500">Investigate complaints</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-stone-400 group-hover:text-stone-900 transition shrink-0" />
        </Link>
      </div>
    </div>
  )
}
