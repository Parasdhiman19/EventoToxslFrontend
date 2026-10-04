import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import API from '../services/api'
import {
  setNotifications,
  appendNotifications,
  prependNotification,
  setUnreadCount,
  markOneRead,
  markAllRead,
  removeNotification,
  setWsStatus,
  setLoading,
  setPaginationMeta,
  clearNotifications,
} from '../redux/slice/notificationSlice'

// Helper to determine WS URL: uses VITE_WS_URL or infers from VITE_API_URL in production, or local host in dev
const getWebSocketUrl = () => {
  let wsUrl = import.meta.env.VITE_WS_URL
  if (wsUrl && typeof wsUrl === 'string') {
    wsUrl = wsUrl.trim().replace(/\/+$/, '')
    return `${wsUrl}/`
  }
  // Auto-infer from VITE_API_URL if VITE_WS_URL was not explicitly set
  let apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl && typeof apiUrl === 'string') {
    let wsBase = apiUrl
      .trim()
      .replace(/^http:/i, 'ws:')
      .replace(/^https:/i, 'wss:')
      .replace(/\/api\/?$/i, '')
      .replace(/\/+$/, '')
    return `${wsBase}/ws/notifications/`
  }
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const protocol = isSecure ? 'wss:' : 'ws:'
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
  return `${protocol}//${host}:8000/ws/notifications/`
}

export function useNotifications() {
  const dispatch = useDispatch()
  const { accessToken, isAuthenticated, user } = useSelector((state) => state.auth)
  const {
    notifications,
    unreadCount,
    wsStatus,
    isOpen,
    isLoading,
    hasMore,
    totalCount,
  } = useSelector((state) => state.notifications)

  const socketRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const maxReconnectAttempts = 5

  // Fetch paginated notifications via REST
  const fetchNotifications = useCallback(
    async ({ page = 1, unreadOnly = false, append = false } = {}) => {
      if (!isAuthenticated) return
      dispatch(setLoading(true))
      try {
        const params = new URLSearchParams()
        if (page > 1) params.append('page', page)
        if (unreadOnly) params.append('unread_only', 'true')

        const res = await API.get(`notifications/?${params.toString()}`)
        const data = res.data

        const results = data.results || []
        const hasNext = Boolean(data.next)
        const count = data.count || 0

        if (append) {
          dispatch(appendNotifications(results))
        } else {
          dispatch(setNotifications(results))
        }

        dispatch(setPaginationMeta({ hasMore: hasNext, totalCount: count }))
      } catch (err) {
        console.error('[Notifications] Failed to load notifications:', err)
        dispatch(setLoading(false))
      }
    },
    [dispatch, isAuthenticated]
  )

  // Fetch lightweight unread count via REST
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await API.get('notifications/unread-count/')
      if (typeof res.data?.unreadCount === 'number') {
        dispatch(setUnreadCount(res.data.unreadCount))
      }
    } catch {
      // Ignore background failure
    }
  }, [dispatch, isAuthenticated])

  // Mark a single notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      // Optimistic Redux update
      dispatch(markOneRead(notificationId))

      // Also send over WS if open, else REST
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'mark_read',
            notification_id: notificationId,
          })
        )
      }

      try {
        await API.post(`notifications/${notificationId}/read/`)
      } catch (err) {
        console.error('[Notifications] Failed to mark read:', err)
      }
    },
    [dispatch]
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    dispatch(markAllRead())
    try {
      await API.post('notifications/mark-all-read/')
    } catch (err) {
      console.error('[Notifications] Failed to mark all read:', err)
    }
  }, [dispatch])

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      dispatch(removeNotification(notificationId))
      try {
        await API.delete(`notifications/${notificationId}/delete/`)
      } catch (err) {
        console.error('[Notifications] Failed to delete notification:', err)
      }
    },
    [dispatch]
  )

  // WebSocket Connection Management
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !accessToken) return
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    dispatch(setWsStatus('connecting'))
    const wsUrl = getWebSocketUrl()

    try {
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0
        // Send JWT Auth payload as first message
        ws.send(
          JSON.stringify({
            type: 'auth',
            token: accessToken,
          })
        )

        // Setup ping interval every 25s
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 25000)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'connection_established') {
            dispatch(setWsStatus('connected'))
            const count = typeof data.unreadCount === 'number' ? data.unreadCount : data.unread_count
            if (typeof count === 'number') {
              dispatch(setUnreadCount(count))
            }
          } else if (data.type === 'notification.new') {
            if (data.notification) {
              dispatch(prependNotification(data.notification))
            }
            const count = typeof data.unreadCount === 'number' ? data.unreadCount : data.unread_count
            if (typeof count === 'number') {
              dispatch(setUnreadCount(count))
            }
          } else if (data.type === 'notification.read') {
            const notifId = data.notificationId || data.notification_id
            if (notifId) {
              dispatch(markOneRead(notifId))
            }
            const count = typeof data.unreadCount === 'number' ? data.unreadCount : data.unread_count
            if (typeof count === 'number') {
              dispatch(setUnreadCount(count))
            }
          }
        } catch (parseError) {
          console.error('[Notifications] WS message parse error:', parseError)
        }
      }

      ws.onerror = (error) => {
        console.warn('[Notifications] WebSocket error:', error)
      }

      ws.onclose = (event) => {
        dispatch(setWsStatus('disconnected'))
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)

        // Only reconnect if still authenticated and not closed intentionally
        if (isAuthenticated && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const backoff = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000)
          reconnectAttemptsRef.current += 1
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket()
          }, backoff)
        }
      }
    } catch (err) {
      console.error('[Notifications] Failed to initiate WebSocket:', err)
      dispatch(setWsStatus('disconnected'))
    }
  }, [accessToken, isAuthenticated, dispatch])

  // Lifecycle: Connect WS on auth change & Initial Load
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectWebSocket()
      fetchUnreadCount()
      fetchNotifications({ page: 1, unreadOnly: false })
    } else {
      // Disconnect and clear state
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      dispatch(clearNotifications())
    }

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [isAuthenticated, accessToken, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback Polling when WebSocket is disconnected
  useEffect(() => {
    if (isAuthenticated && wsStatus === 'disconnected') {
      pollingIntervalRef.current = setInterval(() => {
        fetchUnreadCount()
      }, 30000)
    } else if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [isAuthenticated, wsStatus, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    wsStatus,
    isOpen,
    isLoading,
    hasMore,
    totalCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
