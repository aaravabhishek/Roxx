const express = require('express');
const router = express.Router();
const { getDashboard, listMyStores, getStoreRatings } = require('../controllers/owner.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('owner'));

router.get('/dashboard', getDashboard);
router.get('/stores', listMyStores);
router.get('/stores/:id/ratings', getStoreRatings);

module.exports = router;
