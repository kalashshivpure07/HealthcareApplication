const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateProfile } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);

module.exports = router;
