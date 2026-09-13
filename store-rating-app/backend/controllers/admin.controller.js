const bcrypt = require('bcryptjs');
const pool = require('../db');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRole,
} = require('../utils/validators');

const SORTABLE_USER_FIELDS = ['name', 'email', 'address', 'role', 'created_at'];
const SORTABLE_STORE_FIELDS = ['name', 'email', 'address', 'rating', 'owner_name'];

function safeSort(field, allowed, fallback) {
  return allowed.includes(field) ? field : fallback;
}

function safeOrder(order) {
  return String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

// GET /api/admin/dashboard
async function getDashboard(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    return res.status(200).json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ message: 'Could not load dashboard statistics.' });
  }
}

// GET /api/admin/users?search=&role=&sortBy=&order=
async function listUsers(req, res) {
  try {
    const { search = '', role = '', sortBy = 'created_at', order = 'desc' } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortField = safeSort(sortBy, SORTABLE_USER_FIELDS, 'created_at');
    const sortOrder = safeOrder(order);

    const [rows] = await pool.query(
      `SELECT id, name, email, address, role, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}`,
      params
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ message: 'Could not load users.' });
  }
}

// POST /api/admin/users
// Admin can create normal users, store owners, or other admins.
async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    const errors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const addressErr = validateAddress(address);
    const passwordErr = validatePassword(password);
    const roleErr = validateRole(role);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (addressErr) errors.address = addressErr;
    if (passwordErr) errors.password = passwordErr;
    if (roleErr) errors.role = roleErr;

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
      [name.trim(), email.trim(), hashed, address.trim(), role]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ message: 'User created successfully.', user: rows[0] });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Could not create user.' });
  }
}

// GET /api/admin/users/:id
// Includes store/rating info if the user is a store owner.
async function getUserDetails(req, res) {
  try {
    const { id } = req.params;
    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];
    let stores = [];

    if (user.role === 'owner') {
      const [storeRows] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address,
                COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
                COUNT(r.id) AS totalRatings
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
        [id]
      );
      stores = storeRows;
    }

    return res.status(200).json({ user, stores });
  } catch (err) {
    console.error('Get user details error:', err);
    return res.status(500).json({ message: 'Could not load user details.' });
  }
}

// GET /api/admin/stores?search=&sortBy=&order=
async function listStores(req, res) {
  try {
    const { search = '', sortBy = 'name', order = 'asc' } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortField = safeSort(sortBy, SORTABLE_STORE_FIELDS, 'name');
    const sortOrder = safeOrder(order);

    const sortColumn = sortField === 'rating' ? 'averageRating' : sortField === 'owner_name' ? 'ownerName' : `s.${sortField}`;

    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
              u.name AS ownerName,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
              COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN users u ON u.id = s.owner_id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id, u.name
       ORDER BY ${sortColumn} ${sortOrder}`,
      params
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('List stores error:', err);
    return res.status(500).json({ message: 'Could not load stores.' });
  }
}

// POST /api/admin/stores
async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors = {};
    if (!name || name.trim().length === 0 || name.trim().length > 60) {
      errors.name = 'Store name is required and must not exceed 60 characters.';
    }
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const addressErr = validateAddress(address);
    if (addressErr) errors.address = addressErr;
    if (!ownerId) {
      errors.ownerId = 'Please select a store owner.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const [ownerRows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
    if (ownerRows.length === 0 || ownerRows[0].role !== 'owner') {
      return res.status(400).json({ message: 'Selected owner is invalid. Choose an existing Store Owner account.' });
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), address.trim(), ownerId]
    );

    const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [result.insertId]);

    return res.status(201).json({ message: 'Store created successfully.', store: rows[0] });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ message: 'Could not create store.' });
  }
}

// GET /api/admin/owners - helper endpoint to populate the owner-selection dropdown
async function listOwners(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'owner' ORDER BY name ASC"
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error('List owners error:', err);
    return res.status(500).json({ message: 'Could not load store owners.' });
  }
}

module.exports = {
  getDashboard,
  listUsers,
  createUser,
  getUserDetails,
  listStores,
  createStore,
  listOwners,
};
