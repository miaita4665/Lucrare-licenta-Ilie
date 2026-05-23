const express = require("express")
const router = express.Router()

let cities = []

const loadCities = async () => {
  try {
    const res = await fetch("https://raw.githubusercontent.com/lmfmaier/cities-json/refs/heads/master/cities500.json")
    cities = await res.json()
    console.log(`Loaded ${cities.length} cities`)
  } catch (err) {
    console.error("Failed to load cities:", err)
  }
}

loadCities()

router.get("/search", (req, res) => {
  const q = (req.query.q ?? "").toLowerCase().trim()
  if (q.length < 2) return res.json([])

  const matches = cities
    .filter(c => c.name.toLowerCase().startsWith(q))
    .sort((a, b) => b.pop - a.pop)
    .slice(0, 10)
    .map(c => ({
      id: c.id,
      name: c.name,
      country: c.country,
      admin1: c.admin1,
      lat: c.lat,
      lon: c.lon
    }))

  res.json(matches)
})

router.get("/match", (req, res) => {
  const name = (req.query.name ?? "").toLowerCase().trim()
  const match = cities
    .filter(c => c.name.toLowerCase() === name)
    .sort((a, b) => b.pop - a.pop)[0]

  if (!match) return res.status(404).json({ error: "City not found" })

  res.json({
    id: match.id,
    name: match.name,
    country: match.country,
    admin1: match.admin1,
    lat: match.lat,
    lon: match.lon
  })
})

module.exports = router