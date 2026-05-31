import { useLocation, useNavigate } from 'react-router-dom'
import { Plane, Clock, ArrowLeft } from 'lucide-react'

export default function FlightDetail() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { flight } = state ?? {}

  if (!flight) {
    navigate('/flights')
    return null
  }

  const duration = () => {
    const diff = new Date(flight.arrival) - new Date(flight.departure)
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
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
        <div className="flex items-center gap-3 mb-6">
          <Plane className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold">{flight.airline}</h1>
          {flight._score > 0 && (
            <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded-full">Recommended</span>
          )}
        </div>

        {/* Route */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold">{flight.fromCity ?? flight.from}</p>
            <p className="text-slate-400 text-sm mt-1">{flight.from}</p>
            <p className="text-white font-bold mt-2">
              {new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-slate-400 text-xs">
              {new Date(flight.departure).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center px-6">
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              {duration()}
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 border-t border-dashed border-slate-600" />
              <Plane className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex-1 border-t border-dashed border-slate-600" />
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            </div>
            <p className="text-slate-400 text-xs mt-1">Direct</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold">{flight.toCity ?? flight.to}</p>
            <p className="text-slate-400 text-sm mt-1">{flight.to}</p>
            <p className="text-white font-bold mt-2">
              {new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-slate-400 text-xs">
              {new Date(flight.arrival).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Date</p>
            <p className="font-bold">{new Date(flight.departure).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Class</p>
            <p className="font-bold">Economy</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Baggage</p>
            <p className="font-bold">1x 23kg</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Airline</p>
            <p className="font-bold">{flight.airline}</p>
          </div>
        </div>

        {/* Price + Book */}
        <div className="flex justify-between items-center border-t border-slate-700 pt-6">
          <div>
            <p className="text-slate-400 text-sm">Price per person</p>
            <p className="text-3xl font-bold text-blue-400">${flight.price}</p>
          </div>
          <button
            onClick={() => navigate('/booking', { state: { flight } })}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition"
          >
            Book now
          </button>
        </div>
      </div>
    </div>
  )
}