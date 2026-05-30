import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', discount_percent: '', valid_until: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/promo-codes')
      .then(r => r.json())
      .then(data => { setCodes(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.code || !form.discount_percent) return
    setCreating(true)
    try {
      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setCodes(prev => [data, ...prev])
      setForm({ code: '', discount_percent: '', valid_until: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' })
      setCodes(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Promo Codes</h1>

      {/* Create form */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <p className="text-white font-bold mb-4">Create new code</p>
        <div className="flex gap-3 flex-wrap">
          <input
            placeholder="Code (e.g. SUMMER20)"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none"
          />
          <input
            type="number"
            placeholder="Discount %"
            value={form.discount_percent}
            onChange={e => setForm({ ...form, discount_percent: e.target.value })}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none w-32"
          />
          <input
            type="date"
            value={form.valid_until}
            onChange={e => setForm({ ...form, valid_until: e.target.value })}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {/* Codes table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Valid until</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-slate-400 text-center">No promo codes yet</td></tr>
            )}
            {codes.map(code => (
              <tr key={code.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 font-bold text-blue-400">{code.code}</td>
                <td className="px-4 py-3">{code.discount_percent}%</td>
                <td className="px-4 py-3 text-slate-400">
                  {code.valid_until ? new Date(code.valid_until).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(code.id)} className="text-red-400 hover:text-red-300 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}