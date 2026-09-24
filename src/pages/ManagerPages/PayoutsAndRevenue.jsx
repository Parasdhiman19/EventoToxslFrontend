import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  DollarSign,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import API from '../../services/api'
import { exportToCsv } from '../../utils/exportCsv'
import {
  PayPalSettlementHub,
  PayoutBalanceCards,
  ConnectedPayoutMethods,
  StageSettlementsTable,
  PayoutHistoryTable,
  RequestPayoutModal,
  AddPayoutMethodModal,
} from './PayoutsAndRevenue/index'

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
    return (
      payoutMethods.find((m) => m.isPrimary || m.is_primary || m.status === 'Primary') ||
      payoutMethods[0] ||
      null
    )
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
        const primary =
          data.payoutMethods.find((m) => m.isPrimary || m.is_primary || m.status === 'Primary') ||
          data.payoutMethods[0]
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
    const primary =
      payoutMethods.find((m) => m.isPrimary || m.is_primary || m.status === 'Primary') ||
      payoutMethods[0]
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
    if (numAmount < 10.0) {
      setPayoutModalError('Minimum withdrawal amount is $10.00.')
      return
    }
    if (numAmount > availableBalanceNumeric) {
      setPayoutModalError(
        `Requested amount ($${numAmount.toFixed(2)}) exceeds available balance ($${availableBalanceNumeric.toFixed(2)}).`
      )
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
      setPayoutModalSuccess(
        res.data.message || `Disbursement of $${numAmount.toFixed(2)} sent to your PayPal wallet successfully.`
      )
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
      const msg =
        err.response?.data?.paypalEmail ||
        err.response?.data?.detail ||
        'Failed to connect PayPal account. Please try again.'
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
      p.method || p.destinationAccount || 'PayPal Account',
      p.amount || p.grossTotal || '$0.00',
      p.netAmount || p.netDisbursed || '$0.00',
      p.paypalBatchId || p.reference || p.utrReference || 'N/A',
      p.status || 'Completed',
    ])

    exportToCsv(`evento_payout_statement_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
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

      {/* PayPal Merchant Settlement Hub */}
      <PayPalSettlementHub
        payoutMethods={payoutMethods}
        primaryAccount={primaryAccount}
        availableBalanceNumeric={availableBalanceNumeric}
        copiedEmail={copiedEmail}
        onCopyEmail={handleCopyEmail}
        onOpenAddMethod={() => {
          setMethodModalError(null)
          setIsAddMethodModalOpen(true)
        }}
        onOpenWithdraw={handleOpenWithdrawModal}
      />

      {/* Financial Metric Balance Cards */}
      <PayoutBalanceCards balanceCards={balanceCards} isLoading={isLoading} />

      {/* Middle Section: Connected PayPal Accounts & Stage Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ConnectedPayoutMethods
          payoutMethods={payoutMethods}
          isLoading={isLoading}
          actionLoadingId={actionLoadingId}
          copiedEmail={copiedEmail}
          onCopyEmail={handleCopyEmail}
          onOpenAddMethod={() => {
            setMethodModalError(null)
            setIsAddMethodModalOpen(true)
          }}
          onSetPrimaryMethod={handleSetPrimaryMethod}
          onDeleteMethod={handleDeleteMethod}
        />

        <StageSettlementsTable revenueByEvent={revenueByEvent} isLoading={isLoading} />
      </div>

      {/* Disbursement History Table */}
      <PayoutHistoryTable
        filteredHistory={filteredHistory}
        isLoading={isLoading}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
      />

      {/* Modals */}
      <AddPayoutMethodModal
        isOpen={isAddMethodModalOpen}
        onClose={() => setIsAddMethodModalOpen(false)}
        currentUser={currentUser}
        paypalForm={paypalForm}
        setPaypalForm={setPaypalForm}
        methodModalError={methodModalError}
        onSubmit={handleAddPayPalAccount}
        isSubmitting={isSubmittingMethod}
      />

      <RequestPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        payoutModalSuccess={payoutModalSuccess}
        payoutModalError={payoutModalError}
        payoutMethods={payoutMethods}
        availableBalanceNumeric={availableBalanceNumeric}
        selectedMethodId={selectedMethodId}
        setSelectedMethodId={setSelectedMethodId}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        onSetPercentage={handleSetPercentage}
        onSubmit={handleRequestWithdrawal}
        isRequestingPayout={isRequestingPayout}
        onOpenAddMethod={() => {
          setIsPayoutModalOpen(false)
          setIsAddMethodModalOpen(true)
        }}
      />
    </div>
  )
}