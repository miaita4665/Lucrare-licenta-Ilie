import { useState, useEffect } from 'react'
import { Trash2, Star } from 'lucide-react'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(data => { setReviews(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Reviews</h1>
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Hotel</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-slate-400 text-center">No reviews yet</td></tr>
            )}
            {reviews.map(review => (
              <tr key={review.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3">{review.User?.first_name} {review.User?.last_name}</td>
                <td className="px-4 py-3 text-slate-400">{review.Hotel?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{review.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{review.comment ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(review.id)} className="text-red-400 hover:text-red-300 transition">
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