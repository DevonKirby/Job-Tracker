import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import Layout from '../components/Layout'

const STATUSES = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']
const PIPELINE = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER']

const statusColors = {
  APPLIED: 'bg-blue-500',
  PHONE_SCREEN: 'bg-yellow-500',
  INTERVIEW: 'bg-purple-500',
  OFFER: 'bg-green-500',
  REJECTED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-400',
}

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form, setForm] = useState({
    company: '',
    role: '',
    location: '',
    url: '',
    status: 'APPLIED',
    date_applied: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    notes: '',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    api.get(`/applications/${id}`)
      .then((res) => {
        const data = res.data
        setForm({
          company: data.company,
          role: data.role,
          location: data.location ?? '',
          url: data.url ?? '',
          status: data.status,
          date_applied: data.date_applied,
          follow_up_date: data.follow_up_date ?? '',
          notes: data.notes ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      location: form.location || null,
      url: form.url || null,
      follow_up_date: form.follow_up_date || null,
      notes: form.notes || null,
    }

    try {
      if (isNew) {
        await api.post('/applications', payload)
      } else {
        await api.put(`/applications/${id}`, payload)
      }
      navigate('/applications')
    } catch {
      setError('Failed to save. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this application?')) return
    await api.delete(`/applications/${id}`)
    navigate('/applications')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">Loading...</div>
  )

  const pipelineIndex = PIPELINE.indexOf(form.status)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div className="flex justify-between items-center">
          <Link to="/applications" className="text-sm text-blue-600 hover:underline">
            ← Applications
          </Link>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>

        {/* Pipeline indicator */}
        {!isNew && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Pipeline</h2>
            <div className="flex items-center gap-2">
              {PIPELINE.map((stage, i) => (
                <div key={stage} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-full h-2 rounded-full ${
                      i <= pipelineIndex && pipelineIndex !== -1
                        ? statusColors[form.status]
                        : 'bg-gray-200'
                    }`} />
                    <span className="text-xs text-gray-400 mt-1 text-center">
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {(form.status === 'REJECTED' || form.status === 'WITHDRAWN') && (
              <p className={`text-sm mt-3 font-medium ${
                form.status === 'REJECTED' ? 'text-red-500' : 'text-gray-400'
              }`}>
                {form.status}
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-6">
            {isNew ? 'New Application' : 'Edit Application'}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company *" name="company" value={form.company} onChange={handleChange} required />
              <Field label="Role *" name="role" value={form.role} onChange={handleChange} required />
              <Field label="Location" name="location" value={form.location} onChange={handleChange} />
              <Field label="URL" name="url" value={form.url} onChange={handleChange} />
              <Field label="Date Applied *" name="date_applied" type="date" value={form.date_applied} onChange={handleChange} required />
              <Field label="Follow-up Date" name="follow_up_date" type="date" value={form.follow_up_date} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : isNew ? 'Create Application' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

function Field({ label, name, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}