import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { 
  DollarSign, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Wallet, 
  ArrowRight,
  Lock,
  Zap,
  Mail,
  Copy,
  Check,
  Building2,
  Sparkles,
  Clock,
  ChevronRight,
  BadgeCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import API from '../../services/api'

// Authentic PayPal Duo-Tone SVG Icon
function PayPalIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.738a.77.77 0 0 1 .76-.64h6.425c3.21 0 5.485 1.487 5.076 4.707-.468 3.684-2.88 5.753-6.02 5.753H8.38l-1.304 7.78z"
        fill="#003087"
      />
      <path
        d="M19.167 7.805c-.468 3.684-2.88 5.753-6.02 5.753H10.34l-1.304 7.779h-4.04l.013-.078L7.076 8.54a.77.77 0 0 1 .76-.64h3.805c3.21 0 5.485 1.487 5.076 4.707"
        fill="#0079C1"
      />
      <path
        d="M8.38 13.558h2.808c3.14 0 5.552-2.069 6.02-5.753.376-2.96-1.52-4.47-4.43-4.675a6.45 6.45 0 0 0-1.634-.132H5.704a.77.77 0 0 0-.76.64L2.837 16.357a.641.641 0 0 0 .633.74h3.606l1.304-3.539z"
        fill="#00457C"
        opacity="0.15"
      />
    </svg>
  )
}

// Emulated Smart Chip Graphic for Digital Pass
function ChipGraphic() {
  return (
    <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-0.5 shadow-inner border border-amber-400/40 relative overflow-hidden shrink-0">
      <div className="w-full h-full border border-amber-600/30 rounded-[3px] grid grid-cols-2 grid-rows-2 gap-0.5 opacity-70">
        <div className="border-r border-b border-amber-700/30"></div>
        <div className="border-b border-amber-700/30"></div>
        <div className="border-r border-amber-700/30"></div>
        <div></div>
      </div>
    </div>
  )
}

export default function PayoutsAndRevenue() {
  const currentUser = useSelector((state) => state.auth?.user)
  const [selectedRange, setSelectedRange] = useState('all') // '7d' | '30d' | '90d' | 'all'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedEmail, setCopiedEmail] = useState(null)

  const [balanceCards, setBalanceCards] = useState([
    { label: 'Available for Payout', value: '$0.00', amount: 0, sub: 'Cleared ticket sales ready to withdraw', primary: true },
    { label: 'Pending Escrow', value: '$0.00', amount: 0, sub: 'Clears 48h after respective stage wraps', primary: false },
    { label: 'Lifetime Gross Sales', value: '$0.00', amount: 0, sub: 'Across active & completed stages', primary: false },
    { label: 'Total Platform & Gateway Fees', value: '$0.00', amount: 0, sub: 'Blended effective rate: 3.65%', primary: false },
  ])

  const [availableBalanceNumeric, setAvailableBalanceNumeric] = useState(0)
  const [payoutMethods, setPayoutMethods] = useState([])
  const [revenueByEvent, setRevenueByEvent] = useState([])
  const [payoutHistory, setPayoutHistory] = useState([])

  // Modal States
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [isAddMethodModalOpen, setIsAddMethodModalOpen] = useState(false)
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedMethodId, setSelectedMethodId] = useState(null)
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)
  const [payoutModalError, setPayoutModalError] = useState(null)
  const [payoutModalSuccess, setPayoutModalSuccess] = useState(null)

  // Add PayPal Form State
  const [paypalForm, setPaypalForm] = useState({ email: '', confirmEmail: '', isPrimary: true })
  const [isSubmittingMethod, setIsSubmittingMethod] = useState(false)
  const [methodModalError, setMethodModalError] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Primary linked account helper
  const primaryAccount = useMemo(() => {
    return payoutMethods.find(m => m.isPrimary || m.is_primary || m.status === 'Primary') || payoutMethods[0] || null
  }, [payoutMethods])

  // Fetch live financial data
  const fetchPayoutData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await API.get('payouts/manager/payouts/')
      const data = res.data

      if (data.balanceCards && Array.isArray(data.balanceCards)) {
        setBalanceCards(data.balanceCards)
      }
      if (typeof data.availableBalance === 'number') {
        setAvailableBalanceNumeric(data.availableBalance)
      } else if (data.balanceCards?.[0]?.amount) {
        setAvailableBalanceNumeric(data.balanceCards[0].amount)
      }
      if (data.payoutMethods && Array.isArray(data.payoutMethods)) {
        setPayoutMethods(data.payoutMethods)
        const primary = data.payoutMethods.find(m => m.isPrimary || m.is_primary || m.status === 'Primary') || data.payoutMethods[0]
        if (primary && !selectedMethodId) {
          setSelectedMethodId(primary.id)
        }
      }
      if (data.revenueByEvent && Array.isArray(data.revenueByEvent)) {
        setRevenueByEvent(data.revenueByEvent)
      }
      if (data.payoutHistory && Array.isArray(data.payoutHistory)) {
        setPayoutHistory(data.payoutHistory)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load manager settlement data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedMethodId])

  useEffect(() => {
    fetchPayoutData()
  }, [fetchPayoutData])

  // Open Withdrawal Modal
  const handleOpenWithdrawModal = () => {
    setPayoutModalError(null)
    setPayoutModalSuccess(null)
    setWithdrawAmount(availableBalanceNumeric > 0 ? availableBalanceNumeric.toFixed(2) : '0.00')
    const primary = payoutMethods.find(m => m.isPrimary || m.is_primary || m.status === 'Primary') || payoutMethods[0]
    if (primary) {
      setSelectedMethodId(primary.id)
    }
    setIsPayoutModalOpen(true)
  }

  // Handle Quick Percentage
  const handleSetPercentage = (pct) => {
    const val = (availableBalanceNumeric * pct).toFixed(2)
    setWithdrawAmount(val)
  }

  // Copy email to clipboard
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  // Submit Withdrawal to PayPal
  const handleRequestWithdrawal = async (e) => {
    e.preventDefault()
    setPayoutModalError(null)
    setPayoutModalSuccess(null)

    const numAmount = parseFloat(withdrawAmount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setPayoutModalError('Please specify a valid withdrawal amount greater than $0.00.')
      return
    }
    if (numAmount < 10.00) {
      setPayoutModalError('Minimum withdrawal amount is $10.00.')
      return
    }
    if (numAmount > availableBalanceNumeric) {
      setPayoutModalError(`Requested amount ($${numAmount.toFixed(2)}) exceeds available balance ($${availableBalanceNumeric.toFixed(2)}).`)
      return
    }
    if (!selectedMethodId && payoutMethods.length === 0) {
      setPayoutModalError('Please connect a PayPal account first.')
      return
    }

    setIsRequestingPayout(true)
    try {
      const res = await API.post('payouts/manager/payouts/request/', {
        amount: numAmount.toFixed(2),
        methodId: selectedMethodId,
      })
      setPayoutModalSuccess(res.data.message || `Disbursement of $${numAmount.toFixed(2)} sent to your PayPal wallet successfully.`)
      fetchPayoutData()
    } catch (err) {
      setPayoutModalError(err.response?.data?.detail || 'Could not process PayPal payout. Please check your account details.')
    } finally {
      setIsRequestingPayout(false)
    }
  }

  // Add PayPal Account
  const handleAddPayPalAccount = async (e) => {
    e.preventDefault()
    setMethodModalError(null)

    const email = paypalForm.email.trim().toLowerCase()
    const confirmEmail = paypalForm.confirmEmail.trim().toLowerCase()
    if (!email) {
      setMethodModalError('Please enter your PayPal account email address.')
      return
    }
    if (email !== confirmEmail) {
      setMethodModalError('PayPal email confirmation does not match.')
      return
    }

    setIsSubmittingMethod(true)
    try {
      await API.post('payouts/manager/methods/', {
        methodType: 'paypal',
        paypalEmail: email,
        isPrimary: paypalForm.isPrimary,
      })

      setIsAddMethodModalOpen(false)
      setPaypalForm({ email: '', confirmEmail: '', isPrimary: true })
      await fetchPayoutData()
    } catch (err) {
      const msg = err.response?.data?.paypalEmail || err.response?.data?.detail || 'Failed to connect PayPal account. Please try again.'
      setMethodModalError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setIsSubmittingMethod(false)
    }
  }

  // Set Method as Primary
  const handleSetPrimaryMethod = async (methodId) => {
    setActionLoadingId(methodId)
    try {
      await API.patch(`payouts/manager/methods/${methodId}/`, { isPrimary: true })
      await fetchPayoutData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update default PayPal account.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Delete Method
  const handleDeleteMethod = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this PayPal account?')) return
    setActionLoadingId(methodId)
    try {
      await API.delete(`payouts/manager/methods/${methodId}/`)
      await fetchPayoutData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove PayPal account.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Export Payout Settlement Ledger
  const handleExportStatement = () => {
    if (payoutHistory.length === 0 && revenueByEvent.length === 0) {
      alert('No disbursement history available to export.')
      return
    }

    const headers = ['Payout ID', 'Date', 'PayPal Account', 'Gross Total', 'Net Disbursed', 'PayPal Batch ID', 'Status']
    const rows = payoutHistory.map((p) => [
      p.id || p.payoutNumber,
      p.date,
      `"${p.method || p.destinationAccount || 'PayPal Account'}"`,
      `"${p.amount || p.grossTotal || '$0.00'}"`,
      `"${p.netAmount || p.netDisbursed || '$0.00'}"`,
      `"${p.paypalBatchId || p.reference || p.utrReference || 'N/A'}"`,
      p.status || 'Completed',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `evento_payout_statement_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered History
  const filteredHistory = useMemo(() => {
    if (selectedRange === 'all') return payoutHistory
    const now = new Date()
    const days = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return payoutHistory.filter((item) => {
      if (!item.date) return true
      const d = new Date(item.date)
      return isNaN(d.getTime()) || d >= cutoff
    })
  }, [payoutHistory, selectedRange])

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
              Payouts &amp; Revenue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#0079C1]/10 text-[#003087] border border-[#0079C1]/30 font-semibold inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0079C1] animate-pulse" />
              PayPal Payouts Gateway
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Instant stage revenue disbursements directly to your verified PayPal wallet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={fetchPayoutData}
            disabled={isLoading}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <button
            type="button"
            onClick={handleExportStatement}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWithdrawModal}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono font-semibold text-stone-50 hover:bg-black transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 group"
          >
            <DollarSign size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Withdraw to PayPal</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={fetchPayoutData} className="font-mono underline font-medium">
            Try Again
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Bespoke PayPal Merchant Settlement Hub (Authentic, Non-AI Aesthetic) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-stone-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden relative">
        {/* Brand Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#003087] via-[#0070BA] to-[#0079C1]" />

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Settlement Architecture & Flow */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Top Verified Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070BA]/8 border border-[#0070BA]/20 text-[#003087] text-[11px] font-mono font-medium">
                <BadgeCheck size={14} className="text-[#0070BA]" />
                <span>PayPal Commerce Partner Integration</span>
              </div>

              {payoutMethods.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Settlement Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-mono font-semibold">
                  <Clock size={11} className="text-amber-600" />
                  Action Required
                </span>
              )}
            </div>

            {/* Heading & Rationale */}
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 leading-tight">
                {payoutMethods.length > 0 
                  ? "Direct Revenue Settlement to Your PayPal Wallet" 
                  : "Connect Your PayPal Account for Instant Disbursements"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                Evento processes ticket earnings with zero intermediary hold-ups. Cleared ticket revenue transfers directly into your personal or business PayPal wallet on-demand with no wire transfer fees.
              </p>
            </div>

            {/* 3-Step Human Process Timeline Strip */}
            <div className="pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold mb-3">
                How Settlement Works
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-50 text-[10px] font-mono font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-semibold text-stone-900">Link PayPal ID</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal pl-7">
                    Enter your verified PayPal account email. No password needed.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-50 text-[10px] font-mono font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-semibold text-stone-900">Stage Escrow</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal pl-7">
                    Ticket sales accumulate safely in escrow as attendees register.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-semibold text-stone-900">Instant Transfer</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal pl-7">
                    Withdraw cleared balance straight into your PayPal wallet balance.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-100">
              <span className="inline-flex items-center gap-1.5 text-stone-700">
                <ShieldCheck size={13} className="text-[#0070BA]" />
                Direct PayPal REST API
              </span>
              <span className="inline-flex items-center gap-1.5 text-stone-700">
                <Zap size={13} className="text-amber-500" />
                Zero Platform Wire Fees
              </span>
              <span className="inline-flex items-center gap-1.5 text-stone-700">
                <Lock size={13} className="text-emerald-600" />
                256-bit Encrypted Handshake
              </span>
            </div>

          </div>

          {/* Right Column: Interactive Digital Merchant Pass / Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            <div className="w-full max-w-sm rounded-2xl bg-[#0b1324] text-white p-5 sm:p-6 shadow-xl border border-stone-700/60 relative overflow-hidden space-y-5">
              {/* Subtle architectural hairline accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0079C1]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#003087]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
                    <PayPalIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block leading-tight">
                      Merchant Settlement Pass
                    </span>
                    <span className="text-xs font-semibold tracking-tight text-white">
                      Evento Payouts Gateway
                    </span>
                  </div>
                </div>

                <ChipGraphic />
              </div>

              {/* Middle Pass Information */}
              <div className="space-y-1 relative z-10 pt-2 pb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  Primary Destination Account
                </span>

                {primaryAccount ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-medium text-blue-100 truncate">
                        {primaryAccount.paypalEmail || primaryAccount.paypal_email}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Ready for Automatic Disbursement</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(primaryAccount.paypalEmail || primaryAccount.paypal_email)}
                      className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
                      title="Copy PayPal Email"
                    >
                      {copiedEmail === (primaryAccount.paypalEmail || primaryAccount.paypal_email) ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/5 border border-dashed border-white/15 text-stone-400 text-xs font-mono">
                    <span className="block text-stone-300">No destination linked</span>
                    <span className="text-[10px] text-stone-400">Add a PayPal email to receive payouts</span>
                  </div>
                )}
              </div>

              {/* Pass Footer / Actions */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                    Available Balance
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    ${availableBalanceNumeric.toFixed(2)} USD
                  </span>
                </div>

                {payoutMethods.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMethodModalError(null)
                      setIsAddMethodModalOpen(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-mono font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Link PayPal</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenWithdrawModal}
                    className="px-4 py-2 rounded-xl bg-white text-stone-950 hover:bg-stone-100 text-xs font-mono font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <DollarSign size={13} className="text-emerald-600" />
                    <span>Withdraw</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Financial Metric Balance Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {balanceCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 shadow-2xs space-y-2 relative overflow-hidden transition-all ${
              card.primary
                ? 'bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-stone-50 border-stone-800'
                : 'bg-white text-stone-900 border-stone-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider ${
                  card.primary ? 'text-stone-400' : 'text-stone-500'
                }`}
              >
                {card.label}
              </span>
              {card.primary && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight">
              {isLoading ? (
                <span className="inline-block w-28 h-8 bg-stone-200/50 rounded-lg animate-pulse" />
              ) : (
                card.value
              )}
            </div>

            <p
              className={`text-[11px] font-mono ${
                card.primary ? 'text-stone-300' : 'text-stone-400'
              }`}
            >
              {card.sub}
            </p>
          </div>
        ))}
      </section>

      {/* Middle Section: Connected PayPal Accounts & Stage Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Connected PayPal Accounts */}
        <section className="lg:col-span-6 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="font-serif text-base font-medium text-stone-900 flex items-center gap-2">
                <span>Connected PayPal Wallets</span>
                <span className="text-[11px] font-mono font-normal text-stone-400">({payoutMethods.length})</span>
              </h2>
              <p className="text-xs text-stone-500">Destination accounts for automated instant revenue payouts</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMethodModalError(null)
                setIsAddMethodModalOpen(true)
              }}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-mono font-medium hover:bg-stone-100 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus size={13} />
              <span>Link PayPal</span>
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-stone-400">
                <Loader2 size={20} className="animate-spin mx-auto text-stone-400 mb-1" />
                <p className="font-mono text-xs">Loading PayPal accounts...</p>
              </div>
            ) : payoutMethods.length > 0 ? (
              payoutMethods.map((acc) => {
                const isPrimary = acc.isPrimary || acc.is_primary || acc.status === 'Primary'
                const email = acc.paypalEmail || acc.paypal_email

                return (
                  <div
                    key={acc.id}
                    className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isPrimary 
                        ? 'border-[#0070BA]/40 bg-gradient-to-r from-blue-50/40 via-white to-transparent shadow-xs ring-1 ring-[#0070BA]/10' 
                        : 'border-stone-200/70 bg-stone-50/40 hover:bg-stone-50/80'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Authentic PayPal Badge */}
                      <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <PayPalIcon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-900 truncate">
                            PayPal Wallet
                          </span>
                          {isPrimary && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#003087] text-white font-medium shrink-0 shadow-2xs">
                              Default Destination
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-medium text-stone-800 truncate">
                            {email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(email)}
                            className="p-1 text-stone-400 hover:text-stone-700 transition rounded-md hover:bg-stone-100 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedEmail === email ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active • Instant Payouts Ready</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryMethod(acc.id)}
                          disabled={actionLoadingId === acc.id}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-[11px] font-mono text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMethod(acc.id)}
                        disabled={actionLoadingId === acc.id}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Remove PayPal account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center space-y-3 border border-dashed border-stone-200 rounded-2xl bg-stone-50/40">
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto shadow-2xs">
                  <PayPalIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-stone-900 font-serif font-medium">No PayPal Account Linked</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Link your personal or business PayPal email to receive automatic and on-demand disbursements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMethodModalError(null)
                    setIsAddMethodModalOpen(true)
                  }}
                  className="mt-1 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-black transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={13} />
                  <span>Connect PayPal Account</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Stage Settlements Breakdown */}
        <section className="lg:col-span-6 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="font-serif text-base font-medium text-stone-900">Stage Settlements</h2>
            <p className="text-xs text-stone-500">Gross revenue vs gateway deductions per event</p>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-stone-400">
                <Loader2 size={20} className="animate-spin mx-auto text-stone-400 mb-1" />
                <p className="font-mono text-xs">Loading event settlements...</p>
              </div>
            ) : revenueByEvent.length > 0 ? (
              revenueByEvent.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-stone-50/60 border border-stone-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900 truncate max-w-[220px]">{item.name}</span>
                    <span className="font-mono font-semibold text-stone-900">{item.net}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-stone-200/40 pt-1.5">
                    <span>Gross: {item.gross}</span>
                    <span>Fees: {item.fees}</span>
                    <span className="text-stone-700 font-medium uppercase text-[10px]">{item.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-1 border border-dashed border-stone-200 rounded-2xl">
                <p className="text-xs text-stone-700 font-medium">No stage settlements recorded</p>
                <p className="text-[11px] text-stone-400">
                  When attendees purchase tickets to your stages, financial breakdowns will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Disbursement History Table */}
      <section className="rounded-2xl border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-medium text-stone-900">Disbursement History</h2>
            <p className="text-xs text-stone-500">Completed disbursements to your PayPal wallet</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/80 w-fit">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 text-xs font-mono uppercase rounded-lg transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-stone-900 text-stone-50 shadow-2xs font-medium'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
              <tr>
                <th className="px-5 py-3.5 font-medium">Payout ID &amp; Date</th>
                <th className="px-5 py-3.5 font-medium">PayPal Account</th>
                <th className="px-5 py-3.5 font-medium">Gross Total</th>
                <th className="px-5 py-3.5 font-medium">Net Disbursed</th>
                <th className="px-5 py-3.5 font-medium">PayPal Batch Reference</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400 font-mono text-xs">
                    Loading payout history...
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((payout) => (
                  <tr key={payout.id || payout.payoutNumber} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-stone-900">{payout.id || payout.payoutNumber}</div>
                      <div className="text-[11px] font-mono text-stone-400">{payout.date}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <PayPalIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono font-medium text-stone-800">{payout.method || payout.destinationAccount || 'PayPal Account'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-stone-600 whitespace-nowrap">
                      {payout.amount || payout.grossTotal}
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {payout.netAmount || payout.netDisbursed}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {payout.paypalBatchId || payout.reference || payout.utrReference || 'Completed'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {payout.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">
                    <p className="font-serif text-sm text-stone-600">No payout disbursements recorded</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Completed ticket sales will be eligible for instant PayPal transfers.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((payout, idx) => (
              <div key={payout.id || payout.payoutNumber} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-semibold text-xs text-stone-900 block">{payout.id || payout.payoutNumber}</span>
                    <span className="text-[11px] font-mono text-stone-400">{payout.date}</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {payout.status || 'Completed'}
                  </span>
                </div>

                <div className="text-xs font-medium text-stone-800">
                  {payout.method || payout.destinationAccount}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-stone-100/60 border border-stone-200/40">
                    <span className="text-[10px] uppercase text-stone-400 block">Gross Total</span>
                    <span className="text-stone-700 font-medium">{payout.amount || payout.grossTotal}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-100/60 border border-stone-200/40">
                    <span className="text-[10px] uppercase text-stone-400 block">Net Disbursed</span>
                    <span className="font-semibold text-stone-900">{payout.netAmount || payout.netDisbursed}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-stone-400">
              <p className="font-serif text-sm text-stone-600">No payout disbursements recorded</p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1. Redesigned Connect PayPal Account Modal */}
      {/* ========================================================================= */}
      {isAddMethodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center">
                  <PayPalIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-stone-900 leading-none">
                    Connect PayPal Account
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Direct automated settlement for ticket proceeds
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMethodModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Security Pill Notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0070BA]/5 border border-[#0070BA]/20 text-[11px] text-stone-700">
                <ShieldCheck size={16} className="text-[#0070BA] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-stone-900 block">Security Guarantee</span>
                  <span className="text-stone-600 leading-relaxed block">
                    We only require your registered PayPal email address to disburse funds. Evento will never ask for your password or API keys.
                  </span>
                </div>
              </div>

              {methodModalError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{methodModalError}</span>
                </div>
              )}

              <form onSubmit={handleAddPayPalAccount} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-800">
                      PayPal Account Email <span className="text-red-500">*</span>
                    </label>
                    {currentUser?.email && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaypalForm({
                            ...paypalForm,
                            email: currentUser.email,
                            confirmEmail: currentUser.email,
                          })
                        }}
                        className="text-[11px] font-mono text-[#0070BA] hover:underline cursor-pointer"
                      >
                        Use login email ({currentUser.email.split('@')[0]}...)
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. host.organizer@paypal.com"
                      value={paypalForm.email}
                      onChange={(e) => setPaypalForm({ ...paypalForm, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 focus:border-[#0070BA] transition font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Confirm PayPal Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="Re-enter your PayPal email address"
                      value={paypalForm.confirmEmail}
                      onChange={(e) => setPaypalForm({ ...paypalForm, confirmEmail: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 focus:border-[#0070BA] transition font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={paypalForm.isPrimary}
                      onChange={(e) => setPaypalForm({ ...paypalForm, isPrimary: e.target.checked })}
                      className="rounded border-stone-300 text-stone-900 focus:ring-0"
                    />
                    <span>Designate as primary default payout destination</span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddMethodModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMethod}
                    className="px-6 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-mono font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                  >
                    {isSubmittingMethod ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <PayPalIcon className="w-3.5 h-3.5" />
                        <span>Connect PayPal Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Instant PayPal Withdrawal Modal */}
      {/* ========================================================================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-50 flex items-center justify-center shadow-xs">
                  <DollarSign size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-stone-900 leading-none">
                    Withdraw Revenue
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">Direct transfer to your linked PayPal wallet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {payoutModalSuccess ? (
                <div className="text-center space-y-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 className="font-serif text-2xl font-medium text-stone-900">Disbursement Complete</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans max-w-sm mx-auto">
                    {payoutModalSuccess}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-semibold hover:bg-black transition cursor-pointer shadow-sm"
                  >
                    Done &rarr;
                  </button>
                </div>
              ) : payoutMethods.length === 0 ? (
                /* Prompt to add PayPal account first */
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#0070BA]/10 flex items-center justify-center mx-auto shadow-2xs border border-[#0070BA]/20">
                    <PayPalIcon className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-xl font-medium text-stone-900">PayPal Account Required</h4>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                    Please connect your PayPal email address to receive instant stage disbursements.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPayoutModalOpen(false)
                      setIsAddMethodModalOpen(true)
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-mono font-bold transition cursor-pointer inline-flex items-center justify-center gap-2 shadow-md"
                  >
                    <PayPalIcon className="w-4 h-4" />
                    <span>Connect PayPal Account &rarr;</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  {payoutModalError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{payoutModalError}</span>
                    </div>
                  )}

                  {/* Available Balance Summary */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-stone-50 space-y-1 shadow-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                      Available for Withdrawal
                    </span>
                    <div className="font-serif text-3xl font-semibold text-white">
                      ${availableBalanceNumeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-stone-300 font-mono">
                      Cleared ticket funds • $10.00 minimum
                    </p>
                  </div>

                  {/* Destination PayPal Account Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-800">
                      Destination PayPal Wallet <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedMethodId || ''}
                      onChange={(e) => setSelectedMethodId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 font-mono"
                    >
                      {payoutMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          PayPal ({m.paypalEmail || m.paypal_email}) {m.isPrimary ? '• Default' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Withdrawal Amount */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-800">
                      Withdrawal Amount ($ USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-stone-400 text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="10.00"
                        max={availableBalanceNumeric}
                        required
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-7 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition"
                      />
                    </div>

                    {/* Quick Percentage Selectors */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { label: '25%', val: 0.25 },
                        { label: '50%', val: 0.50 },
                        { label: '75%', val: 0.75 },
                        { label: 'Max (100%)', val: 1.00 },
                      ].map((pct) => (
                        <button
                          key={pct.label}
                          type="button"
                          onClick={() => handleSetPercentage(pct.val)}
                          className="py-1.5 px-2 rounded-lg bg-stone-100 text-[11px] font-mono font-medium text-stone-700 hover:bg-stone-200 hover:text-stone-950 transition cursor-pointer"
                        >
                          {pct.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fee Breakdown Card */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1.5 text-[11px] font-mono text-stone-600">
                    <div className="flex items-center justify-between">
                      <span>Platform Transfer Fee:</span>
                      <span className="text-emerald-700 font-semibold">$0.00 (Platform Covered)</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-200/40 pt-1.5 font-semibold text-stone-900">
                      <span>Net Disbursed:</span>
                      <span>${(parseFloat(withdrawAmount) || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPayoutModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-mono hover:bg-stone-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRequestingPayout || availableBalanceNumeric <= 0}
                      className="px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-mono font-bold hover:bg-black disabled:opacity-50 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      {isRequestingPayout ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Disbursing...</span>
                        </>
                      ) : (
                        <span>Confirm Transfer &rarr;</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}