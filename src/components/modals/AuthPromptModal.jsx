import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Ticket, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  X,
  CheckCircle2
} from 'lucide-react'

const ACTION_CONFIGS = {
  like: {
    badge: 'Show Your Love',
    title: 'Like & Support Experiences',
    subtitle: 'Sign in to like live stages, support your favorite artists, and discover community recommendations.',
    icon: Heart,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50 border-rose-200/80',
    accentColor: 'from-rose-500/10 via-rose-500/5 to-transparent',
    features: ['Support performing artists', 'Receive personalized recommendations', 'Boost stage popularity']
  },
  comment: {
    badge: 'Join the Conversation',
    title: 'Share Your Thoughts',
    subtitle: 'Sign in to join stage discussions, reply to attendees, and chat with event organizers in real time.',
    icon: MessageCircle,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200/80',
    accentColor: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    features: ['Ask organizers questions directly', 'Reply to live comments', 'Connect with fellow attendees']
  },
  bookmark: {
    badge: 'Save for Later',
    title: 'Build Your Event Wishlist',
    subtitle: 'Sign in to save events to your private wishlist and receive notifications before tickets sell out.',
    icon: Bookmark,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200/80',
    accentColor: 'from-amber-500/10 via-amber-500/5 to-transparent',
    features: ['Never lose track of upcoming stages', 'Get instant low-ticket alerts', 'Sync across all your devices']
  },
  checkout: {
    badge: 'Pass Reservation',
    title: 'Sign In to Book Passes',
    subtitle: 'Create a free account or sign in to lock in your tickets, pick assigned seats, and receive digital QR passes.',
    icon: Ticket,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200/80',
    accentColor: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    features: ['Instant digital pass with QR check-in', 'Interactive seat selection & holds', 'Official tax invoices & receipts']
  },
  host: {
    badge: 'Evento Studio',
    title: 'Host Your Own Event',
    subtitle: 'Sign in to launch your stage, customize seating maps, publish ticket tiers, and track payout revenue.',
    icon: Sparkles,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200/80',
    accentColor: 'from-amber-500/10 via-amber-500/5 to-transparent',
    features: ['Interactive venue seat builder', 'Real-time attendee check-in scanner', 'Direct payment transfers']
  },
  general: {
    badge: 'Evento Experience',
    title: 'Unlock the Full Platform',
    subtitle: 'Sign in or create your account to unlock interactive bookings, stage discussions, and ticket wallets.',
    icon: ShieldCheck,
    iconColor: 'text-stone-800',
    iconBg: 'bg-stone-100 border-stone-200/80',
    accentColor: 'from-stone-900/5 via-stone-800/5 to-transparent',
    features: ['Seamless digital ticket wallet', 'Real-time stage updates & notifications', 'Fast 1-click checkout']
  }
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  actionType = 'general',
  title,
  subtitle,
  redirectPath,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const config = ACTION_CONFIGS[actionType] || ACTION_CONFIGS.general
  const Icon = config.icon
  const displayTitle = title || config.title
  const displaySubtitle = subtitle || config.subtitle

  const handleNavigateToAuth = (authPath) => {
    onClose()
    const targetState = { from: redirectPath ? { pathname: redirectPath } : location }
    navigate(authPath, { state: targetState })
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
    >
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-stone-900">
        
        {/* Subtle decorative top gradient */}
        <div className={`h-24 w-full bg-gradient-to-b ${config.accentColor} absolute top-0 inset-x-0 pointer-events-none`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-900/10 z-20"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-5 relative">
          
          {/* Top Badge & Icon */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${config.iconBg} border flex items-center justify-center shrink-0 shadow-xs`}>
              <Icon size={24} className={config.iconColor} />
            </div>
            <div>
              <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold border border-stone-200/60">
                {config.badge}
              </span>
              <h3 id="auth-prompt-title" className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-950 mt-0.5">
                {displayTitle}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {displaySubtitle}
          </p>

          {/* Value Props */}
          <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-2">
            {config.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleNavigateToAuth('/account/login')}
              className="w-full py-3 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-50 text-xs font-mono font-medium tracking-wide transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.99]"
            >
              <span>Sign In to Continue</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigateToAuth('/account/signup')}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 border border-stone-300/90 text-stone-900 text-xs font-mono font-medium tracking-wide transition-all duration-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <span>Create Free Account</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-center text-xs font-mono text-stone-400 hover:text-stone-700 transition cursor-pointer"
            >
              Maybe later, continue browsing
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
