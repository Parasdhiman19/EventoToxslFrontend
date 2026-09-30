import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import API from './services/api'
import { setCredentials, setInitialized, logout } from './redux/slice/authSlice'

// Route Guards
import { GuestRoute, ProtectedRoute } from './routes'

// Landing Page
import LandingPage from './pages/LandingPage'

// Auth Pages & Layout
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Manager Pages & Layout
import ManagerLayout from './layouts/ManagerLayout'
import Overview from './pages/ManagerPages/OverView'
import MyEvents from './pages/ManagerPages/MyEvents'
import TicketSales from './pages/ManagerPages/TicketSales'
import Attendees from './pages/ManagerPages/Attendees'
import PayoutsAndRevenue from './pages/ManagerPages/PayoutsAndRevenue'
import OrganizerSettings from './pages/ManagerPages/OrganizerSettings'
import CreateEvent from './pages/ManagerPages/CreateEvent'
import EventDashboard from './pages/ManagerPages/EventDashboard'
import EditEvent from './pages/ManagerPages/EditEvent'
import ManagerNotifications from './pages/ManagerPages/Notifications'

// Super Admin Pages & Layout
import AdminLayout from './layouts/AdminLayout'
import {
  AdminDashboard,
  AdminEvents,
  AdminBanners,
  AdminRecommendedEvents,
  AdminUsers,
  AdminOrganizers,
  AdminTransactions,
  AdminPayouts,
  AdminAttendance,
  AdminReports,
  AdminSettings,
  AdminAuditLogs,
} from './pages/AdminPages'

// User Pages & Layout
import UserLayout from './layouts/UserLayout'
import Home from './pages/UserPages/Home'
import Discover from './pages/UserPages/Discover'
import EventDetail from './pages/UserPages/EventDetail'
import MyTickets from './pages/UserPages/MyTickets'
import Saved from './pages/UserPages/Saved'
import Orders from './pages/UserPages/Orders'
import Profile from './pages/UserPages/Profile'
import UserNotifications from './pages/UserPages/Notifications'


import ScrollToTop from './components/ScrollToTop'
import { AuthPromptProvider } from './context/AuthPromptContext'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    let isMounted = true

    const initializeAuthSession = async () => {
      try {
        // 1. Obtain a fresh access token from the secure HttpOnly refresh_token cookie
        const refreshRes = await API.post('auth/token/refresh/')
        const access = refreshRes.data.access

        // 2. Query user profile with the fresh access token
        const meRes = await API.get('auth/me/', {
          headers: { Authorization: `Bearer ${access}` },
        })

        if (isMounted) {
          dispatch(setCredentials({ user: meRes.data, accessToken: access }))
        }
      } catch {
        if (isMounted) {
          dispatch(logout())
        }
      } finally {
        if (isMounted) {
          dispatch(setInitialized(true))
        }
      }
    }

    initializeAuthSession()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthPromptProvider>
        <Routes>
          {/* Public / Open Discovery Routes (Accessible to Guests & Authenticated Users Alike) */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/about" element={<LandingPage />} />
          </Route>

          {/* Guest-Only Auth Routes (Login, Signup, Forgot Password) */}
          <Route element={<GuestRoute />}>
            <Route path="/account" element={<AuthLayout />}>
              <Route index element={<Navigate to="login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
            <Route path="/Account/*" element={<Navigate to="/account" replace />} />
          </Route>

          {/* Reset Password Route (Accessible directly via email link token) */}
          <Route path="/account" element={<AuthLayout />}>
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Super Admin Routes (Protected - Requires Super Admin Privilege) */}
          <Route element={<ProtectedRoute requiresAdmin={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="recommendations" element={<AdminRecommendedEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="organizers" element={<AdminOrganizers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="payouts" element={<AdminPayouts />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>
            <Route path="/Admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Manager Routes (Protected - Requires Organizer Capability) */}
          <Route element={<ProtectedRoute requiresOrganizer={true} />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Navigate to="/manager/overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="events" element={<MyEvents />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/:eventId" element={<EventDashboard />} />
              <Route path="events/:eventId/edit" element={<EditEvent />} />
              <Route path="tickets" element={<TicketSales />} />
              <Route path="attendees" element={<Attendees />} />
              <Route path="payouts" element={<PayoutsAndRevenue />} />
              <Route path="settings" element={<OrganizerSettings />} />
              <Route path="notifications" element={<ManagerNotifications />} />
            </Route>
            <Route path="/Manager/*" element={<Navigate to="/manager" replace />} />
          </Route>

          {/* User Protected Routes (Tickets, Saved Bookmarks, Order Invoices, Notifications) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<Navigate to="/" replace />} />
              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="discover" element={<Navigate to="/discover" replace />} />
              <Route path="events/:eventId" element={<EventDetail />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="saved" element={<Saved />} />
              <Route path="orders" element={<Orders />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<UserNotifications />} />
            </Route>
            <Route path="/User/*" element={<Navigate to="/" replace />} />
            {/* Direct convenience route aliases */}
            <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
            <Route path="/settings" element={<Navigate to="/user/profile" replace />} />
            <Route path="/tickets" element={<Navigate to="/user/tickets" replace />} />
            <Route path="/saved" element={<Navigate to="/user/saved" replace />} />
            <Route path="/orders" element={<Navigate to="/user/orders" replace />} />
            <Route path="/notifications" element={<Navigate to="/user/notifications" replace />} />
          </Route>


          {/* 404 / Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthPromptProvider>
    </BrowserRouter>
  )
}

export default App