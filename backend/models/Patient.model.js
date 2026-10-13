const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup:  { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  address: {
    street: String,
    city:   String,
    state:  String,
    zip:    String,
  },
  emergencyContact: {
    name:         String,
    relationship: String,
    phone:        String,
  },
  insurance: {
    provider:    String,
    policyNumber:String,
    expiryDate:  Date,
  },
  allergies:        [{ type: String }],
  chronicConditions:[{ type: String }],
  currentMedications:[{
    name:    String,
    dosage:  String,
    frequency:String,
  }],
  medicalHistory: [{
    condition:  String,
    diagnosedOn:Date,
    notes:      String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
