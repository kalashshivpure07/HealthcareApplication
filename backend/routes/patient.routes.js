const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getPatientById, getAllPatients } = require('../controllers/patient.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/profile', protect, authorize('patient'), getMyProfile);
router.put('/profile', protect, authorize('patient'), updateMyProfile);
router.get('/', protect, authorize('admin', 'doctor'), getAllPatients);
router.get('/:id', protect, authorize('admin', 'doctor'), getPatientById);

module.exports = router;
