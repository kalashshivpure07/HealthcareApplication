const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptions, getPrescriptionById } = require('../controllers/prescription.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getPrescriptions);
router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
