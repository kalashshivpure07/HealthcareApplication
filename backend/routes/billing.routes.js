const express = require('express');
const router = express.Router();
const { getBills, getBillById, markAsPaid, createBill } = require('../controllers/billing.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getBills);
router.post('/', protect, authorize('admin'), createBill);
router.get('/:id', protect, getBillById);
router.put('/:id/pay', protect, markAsPaid);

module.exports = router;
