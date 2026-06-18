import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { flight, hotel } = state ?? {};

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      email: user?.email ?? '',
      passport: '',
    },
  });

  const onSubmit = async (form) => {
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
      setError('root', { message: err.message });
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
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-slate-400 text-sm">First name</label>
            <input
              {...register('firstName', { required: 'First name is required.' })}
              className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
            />
            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div className="flex-1">
            <label className="text-slate-400 text-sm">Last name</label>
            <input
              {...register('lastName', { required: 'Last name is required.' })}
              className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
            />
            {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-sm">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required.' })}
            className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-slate-400 text-sm">Passport number</label>
          <input
            {...register('passport', { required: 'Passport number is required.' })}
            className="mt-1 w-full p-2 rounded bg-slate-700 text-white"
          />
          {errors.passport && <p className="text-red-400 text-xs mt-1">{errors.passport.message}</p>}
        </div>

        {errors.root && <p className="text-red-400 text-sm">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded font-bold disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Continue to checkout →'}
        </button>
      </form>
    </div>
  );
}
