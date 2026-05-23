import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Star, BedDouble } from "lucide-react"

const ATTRIBUTE_LABELS = {
  quiet: "Quiet",
  city_center: "City center",
  budget: "Budget",
  luxury: "Luxury",
  family_friendly: "Family friendly",
  beachfront: "Beachfront",
  business: "Business",
  pet_friendly: "Pet friendly",
  spa: "Spa",
  rooftop_bar: "Rooftop bar",
}

export default function Hotels() {
  const [location, setLocation] = useState("")
  const [results, setResults] = useState([])
  const [preferences, setPreferences] = useState({})
  const navigate = useNavigate()

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/bookings/my")
      if (!res.ok) return {}
      const bookings = await res.json()

      // Count attribute frequency across all past hotel bookings
      const freq = {}
      bookings.forEach(booking => {
        booking.items
          .filter(i => i.item_type === "Hotel" && i.hotel?.attributes)
          .forEach(i => {
            i.hotel.attributes.forEach(attr => {
              freq[attr] = (freq[attr] ?? 0) + 1
            })
          })
      })
      return freq
    } catch {
      return {}
    }
  }

  const handleSearch = async () => {
    const [hotelsRes, prefs] = await Promise.all([
      fetch(`/hotels/search?location=${location}`).then(r => r.json()),
      fetchPreferences(),
    ])

    setPreferences(prefs)

    // Score each hotel by how many attributes match user preferences
    const scored = hotelsRes.map(hotel => {
      const score = (hotel.attributes ?? []).reduce((sum, attr) => {
        return sum + (prefs[attr] ?? 0)
      }, 0)
      return { ...hotel, _score: score }
    })

    // Sort by score descending, fallback to price
    scored.sort((a, b) => b._score - a._score || a.base_price - b.base_price)

    setResults(scored)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Hotels</h1>

      <div className="mt-6 flex gap-4">
        <div className="flex items-center bg-slate-700 rounded px-3 flex-1">
          <MapPin className="w-4 h-4 text-slate-400 mr-2" />
          <input
            placeholder="Search by city (e.g. Paris)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent text-white p-2 w-full outline-none"
          />
        </div>
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>

      {Object.keys(preferences).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-slate-400 text-sm">Sorted by your preferences:</span>
          {Object.entries(preferences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([attr]) => (
              <span key={attr} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {ATTRIBUTE_LABELS[attr] ?? attr}
              </span>
            ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4">
        {results.map(hotel => (
          <div key={hotel.id} className="bg-slate-800 p-4 rounded-lg text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400" />
                <p className="text-lg font-bold">{hotel.name}</p>
                {hotel._score > 0 && (
                  <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <p className="text-slate-400">{hotel.location}</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {hotel.attributes?.map(attr => (
                  <span
                    key={attr}
                    className={`text-xs px-2 py-1 rounded-full ${
                      preferences[attr]
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {ATTRIBUTE_LABELS[attr] ?? attr}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">{hotel.currency} {hotel.base_price}</p>
              <button onClick={() => navigate("/booking", { state: { hotel } })} className="mt-2 bg-blue-600 px-4 py-2 rounded">Book</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}