const Doctor = require('../models/Doctor.model');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');

// @desc    Get all doctors (with profiles)
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res) => {
  const { specialization, department, search } = req.query;
  
  let userQuery = { role: 'doctor', isActive: true };
  if (search) {
    userQuery.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
    ];
  }

  const doctorUsers = await User.find(userQuery).select('-password');
  const userIds = doctorUsers.map(u => u._id);

  let profileQuery = { user: { $in: userIds }, isApproved: true };
  if (specialization) profileQuery.specialization = { $regex: specialization, $options: 'i' };
  if (department) profileQuery.department = { $regex: department, $options: 'i' };

  const doctorProfiles = await Doctor.find(profileQuery).populate('user', '-password');

  res.status(200).json({ success: true, count: doctorProfiles.length, data: doctorProfiles });
};

// @desc    Get single doctor profile
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.params.id }).populate('user', '-password');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.status(200).json({ success: true, data: doctor });
};

// @desc    Get doctor's available time slots
// @route   GET /api/doctors/:id/slots
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });

  const doctor = await Doctor.findOne({ user: req.params.id });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

  const selectedDate = new Date(date);
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][selectedDate.getDay()];
  const daySchedule = doctor.availability.find(a => a.day === dayName && a.isAvailable);

  if (!daySchedule) {
    return res.status(200).json({ success: true, slots: [], message: 'Doctor not available on this day.' });
  }

  // Generate 30-minute slots
  const slots = [];
  const [startH, startM] = daySchedule.startTime.split(':').map(Number);
  const [endH, endM] = daySchedule.endTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + 30 <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0');
    const m = String(current % 60).padStart(2, '0');
    const nh = String(Math.floor((current + 30) / 60)).padStart(2, '0');
    const nm = String((current + 30) % 60).padStart(2, '0');
    slots.push(`${h}:${m} - ${nh}:${nm}`);
    current += 30;
  }

  // Find booked slots for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23,59,59,999);

  const bookedAppointments = await Appointment.find({
    doctor: req.params.id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['Cancelled'] },
  });

  const bookedSlots = bookedAppointments.map(a => a.timeSlot);
  const availableSlots = slots.filter(s => !bookedSlots.includes(s));

  res.status(200).json({ success: true, slots: availableSlots, bookedSlots });
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Doctor, Admin
exports.updateDoctorProfile = async (req, res) => {
  const allowedFields = ['specialization', 'department', 'experience', 'qualifications', 'bio', 'consultationFee', 'availability'];
  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  const doctor = await Doctor.findOneAndUpdate(
    { user: req.params.id },
    updateData,
    { new: true, runValidators: true }
  ).populate('user', '-password');

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.status(200).json({ success: true, data: doctor });
};

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Doctor, Admin
exports.getDoctorAppointments = async (req, res) => {
  const { status, date } = req.query;
  const query = { doctor: req.params.id };
  if (status) query.status = status;
  if (date) {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end = new Date(date); end.setHours(23,59,59,999);
    query.date = { $gte: start, $lte: end };
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone avatar')
    .sort({ date: 1 });

  res.status(200).json({ success: true, count: appointments.length, data: appointments });
};
