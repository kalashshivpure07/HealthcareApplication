const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  department: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  experience: { type: Number, default: 0 }, // years
  qualifications: [{ type: String }],
  bio: { type: String, maxlength: 500 },
  consultationFee: { type: Number, required: true, default: 500 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },

  // Availability schedule
  availability: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: { type: String }, // "09:00"
    endTime:   { type: String }, // "17:00"
    isAvailable: { type: Boolean, default: true },
  }],

  // Time-off / leaves
  leaves: [{
    startDate: Date,
    endDate:   Date,
    reason:    String,
  }],

  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
