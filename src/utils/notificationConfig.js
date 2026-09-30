import {
  Sparkles,
  KeyRound,
  Lock,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  MessageSquare,
  DollarSign,
  Wallet,
  Building2,
  Bell,
  AlertCircle,
  CreditCard,
  UserCheck,
} from 'lucide-react'

export const NOTIFICATION_CONFIG = {
  // User — Account & Security
  WELCOME: {
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'Welcome',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    getActionUrl: () => '/discover',
    actionLabel: 'Explore Events',
  },
  PASSWORD_CHANGED: {
    icon: Lock,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'Security',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    getActionUrl: () => '/user/profile',
    actionLabel: 'Account Settings',
  },
  PASSWORD_RESET_REQUESTED: {
    icon: KeyRound,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badge: 'Security',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    getActionUrl: () => '/user/profile',
    actionLabel: 'View Account',
  },

  // User — Tickets & Orders
  ORDER_PLACED: {
    icon: CreditCard,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    badge: 'Order',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    getActionUrl: (data) => (data?.orderId ? `/user/orders` : '/user/orders'),
    actionLabel: 'View Order',
  },
  TICKET_ISSUED: {
    icon: Ticket,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'Tickets',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    getActionUrl: (data) => (data?.eventId ? `/user/tickets` : '/user/tickets'),
    actionLabel: 'View My Passes',
  },
  PAYMENT_FAILED: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    badge: 'Payment Alert',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    getActionUrl: (data) => (data?.eventId ? `/events/${data.eventId}` : '/user/orders'),
    actionLabel: 'Retry Checkout',
  },

  // User — Events (Attendee)
  EVENT_UPDATED: {
    icon: Calendar,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    badge: 'Event Update',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    getActionUrl: (data) => (data?.eventId ? `/events/${data.eventId}` : '/discover'),
    actionLabel: 'View Event',
  },
  EVENT_CANCELLED: {
    icon: XCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    badge: 'Cancelled',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    getActionUrl: () => '/user/tickets',
    actionLabel: 'View Tickets',
  },

  // User & Manager — Social
  EVENT_COMMENT_REPLIED: {
    icon: MessageSquare,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    badge: 'Reply',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    getActionUrl: (data) => (data?.eventId ? `/events/${data.eventId}` : '/discover'),
    actionLabel: 'View Discussion',
  },
  EVENT_COMMENT_RECEIVED: {
    icon: MessageSquare,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    badge: 'Discussion',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    getActionUrl: (data) => (data?.eventId ? `/events/${data.eventId}` : '/manager/events'),
    actionLabel: 'Reply to Comment',
  },

  // Manager — Sales
  TICKET_SOLD: {
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'Ticket Sale',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    getActionUrl: (data) => (data?.eventId ? `/manager/events/${data.eventId}` : '/manager/tickets'),
    actionLabel: 'View Sale',
  },
  EVENT_SOLD_OUT: {
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'Sold Out 🎉',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    getActionUrl: (data) => (data?.eventId ? `/manager/events/${data.eventId}` : '/manager/events'),
    actionLabel: 'Event Dashboard',
  },
  EVENT_LOW_INVENTORY: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    badge: 'Low Stock',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    getActionUrl: (data) => (data?.eventId ? `/manager/events/${data.eventId}` : '/manager/tickets'),
    actionLabel: 'Manage Tiers',
  },

  // Manager — Events
  EVENT_PUBLISHED: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'Published',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    getActionUrl: (data) => (data?.eventId ? `/events/${data.eventId}` : '/manager/events'),
    actionLabel: 'Live Page',
  },

  // Manager — Payouts
  PAYOUT_DISBURSED: {
    icon: Wallet,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'Payout Sent',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    getActionUrl: () => '/manager/payouts',
    actionLabel: 'Payout History',
  },
  PAYOUT_FAILED: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    badge: 'Payout Issue',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    getActionUrl: () => '/manager/payouts',
    actionLabel: 'Review Payouts',
  },

  // Manager — Account
  ORGANIZER_PROFILE_ACTIVATED: {
    icon: Building2,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'Host Studio',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    getActionUrl: () => '/manager/overview',
    actionLabel: 'Open Host Studio',
  },
}

const DEFAULT_CONFIG = {
  icon: Bell,
  color: 'text-stone-500',
  bg: 'bg-stone-500/10',
  border: 'border-stone-500/20',
  badge: 'Notification',
  badgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
  getActionUrl: () => null,
  actionLabel: 'View',
}

export function getNotificationConfig(type) {
  return NOTIFICATION_CONFIG[type] || DEFAULT_CONFIG
}
