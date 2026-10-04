import { createSlice } from '@reduxjs/toolkit'

const getStoredUser = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('evento_user') : null
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const getStoredAccessToken = () => {
  try {
    return typeof window !== 'undefined' ? (localStorage.getItem('evento_access_token') || null) : null
  } catch {
    return null
  }
}

const initialUser = getStoredUser()
const initialAccessToken = getStoredAccessToken()

const initialState = {
  user: initialUser,
  role: initialUser?.role || (initialUser?.isOrganizer ? 'manager' : (initialUser ? 'user' : null)),
  isOrganizer: Boolean(initialUser?.isOrganizer || initialUser?.is_organizer || initialUser?.role === 'manager'),
  isSuperAdmin: Boolean(initialUser?.isSuperAdmin || initialUser?.is_super_admin || initialUser?.is_staff || initialUser?.role === 'admin'),
  accessToken: initialAccessToken,
  isAuthenticated: Boolean(initialAccessToken && initialUser),
  isInitialized: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload || {}
      if (user !== undefined && user !== null) {
        state.user = user
        state.role = user?.role || (user?.isOrganizer ? 'manager' : 'user')
        state.isOrganizer = Boolean(user?.isOrganizer || user?.is_organizer || user?.role === 'manager')
        state.isSuperAdmin = Boolean(user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin')
        try {
          localStorage.setItem('evento_user', JSON.stringify(user))
        } catch {}
      }
      if (accessToken) {
        state.accessToken = accessToken
        state.isAuthenticated = true
        try {
          localStorage.setItem('evento_access_token', accessToken)
        } catch {}
      }
      if (refreshToken) {
        try {
          localStorage.setItem('evento_refresh_token', refreshToken)
        } catch {}
      }
      state.isInitialized = true
      state.isLoading = false
      state.error = null
    },
    setSession: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload || {}
      if (user !== undefined && user !== null) {
        state.user = user
        state.role = user?.role || (user?.isOrganizer ? 'manager' : 'user')
        state.isOrganizer = Boolean(user?.isOrganizer || user?.is_organizer || user?.role === 'manager')
        state.isSuperAdmin = Boolean(user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin')
        try {
          localStorage.setItem('evento_user', JSON.stringify(user))
        } catch {}
      }
      if (accessToken) {
        state.accessToken = accessToken
        try {
          localStorage.setItem('evento_access_token', accessToken)
        } catch {}
      }
      if (refreshToken) {
        try {
          localStorage.setItem('evento_refresh_token', refreshToken)
        } catch {}
      }
      state.isAuthenticated = Boolean(state.accessToken || accessToken)
      state.isInitialized = true
      state.isLoading = false
      state.error = null
    },
    updateUser: (state, action) => {
      const updatedUser = action.payload
      state.user = { ...state.user, ...updatedUser }
      state.role = updatedUser?.role || state.role || 'user'
      state.isOrganizer = Boolean(updatedUser?.isOrganizer !== undefined ? updatedUser.isOrganizer : state.isOrganizer)
      state.isSuperAdmin = Boolean(updatedUser?.isSuperAdmin !== undefined ? updatedUser.isSuperAdmin : state.isSuperAdmin)
      try {
        localStorage.setItem('evento_user', JSON.stringify(state.user))
      } catch {}
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload !== undefined ? action.payload : true
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.role = null
      state.isOrganizer = false
      state.isSuperAdmin = false
      state.accessToken = null
      state.isAuthenticated = false
      state.isInitialized = true
      state.isLoading = false
      state.error = null
      try {
        localStorage.removeItem('evento_user')
        localStorage.removeItem('evento_access_token')
        localStorage.removeItem('evento_refresh_token')
      } catch {}
    },
  },
})

export const {
  setLoading,
  setError,
  clearError,
  setCredentials,
  setSession,
  updateUser,
  setInitialized,
  logout,
} = authSlice.actions

export default authSlice.reducer

