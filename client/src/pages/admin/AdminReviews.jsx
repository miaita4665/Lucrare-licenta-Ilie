import { useState, useEffect } from 'react'
import { Trash2, Star, ShieldCheck, ShieldOff } from 'lucide-react'
import api from '../../services/api'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reviews')
      .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleModerate = async (id) => {
    try {
      const res = await api.patch(`/reviews/${id}/moderate`)
      setReviews(prev =>
        prev.map(r => r.id === id ? { ...r, is_moderated: res.data.is_moderated } : r)
      )
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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-slate-400 text-center">
                  No reviews yet
                </td>
              </tr>
            )}
            {reviews.map(review => (
              <tr
                key={review.id}
                className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${
                  review.is_moderated ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  {review.User?.first_name} {review.User?.last_name}
                </td>
                <td className="px-4 py-3 text-slate-400">{review.Hotel?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{review.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                  {review.comment ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {review.is_moderated ? (
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                      Moderated
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                      Visible
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleModerate(review.id)}
                      title={review.is_moderated ? 'Restore review' : 'Moderate review'}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      {review.is_moderated
                        ? <ShieldOff className="w-4 h-4" />
                        : <ShieldCheck className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      title="Delete review"
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
