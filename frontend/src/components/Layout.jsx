import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Job Tracker
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/applications" className="text-sm text-gray-600 hover:text-gray-900">
              Applications
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
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