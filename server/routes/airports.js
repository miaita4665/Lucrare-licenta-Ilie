const express = require("express")
const router = express.Router()

let airports = []

const loadAirports = async () => {
  try {
    const res = await fetch("https://gist.githubusercontent.com/tdreyno/4278655/raw/7b0762c09b519f40397e4c3e100b097d861f5588/airports.json")
    airports = await res.json()
    console.log(`Loaded ${airports.length} airports`)
  } catch (err) {
    console.error("Failed to load airports:", err)
  }
}

loadAirports()

router.get("/search", (req, res) => {
  const q = (req.query.q ?? "").toLowerCase().trim()
  if (q.length < 2) return res.json([])

  const matches = airports
    .filter(a =>
      a.code?.toLowerCase().startsWith(q) ||
      a.city?.toLowerCase().startsWith(q) ||
      a.name?.toLowerCase().startsWith(q)
    )
    .sort((a, b) => parseInt(b.direct_flights) - parseInt(a.direct_flights))
    .slice(0, 10)
    .map(a => ({
      code: a.code,
      name: a.name,
      city: a.city,
      state: a.state,
      country: a.country,
      lat: a.lat,
      lon: a.lon,
    }))

  res.json(matches)
})

module.exports = router