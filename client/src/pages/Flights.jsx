import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AirportInput({ placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/airports/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSuggestions(data);
    }, 250);
  };

  return (
    <div className="relative flex-1">
      <input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full p-2 rounded bg-slate-700 text-white outline-none"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden shadow-lg">
          {suggestions.map((airport) => (
            <li
              key={airport.code}
              onClick={() => { onSelect(airport); setSuggestions([]); }}
              className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-blue-400 mr-2">{airport.code}</span>
                {airport.city}
              </div>
              <span className="text-slate-400 text-xs">{airport.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Flights() {
  const { state } = useLocation();
  const navigate = useNavigate();


  const getSavedState = (key, fallback) => {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [from, setFrom] = useState(() => getSavedState('flight_from', state?.selectedFrom ? `${state.selectedFrom.code} — ${state.selectedFrom.city}` : ''));
  const [to, setTo] = useState(() => getSavedState('flight_to', state?.selectedTo ? `${state.selectedTo.code} — ${state.selectedTo.city}` : ''));
  const [selectedFrom, setSelectedFrom] = useState(() => getSavedState('flight_selectedFrom', state?.selectedFrom ?? null));
  const [selectedTo, setSelectedTo] = useState(() => getSavedState('flight_selectedTo', state?.selectedTo ?? null));
  const [date, setDate] = useState(() => getSavedState('flight_date', state?.date ?? ''));
  

  const [results, setResults] = useState(() => getSavedState('flight_results', []));
  const [preferences, setPreferences] = useState(() => getSavedState('flight_prefs', { destinations: {}, airlines: {} }));

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/bookings/my');
      if (!res.ok) return { destinations: {}, airlines: {} };
      const bookings = await res.json();
      const destinations = {}, airlines = {};
      bookings.forEach((booking) => {
        booking.items.filter((i) => i.item_type === 'Flight' && i.flight).forEach((i) => {
          const seg = i.flight.segments?.[0];
          if (seg?.destination_code) destinations[seg.destination_code] = (destinations[seg.destination_code] ?? 0) + 1;
          if (i.flight.airline_code) airlines[i.flight.airline_code] = (airlines[i.flight.airline_code] ?? 0) + 1;
        });
      });
      return { destinations, airlines };
    } catch {
      return { destinations: {}, airlines: {} };
    }
  };

  const runSearch = async (from, to, date) => {
    const [flightsRes, prefs] = await Promise.all([
      fetch(`/flights/search?from=${from.code}&to=${to.code}&date=${date}&fromCity=${encodeURIComponent(from.city)}&toCity=${encodeURIComponent(to.city)}`).then((r) => r.json()),
      fetchPreferences(), 
    ]);
    
    const scored = flightsRes.map((f) => ({
      ...f,
      _score: (prefs.destinations[f.to] ?? 0) + (prefs.airlines[f.airline] ?? 0),
    }));
    scored.sort((a, b) => b._score - a._score || a.price - b.price);

    setResults(scored);
    setPreferences(prefs);

    sessionStorage.setItem('flight_results', JSON.stringify(scored));
    sessionStorage.setItem('flight_prefs', JSON.stringify(prefs));
    sessionStorage.setItem('flight_from', JSON.stringify(`${from.code} — ${from.city}`));
    sessionStorage.setItem('flight_to', JSON.stringify(`${to.code} — ${to.city}`));
    sessionStorage.setItem('flight_selectedFrom', JSON.stringify(from));
    sessionStorage.setItem('flight_selectedTo', JSON.stringify(to));
    sessionStorage.setItem('flight_date', JSON.stringify(date));
  };

  useEffect(() => {
    if (state?.selectedFrom && state?.selectedTo && state?.date) {
      runSearch(state.selectedFrom, state.selectedTo, state.date);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFrom && selectedTo && date) runSearch(selectedFrom, selectedTo, date);
  };

  const hasPrefs = Object.keys(preferences.airlines).length > 0 || Object.keys(preferences.destinations).length > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Flights</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-4 items-start">
        <AirportInput
          placeholder="From"
          value={from}
        onChange={(v) => { setFrom(v); setSelectedFrom(null); }}
        onSelect={(a) => { setFrom(`${a.code} — ${a.city}`); setSelectedFrom(a); }}
        />
        <AirportInput
          placeholder="To"
          value={to}
          onChange={(v) => { setTo(v); setSelectedTo(null); }}
          onSelect={(a) => { setTo(`${a.code} — ${a.city}`); setSelectedTo(a); }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded bg-slate-700 text-white"
        />
        <button
          type="submit"
          disabled={!selectedFrom || !selectedTo || !date}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 shrink-0"
        >
          Search
        </button>
      </form>

      {hasPrefs && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-slate-400 text-sm">Sorted by your preferences:</span>
          {Object.entries(preferences.airlines).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a]) => (
            <span key={a} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{a}</span>
          ))}
          {Object.entries(preferences.destinations).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => (
            <span key={d} className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full">→ {d}</span>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4">
        {results.map((flight) => (
          <div key={flight.id} className="bg-slate-800 p-4 rounded-lg text-white flex justify-between items-center">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/flights/${flight.id}`, { state: { flight } })}
            >
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold">{flight.airline}</p>
                {flight._score > 0 && (
                  <span className="bg-green-700 text-green-200 text-xs px-2 py-0.5 rounded-full">Recommended</span>
                )}
              </div>
              <p className="text-slate-400">{flight.fromCity ?? flight.from} → {flight.toCity ?? flight.to}</p>
              <p className="text-slate-400">
                {new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' — '}
                {new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">${flight.price}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigate(`/flights/${flight.id}`, { state: { flight } })}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition"
                >
                  Details
                </button>
                <button
                  onClick={() => navigate('/booking', { state: { flight } })}
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