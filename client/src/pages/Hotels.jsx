import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Star, BedDouble } from "lucide-react"

export default function Hotels() {
  const [location, setLocation] = useState("")
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  const handleSearch = async () => {
    const res = await fetch(`/hotels/search?location=${location}`)
    const data = await res.json()
    setResults(data)
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

      <div className="mt-8 grid grid-cols-1 gap-4">
        {results.map(hotel => (
          <div key={hotel.id} className="bg-slate-800 p-4 rounded-lg text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400" />
                <p className="text-lg font-bold">{hotel.name}</p>
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