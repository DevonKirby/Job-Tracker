import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Layout from '../components/Layout'

const STATUSES = ['ALL', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']

const statusColors = {
  APPLIED: 'bg-blue-900/50 text-blue-400',
  PHONE_SCREEN: 'bg-yellow-900/50 text-yellow-400',
  INTERVIEW: 'bg-purple-900/50 text-purple-400',
  OFFER: 'bg-lime-900/50 text-lime-500',
  REJECTED: 'bg-red-900/50 text-red-400',
  WITHDRAWN: 'bg-gray-800 text-gray-500',
}

export default function Applications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('date_applied')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications')
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = applications
    .filter((a) => filter === 'ALL' || a.status === filter)
    .sort((a, b) => {
      if (sortBy === 'date_applied') return new Date(b.date_applied) - new Date(a.date_applied)
      if (sortBy === 'company') return a.company.localeCompare(b.company)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/applications/new')}
            className="bg-lime-500 text-gray-950 text-sm px-4 py-2 rounded-lg hover:bg-lime-400 font-bold"
          >
            + Add Application
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  filter === s
                    ? 'bg-lime-500 text-gray-950 border-lime-500'
                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-lime-500 hover:text-lime-500'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            <option value="date_applied">Sort: Date Applied</option>
            <option value="company">Sort: Company</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 py-16">No applications found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="block bg-gray-900 rounded-2xl border border-gray-700 p-5 hover:border-lime-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-100">{app.company}</p>
                    <p className="text-sm text-gray-400">{app.role}</p>
                    {app.location && (
                      <p className="text-sm text-gray-500">{app.location}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{app.date_applied}</span>
                    {app.follow_up_date && (
                      <span className="text-xs text-lime-500">Follow-up: {app.follow_up_date}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
