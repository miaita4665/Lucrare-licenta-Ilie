import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const [tab, setTab] = useState('flights')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(tab === 'flights' ? '/flights' : '/hotels')
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Your next trip,<br />
            <span className="text-sky-400">simplified.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Search flights and hotels, book your trip, and manage everything in one place.
          </p>
        </div>

        {/* Search card */}
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6">

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['flights', 'hotels'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition capitalize ${
                  tab === t
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'flights' ? '✈ Flights' : '🏨 Hotels'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            {tab === 'flights' ? (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="From (e.g. OTP)"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  placeholder="To (e.g. LHR)"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="date"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  placeholder="Passengers"
                  min="1"
                  defaultValue="1"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Destination (e.g. Paris)"
                  className="col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="date"
                  placeholder="Check-in"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
                <input
                  type="date"
                  placeholder="Check-out"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Search {tab === 'flights' ? 'Flights' : 'Hotels'}
            </button>
          </form>
        </div>
      </div>

      {/* Featured destinations */}
      <div className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Popular destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { city: 'Paris', country: 'France', emoji: '🗼' },
            { city: 'Tokyo', country: 'Japan', emoji: '⛩️' },
            { city: 'New York', country: 'USA', emoji: '🗽' },
            { city: 'Bucharest', country: 'Romania', emoji: '🏛️' },
          ].map(({ city, country, emoji }) => (
            <div
              key={city}
              onClick={() => navigate('/hotels')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-sky-500/50 hover:bg-slate-800 transition group"
            >
              <div className="text-4xl mb-3">{emoji}</div>
              <div className="font-semibold group-hover:text-sky-400 transition">{city}</div>
              <div className="text-slate-500 text-sm">{country}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
