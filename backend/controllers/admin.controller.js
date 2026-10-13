const User = require('../models/User.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Appointment = require('../models/Appointment.model');
const Billing = require('../models/Billing.model');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, total, page: Number(page), data: users });
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Admin
exports.getAnalytics = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    totalRevenue,
    pendingBills,
  ] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ status: 'Pending' }),
    Appointment.countDocuments({ status: 'Completed' }),
    Billing.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Billing.aggregate([{ $match: { status: 'Pending' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);

  // Last 7 days appointments
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyAppointments = await Appointment.aggregate([
    { $match: { date: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRevenue = await Billing.aggregate([
    { $match: { status: 'Paid', createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingBillsAmount: pendingBills[0]?.total || 0,
      weeklyAppointments,
      monthlyRevenue,
    },
  });
};

// @desc    Create a doctor account
// @route   POST /api/admin/doctors
// @access  Admin
exports.createDoctor = async (req, res) => {
  const { firstName, lastName, email, password, phone, specialization, department, licenseNumber, experience, qualifications, bio, consultationFee, availability } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, message: 'Email already in use.' });

  const user = await User.create({ firstName, lastName, email, password, role: 'doctor', phone });
  const doctor = await Doctor.create({
    user: user._id, specialization, department, licenseNumber,
    experience, qualifications, bio, consultationFee, availability,
  });

  res.status(201).json({ success: true, data: { user, doctor } });
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin accounts.' });

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'User deleted successfully.' });
};
