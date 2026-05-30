import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Tag, X } from 'lucide-react'

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

function CheckoutForm({ bookingId, total, discountedTotal, currency, flight, hotel, passenger, promoCode }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const finalTotal = discountedTotal ?? total

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/bookings/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, promoCode, discountedTotal: finalTotal }),
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
        body: JSON.stringify({ discountedTotal: finalTotal, promoCode }), 
      })

      navigate('/booking/confirmation', {
        state: { bookingId, total: finalTotal, currency, flight, hotel, passenger }
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
        {loading ? "Processing..." : `Pay ${currency} ${parseFloat(finalTotal).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { flight, hotel, passenger, bookingId, total, currency = "EUR" } = state ?? {}

  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null)
  const [promoError, setPromoError] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const discountedTotal = promo
    ? parseFloat(total) * (1 - promo.discount_percent / 100)
    : null

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError(null)
    try {
      const res = await fetch(`/api/promo-codes/validate?code=${encodeURIComponent(promoInput.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPromo(data)
    } catch (err) {
      setPromo(null)
      setPromoError(err.message)
    } finally {
      setPromoLoading(false)
    }
  }

  if (!bookingId) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Checkout</h1>

      {/* Order summary */}
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
        {promo && (
          <div className="flex justify-between mb-2 text-green-400">
            <span>Promo: {promo.code} (-{promo.discount_percent}%)</span>
            <span>- {currency} {(parseFloat(total) * promo.discount_percent / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <div className="text-right">
            {promo && (
              <p className="text-slate-400 line-through text-sm">{currency} {parseFloat(total).toFixed(2)}</p>
            )}
            <span className="text-blue-400">
              {currency} {parseFloat(discountedTotal ?? total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Promo code */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4 text-white">
        <p className="text-slate-400 text-sm mb-3">Promo code</p>
        {promo ? (
          <div className="flex items-center justify-between bg-green-900/30 border border-green-700 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-bold">{promo.code}</span>
              <span className="text-green-400 text-sm">— {promo.discount_percent}% off</span>
            </div>
            <button onClick={() => setPromo(null)} className="text-slate-400 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              placeholder="Enter promo code"
              value={promoInput}
              onChange={e => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-xl text-sm outline-none"
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50 transition"
            >
              {promoLoading ? 'Checking...' : 'Apply'}
            </button>
          </div>
        )}
        {promoError && <p className="text-red-400 text-sm mt-2">{promoError}</p>}
      </div>

      {/* Passenger */}
      {passenger && (
        <div className="mt-4 bg-slate-800 rounded-lg p-4 text-white">
          <p className="text-slate-400 text-sm mb-1">Passenger</p>
          <p>{passenger.firstName} {passenger.lastName} · {passenger.email}</p>
        </div>
      )}

      {/* Stripe payment */}
      <div className="mt-8">
        <p className="text-white font-bold mb-4">Payment details</p>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingId={bookingId}
            total={total}
            discountedTotal={discountedTotal}
            currency={currency}
            flight={flight}
            hotel={hotel}
            passenger={passenger}
            promoCode={promo?.code}
          />
        </Elements>
      </div>
    </div>
  )
}