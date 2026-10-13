const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, getAppointmentById, updateAppointmentStatus, cancelAppointment } = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getAppointments);
router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);
router.put('/:id/cancel', protect, authorize('patient'), cancelAppointment);

module.exports = router;
