const pool = require('../db');
const { validateRating } = require('../utils/validators');

// GET /api/stores?search=
// Returns all stores with overall rating and the current user's own rating.
async function listStores(req, res) {
  try {
    const { search = '' } = req.query;
    const userId = req.user.id;

    const conditions = [];
    const params = [userId];

    let query = `
      SELECT s.id, s.name, s.address,
             COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
             COUNT(r.id) AS totalRatings,
             ur.rating AS userRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
    `;

    if (search) {
      conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' GROUP BY s.id, ur.rating ORDER BY s.name ASC';

    const [rows] = await pool.query(query, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('List stores (user) error:', err);
    return res.status(500).json({ message: 'Could not load stores.' });
  }
}

// GET /api/stores/:id
async function getStore(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
              COUNT(r.id) AS totalRatings,
              ur.rating AS userRating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
       WHERE s.id = ?
       GROUP BY s.id, ur.rating`,
      [userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Get store error:', err);
    return res.status(500).json({ message: 'Could not load store.' });
  }
}

// POST /api/stores/:id/rating - create a new rating
// PUT /api/stores/:id/rating - update an existing rating
// Both are implemented with an upsert so a duplicate submission never
// creates a second row (unique constraint on user_id + store_id).
async function submitRating(req, res) {
  try {
    const { id: storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ message: ratingErr });
    }

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [userId, storeId, rating]
    );

    return res.status(200).json({ message: 'Your rating has been saved.', rating: Number(rating) });
  } catch (err) {
    console.error('Submit rating error:', err);
    return res.status(500).json({ message: 'Could not save your rating.' });
  }
}

// GET /api/user/dashboard - simple dashboard summary for the logged-in user
async function getDashboard(req, res) {
  try {
    const userId = req.user.id;
    const [[{ storesRated }]] = await pool.query(
      'SELECT COUNT(*) AS storesRated FROM ratings WHERE user_id = ?',
      [userId]
    );
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');

    return res.status(200).json({ storesRated, totalStores });
  } catch (err) {
    console.error('User dashboard error:', err);
    return res.status(500).json({ message: 'Could not load dashboard.' });
  }
}

module.exports = { listStores, getStore, submitRating, getDashboard };
