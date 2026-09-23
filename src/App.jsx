import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import API from './services/api'
import { setCredentials, setInitialized, logout } from './redux/slice/authSlice'

// Route Guards
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'

// Landing Page
import LandingPage from './pages/LandingPage'

// Auth Pages & Layout
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'

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

// User Pages & Layout
import UserLayout from './layouts/UserLayout'
import Home from './pages/UserPages/Home'
import Discover from './pages/UserPages/Discover'
import EventDetail from './pages/UserPages/EventDetail'
import MyTickets from './pages/UserPages/MyTickets'
import Saved from './pages/UserPages/Saved'
import Orders from './pages/UserPages/Orders'

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
      <Routes>
        {/* Guest-Only / Public Routes (Landing, Login, Signup) */}
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/account" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
          <Route path="/Account/*" element={<Navigate to="/account" replace />} />
        </Route>

        {/* Manager Routes (Protected - Requires Organizer Capability) */}
        <Route element={<ProtectedRoute requiresOrganizer={true} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="events" element={<MyEvents />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/:eventId" element={<EventDashboard />} />
            <Route path="events/:eventId/edit" element={<EditEvent />} />
            <Route path="tickets" element={<TicketSales />} />
            <Route path="attendees" element={<Attendees />} />
            <Route path="payouts" element={<PayoutsAndRevenue />} />
            <Route path="settings" element={<OrganizerSettings />} />
          </Route>
          <Route path="/Manager/*" element={<Navigate to="/manager" replace />} />
        </Route>

        {/* User / Attendee Routes (Protected - Accessible to ALL Authenticated Users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="discover" element={<Discover />} />
            <Route path="events/:eventId" element={<EventDetail />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="saved" element={<Saved />} />
            <Route path="orders" element={<Orders />} />
          </Route>
          <Route path="/events/:eventId" element={<UserLayout />}>
            <Route index element={<EventDetail />} />
          </Route>
          <Route path="/User/*" element={<Navigate to="/user" replace />} />
        </Route>

        {/* 404 / Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App