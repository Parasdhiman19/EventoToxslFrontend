import React from 'react'
import { AlertCircle } from 'lucide-react'

export default class PayPalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('PayPal SDK Error caught safely by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <AlertCircle size={14} className="text-amber-600" />
            <span>PayPal Sandbox Unavailable</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Please configure your PayPal Sandbox Client ID or use the Instant Pass option below.
          </p>
          <button
            type="button"
            onClick={this.props.onFallbackToDirect}
            className="w-full py-2.5 px-3 rounded-lg bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 transition cursor-pointer"
          >
            Switch to Instant Pass
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
