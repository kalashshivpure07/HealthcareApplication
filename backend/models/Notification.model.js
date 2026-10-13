const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['appointment_booked', 'appointment_confirmed', 'appointment_cancelled',
           'appointment_reminder', 'prescription_issued', 'bill_generated',
           'bill_paid', 'lab_result', 'general'],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String },
  isRead:  { type: Boolean, default: false },
  readAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
