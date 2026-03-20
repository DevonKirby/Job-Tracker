import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/client'
import Layout from '../components/Layout'

const statusColors = {
  APPLIED: 'bg-blue-900/50 text-blue-400',
  PHONE_SCREEN: 'bg-yellow-900/50 text-yellow-400',
  INTERVIEW: 'bg-purple-900/50 text-purple-400',
  OFFER: 'bg-lime-900/50 text-lime-500',
  REJECTED: 'bg-red-900/50 text-red-400',
  WITHDRAWN: 'bg-gray-800 text-gray-500',
}

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

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentApplication, setRecentApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/applications'),
    ]).then(([statsRes, appsRes]) => {
      setStats(statsRes.data)
      const sorted = appsRes.data.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied))
      setRecentApplication(sorted[0] ?? null)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

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
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">By Status</h2>
          <div className="flex flex-wrap gap-2">
            {stats.by_status.map((s) => (
              <span key={s.status} className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[s.status]}`}>
                {s.status.replace('_', ' ')} — {s.count}
              </span>
            ))}
          </div>
        </div>

        {/* Most recent application */}
        {recentApplication && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Most Recent Application</h2>
            <Link
              to={`/applications/${recentApplication.id}`}
              className="flex items-start justify-between gap-4 hover:opacity-80 transition-opacity"
            >
              <div>
                <p className="font-semibold text-gray-100">{recentApplication.company}</p>
                <p className="text-sm text-gray-400">{recentApplication.role}</p>
                {recentApplication.location && (
                  <p className="text-sm text-gray-500">{recentApplication.location}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[recentApplication.status]}`}>
                  {recentApplication.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">{recentApplication.date_applied}</span>
                {recentApplication.follow_up_date && (
                  <span className="text-xs text-lime-500">Follow-up: {recentApplication.follow_up_date}</span>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Weekly chart */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Applications per Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fillWeeklyData(stats.weekly_counts)}>
              <XAxis dataKey="week_start" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#84cc16' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" fill="#84cc16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </Layout>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-lime-500 mt-1">{value}</p>
    </div>
  )
}
