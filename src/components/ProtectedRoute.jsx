import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ requiresOrganizer, allowedRoles, children }) {
  const { isAuthenticated, isOrganizer, role, isInitialized } = useSelector((state) => state.auth)
  const location = useLocation()

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

  // 2. If unauthenticated, redirect to login page preserving the intended path
  if (!isAuthenticated) {
    return <Navigate to="/account/login" state={{ from: location }} replace />
  }

  // 3. Organizer Capability check: if route requires organizer capability
  const isUserAnOrganizer = isOrganizer || role === 'manager'
  if (requiresOrganizer && !isUserAnOrganizer) {
    return <Navigate to="/user/discover" replace />
  }

  // Legacy allowedRoles support
  if (allowedRoles && Array.isArray(allowedRoles)) {
    const managerOnly = allowedRoles.includes('manager') && !allowedRoles.includes('user')
    if (managerOnly && !isUserAnOrganizer) {
      return <Navigate to="/user/discover" replace />
    }
  }

  // 4. Authenticated & permitted: render children or Outlet
  return children ? children : <Outlet />
}

