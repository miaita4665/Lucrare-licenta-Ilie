'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const sendTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true, // not accessible via JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

//  Register

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Get default role (Registered User = role id 2)
    // Make sure you seed roles first or adjust this id
    const role = await Role.findOne({
      where: { role_name: 'Registered User' },
    });
    if (!role) {
      return res
        .status(500)
        .json({ message: 'Default role not found. Please seed roles.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone: phone || null,
      role_id: role.id,
    });

    const token = signToken(user.id);
    sendTokenCookie(res, token);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: role.role_name,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res
      .status(500)
      .json({ message: 'Server error during registration.' });
  }
};

// ── Login ─────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // OAuth-only users have no password
    if (!user.password_hash) {
      return res.status(401).json({ message: 'Please log in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    sendTokenCookie(res, token);

    return res.status(200).json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.Role.role_name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// ── Logout ────────────────────────────────────────────────────

const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully.' });
};

// ── Me (get current user) ─────────────────────────────────────

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, attributes: ['role_name'] }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, logout, me };
