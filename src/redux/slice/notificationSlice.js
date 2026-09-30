import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  wsStatus: 'idle', // 'idle' | 'connecting' | 'connected' | 'disconnected'
  isOpen: false,
  isLoading: false,
  hasMore: false,
  totalCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload || []
      state.isLoading = false
    },
    appendNotifications: (state, action) => {
      const existingIds = new Set(state.notifications.map((n) => n.id))
      const newItems = (action.payload || []).filter((n) => !existingIds.has(n.id))
      state.notifications = [...state.notifications, ...newItems]
      state.isLoading = false
    },
    prependNotification: (state, action) => {
      const notif = action.payload
      if (!notif || !notif.id) return
      // Prevent duplicates
      const existsIndex = state.notifications.findIndex((n) => n.id === notif.id)
      if (existsIndex >= 0) {
        state.notifications[existsIndex] = notif
      } else {
        state.notifications.unshift(notif)
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, action.payload ?? 0)
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1)
    },
    markOneRead: (state, action) => {
      const id = action.payload
      const item = state.notifications.find((n) => n.id === id)
      if (item && !item.isRead) {
        item.isRead = true
        item.readAt = new Date().toISOString()
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true
        n.readAt = n.readAt || new Date().toISOString()
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action) => {
      const id = action.payload
      const item = state.notifications.find((n) => n.id === id)
      if (item && !item.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter((n) => n.id !== id)
      state.totalCount = Math.max(0, state.totalCount - 1)
    },
    setWsStatus: (state, action) => {
      state.wsStatus = action.payload
    },
    toggleDropdown: (state) => {
      state.isOpen = !state.isOpen
    },
    setDropdownOpen: (state, action) => {
      state.isOpen = Boolean(action.payload)
    },
    setPaginationMeta: (state, action) => {
      state.hasMore = Boolean(action.payload?.hasMore)
      state.totalCount = action.payload?.totalCount ?? state.totalCount
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
      state.wsStatus = 'idle'
      state.isOpen = false
      state.isLoading = false
      state.hasMore = false
      state.totalCount = 0
    },
  },
})

export const {
  setLoading,
  setNotifications,
  appendNotifications,
  prependNotification,
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  markOneRead,
  markAllRead,
  removeNotification,
  setWsStatus,
  toggleDropdown,
  setDropdownOpen,
  setPaginationMeta,
  clearNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer
