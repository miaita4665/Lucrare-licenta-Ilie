import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Star, BedDouble, ArrowLeft } from 'lucide-react'

const ATTRIBUTE_LABELS = {
  quiet: 'Quiet', city_center: 'City center', budget: 'Budget',
  luxury: 'Luxury', family_friendly: 'Family friendly', beachfront: 'Beachfront',
  business: 'Business', pet_friendly: 'Pet friendly', spa: 'Spa', rooftop_bar: 'Rooftop bar',
}

export default function HotelDetail() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { hotel, city } = state ?? {}

  if (!hotel) {
    navigate('/hotels')
    return null
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

        {/* Attributes */}
        {hotel.attributes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {hotel.attributes.map(attr => (
              <span key={attr} className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full">
                {ATTRIBUTE_LABELS[attr] ?? attr}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
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

        {/* Price + Book */}
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
    </div>
  )
}