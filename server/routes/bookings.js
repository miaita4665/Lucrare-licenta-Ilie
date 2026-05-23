const express = require("express")
const router = express.Router()
const { sequelize, Booking, BookingItem, Traveler, Hotel, Flight, FlightSegment } = require("../models")
const { protect } = require("../middleware/authMiddleware") 

router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Traveler,
          as: "travelers",
          attributes: ["first_name", "last_name", "document_number"],
        },
        {
          model: BookingItem,
          as: "items",
        },
      ],
      order: [["created_at", "DESC"]],
    })

    // For each booking item, manually fetch the flight or hotel
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const b = booking.toJSON()
        b.items = await Promise.all(
          b.items.map(async (item) => {
            if (item.item_type === "Flight") {
              const flight = await Flight.findByPk(item.reference_id, {
                include: [{ model: FlightSegment, as: "segments" }],
              })
              return { ...item, flight: flight?.toJSON() ?? null }
            }
            if (item.item_type === "Hotel") {
              const hotel = await Hotel.findByPk(item.reference_id)
              return { ...item, hotel: hotel?.toJSON() ?? null }
            }
            return item
          })
        )
        return b
      })
    )

    res.json(enriched)
  } catch (err) {
    console.error("Failed to fetch bookings:", err)
    res.status(500).json({ error: "Failed to fetch bookings" })
  }
})

router.post("/",protect, async (req, res) => {
  const { flight, hotel, passenger } = req.body

  // Basic validation
  if (!passenger?.firstName || !passenger?.lastName || !passenger?.email || !passenger?.passport) {
    return res.status(400).json({ error: "Missing passenger details" })
  }
  if (!flight && !hotel) {
    return res.status(400).json({ error: "No flight or hotel provided" })
  }

  const t = await sequelize.transaction()

  try {
    // 1. Calculate total
    const total =
      (flight ? parseFloat(flight.price) : 0) +
      (hotel ? parseFloat(hotel.base_price) : 0)

    // 2. Create the Booking row
    const booking = await Booking.create({
      user_id: req.user?.id ?? null,
      guest_email: req.user ? null : passenger.email,
      status: "Pending",
      total_amount: total,
      currency: hotel?.currency ?? "EUR",
      fare_class: "Economy",
    }, { transaction: t })

    // 3. Create the Traveler row
    await Traveler.create({
      booking_id: booking.id,
      first_name: passenger.firstName,
      last_name: passenger.lastName,
      document_number: passenger.passport,
    }, { transaction: t })

    // 4. Save flight to DB and create BookingItem
    if (flight) {
      const dbFlight = await Flight.create({
        airline_code: flight.airline,
        total_base_price: flight.price,
        is_multi_city: false,
      }, { transaction: t })

      await FlightSegment.create({
        flight_id: dbFlight.id,
        origin_code: flight.from,
        destination_code: flight.to,
        departure_time: new Date(flight.departure),
        arrival_time: new Date(flight.arrival),
        sequence_number: 1,
      }, { transaction: t })

      await BookingItem.create({
        booking_id: booking.id,
        item_type: "Flight",
        reference_id: dbFlight.id,
      }, { transaction: t })
    }

    // 5. Save hotel to DB and create BookingItem
    if (hotel) {
      const dbHotel = await Hotel.create({
        name: hotel.name,
        location: hotel.location,
        stars: hotel.stars,
        description: hotel.description ?? null,
        base_price: hotel.base_price,
        currency: hotel.currency,
      }, { transaction: t })

      await BookingItem.create({
        booking_id: booking.id,
        item_type: "Hotel",
        reference_id: dbHotel.id,
      }, { transaction: t })
    }

    await t.commit()

    res.status(201).json({ bookingId: booking.id, total, status: "Pending" })

  } catch (err) {
    await t.rollback()
    console.error("Booking error:", err)
    res.status(500).json({ error: "Failed to create booking" })
  }
})

module.exports = router