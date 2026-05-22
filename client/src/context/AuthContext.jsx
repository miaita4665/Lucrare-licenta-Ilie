import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setUser(res.data.user)
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  const isAdmin = user?.Role?.role_name === 'Admin'
  const isAgent = user?.Role?.role_name === 'Support Agent'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin,
      isAgent,
      isAuthenticated,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
