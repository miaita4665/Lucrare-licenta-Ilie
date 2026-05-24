import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Plane, Hotel } from 'lucide-react'

export default function Confirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { bookingId, total, currency = "EUR", flight, hotel, passenger } = state ?? {}

  if (!bookingId) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      <div className="flex flex-col items-center text-center mb-10">
        <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
        <h1 className="text-3xl font-bold text-white">Booking confirmed!</h1>
        <p className="text-slate-400 mt-2">Booking #{bookingId}</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 text-white flex flex-col gap-4">
        {flight && (
          <div className="flex items-start gap-3">
            <Plane className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{flight.airline}</p>
              <p className="text-slate-400">{flight.fromCity ?? flight.from} → {flight.toCity ?? flight.to}</p>
              <p className="text-slate-400 text-sm">
                {new Date(flight.departure).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {new Date(flight.arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

        {hotel && (
          <div className="flex items-start gap-3">
            <Hotel className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{hotel.name}</p>
              <p className="text-slate-400">{hotel.location}</p>
              <p className="text-slate-400 text-sm">{hotel.currency} {hotel.base_price}/night</p>
            </div>
          </div>
        )}

        {passenger && (
          <div className="border-t border-slate-700 pt-4">
            <p className="text-slate-400 text-sm">Passenger</p>
            <p>{passenger.firstName} {passenger.lastName}</p>
            <p className="text-slate-400 text-sm">{passenger.email}</p>
          </div>
        )}

        <div className="border-t border-slate-700 pt-4 flex justify-between font-bold">
          <span>Total paid</span>
          <span className="text-green-400">{currency} {parseFloat(total).toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
      >
        Go to dashboard
      </button>
    </div>
  )
}