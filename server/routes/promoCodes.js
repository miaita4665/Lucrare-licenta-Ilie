const express = require('express')
const router = express.Router()
const { PromoCode } = require('../models')
const { protect, restrict } = require('../middleware/authMiddleware')

// GET /api/promo-codes
router.get('/', protect, restrict('Admin'), async (req, res) => {
  try {
    const codes = await PromoCode.findAll({ order: [['id', 'DESC']] })
    res.json(codes)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch promo codes' })
  }
})

// POST /api/promo-codes
router.post('/', protect, restrict('Admin'), async (req, res) => {
  try {
    const { code, discount_percent, valid_until } = req.body
    if (!code || !discount_percent || !valid_until) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discount_percent,
      valid_until,
      created_by_admin_id: req.user.id,
    })
    res.status(201).json(promo)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create promo code' })
  }
})

// DELETE /api/promo-codes/:id
router.delete('/:id', protect, restrict('Admin'), async (req, res) => {
  try {
    const promo = await PromoCode.findByPk(req.params.id)
    if (!promo) return res.status(404).json({ error: 'Not found' })
    await promo.destroy()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete promo code' })
  }
})
// GET /api/promo-codes/validate?code=SUMMER20
router.get('/validate', protect, async (req, res) => {
  try {
    const code = (req.query.code ?? '').toUpperCase().trim()
    if (!code) return res.status(400).json({ error: 'No code provided' })

    const promo = await PromoCode.findOne({ where: { code } })
    if (!promo) return res.status(404).json({ error: 'Invalid promo code' })

    if (new Date(promo.valid_until) < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' })
    }

    res.json({ code: promo.code, discount_percent: parseFloat(promo.discount_percent) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate promo code' })
  }
})
module.exports = router