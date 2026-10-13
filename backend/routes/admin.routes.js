const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, getAnalytics, createDoctor, deleteUser } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const adminOnly = [protect, authorize('admin')];

router.get('/users', ...adminOnly, getAllUsers);
router.put('/users/:id/toggle-status', ...adminOnly, toggleUserStatus);
router.delete('/users/:id', ...adminOnly, deleteUser);
router.get('/analytics', ...adminOnly, getAnalytics);
router.post('/doctors', ...adminOnly, createDoctor);

module.exports = router;
