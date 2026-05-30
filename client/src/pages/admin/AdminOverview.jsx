import { useState, useEffect } from 'react'
import { Users, Ticket, TrendingUp, Clock } from 'lucide-react'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [usersRes, bookingsRes] = await Promise.all([
          fetch('/api/auth/users').then(r => r.json()),
          fetch('/bookings/all').then(r => r.json()),
        ])
        const totalRevenue = bookingsRes
          .filter(b => b.status === 'Confirmed')
          .reduce((sum, b) => sum + parseFloat(b.total_amount), 0)

        setStats({
          totalUsers: usersRes.length,
          totalBookings: bookingsRes.length,
          pendingBookings: bookingsRes.filter(b => b.status === 'Pending').length,
          confirmedBookings: bookingsRes.filter(b => b.status === 'Confirmed').length,
          totalRevenue,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])

  if (loading) return <p className="text-slate-400">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Overview</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <p className="text-slate-400 text-sm">Total users</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-5 h-5 text-blue-400" />
            <p className="text-slate-400 text-sm">Total bookings</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <p className="text-slate-400 text-sm">Pending bookings</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.pendingBookings}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-slate-400 text-sm">Total revenue</p>
          </div>
          <p className="text-3xl font-bold text-white">EUR {stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}