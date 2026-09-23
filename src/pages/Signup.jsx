import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import API from '../services/api'
import { setCredentials } from '../redux/slice/authSlice'

function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      role: 'user',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      role: Yup.string()
        .oneOf(['user', 'manager'], 'Please select a valid role')
        .required('Account role is required'),
      fullName: Yup.string()
        .trim()
        .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters')
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must include at least one uppercase letter')
        .matches(/[0-9]/, 'Must include at least one number')
        .matches(/[^A-Za-z0-9]/, 'Must include at least one special character'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true)
      setServerError(null)

      try {
        const response = await API.post('auth/signup/', {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: values.role,
        })

        const { user, access } = response.data

        // Store user and access token in in-memory Redux state
        dispatch(setCredentials({ user, accessToken: access }))

        // Redirection: if initial choice was host, enter manager studio, else explore
        if (user?.isOrganizer || user?.role === 'manager') {
          navigate('/manager/overview')
        } else {
          navigate('/user/home')
        }
      } catch (err) {
        const message =
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          'Failed to create account. Please check your information.'
        setServerError(message)
      } finally {
        setIsLoading(false)
      }
    },
  })

  // Password strength calculation
  const strength = useMemo(() => {
    const pwd = formik.values.password
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
  }, [formik.values.password])

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
          Create an account
        </h1>
        <p className="text-sm text-stone-500">
          Join Evento to discover events or host your own stage.
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
        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-md border border-stone-200/80">
            <button
              type="button"
              onClick={() => formik.setFieldValue('role', 'user')}
              className={`py-2 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                formik.values.role === 'user'
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Explore & Buy Tickets
            </button>

            <button
              type="button"
              onClick={() => formik.setFieldValue('role', 'manager')}
              className={`py-2 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                formik.values.role === 'manager'
                  ? 'bg-stone-900 text-stone-50 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Host & Sell Tickets
            </button>
          </div>
        </div>

        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
          >
            Full Name <span style={{ color: 'red', position: 'relative', top: '-3px' }}>*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            onChange={(e) => {
              setServerError(null)
              formik.handleChange(e)
            }}
            onBlur={formik.handleBlur}
            value={formik.values.fullName}
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
              formik.touched.fullName && formik.errors.fullName
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
            }`}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.fullName}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
          >
            Email Address <span style={{ color: 'red', position: 'relative', top: '-3px' }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="organizer@evento.com"
            onChange={(e) => {
              setServerError(null)
              formik.handleChange(e)
            }}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
              formik.touched.email && formik.errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
            >
              Password <span style={{ color: 'red', position: 'relative', top: '-3px' }}>*</span>
            </label>
            {formik.values.password && (
              <span className={`text-[11px] font-mono font-medium ${strength.text}`}>
                {strength.label}
              </span>
            )}
          </div>
          
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => {
                setServerError(null)
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full rounded-md border bg-white pl-3.5 pr-11 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
                formik.touched.password && formik.errors.password
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

          {/* Clean Underline Strength Indicator */}
          {formik.values.password && (
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

          {formik.touched.password && formik.errors.password && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.password}</p>
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
          disabled={isLoading}
          className="w-full cursor-pointer rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 active:bg-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 pt-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-2 text-center text-xs text-stone-500">
        Already have an account?{' '}
        <Link
          to="/account/login"
          className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

export default Signup