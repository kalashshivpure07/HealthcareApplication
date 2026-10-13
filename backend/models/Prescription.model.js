const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis:   { type: String, required: true },
  medicines: [{
    name:      { type: String, required: true },
    dosage:    { type: String, required: true },
    frequency: { type: String, required: true },
    duration:  { type: String, required: true },
    instructions: { type: String },
  }],
  labTests: [{
    name:        String,
    instructions:String,
    urgency:     { type: String, enum: ['Routine', 'Urgent', 'STAT'], default: 'Routine' },
  }],
  notes:        { type: String },
  followUpDate: { type: Date },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
