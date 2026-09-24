import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Universal ScrollToTop component for React Router.
 * Automatically scrolls the browser window to the top (0, 0)
 * whenever the route pathname or search parameters change.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Reset window scroll position immediately upon route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [pathname])

  return null
}
