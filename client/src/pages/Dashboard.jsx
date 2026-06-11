import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plane, Hotel, Clock, CheckCircle, XCircle, FileText, CreditCard, Tag } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/bookings/my');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const flightBookings = bookings.filter((b) => b.items.some((i) => i.item_type === 'Flight'));
  const hotelBookings = bookings.filter((b) => b.items.some((i) => i.item_type === 'Hotel'));

  const statusIcon = (status) => {
    if (status === 'Confirmed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'Cancelled') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  const statusColor = (status) => {
    if (status === 'Confirmed') return 'text-green-400';
    if (status === 'Cancelled') return 'text-red-400';
    return 'text-yellow-400';
  };
  const PricingDisplay = ({ booking, size = "normal" }) => {
    const finalTotal = parseFloat(booking.total_amount);
    const textSize = size === "large" ? "text-xl" : "text-lg";

    if (booking.PromoCode) {
      const discountPercent = parseFloat(booking.PromoCode.discount_percent);
      const originalPrice = finalTotal / (1 - (discountPercent / 100));
      const discountAmount = originalPrice - finalTotal;

      return (
        <div className="flex flex-col items-start mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 line-through text-sm">
              {booking.currency} {originalPrice.toFixed(2)}
            </span>
            <span className={`text-blue-400 font-bold ${textSize}`}>
              {booking.currency} {finalTotal.toFixed(2)}
            </span>
          </div>
          <span className="text-green-400 text-xs mt-1 bg-green-900/30 flex items-center gap-1 px-2 py-0.5 rounded">
            <Tag className="w-3 h-3" /> Used {booking.PromoCode.code} (Saved {booking.currency} {discountAmount.toFixed(2)})
          </span>
        </div>
      );
    }

    return (
      <p className={`text-blue-400 font-bold mt-2 ${textSize}`}>
        {booking.currency} {finalTotal.toFixed(2)}
      </p>
    );
  };

  // Modal for booking details
  const BookingModal = ({ booking, onClose }) => {
    const flight = booking.items.find((i) => i.item_type === 'Flight')?.flight;
    const hotel = booking.items.find((i) => i.item_type === 'Hotel')?.hotel;
    const traveler = booking.travelers?.[0];
    const segment = flight?.segments?.[0];

    const handlePay = () => {
      navigate('/checkout', {
        state: {
          bookingId: booking.id,
          total: booking.total_amount,
          currency: booking.currency,
          flight: flight ? {
            airline: flight.airline_code,
            from: segment?.origin_code,
            to: segment?.destination_code,
            departure: segment?.departure_time,
            arrival: segment?.arrival_time,
            price: flight.total_base_price,
          } : null,
          hotel: hotel ? {
            name: hotel.name,
            location: hotel.location,
            base_price: hotel.base_price,
            currency: hotel.currency,
          } : null,
          passenger: traveler ? {
            firstName: traveler.first_name,
            lastName: traveler.last_name,
            email: user?.email,
          } : null,
        }
      })
    }
    const handleCancel = async () => {
      if (!confirm('Are you sure you want to cancel this booking?')) return
      try {
        const res = await fetch(`/bookings/${booking.id}/cancel`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) {
          const data = await res.json()
          alert(data.error)
          return
        }
        setBookings(prev => prev.map(b =>
          b.id === booking.id ? { ...b, status: 'Cancelled' } : b
        ))
        onClose()
      } catch (err) {
        console.error(err)
      }
    }

    const handleInvoice = () => {
      const lines = [
        `REZIO — BOOKING INVOICE`,
        `========================`,
        `Booking #${booking.id}`,
        `Date: ${new Date(booking.created_at).toLocaleDateString()}`,
        `Status: ${booking.status}`,
        booking.PromoCode ? `Promo Applied: ${booking.PromoCode.code} (-${booking.PromoCode.discount_percent}%)` : '',
        ``,
        `PASSENGER`,
        traveler ? `${traveler.first_name} ${traveler.last_name}` : 'N/A',
        traveler ? `Passport: ${traveler.document_number}` : '',
        ``,
        flight && segment ? [
          `FLIGHT`,
          `${flight.airline_code}`,
          `${segment.origin_code} → ${segment.destination_code}`,
          `Departure: ${new Date(segment.departure_time).toLocaleString()}`,
          `Arrival: ${new Date(segment.arrival_time).toLocaleString()}`,
          `Price: ${booking.currency} ${flight.total_base_price}`,
        ].join('\n') : '',
        hotel ? [
          ``,
          `HOTEL`,
          `${hotel.name}`,
          `${hotel.location}`,
          `Price/night: ${hotel.currency} ${hotel.base_price}`,
        ].join('\n') : '',
        ``,
        `========================`,
        `TOTAL: ${booking.currency} ${parseFloat(booking.total_amount).toFixed(2)}`,
      ].filter(Boolean).join('\n')

      const blob = new Blob([lines], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rezio-booking-${booking.id}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md text-white" onClick={e => e.stopPropagation()}>

          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs">Booking #{booking.id}</p>
              <p className="text-slate-400 text-xs">{new Date(booking.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-1">
              {statusIcon(booking.status)}
              <span className={`text-sm font-bold ${statusColor(booking.status)}`}>{booking.status}</span>
            </div>
          </div>

          {flight && segment && (
            <div className="bg-slate-800 rounded-xl p-4 mb-3">
              <p className="text-slate-400 text-xs mb-1">Flight</p>
              <p className="font-bold">{flight.airline_code}</p>
              <p className="text-slate-300">{segment.origin_code} → {segment.destination_code}</p>
              <p className="text-slate-400 text-sm">
                {new Date(segment.departure_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-blue-400 font-bold mt-1">{booking.currency} {parseFloat(flight.total_base_price).toFixed(2)}</p>
            </div>
          )}

          {hotel && (
            <div className="bg-slate-800 rounded-xl p-4 mb-3">
              <p className="text-slate-400 text-xs mb-1">Hotel</p>
              <p className="font-bold">{hotel.name}</p>
              <p className="text-slate-400 text-sm">{hotel.location}</p>
              <p className="text-blue-400 font-bold mt-1">{hotel.currency} {parseFloat(hotel.base_price).toFixed(2)}/night</p>
            </div>
          )}

          {traveler && (
            <div className="bg-slate-800 rounded-xl p-4 mb-4">
              <p className="text-slate-400 text-xs mb-1">Passenger</p>
              <p>{traveler.first_name} {traveler.last_name}</p>
              <p className="text-slate-400 text-sm">{traveler.document_number}</p>
            </div>
          )}
          <div className="flex justify-between items-start font-bold text-lg mb-6">
            <span className="mt-2">Total</span>
            <PricingDisplay booking={booking} size="large" />
          </div>

          {booking.status === 'Pending' && (
            <>
              <button
                onClick={handlePay}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-2"
              >
                <CreditCard className="w-4 h-4" /> Complete payment
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-2"
              >
                <XCircle className="w-4 h-4" /> Cancel booking
              </button>
            </>
          )}

          {booking.status === 'Confirmed' && (
            <button
              onClick={handleInvoice}
              className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-2"
            >
              <FileText className="w-4 h-4" /> Download invoice
            </button>
          )}

          <button onClick={onClose} className="w-full text-slate-400 hover:text-white py-2 text-sm transition">
            Close
          </button>
        </div>
      </div>
    )
  }

  const FlightCard = ({ booking }) => {
    const flight = booking.items.find((i) => i.item_type === 'Flight')?.flight;
    const traveler = booking.travelers?.[0];
    const segment = flight?.segments?.[0];

    return (
      <div
        onClick={() => setSelectedBooking(booking)}
        className="bg-slate-800 rounded-xl p-4 text-white cursor-pointer hover:bg-slate-700 transition"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-slate-400 text-xs">Booking #{booking.id}</p>
            <p className="text-slate-400 text-xs">{new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1">
            {statusIcon(booking.status)}
            <span className={`text-xs font-bold ${statusColor(booking.status)}`}>{booking.status}</span>
          </div>
        </div>
        {flight && (
          <div className="mb-3">
            <p className="font-bold text-lg">{flight.airline_code}</p>
            {segment && (
              <>
                <p className="text-white font-bold">{segment.origin_code} → {segment.destination_code}</p>
                <p className="text-slate-400 text-sm">
                  {new Date(segment.departure_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </>
            )}
          </div>
        )}
        {traveler && (
          <p className="text-slate-400 text-xs">{traveler.first_name} {traveler.last_name} · {traveler.document_number}</p>
        )}
        <PricingDisplay booking={booking} />
      </div>
    );
  };

  const HotelCard = ({ booking }) => {
    const hotel = booking.items.find((i) => i.item_type === 'Hotel')?.hotel;
    const traveler = booking.travelers?.[0];

    return (
      <div
        onClick={() => setSelectedBooking(booking)}
        className="bg-slate-800 rounded-xl p-4 text-white cursor-pointer hover:bg-slate-700 transition"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-slate-400 text-xs">Booking #{booking.id}</p>
            <p className="text-slate-400 text-xs">{new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1">
            {statusIcon(booking.status)}
            <span className={`text-xs font-bold ${statusColor(booking.status)}`}>{booking.status}</span>
          </div>
        </div>
        {hotel && (
          <div className="mb-3">
            <p className="font-bold text-lg">{hotel.name}</p>
            <p className="text-slate-400 text-sm">{hotel.location}</p>
            <p className="text-slate-400 text-sm">{hotel.currency} {hotel.base_price}/night</p>
          </div>
        )}
        {traveler && (
          <p className="text-slate-400 text-xs">{traveler.first_name} {traveler.last_name} · {traveler.document_number}</p>
        )}
        <PricingDisplay booking={booking} />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.first_name} </h1>
        <p className="text-slate-400 mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button onClick={() => navigate('/flights')} className="bg-slate-800 hover:bg-slate-700 transition p-5 rounded-xl text-left">
          <Plane className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-white font-bold">Search flights</p>
          <p className="text-slate-400 text-sm mt-1">Find and book your next flight</p>
        </button>
        <button onClick={() => navigate('/hotels')} className="bg-slate-800 hover:bg-slate-700 transition p-5 rounded-xl text-left">
          <Hotel className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-white font-bold">Search hotels</p>
          <p className="text-slate-400 text-sm mt-1">Browse hotels worldwide</p>
        </button>
      </div>

      {loading && <p className="text-slate-400">Loading bookings...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Flights</h2>
              <span className="text-slate-400 text-sm">({flightBookings.length})</span>
            </div>
            {flightBookings.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm">No flight bookings yet</p>
                <button onClick={() => navigate('/flights')} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Search flights</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {flightBookings.map((b) => <FlightCard key={b.id} booking={b} />)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Hotels</h2>
              <span className="text-slate-400 text-sm">({hotelBookings.length})</span>
            </div>
            {hotelBookings.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm">No hotel bookings yet</p>
                <button onClick={() => navigate('/hotels')} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Search hotels</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {hotelBookings.map((b) => <HotelCard key={b.id} booking={b} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedBooking && (
        <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
}