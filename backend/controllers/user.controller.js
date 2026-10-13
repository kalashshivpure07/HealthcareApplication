const User = require('../models/User.model');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.status(200).json({ success: true, data: user });
};

// @desc    Update user profile (name, phone, avatar)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select('-password');
  res.status(200).json({ success: true, data: user });
};
