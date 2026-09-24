import React, { createContext, useContext, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import AuthPromptModal from '../components/modals/AuthPromptModal'

const AuthPromptContext = createContext(null)

export function AuthPromptProvider({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const [isOpen, setIsOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    actionType: 'general',
    title: '',
    subtitle: '',
    redirectPath: null,
  })

  const openAuthPrompt = useCallback((config = {}) => {
    setModalConfig({
      actionType: config.actionType || 'general',
      title: config.title || '',
      subtitle: config.subtitle || '',
      redirectPath: config.redirectPath || null,
    })
    setIsOpen(true)
  }, [])

  const closeAuthPrompt = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Helper function to guard any interactive action
  const requireAuth = useCallback(
    (actionCallback, config = {}) => {
      if (isAuthenticated) {
        if (typeof actionCallback === 'function') {
          actionCallback()
        }
        return true
      }

      // If first argument is config object instead of callback
      const resolvedConfig = typeof actionCallback === 'function' ? config : (actionCallback || {})
      openAuthPrompt(resolvedConfig)
      return false
    },
    [isAuthenticated, openAuthPrompt]
  )

  return (
    <AuthPromptContext.Provider value={{ isOpen, openAuthPrompt, closeAuthPrompt, requireAuth, isAuthenticated }}>
      {children}
      <AuthPromptModal
        isOpen={isOpen}
        onClose={closeAuthPrompt}
        actionType={modalConfig.actionType}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        redirectPath={modalConfig.redirectPath}
      />
    </AuthPromptContext.Provider>
  )
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext)
  if (!context) {
    throw new Error('useAuthPrompt must be used within an AuthPromptProvider')
  }
  return context
}

export default AuthPromptContext
