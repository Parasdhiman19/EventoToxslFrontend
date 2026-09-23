  import axios from 'axios'
  import { store } from '../redux/store/store'
  import { setCredentials, logout } from '../redux/slice/authSlice'

  // Dynamically resolve API URL to match the browser's current host (localhost vs 127.0.0.1)
  // This ensures requests remain Same-Site, allowing SameSite=Lax HttpOnly cookies to pass seamlessly.
  const getApiBaseUrl = () => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
    return `http://${host}:8000/api/`
  }

  const API_BASE_URL = getApiBaseUrl()

  const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Automatically sends and receives HttpOnly refresh_token cookie
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request Interceptor: Attach JWT Access Token from Redux state
  API.interceptors.request.use(
    (config) => {
      try { 
        const state = store.getState()
        const token = state.auth?.accessToken
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // In case store is not yet initialized
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response Interceptor: Handle 401 errors & perform silent token refresh exclusively via HttpOnly cookie
  let isRefreshing = false
  let failedQueue = []

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  API.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      const isAuthEndpoint =
        originalRequest?.url?.includes('auth/login/') ||
        originalRequest?.url?.includes('auth/signup/') ||
        originalRequest?.url?.includes('auth/token/refresh/')

      // If 401 Unauthorized, not already retrying, and not an auth endpoint
      if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // Queue concurrent requests while token refresh is in flight
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return API(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Request new access token - browser automatically sends HttpOnly refresh_token cookie
          const res = await axios.post(
            `${API_BASE_URL}auth/token/refresh/`,
            {},
            { withCredentials: true }
          )

          const newAccessToken = res.data.access

          // Update Redux state with new access token
          const currentUser = store.getState().auth?.user
          store.dispatch(setCredentials({ 
            user: currentUser, 
            accessToken: newAccessToken
          }))

          processQueue(null, newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          return API(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)

          // Clear authentication state on refresh failure
          store.dispatch(logout())

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    }
  )

  export default API

