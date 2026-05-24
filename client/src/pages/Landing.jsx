import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plane, Hotel } from 'lucide-react';

function CityInput({ placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    clearTimeout(debounceRef.current);
    if (e.target.value.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/cities/search?q=${encodeURIComponent(e.target.value)}`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 250);
  };

  return (
    <div className="relative">
      <input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden shadow-lg">
          {suggestions.map((city) => (
            <li
              key={city.id}
              onClick={() => {
                onSelect(city);
                setSuggestions([]);
              }}
              className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer flex justify-between text-sm"
            >
              <span>{city.name}</span>
              <span className="text-slate-400 text-xs">
                {city.admin1}, {city.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AirportInput({ placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    clearTimeout(debounceRef.current);
    if (e.target.value.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/airports/search?q=${encodeURIComponent(e.target.value)}`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 250);
  };

  return (
    <div className="relative">
      <input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden shadow-lg">
          {suggestions.map((a) => (
            <li
              key={a.code}
              onClick={() => {
                onSelect(a);
                setSuggestions([]);
              }}
              className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer flex justify-between text-sm"
            >
              <span>
                <span className="text-blue-400 font-bold mr-2">{a.code}</span>
                {a.city}
              </span>
              <span className="text-slate-400 text-xs">{a.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Landing() {
  const [tab, setTab] = useState('flights');
  const navigate = useNavigate();

  const [fromVal, setFromVal] = useState('');
  const [toVal, setToVal] = useState('');
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [date, setDate] = useState('');

  const [hotelVal, setHotelVal] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (tab === 'flights' && selectedFrom && selectedTo && date) {
      navigate('/flights', { state: { selectedFrom, selectedTo, date } });
    } else if (tab === 'hotels' && selectedCity) {
      navigate('/hotels', { state: { selectedCity } });
    }
  };

  return (
    <div>
      <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950 pointer-events-none" />

        <div className="relative z-10 text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Your next trip,
            <br />
            <span className="text-sky-400">simplified.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Search flights and hotels, book your trip, and manage everything in
            one place.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6">
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
                {t === 'flights' ? (
                  <span className="flex items-center gap-1">
                    <Plane className="w-4 h-4" /> Flights
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Hotel className="w-4 h-4" /> Hotels
                  </span>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            {tab === 'flights' ? (
              <div className="grid grid-cols-2 gap-3">
                <AirportInput
                  placeholder="From (e.g. Bucharest)"
                  value={fromVal}
                  onChange={(v) => {
                    setFromVal(v);
                    setSelectedFrom(null);
                  }}
                  onSelect={(a) => {
                    setFromVal(`${a.code} — ${a.city}`);
                    setSelectedFrom(a);
                  }}
                />
                <AirportInput
                  placeholder="To (e.g. London)"
                  value={toVal}
                  onChange={(v) => {
                    setToVal(v);
                    setSelectedTo(null);
                  }}
                  onSelect={(a) => {
                    setToVal(`${a.code} — ${a.city}`);
                    setSelectedTo(a);
                  }}
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <CityInput
                placeholder="Where to? (e.g. Paris)"
                value={hotelVal}
                onChange={(v) => {
                  setHotelVal(v);
                  setSelectedCity(null);
                }}
                onSelect={(c) => {
                  setHotelVal(c.name);
                  setSelectedCity(c);
                }}
              />
            )}

            <button
              type="submit"
              disabled={
                tab === 'flights'
                  ? !selectedFrom || !selectedTo || !date
                  : !selectedCity
              }
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Popular destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { city: 'Paris', country: 'France' },
            { city: 'Tokyo', country: 'Japan' },
            { city: 'New York', country: 'USA' },
            { city: 'Bucharest', country: 'Romania' },
          ].map(({ city, country }) => (
            <div
              key={city}
              onClick={() =>
                navigate('/hotels', { state: { selectedCity: { name: city } } })
              }
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-sky-500/50 hover:bg-slate-800 transition group"
            >
              <div className="font-semibold group-hover:text-sky-400 transition">
                {city}
              </div>
              <div className="text-slate-500 text-sm">{country}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
