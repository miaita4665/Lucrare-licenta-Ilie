'use strict';
const router = require('express').Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { restrict } = require('../middleware/authMiddleware')
const { register,  
  login, 
  logout, 
  me, 
  updateMe, 
  changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

//  Validation rules

const registerRules = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', registerRules, validate, register);

router.post('/login', loginRules, validate, login);

router.post('/logout', logout);

router.get('/me', protect, me);

router.patch('/me', protect, updateMe); 

router.patch('/me/password', protect, changePassword);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// GET /api/auth/google/callback  → Google redirects back here
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  (req, res) => {
    // Issue JWT and set cookie
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend after successful OAuth
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);
// GET /api/auth/users — all users (admin only)
router.get('/users', protect, restrict('Admin'), async (req, res) => {
  try {
    const { User, Role } = require('../models')
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, attributes: ['role_name'] }],
      order: [['created_at', 'DESC']],
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})
// PATCH /api/auth/users/:id/role — change role (admin only, not to Admin)
router.patch('/users/:id/role', protect, restrict('Admin'), async (req, res) => {
  try {
    const { User, Role } = require('../models')
    const { role_name } = req.body

    if (!['Registered User', 'Support Agent'].includes(role_name)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const role = await Role.findOne({ where: { role_name } })
    if (!role) return res.status(404).json({ error: 'Role not found' })

    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    await user.update({ role_id: role.id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' })
  }
})


module.exports = router;
