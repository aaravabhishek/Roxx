const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/auth/register
// Public registration always creates a Normal User (role = 'user').
async function register(req, res) {
  try {
    const { name, email, address, password } = req.body;

    const errors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const addressErr = validateAddress(address);
    const passwordErr = validatePassword(password);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (addressErr) errors.address = addressErr;
    if (passwordErr) errors.password = passwordErr;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), hashed, address.trim(), 'user']
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Something went wrong while registering. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.status(200).json({ message: 'Login successful.', token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Something went wrong while logging in. Please try again.' });
  }
}

// PUT /api/auth/change-password (protected, all roles)
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      return res.status(400).json({ message: passwordErr });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Something went wrong while changing the password.' });
  }
}

module.exports = { register, login, changePassword, sanitizeUser };
