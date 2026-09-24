import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth)

  // 1. While auth state is initializing with the backend, show clean loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">Verifying Session...</span>
        </div>
      </div>
    )
  }

  // 2. If authenticated, redirect away from guest/auth pages to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 3. Unauthenticated user: allow access
  return children ? children : <Outlet />
}
