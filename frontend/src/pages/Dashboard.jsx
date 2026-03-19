import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Toaster, toast } from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import useWebSocket from '../hooks/useWebSocket'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/notifications'),
    ]).then(([statsRes, notifRes]) => {
      setStats(statsRes.data)
      setNotifications(notifRes.data)
    }).finally(() => setLoading(false))
  }, [])

  useWebSocket((message) => {
    toast(message.message, { icon: '🔔' })
    setNotifications((prev) => [message, ...prev])
  })

  const statusColors = {
    APPLIED: 'bg-blue-100 text-blue-700',
    PHONE_SCREEN: 'bg-yellow-100 text-yellow-700',
    INTERVIEW: 'bg-purple-100 text-purple-700',
    OFFER: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-gray-100 text-gray-700',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">Loading...</div>
  )

  function fillWeeklyData(weeklyCounts) {
    const today = new Date()

    const dayOfWeek = today.getUTCDay() === 0 ? 6 : today.getUTCDay() - 1
    const currentWeekStart = new Date(today)
    currentWeekStart.setUTCDate(today.getUTCDate() - dayOfWeek)
    currentWeekStart.setUTCHours(0, 0, 0, 0)

    const start = new Date(currentWeekStart)
    start.setUTCDate(currentWeekStart.getUTCDate() - 7 * 7)

    const dataMap = Object.fromEntries(weeklyCounts.map(w => [w.week_start, w.count]))

    const result = []
    let current = new Date(start)
    while (current <= currentWeekStart) {
      const key = current.toISOString().split('T')[0]
      result.push({ week_start: key, count: dataMap[key] ?? 0 })
      const next = new Date(current)
      next.setUTCDate(current.getUTCDate() + 7)
      current = next
    }

    return result
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative">
              <span className="text-xl">🔔</span>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
            <Link to="/applications" className="text-sm text-blue-600 hover:underline">
              Applications
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Response Rate" value={`${stats.response_rate}%`} />
          <StatCard label="Interviews" value={
            stats.by_status.find(s => s.status === 'INTERVIEW')?.count ?? 0
          } />
          <StatCard label="Offers" value={
            stats.by_status.find(s => s.status === 'OFFER')?.count ?? 0
          } />
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Status</h2>
          <div className="flex flex-wrap gap-2">
            {stats.by_status.map((s) => (
              <span key={s.status} className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[s.status]}`}>
                {s.status.replace('_', ' ')} — {s.count}
              </span>
            ))}
          </div>
        </div>

        {/* Weekly chart */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications per Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fillWeeklyData(stats.weekly_counts)}>
              <XAxis dataKey="week_start" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </main>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}