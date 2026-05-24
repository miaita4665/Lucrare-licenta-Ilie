import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const FIELD_STYLE = {
  style: {
    base: {
      color: '#f8fafc',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#64748b' },
      iconColor: '#60a5fa',
    },
    invalid: { color: '#f87171', iconColor: '#f87171' },
  },
}

function CheckoutForm({ bookingId, total, currency, flight, hotel, passenger }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/bookings/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const { clientSecret, error: piError } = await res.json()
      if (piError) throw new Error(piError)

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement) },
      })
      if (stripeError) throw new Error(stripeError.message)

      await fetch(`/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      navigate('/booking/confirmation', {
        state: { bookingId, total, currency, flight, hotel, passenger }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-slate-400 text-sm block mb-1">Card number</label>
        <div className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-3">
          <CardNumberElement options={FIELD_STYLE} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-sm block mb-1">Expiry date</label>
          <div className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-3">
            <CardExpiryElement options={FIELD_STYLE} />
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-sm block mb-1">CVC</label>
          <div className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-3">
            <CardCvcElement options={FIELD_STYLE} />
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 transition mt-2"
      >
        {loading ? "Processing..." : `Pay ${currency} ${parseFloat(total).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { flight, hotel, passenger, bookingId, total, currency = "EUR" } = state ?? {}

  if (!bookingId) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Checkout</h1>

      <div className="mt-6 bg-slate-800 rounded-lg p-4 text-white">
        <p className="text-slate-400 text-sm mb-3">Order summary</p>
        {flight && (
          <div className="flex justify-between mb-2">
            <span>{flight.airline} — {flight.fromCity ?? flight.from} → {flight.toCity ?? flight.to}</span>
            <span className="text-blue-400">${flight.price}</span>
          </div>
        )}
        {hotel && (
          <div className="flex justify-between mb-2">
            <span>{hotel.name} — {hotel.location}</span>
            <span className="text-blue-400">{hotel.currency} {hotel.base_price}</span>
          </div>
        )}
        <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-blue-400">{currency} {parseFloat(total).toFixed(2)}</span>
        </div>
      </div>

      {passenger && (
        <div className="mt-4 bg-slate-800 rounded-lg p-4 text-white">
          <p className="text-slate-400 text-sm mb-1">Passenger</p>
          <p>{passenger.firstName} {passenger.lastName} · {passenger.email}</p>
        </div>
      )}

      <div className="mt-8">
        <p className="text-white font-bold mb-4">Payment details</p>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingId={bookingId}
            total={total}
            currency={currency}
            flight={flight}
            hotel={hotel}
            passenger={passenger}
          />
        </Elements>
      </div>
    </div>
  )
}