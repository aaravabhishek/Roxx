const express = require('express');
const router = express.Router();
const {
  getDashboard,
  listUsers,
  createUser,
  getUserDetails,
  listStores,
  createStore,
  listOwners,
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserDetails);

router.get('/stores', listStores);
router.post('/stores', createStore);

router.get('/owners', listOwners);

module.exports = router;
