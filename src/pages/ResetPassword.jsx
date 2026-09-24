import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import API from '../services/api'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Validate token on component load
  useEffect(() => {
    let isMounted = true

    const validateToken = async () => {
      if (!token || !email) {
        if (isMounted) {
          setIsTokenValid(false)
          setTokenError('The password reset link is invalid or incomplete. Please request a new link.')
          setIsValidating(false)
        }
        return
      }

      try {
        await API.post('auth/password-reset/validate-token/', {
          email,
          token,
        })
        if (isMounted) {
          setIsTokenValid(true)
        }
      } catch (err) {
        if (isMounted) {
          setIsTokenValid(false)
          setTokenError(
            err.response?.data?.detail ||
            'This password reset link has expired or is invalid. Please request a new link.'
          )
        }
      } finally {
        if (isMounted) {
          setIsValidating(false)
        }
      }
    }

    validateToken()

    return () => {
      isMounted = false
    }
  }, [email, token])

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must include at least one uppercase letter')
        .matches(/[0-9]/, 'Must include at least one number')
        .matches(/[^A-Za-z0-9]/, 'Must include at least one special character'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true)
      setServerError(null)

      try {
        await API.post('auth/password-reset/confirm/', {
          email,
          token,
          new_password: values.newPassword,
        })

        setIsSuccess(true)
      } catch (err) {
        setServerError(
          err.response?.data?.detail ||
          err.response?.data?.new_password?.[0] ||
          'Failed to reset password. Please try again or request a new link.'
        )
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Password strength calculation
  const strength = useMemo(() => {
    const pwd = formik.values.newPassword
    if (!pwd) return { score: 0, label: '', color: 'bg-stone-200', text: 'text-stone-400' }

    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' }
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' }
      case 3:
        return { score: 3, label: 'Good', color: 'bg-stone-700', text: 'text-stone-700' }
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-600' }
      default:
        return { score: 0, label: '', color: 'bg-stone-200', text: 'text-stone-400' }
    }
  }, [formik.values.newPassword])

  // Loading State
  if (isValidating) {
    return (
      <div className="w-full text-center py-12 space-y-4">
        <svg className="animate-spin mx-auto h-8 w-8 text-stone-900" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm text-stone-500 font-mono">Verifying security token...</p>
      </div>
    )
  }

  // Token Invalid or Expired State
  if (!isTokenValid) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl tracking-tight text-stone-900 font-medium">
            Reset Link Invalid or Expired
          </h1>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            {tokenError || 'This reset link has expired or has already been used.'}
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link
            to="/account/forgot-password"
            className="block w-full text-center rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 transition-colors"
          >
            Request a New Reset Link
          </Link>
          <Link
            to="/account/login"
            className="block w-full text-center text-xs font-medium text-stone-600 hover:text-stone-900 pt-2 transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
            Password Reset Complete
          </h1>
          <p className="text-sm text-stone-500">
            Your password has been updated successfully. You can now sign in to your Evento account with your new credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/account/login')}
          className="w-full cursor-pointer rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 active:bg-stone-950 transition-colors"
        >
          Sign In Now
        </button>
      </div>
    )
  }

  // Active Reset Password Form
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
          Set a new password
        </h1>
        <p className="text-sm text-stone-500">
          Resetting password for <span className="font-medium text-stone-900">{email}</span>. Choose a strong, unique password.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* New Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="newPassword"
              className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
            >
              New Password <span style={{ color: 'red', position: 'relative', top: '-3px' }}>*</span>
            </label>
            {formik.values.newPassword && (
              <span className={`text-[11px] font-mono font-medium ${strength.text}`}>
                {strength.label}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => {
                setServerError(null)
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              value={formik.values.newPassword}
              className={`w-full rounded-md border bg-white pl-3.5 pr-11 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                formik.touched.newPassword && formik.errors.newPassword
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.375l1.091 1.091a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                  <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {formik.values.newPassword && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    strength.score >= level ? strength.color : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          )}

          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
          >
            Confirm Password <span style={{ color: 'red', position: 'relative', top: '-3px' }}>*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => {
                setServerError(null)
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className={`w-full rounded-md border bg-white pl-3.5 pr-11 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.375l1.091 1.091a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                  <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 active:bg-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 pt-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
