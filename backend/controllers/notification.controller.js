const Notification = require('../models/Notification.model');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ success: true, count: notifications.length, data: notifications });
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  res.status(200).json({ success: true, data: notif });
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Notification deleted.' });
};
