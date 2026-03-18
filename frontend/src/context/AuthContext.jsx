import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = sessionStorage.getItem('token')
        if (stored) {
            setToken(stored)
            api.defaults.headers.common['Authorization'] = `Bearer ${stored}`
            api.get('/auth/me')
                .then((res) => setUser(res.data))
                .catch(() => logout())
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    async function login(email, password) {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)

    const res = await api.post('/auth/token', params)
    const accessToken = res.data.access_token

    sessionStorage.setItem('token', accessToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setToken(accessToken)

    const me = await api.get('/auth/me')
    setUser(me.data)
  }

  function logout() {
    sessionStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}