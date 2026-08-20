import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      console.log(values)
    },
  })

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl tracking-tight text-stone-900 font-medium">
          Sign in to Evento
        </h1>
        <p className="text-sm text-stone-500">
          Manage your events or access your purchased tickets.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="email" 
            className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="organizer@evento.com"
            onChange={formik.handleChange}
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

        {/* Password Field with Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="password" 
              className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono"
            >
              Password
            </label>
            <Link 
              to="/Account/forgot-password" 
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={formik.handleChange}
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
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none"
            >
              {showPassword ? (
                /* Eye Off Icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.375l1.091 1.091a4 4 0 0 0-5.557-5.557Z"
                    clipRule="evenodd"
                  />
                  <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                </svg>
              ) : (
                /* Eye Icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path
                    fillRule="evenodd"
                    d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {formik.touched.password && formik.errors.password && (
            <p className="text-xs text-red-600 tracking-tight">{formik.errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full cursor-pointer rounded-md bg-stone-900 py-2.5 px-4 text-sm font-medium text-stone-50 hover:bg-stone-800 active:bg-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="pt-2 text-center text-xs text-stone-500">
        Don&apos;t have an account?{' '}
        <Link 
          to="/Account/signup" 
          className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-700 transition-colors"
        >
          Create one now
        </Link>
      </div>
    </div>
  )
}

export default Login