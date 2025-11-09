import React, { createContext, useState, useContext, useEffect } from 'react'
import AuthService from '../services/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = AuthService.getCurrentUser()
        if (userData) {
          // Verify token with backend
          const isValid = await AuthService.verifyToken()
          if (isValid) {
            setUser(userData)
          } else {
            AuthService.logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        AuthService.logout()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const userData = await AuthService.login(username, password)
      setUser(userData)
      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      const newUser = await AuthService.signup(userData)
      setUser(newUser)
      return { success: true, data: newUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}