const express = require("express")
const router = express.Router()

const airlines = ["Ryanair", "Wizz Air", "Lufthansa", "easyJet", "Turkish Airlines", "Air France", "KLM", "Emirates", "Qatar Airways", "British Airways"]
const cities = ["Bucharest", "London", "Paris", "Rome", "Berlin", "Madrid", "Amsterdam", "Vienna", "Athens", "Dublin"]

const randomTime = () => {
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, "0")
  const minute = Math.random() > 0.5 ? "00" : "30"
  return `${hour}:${minute}`
}

router.get("/search", async (req, res) => {
  const { from, to, date } = req.query

  const flights = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    airline: airlines[Math.floor(Math.random() * airlines.length)],
    from,
    to,
    date,
    departure: randomTime(),
    arrival: randomTime(),
    price: Math.floor(Math.random() * 500) + 50
  }))

  res.json(flights)
})

module.exports = router