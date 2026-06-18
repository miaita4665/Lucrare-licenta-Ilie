import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Star, BedDouble, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ATTRIBUTE_LABELS = {
  quiet: 'Quiet', city_center: 'City center', budget: 'Budget',
  luxury: 'Luxury', family_friendly: 'Family friendly', beachfront: 'Beachfront',
  business: 'Business', pet_friendly: 'Pet friendly', spa: 'Spa', rooftop_bar: 'Rooftop bar',
}

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            className={`w-6 h-6 transition ${
              n <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function HotelDetail() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { hotel, city } = state ?? {}

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (!hotel?.name) return
    api
      .get(`/reviews/hotel?name=${encodeURIComponent(hotel.name)}`)
      .then(res => setReviews(res.data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [hotel?.name])

  if (!hotel) {
    navigate('/hotels')
    return null
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!rating) { setSubmitError('Please select a rating.'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await api.post('/reviews', { hotel_name: hotel.name, rating, comment })
      setReviews(prev => [res.data, ...prev])
      setRating(0)
      setComment('')
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err.response?.data?.error ?? 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="bg-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <BedDouble className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold">{hotel.name}</h1>
          </div>
          {hotel._score > 0 && (
            <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded-full">Recommended</span>
          )}
        </div>

        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <p className="text-slate-400">{hotel.location}</p>
        </div>

        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < hotel.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
          ))}
          <span className="text-slate-400 text-sm ml-1">{hotel.stars} star hotel</span>
        </div>

        {hotel.attributes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {hotel.attributes.map(attr => (
              <span key={attr} className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full">
                {ATTRIBUTE_LABELS[attr] ?? attr}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Location</p>
            <p className="font-bold">{hotel.location}</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Stars</p>
            <p className="font-bold">{hotel.stars} stars</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Price per night</p>
            <p className="font-bold">{hotel.currency} {hotel.base_price}</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Description</p>
            <p className="font-bold">{hotel.description ?? 'A great place to stay'}</p>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-slate-700 pt-6">
          <div>
            <p className="text-slate-400 text-sm">Price per night</p>
            <p className="text-3xl font-bold text-blue-400">{hotel.currency} {hotel.base_price}</p>
          </div>
          <button
            onClick={() => navigate('/booking', { state: { hotel, city } })}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition"
          >
            Book now
          </button>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white mb-6">Guest Reviews</h2>

        {reviewsLoading ? (
          <p className="text-slate-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-slate-400 mb-6">No reviews yet for this hotel.</p>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {reviews.map(r => (
              <div key={r.id} className="bg-slate-800 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {r.User?.first_name} {r.User?.last_name}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-slate-300 text-sm">{r.comment}</p>}
                <p className="text-slate-500 text-xs mt-2">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {isAuthenticated ? (
          <div className="bg-slate-800 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Leave a Review</h3>
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Rating</label>
                <StarSelector value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full bg-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
              {submitSuccess && <p className="text-green-400 text-sm">Review submitted successfully!</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">
            <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline">Log in</button> to leave a review.
          </p>
        )}
      </div>
    </div>
  )
}
