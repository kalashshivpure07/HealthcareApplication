const Prescription = require('../models/Prescription.model');
const Notification = require('../models/Notification.model');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Doctor
exports.createPrescription = async (req, res) => {
  const { appointmentId, patientId, diagnosis, medicines, labTests, notes, followUpDate } = req.body;

  const prescription = await Prescription.create({
    appointment: appointmentId,
    patient: patientId,
    doctor: req.user._id,
    diagnosis, medicines, labTests, notes, followUpDate,
  });

  const io = req.app.get('io');
  const notif = await Notification.create({
    recipient: patientId,
    sender: req.user._id,
    type: 'prescription_issued',
    title: 'New Prescription',
    message: `Dr. ${req.user.firstName} ${req.user.lastName} has issued you a new prescription for ${diagnosis}.`,
    link: '/patient/prescriptions',
  });
  if (io) io.to(patientId.toString()).emit('notification', notif);

  await prescription.populate([
    { path: 'patient', select: 'firstName lastName' },
    { path: 'doctor',  select: 'firstName lastName' },
  ]);

  res.status(201).json({ success: true, data: prescription });
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  const query = {};
  if (req.user.role === 'patient') query.patient = req.user._id;
  else if (req.user.role === 'doctor') query.doctor = req.user._id;

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'firstName lastName email')
    .populate('doctor',  'firstName lastName')
    .populate('appointment', 'date timeSlot')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescriptionById = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor',  'firstName lastName')
    .populate('appointment');

  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
  res.status(200).json({ success: true, data: prescription });
};
