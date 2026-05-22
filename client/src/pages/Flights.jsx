import { useState } from "react"

export default function Flights() {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: ""
  })
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`/flights/search?from=${form.from}&to=${form.to}&date=${form.date}`)
    const data = await res.json()
    console.log(data) 
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
    </div>
  )
}