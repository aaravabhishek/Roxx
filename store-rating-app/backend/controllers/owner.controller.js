const pool = require('../db');

// Helper: confirms a store belongs to the currently logged-in owner.
async function assertOwnsStore(storeId, ownerId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE id = ? AND owner_id = ?', [
    storeId,
    ownerId,
  ]);
  return rows.length > 0;
}

// GET /api/owner/dashboard
async function getDashboard(req, res) {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
              COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [ownerId]
    );

    return res.status(200).json({ stores });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    return res.status(500).json({ message: 'Could not load dashboard.' });
  }
}

// GET /api/owner/stores
async function listMyStores(req, res) {
  try {
    const ownerId = req.user.id;
    const [stores] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
              COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [ownerId]
    );
    return res.status(200).json(stores);
  } catch (err) {
    console.error('List my stores error:', err);
    return res.status(500).json({ message: 'Could not load your stores.' });
  }
}

// GET /api/owner/stores/:id/ratings
// Only returns data if the store belongs to the logged-in owner.
async function getStoreRatings(req, res) {
  try {
    const { id: storeId } = req.params;
    const ownerId = req.user.id;

    const owns = await assertOwnsStore(storeId, ownerId);
    if (!owns) {
      return res.status(403).json({ message: 'You do not have access to this store.' });
    }

    const [ratings] = await pool.query(
      `SELECT u.id AS userId, u.name AS userName, u.email AS userEmail,
              r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    const [[{ averageRating }]] = await pool.query(
      'SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS averageRating FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.status(200).json({ ratings, averageRating, totalRatings: ratings.length });
  } catch (err) {
    console.error('Get store ratings error:', err);
    return res.status(500).json({ message: 'Could not load ratings for this store.' });
  }
}

module.exports = { getDashboard, listMyStores, getStoreRatings };
