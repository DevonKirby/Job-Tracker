import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useWebSocket from '../hooks/useWebSocket'
import { toast, Toaster } from 'react-hot-toast'
import api from '../api/client'

export default function Layout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/notifications').then((res) => setUnreadCount(res.data.length))
  }, [])

  useWebSocket((message) => {
    toast(message.message, { icon: '🔔' })
    setUnreadCount((prev) => prev + 1)
  })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster position="top-right" />
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-lime-500">
            Job Tracker
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-100">
              Dashboard
            </Link>
            <Link to="/applications" className="text-sm text-gray-400 hover:text-gray-100">
              Applications
            </Link>
            <div className="relative">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-lime-500 text-gray-950 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
