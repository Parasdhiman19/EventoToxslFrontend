import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import API from '../../services/api'
import {
  LifeBuoy,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  CreditCard,
  Ticket,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Inbox,
  ArrowRight,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react'

const ISSUE_CATEGORIES = [
  {
    id: 'bug',
    name: 'Technical Issue / Bug',
    desc: 'Website glitches, errors, or broken features',
    icon: ShieldAlert,
    targetModel: 'Platform',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'tickets',
    name: 'Tickets & QR Passes',
    desc: 'Issues downloading passes, QR scanners, or admissions',
    icon: Ticket,
    targetModel: 'Ticket',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'payment',
    name: 'Payments & Billing',
    desc: 'Checkout errors, card charges, or refund queries',
    icon: CreditCard,
    targetModel: 'Order',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'event',
    name: 'Event / Host Concern',
    desc: 'Event cancellation, schedule changes, or host queries',
    icon: Sparkles,
    targetModel: 'Event',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'account',
    name: 'Account & Security',
    desc: 'Login difficulties, password resets, or profile settings',
    icon: HelpCircle,
    targetModel: 'Account',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'general',
    name: 'General Question / Feedback',
    desc: 'Platform inquiries, suggestions, or organizer onboarding',
    icon: MessageSquare,
    targetModel: 'Platform',
    color: 'text-stone-700 bg-stone-100 border-stone-200',
  },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'history'
  const [tickets, setTickets] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expandedTicketId, setExpandedTicketId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('bug')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [targetId, setTargetId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const fetchUserTickets = async () => {
    setLoadingHistory(true)
    try {
      const res = await API.get('auth/support/')
      setTickets(res.data || [])
    } catch (err) {
      console.error('Failed to fetch user support tickets:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchUserTickets()
  }, [])

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !details.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both a subject line and description.' })
      return
    }

    const categoryObj = ISSUE_CATEGORIES.find((c) => c.id === selectedCategory) || ISSUE_CATEGORIES[0]

    setIsSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      const res = await API.post('auth/support/', {
        reportType: selectedCategory,
        targetModel: categoryObj.targetModel,
        targetId: targetId.trim(),
        reason: subject.trim(),
        details: details.trim(),
      })

      setFeedback({
        type: 'success',
        message: `Support ticket #${res.data?.id || ''} has been submitted to the Super Admin. You will receive an in-app notification upon resolution.`,
      })

      // Reset form
      setSubject('')
      setDetails('')
      setTargetId('')
      fetchUserTickets()

      // Automatically switch to history view after 1.2s
      setTimeout(() => {
        setActiveTab('history')
      }, 1200)
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.details?.[0] || err.response?.data?.reason?.[0] || 'Failed to submit ticket. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets
    if (statusFilter === 'pending') {
      return tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Dismissed')
    }
    return tickets.filter((t) => t.status?.toLowerCase() === statusFilter.toLowerCase())
  }, [tickets, statusFilter])

  const pendingCount = useMemo(() => {
    return tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Dismissed').length
  }, [tickets])

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'dismissed':
        return 'bg-stone-100 text-stone-600 border-stone-200'
      case 'investigating':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-stone-900 text-stone-50">
              <LifeBuoy size={16} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
              Help &amp; Problem Support
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
            Support &amp; Inquiries
          </h1>
          <p className="text-xs font-mono text-stone-500 mt-1">
            Send problem reports directly to the Super Admin team and track the status of your inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUserTickets}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl transition shadow-2xs active:scale-95 cursor-pointer"
            title="Refresh ticket history"
          >
            <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 my-6 border-b border-stone-200/80 pb-3">
        <div className="inline-flex p-1 bg-stone-200/70 rounded-full border border-stone-300/60">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-stone-900 text-stone-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-300/40'
            }`}
          >
            <Send size={13} />
            <span>Submit Problem</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-stone-900 text-stone-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-300/40'
            }`}
          >
            <Inbox size={13} />
            <span>My Support Tickets</span>
            {tickets.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'history'
                    ? 'bg-stone-700 text-white'
                    : 'bg-stone-300 text-stone-700'
                }`}
              >
                {tickets.length}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            {['all', 'pending', 'resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg border uppercase text-[11px] transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs font-mono flex items-start justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* TAB 1: NEW TICKET FORM */}
      {activeTab === 'new' && (
        <div className="space-y-6">
          <form onSubmit={handleSubmitTicket} className="space-y-6">
            {/* Category selection */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                1. Select Problem Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ISSUE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-md ring-2 ring-stone-900/10'
                          : 'border-stone-200/90 bg-white hover:border-stone-400 hover:bg-stone-50/70 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-stone-800 text-amber-400' : cat.color
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        {isSelected && <Check size={14} className="text-amber-400" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold">{cat.name}</h4>
                        <p
                          className={`text-[11px] mt-0.5 leading-tight ${
                            isSelected ? 'text-stone-300' : 'text-stone-400'
                          }`}
                        >
                          {cat.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject line & Reference ID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                  2. Subject / Issue Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trouble downloading QR pass for Electric Solstice"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                  Related ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Order #123 or Event ID"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition shadow-2xs font-mono"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">
                  3. Detailed Explanation <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-stone-400">
                  {details.length} characters
                </span>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Please describe the issue in detail, what you were trying to do, error messages seen, or what assistance is required..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition shadow-2xs leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[11px] font-mono text-stone-400">
                🔒 Your inquiry will be forwarded securely to the Super Admin.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-medium transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                    <span>Transmitting to Super Admin...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Problem Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MY TICKETS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="py-20 text-center text-xs font-mono text-stone-500 bg-white rounded-2xl border border-stone-200/80 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-stone-900" />
              <span>Loading your support tickets...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white rounded-2xl border border-stone-200/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Inbox size={22} />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-800">
                No Support Tickets Found
              </h3>
              <p className="text-xs font-mono text-stone-500 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'You have not submitted any problem messages yet.'
                  : `No tickets match the "${statusFilter}" filter.`}
              </p>
              {statusFilter === 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono font-medium hover:bg-stone-800 transition shadow-2xs"
                >
                  <Send size={12} />
                  <span>Submit Your First Ticket</span>
                </button>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isExpanded = expandedTicketId === ticket.id
              const hasResolution = Boolean(ticket.resolutionNotes || ticket.status === 'Resolved' || ticket.status === 'Dismissed')
              const categoryMatch = ISSUE_CATEGORIES.find((c) => c.id === ticket.reportType)

              return (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-stone-900 shadow-md ring-1 ring-stone-900/10'
                      : 'border-stone-200/80 hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  {/* Ticket Header Bar */}
                  <div
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 font-mono text-xs font-bold shrink-0">
                        #{ticket.id}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif font-bold text-sm text-stone-950 truncate">
                            {ticket.reason}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getStatusBadge(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-stone-400">
                          <span className="text-stone-600 font-medium">
                            {categoryMatch?.name || ticket.reportType || 'Support'}
                          </span>
                          {ticket.targetId && (
                            <>
                              <span>&bull;</span>
                              <span>Ref: #{ticket.targetId}</span>
                            </>
                          )}
                          <span>&bull;</span>
                          <span>
                            {ticket.createdAt
                              ? new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {hasResolution && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Admin Replied</span>
                        </span>
                      )}
                      <button
                        type="button"
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Ticket Details & Admin Resolution Response */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 bg-stone-50/40 space-y-4 text-xs font-sans">
                      <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-stone-400 tracking-wider">
                          Your Message:
                        </span>
                        <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                          {ticket.details}
                        </p>
                      </div>

                      {/* Super Admin Response Section */}
                      {ticket.resolutionNotes ? (
                        <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-[11px] font-bold uppercase">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              <span>Super Admin Resolution Response</span>
                            </div>
                            {ticket.resolvedAt && (
                              <span className="text-[10px] font-mono text-emerald-700">
                                {new Date(ticket.resolvedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-950 font-sans whitespace-pre-wrap leading-relaxed">
                            {ticket.resolutionNotes}
                          </p>
                        </div>
                      ) : ticket.status === 'Investigating' ? (
                        <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs font-mono text-blue-800 flex items-center gap-2">
                          <Clock size={14} className="text-blue-600 animate-pulse shrink-0" />
                          <span>
                            Super Admin is currently investigating this inquiry. You will be notified as soon as updates are posted.
                          </span>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-mono text-amber-800 flex items-center gap-2">
                          <Clock size={14} className="text-amber-600 shrink-0" />
                          <span>
                            Ticket is in queue for Super Admin review. Responses typically take less than 24 hours.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
