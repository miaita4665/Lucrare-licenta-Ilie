import { useState, useEffect } from 'react'
import { Plane, Hotel } from 'lucide-react'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled', 'Completed']

const statusColor = (status) => {
  if (status === 'Confirmed') return 'text-green-400'
  if (status === 'Cancelled') return 'text-red-400'
  if (status === 'Completed') return 'text-blue-400'
  return 'text-yellow-400'
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/bookings/all')
      .then(r => r.json())
      .then(data => { setBookings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleStatusChange = async (bookingId, status) => {
    try {
      await fetch(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Bookings</h1>
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Passenger</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => {
              const flight = booking.items.find(i => i.item_type === 'Flight')?.flight
              const hotel = booking.items.find(i => i.item_type === 'Hotel')?.hotel
              const traveler = booking.travelers?.[0]
              const segment = flight?.segments?.[0]
              return (
                <tr key={booking.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-400">#{booking.id}</td>
                  <td className="px-4 py-3">
                    {traveler ? `${traveler.first_name} ${traveler.last_name}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {flight && segment && (
                        <span className="flex items-center gap-1 text-xs">
                          <Plane className="w-3 h-3 text-blue-400" />
                          {segment.origin_code} → {segment.destination_code}
                        </span>
                      )}
                      {hotel && (
                        <span className="flex items-center gap-1 text-xs">
                          <Hotel className="w-3 h-3 text-blue-400" />
                          {hotel.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-blue-400 font-bold">
                    {booking.currency} {parseFloat(booking.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={booking.status}
                      onChange={e => handleStatusChange(booking.id, e.target.value)}
                      className={`bg-slate-700 text-xs px-2 py-1 rounded-lg outline-none ${statusColor(booking.status)}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}