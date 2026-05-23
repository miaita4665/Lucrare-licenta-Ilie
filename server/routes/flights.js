const express = require("express")
const router = express.Router()

const airlines = ["Ryanair", "Wizz Air", "Lufthansa", "easyJet", "Turkish Airlines", "Air France", "KLM", "Emirates", "Qatar Airways", "British Airways"]

const randomDateTime = (date, addHours = 0) => {
  const base = new Date(date)
  base.setHours(Math.floor(Math.random() * 20) + addHours, Math.random() > 0.5 ? 0 : 30, 0, 0)
  return base.toISOString()
}

router.get("/search", async (req, res) => {
  const { from, to, date } = req.query

  if (!date) return res.status(400).json({ error: "Date is required" })

  const flights = Array.from({ length: 10 }, (_, i) => {
    const departure = randomDateTime(date, 0)
    const arrival = randomDateTime(date, 2)  // always 2h after departure base

    return {
      id: String(i + 1),
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      from,
      to,
      date,
      departure,
      arrival,
      price: Math.floor(Math.random() * 500) + 50
    }
  })

  res.json(flights)
})

module.exports = router