const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorProfile:{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date:        { type: Date, required: true },
  timeSlot:    { type: String, required: true }, // "09:00 - 09:30"
  type:        { type: String, enum: ['Consultation', 'Follow-up', 'Emergency', 'Routine Check'], default: 'Consultation' },
  status:      { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show'], default: 'Pending' },
  symptoms:    { type: String },
  notes:       { type: String },
  consultationFee: { type: Number },
  isPaid:      { type: Boolean, default: false },
  cancelledBy: { type: String, enum: ['patient', 'doctor', 'admin'] },
  cancelReason:{ type: String },
  completedAt: { type: Date },
}, { timestamps: true });

// Index for efficient queries
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
