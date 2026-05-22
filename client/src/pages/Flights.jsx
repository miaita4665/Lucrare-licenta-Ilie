import { useState } from "react"

export default function Flights() {
  const [form, setForm] = useState({ from: "", to: "", date: "" })
  const [results, setResults] = useState([])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`/flights/search?from=${form.from}&to=${form.to}&date=${form.date}`)
    const data = await res.json()
    setResults(data)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Flights</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex gap-4">
        <input name="from" placeholder="From (e.g. OTP)" onChange={handleChange} className="p-2 rounded bg-slate-700 text-white" />
        <input name="to" placeholder="To (e.g. LHR)" onChange={handleChange} className="p-2 rounded bg-slate-700 text-white" />
        <input name="date" type="date" onChange={handleChange} className="p-2 rounded bg-slate-700 text-white" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {results.map(flight => (
          <div key={flight.id} className="bg-slate-800 p-4 rounded-lg text-white flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">{flight.airline}</p>
              <p className="text-slate-400">{flight.from} → {flight.to}</p>
              <p className="text-slate-400">{flight.departure} - {flight.arrival}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">${flight.price}</p>
              <button className="mt-2 bg-blue-600 px-4 py-2 rounded">Book</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}