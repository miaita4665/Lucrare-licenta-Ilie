import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Plane, Hotel, Clock, CheckCircle, XCircle } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/bookings/my")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setBookings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const flightBookings = bookings.filter(b => b.items.some(i => i.item_type === "Flight"))
  const hotelBookings = bookings.filter(b => b.items.some(i => i.item_type === "Hotel"))

  const statusIcon = (status) => {
    if (status === "Confirmed") return <CheckCircle className="w-4 h-4 text-green-400" />
    if (status === "Cancelled") return <XCircle className="w-4 h-4 text-red-400" />
    return <Clock className="w-4 h-4 text-yellow-400" />
  }

  const statusColor = (status) => {
    if (status === "Confirmed") return "text-green-400"
    if (status === "Cancelled") return "text-red-400"
    return "text-yellow-400"
  }

  const FlightCard = ({ booking }) => {
    const flight = booking.items.find(i => i.item_type === "Flight")?.flight
    const traveler = booking.travelers?.[0]
    const segment = flight?.segments?.[0]

    return (
      <div className="bg-slate-800 rounded-xl p-4 text-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-slate-400 text-xs">Booking #{booking.id}</p>
            <p className="text-slate-400 text-xs">{new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1">
            {statusIcon(booking.status)}
            <span className={`text-xs font-bold ${statusColor(booking.status)}`}>{booking.status}</span>
          </div>
        </div>

        {flight && (
          <div className="mb-3">
            <p className="font-bold text-lg">{flight.airline_code}</p>
            {segment && (
              <>
                <p className="text-white font-bold">
                  {segment.origin_code} → {segment.destination_code}
                </p>
                <p className="text-slate-400 text-sm">
                  {new Date(segment.departure_time).toLocaleString([], {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </>
            )}
          </div>
        )}

        {traveler && (
          <p className="text-slate-400 text-xs">
            {traveler.first_name} {traveler.last_name} · {traveler.document_number}
          </p>
        )}

        <p className="text-blue-400 font-bold mt-2">
          {booking.currency} {parseFloat(booking.total_amount).toFixed(2)}
        </p>
      </div>
    )
  }

  const HotelCard = ({ booking }) => {
    const hotel = booking.items.find(i => i.item_type === "Hotel")?.hotel
    const traveler = booking.travelers?.[0]

    return (
      <div className="bg-slate-800 rounded-xl p-4 text-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-slate-400 text-xs">Booking #{booking.id}</p>
            <p className="text-slate-400 text-xs">{new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1">
            {statusIcon(booking.status)}
            <span className={`text-xs font-bold ${statusColor(booking.status)}`}>{booking.status}</span>
          </div>
        </div>

        {hotel && (
          <div className="mb-3">
            <p className="font-bold text-lg">{hotel.name}</p>
            <p className="text-slate-400 text-sm">{hotel.location}</p>
            <p className="text-slate-400 text-sm">{hotel.currency} {hotel.base_price}/night</p>
          </div>
        )}

        {traveler && (
          <p className="text-slate-400 text-xs">
            {traveler.first_name} {traveler.last_name} · {traveler.document_number}
          </p>
        )}

        <p className="text-blue-400 font-bold mt-2">
          {booking.currency} {parseFloat(booking.total_amount).toFixed(2)}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.first_name} 👋
        </h1>
        <p className="text-slate-400 mt-1">{user?.email}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => navigate("/flights")}
          className="bg-slate-800 hover:bg-slate-700 transition p-5 rounded-xl text-left"
        >
          <Plane className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-white font-bold">Search flights</p>
          <p className="text-slate-400 text-sm mt-1">Find and book your next flight</p>
        </button>
        <button
          onClick={() => navigate("/hotels")}
          className="bg-slate-800 hover:bg-slate-700 transition p-5 rounded-xl text-left"
        >
          <Hotel className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-white font-bold">Search hotels</p>
          <p className="text-slate-400 text-sm mt-1">Browse hotels worldwide</p>
        </button>
      </div>

      {loading && <p className="text-slate-400">Loading bookings...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* Two column bookings */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-8">

          {/* Flights column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Flights</h2>
              <span className="text-slate-400 text-sm">({flightBookings.length})</span>
            </div>
            {flightBookings.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm">No flight bookings yet</p>
                <button
                  onClick={() => navigate("/flights")}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Search flights
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flightBookings.map(b => <FlightCard key={b.id} booking={b} />)}
              </div>
            )}
          </div>

          {/* Hotels column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Hotels</h2>
              <span className="text-slate-400 text-sm">({hotelBookings.length})</span>
            </div>
            {hotelBookings.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm">No hotel bookings yet</p>
                <button
                  onClick={() => navigate("/hotels")}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Search hotels
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {hotelBookings.map(b => <HotelCard key={b.id} booking={b} />)}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}