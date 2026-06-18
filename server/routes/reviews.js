const express = require('express')
const router = express.Router()
const { Review, User, Hotel } = require('../models')
const { protect, restrict } = require('../middleware/authMiddleware')

// GET /api/reviews — admin + support agent
router.get('/', protect, restrict('Admin', 'Support Agent'), async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['first_name', 'last_name'] },
        { model: Hotel, attributes: ['name'] },
      ],
      order: [['created_at', 'DESC']],
    })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// GET /api/reviews/hotel?name=... — public, reviews for a hotel by name
router.get('/hotel', async (req, res) => {
  try {
    const { name } = req.query
    if (!name) return res.json([])
    const hotel = await Hotel.findOne({ where: { name } })
    if (!hotel) return res.json([])
    const reviews = await Review.findAll({
      where: { hotel_id: hotel.id, is_moderated: false },
      include: [{ model: User, attributes: ['first_name', 'last_name'] }],
      order: [['created_at', 'DESC']],
    })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// PATCH /api/reviews/:id/moderate — toggle is_moderated (admin + support agent)
router.patch('/:id/moderate', protect, restrict('Admin', 'Support Agent'), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    await review.update({ is_moderated: !review.is_moderated })
    res.json({ success: true, is_moderated: review.is_moderated })
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate review' })
  }
})

// DELETE /api/reviews/:id — admin + support agent
router.delete('/:id', protect, restrict('Admin', 'Support Agent'), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    await review.destroy()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
})

// POST /api/reviews — user autentificat lasă o recenzie (după hotel_name)
router.post('/', protect, async (req, res) => {
  try {
    const { hotel_name, rating, comment } = req.body
    if (!hotel_name || !rating) return res.status(400).json({ error: 'Missing fields' })
    const hotel = await Hotel.findOne({ where: { name: hotel_name } })
    if (!hotel) return res.status(404).json({ error: 'Hotel not found. Book this hotel first to leave a review.' })
    const review = await Review.create({
      user_id: req.user.id,
      hotel_id: hotel.id,
      rating: parseInt(rating),
      comment,
      is_moderated: false,
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' })
  }
})

module.exports = router