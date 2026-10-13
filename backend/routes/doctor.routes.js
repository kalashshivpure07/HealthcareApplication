const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, getAvailableSlots, updateDoctorProfile, getDoctorAppointments } = require('../controllers/doctor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', protect, getAvailableSlots);
router.get('/:id/appointments', protect, authorize('doctor', 'admin'), getDoctorAppointments);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctorProfile);

module.exports = router;
