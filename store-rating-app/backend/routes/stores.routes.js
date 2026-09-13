const express = require('express');
const router = express.Router();
const { listStores, getStore, submitRating } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('user'));

router.get('/', listStores);
router.get('/:id', getStore);
router.post('/:id/rating', submitRating);
router.put('/:id/rating', submitRating);

module.exports = router;
