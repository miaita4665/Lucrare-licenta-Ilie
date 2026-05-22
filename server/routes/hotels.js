const express = require("express")
const router = express.Router()

const hotelNames = ["Grand Hotel", "Ibis", "Hilton", "Marriott", "Novotel", "Radisson", "Sheraton", "Holiday Inn", "Hyatt", "Crowne Plaza"]
const cities = ["Bucharest", "London", "Paris", "Rome", "Berlin", "Madrid", "Amsterdam", "Vienna", "Athens", "Dublin"]

router.get("/search", (req, res) => {
  const { location } = req.query

  const hotels = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    name: `${hotelNames[Math.floor(Math.random() * hotelNames.length)]} ${location || cities[Math.floor(Math.random() * cities.length)]}`,
    location: location || cities[Math.floor(Math.random() * cities.length)],
    stars: Math.floor(Math.random() * 5) + 1,
    description: "A great place to stay",
    base_price: Math.floor(Math.random() * 500) + 50,
    currency: "EUR"
  }))

  res.json(hotels)
})

module.exports = router