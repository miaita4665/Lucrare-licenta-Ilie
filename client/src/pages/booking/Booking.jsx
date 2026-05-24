import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { flight, hotel } = state ?? {};

  const [form, setForm] = useState({
    firstName: user?.first_name ?? '',
    lastName: user?.last_name ?? '',
    email: user?.email ?? '',
    passport: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flight, hotel, passenger: form }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate('/checkout', {
        state: { flight, hotel, passenger: form, bookingId: data.bookingId, total: data.total },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Passenger details</h1>

      {/* Booking summary */}
      <div className="mt-6 bg-slate-800 rounded-lg p-4 text-white">
        {flight && (
          <div>
            <p className="text-slate-400 text-sm">Flight</p>
            <p className="font-bold">{flight.airline} — {flight.fromCity ?? flight.from} → {flight.toCity ?? flight.to}</p>
            <p className="text-slate-400">
              {new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${flight.price}
            </p>
          </div>
        )}
        {hotel && (
          <div className={flight ? 'mt-3 pt-3 border-t border-slate-700' : ''}>
            <p className="text-slate-400 text-sm">Hotel</p>
            <p className="font-bold">{hotel.name}</p>
            <p className="text-slate-400">{hotel.location} · {hotel.currency} {hotel.base_price}/night</p>
          </div>
        )}
      </div>

      {/* Passenger form */}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-slate-400 text-sm">First name</label>
            <input
              name="firstName"
              required
              value={form.firstName}
              onChange={handleChange}
              className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-slate-400 text-sm">Last name</label>
            <input
              name="lastName"
              required
              value={form.lastName}
              onChange={handleChange}
              className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-sm">Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-slate-400 text-sm">Passport number</label>
          <input
            name="passport"
            required
            value={form.passport}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded font-bold disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue to checkout →'}
        </button>
      </form>
    </div>
  );
}