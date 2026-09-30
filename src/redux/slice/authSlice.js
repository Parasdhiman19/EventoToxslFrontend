import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  role: null,
  isOrganizer: false,
  isSuperAdmin: false,
  accessToken: null,
  isAuthenticated: false,
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
      const { user, accessToken } = action.payload
      if (user !== undefined && user !== null) {
        state.user = user
        state.role = user?.role || (user?.isOrganizer ? 'manager' : 'user')
        state.isOrganizer = Boolean(user?.isOrganizer || user?.is_organizer || user?.role === 'manager')
        state.isSuperAdmin = Boolean(user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin')
      }
      if (accessToken) {
        state.accessToken = accessToken
        state.isAuthenticated = true
      }
      state.isInitialized = true
      state.isLoading = false
      state.error = null
    },
    setSession: (state, action) => {
      const { user, accessToken } = action.payload
      if (user !== undefined && user !== null) {
        state.user = user
        state.role = user?.role || (user?.isOrganizer ? 'manager' : 'user')
        state.isOrganizer = Boolean(user?.isOrganizer || user?.is_organizer || user?.role === 'manager')
        state.isSuperAdmin = Boolean(user?.isSuperAdmin || user?.is_super_admin || user?.is_staff || user?.role === 'admin')
      }
      if (accessToken) {
        state.accessToken = accessToken
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

