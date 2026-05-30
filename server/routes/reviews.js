const express = require('express')
const router = express.Router()
const { Review, User, Hotel } = require('../models')
const { protect, restrict } = require('../middleware/authMiddleware')

// GET /api/reviews — admin only
router.get('/', protect, restrict('Admin'), async (req, res) => {
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

// DELETE /api/reviews/:id — admin only
router.delete('/:id', protect, restrict('Admin'), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    await review.destroy()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' })
  }
})

// POST /api/reviews — logged in user leaves a review
router.post('/', protect, async (req, res) => {
  try {
    const { hotel_id, rating, comment } = req.body
    if (!hotel_id || !rating) return res.status(400).json({ error: 'Missing fields' })
    const review = await Review.create({
      user_id: req.user.id,
      hotel_id,
      rating,
      comment,
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' })
  }
})

module.exports = router