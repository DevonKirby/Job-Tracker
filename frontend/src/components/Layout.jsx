import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-lime-500">
            Job Tracker
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-base font-medium text-lime-500'
                  : 'text-base text-gray-400 hover:text-gray-100'
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/applications"
              className={({ isActive }) =>
                isActive
                  ? 'text-base font-medium text-lime-500'
                  : 'text-base text-gray-400 hover:text-gray-100'
              }
            >
              Applications
            </NavLink>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-lime-500 text-gray-950 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-base text-gray-500 hover:text-gray-300"
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
