const Appointment = require('../models/Appointment.model');
const Doctor = require('../models/Doctor.model');
const Notification = require('../models/Notification.model');
const Billing = require('../models/Billing.model');

// Helper: send notification via Socket.IO
const sendNotification = async (io, recipientId, notification) => {
  const notif = await Notification.create(notification);
  if (io) io.to(recipientId.toString()).emit('notification', notif);
  return notif;
};

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Patient
exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, type, symptoms, notes } = req.body;

  // Check if slot is still available
  const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);
  const existingBooking = await Appointment.findOne({
    doctor: doctorId, date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot, status: { $nin: ['Cancelled'] },
  });
  if (existingBooking) {
    return res.status(400).json({ success: false, message: 'This time slot is already booked.' });
  }

  // Get doctor fee
  const doctorProfile = await Doctor.findOne({ user: doctorId });
  const consultationFee = doctorProfile?.consultationFee || 500;

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    doctorProfile: doctorProfile?._id,
    date: new Date(date),
    timeSlot, type, symptoms, notes,
    consultationFee,
  });

  const io = req.app.get('io');

  // Notify doctor
  await sendNotification(io, doctorId, {
    recipient: doctorId,
    sender: req.user._id,
    type: 'appointment_booked',
    title: 'New Appointment Request',
    message: `${req.user.firstName} ${req.user.lastName} has booked an appointment on ${new Date(date).toDateString()} at ${timeSlot}.`,
    link: `/doctor/appointments`,
  });

  await appointment.populate([
    { path: 'patient', select: 'firstName lastName email phone' },
    { path: 'doctor',  select: 'firstName lastName email' },
  ]);

  res.status(201).json({ success: true, data: appointment });
};

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private (filtered by role)
exports.getAppointments = async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === 'patient') query.patient = req.user._id;
  else if (req.user.role === 'doctor') query.doctor = req.user._id;

  if (status) query.status = status;
  if (date) {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    query.date = { $gte: start, $lte: end };
  }

  const total = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone avatar')
    .populate('doctor', 'firstName lastName email avatar')
    .populate('doctorProfile', 'specialization department consultationFee')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ date: -1 });

  res.status(200).json({ success: true, total, data: appointments });
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone avatar')
    .populate('doctor', 'firstName lastName email avatar')
    .populate('doctorProfile', 'specialization department consultationFee');

  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
  res.status(200).json({ success: true, data: appointment });
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Doctor, Admin
exports.updateAppointmentStatus = async (req, res) => {
  const { status, cancelReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  appointment.status = status;
  if (status === 'Cancelled') {
    appointment.cancelledBy = req.user.role;
    appointment.cancelReason = cancelReason || 'No reason provided';
  }
  if (status === 'Completed') appointment.completedAt = new Date();
  await appointment.save();

  const io = req.app.get('io');

  // Notify patient
  await sendNotification(io, appointment.patient, {
    recipient: appointment.patient,
    sender: req.user._id,
    type: status === 'Confirmed' ? 'appointment_confirmed' : 'appointment_cancelled',
    title: `Appointment ${status}`,
    message: `Your appointment on ${appointment.date.toDateString()} at ${appointment.timeSlot} has been ${status.toLowerCase()}.`,
    link: `/patient/appointments`,
  });

  // If completed, auto-generate bill
  if (status === 'Completed') {
    await Billing.create({
      patient: appointment.patient,
      appointment: appointment._id,
      items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: appointment.consultationFee, total: appointment.consultationFee }],
      subtotal: appointment.consultationFee,
      tax: Math.round(appointment.consultationFee * 0.05),
      totalAmount: Math.round(appointment.consultationFee * 1.05),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  res.status(200).json({ success: true, data: appointment });
};

// @desc    Cancel appointment (by patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Patient
exports.cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
  if (appointment.patient.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  if (['Completed', 'Cancelled'].includes(appointment.status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment.` });
  }

  appointment.status = 'Cancelled';
  appointment.cancelledBy = 'patient';
  appointment.cancelReason = req.body.reason || 'Cancelled by patient';
  await appointment.save();

  const io = req.app.get('io');
  await sendNotification(io, appointment.doctor, {
    recipient: appointment.doctor,
    sender: req.user._id,
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: `${req.user.firstName} ${req.user.lastName} cancelled the appointment on ${appointment.date.toDateString()} at ${appointment.timeSlot}.`,
    link: `/doctor/appointments`,
  });

  res.status(200).json({ success: true, data: appointment });
};
