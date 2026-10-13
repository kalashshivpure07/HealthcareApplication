const Patient = require('../models/Patient.model');
const User = require('../models/User.model');

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Patient
exports.getMyProfile = async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id }).populate('user', '-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });
  res.status(200).json({ success: true, data: patient });
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Patient
exports.updateMyProfile = async (req, res) => {
  const allowedFields = ['dateOfBirth','gender','bloodGroup','address','emergencyContact','insurance','allergies','chronicConditions','currentMedications'];
  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  const patient = await Patient.findOneAndUpdate(
    { user: req.user._id },
    updateData,
    { new: true, runValidators: true, upsert: true }
  ).populate('user', '-password');

  // Also update user basic info if provided
  if (req.body.phone || req.body.firstName || req.body.lastName) {
    const userUpdate = {};
    if (req.body.phone) userUpdate.phone = req.body.phone;
    if (req.body.firstName) userUpdate.firstName = req.body.firstName;
    if (req.body.lastName) userUpdate.lastName = req.body.lastName;
    await User.findByIdAndUpdate(req.user._id, userUpdate);
  }

  res.status(200).json({ success: true, data: patient });
};

// @desc    Get patient by ID (admin/doctor)
// @route   GET /api/patients/:id
// @access  Doctor, Admin
exports.getPatientById = async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.id }).populate('user', '-password');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
  res.status(200).json({ success: true, data: patient });
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Admin, Doctor
exports.getAllPatients = async (req, res) => {
  const { search } = req.query;
  let userQuery = { role: 'patient' };
  if (search) {
    userQuery.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
  }
  const patientUsers = await User.find(userQuery).select('-password');
  const userIds = patientUsers.map(u => u._id);
  const patients = await Patient.find({ user: { $in: userIds } }).populate('user', '-password');
  res.status(200).json({ success: true, count: patients.length, data: patients });
};
