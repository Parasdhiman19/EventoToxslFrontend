import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import API from '../services/api'
import { setCredentials } from '../redux/slice/authSlice'

function ForgotPassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Recovery Mode: 'link' (Password Reset Link) or 'otp' (One-Time Login Code)
  const [recoveryMode, setRecoveryMode] = useState('link')

  // Step state:
  // For 'link': 1 = Email Input, 2 = Link Sent Success Screen
  // For 'otp': 1 = Email Input, 2 = OTP Digit Grid & Instant Login
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [remainingAttempts, setRemainingAttempts] = useState(null)

  // 6-digit OTP input state (used when recoveryMode === 'otp')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const otpInputRefs = useRef([])

  // Countdown timer for Resend button
  useEffect(() => {
    let interval = null
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, resendTimer])

  // Focus first OTP input when transitioning to Step 2 in OTP mode
  useEffect(() => {
    if (step === 2 && recoveryMode === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step, recoveryMode])

  // Step 1 Formik (Email Input)
  const emailFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true)
      setServerError(null)

      try {
        if (recoveryMode === 'link') {
          // Send 32-byte secure password reset link
          await API.post('auth/password-reset/send-link/', {
            email: values.email,
          })
          setStep(2)
          setResendTimer(60)
        } else {
          // Send 6-digit OTP for instant login
          await API.post('auth/password-reset/send-otp/', {
            email: values.email,
          })
          setStep(2)
          setResendTimer(60)
          setRemainingAttempts(5)
          setOtpDigits(['', '', '', '', '', ''])
        }
      } catch (err) {
        const message =
          err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          'Failed to send request. Please check your email and try again.'
        setServerError(message)
      } finally {
        setIsLoading(false)
      }
    },
  })

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    setServerError(null)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all 6 digits are entered
    const completeCode = newDigits.join('')
    if (completeCode.length === 6) {
      verifyAndLogin(completeCode)
    }
  }

  // Handle backspace navigation in OTP inputs
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtpDigits(digits)
      otpInputRefs.current[5]?.focus()
      verifyAndLogin(pastedData)
    }
  }

  // Verify OTP and complete login (without changing password)
  const verifyAndLogin = async (codeToVerify) => {
    const otp = codeToVerify || otpDigits.join('')
    if (otp.length !== 6) {
      setServerError('Please enter the full 6-digit verification code.')
      return
    }

    setIsLoading(true)
    setServerError(null)

    try {
      const response = await API.post('auth/password-reset/verify/', {
        email: emailFormik.values.email,
        otp: otp,
      })

      const { user, access } = response.data

      // Store user and access token in Redux state for instant auto-login
      dispatch(setCredentials({ user, accessToken: access }))

      // Redirection: Host -> Manager Studio, User -> Home
      if (user?.isOrganizer || user?.role === 'manager') {
        navigate('/manager/overview')
      } else {
        navigate('/')
      }
    } catch (err) {
      const remaining = err.response?.data?.remaining_attempts
      if (typeof remaining === 'number') {
        setRemainingAttempts(remaining)
      }
      const message =
        err.response?.data?.detail ||
        err.response?.data?.otp?.[0] ||
        'Verification failed. Please check the code and try again.'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend Handler (Supports both Link and OTP)
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return

    setIsResending(true)
    setServerError(null)

    try {
      if (recoveryMode === 'link') {
        await API.post('auth/password-reset/send-link/', {
          email: emailFormik.values.email,
        })
      } else {
        await API.post('auth/password-reset/send-otp/', {
          email: emailFormik.values.email,
        })
        setRemainingAttempts(5)
        setOtpDigits(['', '', '', '', '', ''])
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus()
        }
      }
      setResendTimer(60)
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        'Failed to resend. Please try again in a moment.'
      setServerError(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Step 1: Mode Selection & Email Input */}
      {step === 1 && (
        <>
          {/* Recovery Mode Selector Tabs */}
          <div className="flex p-1 bg-stone-100 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setRecoveryMode('link')
                setServerError(null)
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                recoveryMode === 'link'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Reset Password Link
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoveryMode('otp')
                setServerError(null)
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                recoveryMode === 'otp'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              One-Time Login Code
            </button>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
              {recoveryMode === 'link' ? 'Reset your password' : 'Sign in with OTP'}
            </h1>
            <p className="text-sm text-stone-500">
              {recoveryMode === 'link'
                ? "Enter your registered email address and we'll send you a secure link to reset your password."
                : "Enter your registered email address and we'll send you a 6-digit one-time code to sign in instantly."}
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={emailFormik.handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
              >
                Registered Email <span style={{ color: 'red', position: 'relative', top: '-3px' }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(e) => {
                  setServerError(null)
                  emailFormik.handleChange(e)
                }}
                onBlur={emailFormik.handleBlur}
                value={emailFormik.values.email}
                className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                  emailFormik.touched.email && emailFormik.errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
                }`}
              />
              {emailFormik.touched.email && emailFormik.errors.email && (
                <p className="text-xs text-red-600 tracking-tight">{emailFormik.errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 active:bg-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 pt-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{recoveryMode === 'link' ? 'Sending Reset Link...' : 'Sending Login Code...'}</span>
                </>
              ) : (
                <span>{recoveryMode === 'link' ? 'Send Password Reset Link' : 'Send One-Time Login Code'}</span>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 text-center text-xs text-stone-500">
            Remember your password?{' '}
            <Link
              to="/account/login"
              className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-700 transition-colors"
            >
              Sign in with password
            </Link>
          </div>
        </>
      )}

      {/* Step 2 (Link Mode): Check Your Email Confirmation */}
      {step === 2 && recoveryMode === 'link' && (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-stone-100 border border-stone-200 text-stone-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
              Check your email
            </h1>
            <p className="text-sm text-stone-500">
              We sent a password reset link to{' '}
              <span className="font-medium text-stone-900">{emailFormik.values.email}</span>.
              Click the link in the email to choose a new password.
            </p>
          </div>

          <div className="rounded-md bg-stone-50 border border-stone-200 p-4 text-xs text-stone-600 space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-medium">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Security Information</span>
            </div>
            <p>
              The reset link will expire in <strong className="text-stone-900">15 minutes</strong> for your security. Check your spam folder if it doesn't arrive shortly.
            </p>
          </div>

          {/* Resend Link & Navigation */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className="w-full cursor-pointer rounded-md border border-stone-300 bg-white py-2.5 px-4 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isResending ? (
                <span>Sending...</span>
              ) : resendTimer > 0 ? (
                <span className="font-mono text-xs">Resend Link in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
              ) : (
                <span>Resend Reset Link</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setServerError(null)
                }}
                className="text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                ← Try a different email
              </button>
              <Link
                to="/account/login"
                className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-700 transition-colors"
              >
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 (OTP Mode): OTP Verification Screen */}
      {step === 2 && recoveryMode === 'otp' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setServerError(null)
                }}
                className="inline-flex items-center text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to email
              </button>

              <span className="text-[11px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                Step 2 of 2
              </span>
            </div>

            <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
              Enter verification code
            </h1>
            <p className="text-sm text-stone-500">
              We sent a 6-digit login code to{' '}
              <span className="font-medium text-stone-900">{emailFormik.values.email}</span>
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex flex-col space-y-1">
              <span>{serverError}</span>
              {remainingAttempts !== null && remainingAttempts < 5 && (
                <span className="text-xs font-mono font-medium text-red-800">
                  Remaining attempts: {remainingAttempts} / 5
                </span>
              )}
            </div>
          )}

          {/* OTP Digit Input Grid */}
          <div className="space-y-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono text-center">
              Enter 6-Digit Code
            </label>

            <div className="flex justify-between items-center gap-2 max-w-xs mx-auto">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-13 text-center text-xl font-bold font-mono rounded-lg border border-stone-300 bg-white text-stone-900 shadow-xs focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all"
                />
              ))}
            </div>

            <p className="text-center text-xs text-stone-400">
              Code is valid for 5 minutes. Check your spam folder if not received.
            </p>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => verifyAndLogin()}
              disabled={isLoading || otpDigits.join('').length !== 6}
              className="w-full cursor-pointer rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 active:bg-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 pt-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying & Signing In...</span>
                </>
              ) : (
                <span>Verify & Sign In</span>
              )}
            </button>
          </div>

          {/* Resend Code Section */}
          <div className="pt-2 text-center text-xs text-stone-500 border-t border-stone-100">
            Didn't receive the code?{' '}
            {resendTimer > 0 ? (
              <span className="font-medium text-stone-400 font-mono">
                Resend in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-700 transition-colors cursor-pointer"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
