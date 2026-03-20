import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Layout from '../components/Layout'

const STATUSES = ['ALL', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']

const statusColors = {
  APPLIED: 'bg-blue-100 text-blue-700',
  PHONE_SCREEN: 'bg-yellow-100 text-yellow-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
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
    <div className="flex items-center justify-center h-screen">Loading...</div>
  )

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/applications/new')}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Application
          </button>
        </div>

        {/* Filters and sort */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filter === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date_applied">Sort: Date Applied</option>
            <option value="company">Sort: Company</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {/* Applications list */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">No applications found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="block bg-white rounded-2xl shadow p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{app.company}</p>
                    <p className="text-sm text-gray-500">{app.role}</p>
                    {app.location && (
                      <p className="text-sm text-gray-400">{app.location}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{app.date_applied}</span>
                    {app.follow_up_date && (
                      <span className="text-xs text-orange-500">Follow-up: {app.follow_up_date}</span>
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