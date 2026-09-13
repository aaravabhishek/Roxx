const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('user'));

router.get('/dashboard', getDashboard);

module.exports = router;
