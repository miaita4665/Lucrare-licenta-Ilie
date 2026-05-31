import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, BedDouble } from 'lucide-react';

const ATTRIBUTE_LABELS = {
  quiet: 'Quiet', city_center: 'City center', budget: 'Budget',
  luxury: 'Luxury', family_friendly: 'Family friendly', beachfront: 'Beachfront',
  business: 'Business', pet_friendly: 'Pet friendly', spa: 'Spa', rooftop_bar: 'Rooftop bar',
};

export default function Hotels() {
  const { state } = useLocation();
  const [location, setLocation] = useState(state?.selectedCity?.name ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(state?.selectedCity ?? null);
  const [results, setResults] = useState([]);
  const [preferences, setPreferences] = useState({});
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (location.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/cities/search?q=${encodeURIComponent(location)}`);
      const data = await res.json();
      setSuggestions(data);
    }, 250);
  }, [location]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/bookings/my');
      if (!res.ok) return {};
      const bookings = await res.json();
      const freq = {};
      bookings.forEach((booking) => {
        booking.items.filter((i) => i.item_type === 'Hotel' && i.hotel?.attributes).forEach((i) => {
          i.hotel.attributes.forEach((attr) => { freq[attr] = (freq[attr] ?? 0) + 1; });
        });
      });
      return freq;
    } catch { return {}; }
  };

  const runSearch = async (city) => {
    const [hotelsRes, prefs] = await Promise.all([
      fetch(`/hotels/search?location=${city.name}`).then((r) => r.json()),
      fetchPreferences(),
    ]);
    setPreferences(prefs);
    const scored = hotelsRes.map((hotel) => ({
      ...hotel,
      _score: (hotel.attributes ?? []).reduce((sum, attr) => sum + (prefs[attr] ?? 0), 0),
    }));
    scored.sort((a, b) => b._score - a._score || a.base_price - b.base_price);
    setResults(scored);
  };

  useEffect(() => {
    if (state?.selectedCity) runSearch(state.selectedCity);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Hotels</h1>

      <div className="mt-6 flex gap-4">
        <div className="relative flex-1">
          <div className="flex items-center bg-slate-700 rounded px-3">
            <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              placeholder="Search by city (e.g. Paris)"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setSelectedCity(null); }}
              className="bg-transparent text-white p-2 w-full outline-none"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden shadow-lg">
              {suggestions.map((city) => (
                <li
                  key={city.id}
                  onClick={() => { setLocation(city.name); setSelectedCity(city); setSuggestions([]); }}
                  className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                >
                  <span>{city.name}</span>
                  <span className="text-slate-400 text-xs">{city.admin1}, {city.country}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => selectedCity && runSearch(selectedCity)}
          disabled={!selectedCity}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {!selectedCity && location.length > 0 && suggestions.length === 0 && (
        <p className="text-red-400 text-sm mt-2">No city found — try a different name</p>
      )}

      {Object.keys(preferences).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-slate-400 text-sm">Sorted by your preferences:</span>
          {Object.entries(preferences).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([attr]) => (
            <span key={attr} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {ATTRIBUTE_LABELS[attr] ?? attr}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4">
        {results.map((hotel) => (
          <div key={hotel.id} className="bg-slate-800 p-4 rounded-lg text-white flex justify-between items-center">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/hotels/${hotel.id}`, { state: { hotel, city: selectedCity } })}
            >
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400" />
                <p className="text-lg font-bold">{hotel.name}</p>
                {hotel._score > 0 && (
                  <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded-full">Recommended</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <p className="text-slate-400">{hotel.location}</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < hotel.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {hotel.attributes?.map((attr) => (
                  <span key={attr} className={`text-xs px-2 py-1 rounded-full ${preferences[attr] ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {ATTRIBUTE_LABELS[attr] ?? attr}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">{hotel.currency} {hotel.base_price}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigate(`/hotels/${hotel.id}`, { state: { hotel, city: selectedCity } })}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition"
                >
                  Details
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/booking', { state: { hotel, city: selectedCity } }); }}
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}