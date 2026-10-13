const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Appointment = require('../models/Appointment.model');
const Billing = require('../models/Billing.model');
const Prescription = require('../models/Prescription.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcareDB';

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General Medicine', 'Gynecology', 'Ophthalmology'];

const doctorsData = [
  { firstName: 'Arjun', lastName: 'Sharma', email: 'dr.arjun@medcare.com', specialization: 'Cardiologist', department: 'Cardiology', licenseNumber: 'MH-2024-001', experience: 15, consultationFee: 800, bio: 'Senior Cardiologist with 15+ years of experience in interventional cardiology and heart failure management.', qualifications: ['MBBS - AIIMS Delhi', 'MD Cardiology - PGI Chandigarh', 'FACC - American College of Cardiology'] },
  { firstName: 'Priya', lastName: 'Nair', email: 'dr.priya@medcare.com', specialization: 'Neurologist', department: 'Neurology', licenseNumber: 'MH-2024-002', experience: 12, consultationFee: 750, bio: 'Expert Neurologist specializing in stroke management, epilepsy, and movement disorders.', qualifications: ['MBBS - KEM Mumbai', 'DM Neurology - NIMHANS'] },
  { firstName: 'Rahul', lastName: 'Mehta', email: 'dr.rahul@medcare.com', specialization: 'Orthopedic Surgeon', department: 'Orthopedics', licenseNumber: 'MH-2024-003', experience: 10, consultationFee: 700, bio: 'Orthopedic Surgeon specializing in joint replacement, sports injuries, and spine surgery.', qualifications: ['MBBS - Grant Medical College', 'MS Orthopedics - LTMMC'] },
  { firstName: 'Sneha', lastName: 'Patel', email: 'dr.sneha@medcare.com', specialization: 'Pediatrician', department: 'Pediatrics', licenseNumber: 'MH-2024-004', experience: 8, consultationFee: 600, bio: 'Dedicated Pediatrician with expertise in neonatal care, childhood vaccinations, and developmental pediatrics.', qualifications: ['MBBS - BJ Medical College', 'MD Pediatrics - Seth GS Medical College'] },
  { firstName: 'Vikram', lastName: 'Singh', email: 'dr.vikram@medcare.com', specialization: 'Dermatologist', department: 'Dermatology', licenseNumber: 'MH-2024-005', experience: 7, consultationFee: 650, bio: 'Dermatologist specializing in skin diseases, cosmetic dermatology, and hair disorders.', qualifications: ['MBBS - SMS Medical College', 'DVD Dermatology - KMC Manipal'] },
  { firstName: 'Ananya', lastName: 'Krishnan', email: 'dr.ananya@medcare.com', specialization: 'Gynecologist', department: 'Gynecology', licenseNumber: 'MH-2024-006', experience: 11, consultationFee: 700, bio: 'Gynecologist and Obstetrician with extensive experience in high-risk pregnancies and minimally invasive surgery.', qualifications: ['MBBS - Christian Medical College', 'MS Obstetrics & Gynecology - PGIMER'] },
];

const patientsData = [
  { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.kumar@gmail.com', phone: '9876543210', gender: 'Male', bloodGroup: 'O+', dateOfBirth: new Date('1985-03-15'), allergies: ['Penicillin'], chronicConditions: ['Hypertension'] },
  { firstName: 'Meena', lastName: 'Joshi', email: 'meena.joshi@gmail.com', phone: '9876543211', gender: 'Female', bloodGroup: 'A+', dateOfBirth: new Date('1990-07-22'), allergies: [], chronicConditions: ['Diabetes Type 2'] },
  { firstName: 'Suresh', lastName: 'Gupta', email: 'suresh.gupta@gmail.com', phone: '9876543212', gender: 'Male', bloodGroup: 'B+', dateOfBirth: new Date('1978-11-05'), allergies: ['Sulfa drugs'], chronicConditions: [] },
  { firstName: 'Lakshmi', lastName: 'Rao', email: 'lakshmi.rao@gmail.com', phone: '9876543213', gender: 'Female', bloodGroup: 'AB-', dateOfBirth: new Date('1995-02-14'), allergies: [], chronicConditions: ['Asthma'] },
  { firstName: 'Mohan', lastName: 'Das', email: 'mohan.das@gmail.com', phone: '9876543214', gender: 'Male', bloodGroup: 'O-', dateOfBirth: new Date('1968-09-30'), allergies: ['Aspirin'], chronicConditions: ['Arthritis', 'Hypertension'] },
];

const availability = [
  { day: 'Monday',    startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Tuesday',   startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '13:00', isAvailable: true },
  { day: 'Thursday',  startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Friday',    startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Saturday',  startTime: '10:00', endTime: '14:00', isAvailable: true },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Billing.deleteMany({}),
      Prescription.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      firstName: 'System', lastName: 'Admin',
      email: 'admin@medcare.com',
      password: 'Admin@123',
      role: 'admin', phone: '9999999999',
    });
    console.log('👤 Admin created: admin@medcare.com / Admin@123');

    // Create Doctors
    const doctorUsers = [];
    const doctorProfiles = [];
    for (const d of doctorsData) {
      const user = await User.create({ firstName: d.firstName, lastName: d.lastName, email: d.email, password: 'Doctor@123', role: 'doctor', phone: `98765${Math.floor(10000 + Math.random() * 90000)}` });
      const profile = await Doctor.create({ user: user._id, specialization: d.specialization, department: d.department, licenseNumber: d.licenseNumber, experience: d.experience, consultationFee: d.consultationFee, bio: d.bio, qualifications: d.qualifications, availability, rating: (3.5 + Math.random() * 1.5).toFixed(1), totalRatings: Math.floor(50 + Math.random() * 200) });
      doctorUsers.push(user);
      doctorProfiles.push(profile);
    }
    console.log(`👨‍⚕️  Created ${doctorUsers.length} doctors (password: Doctor@123)`);

    // Create Patients
    const patientUsers = [];
    for (const p of patientsData) {
      const user = await User.create({ firstName: p.firstName, lastName: p.lastName, email: p.email, password: 'Patient@123', role: 'patient', phone: p.phone });
      await Patient.create({ user: user._id, gender: p.gender, bloodGroup: p.bloodGroup, dateOfBirth: p.dateOfBirth, allergies: p.allergies, chronicConditions: p.chronicConditions, address: { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zip: '400001' }, emergencyContact: { name: 'Family Member', relationship: 'Spouse', phone: '9000000000' } });
      patientUsers.push(user);
    }
    console.log(`🏥 Created ${patientUsers.length} patients (password: Patient@123)`);

    // Create Appointments
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Completed', 'Confirmed'];
    const slots = ['09:00 - 09:30', '10:00 - 10:30', '11:00 - 11:30', '14:00 - 14:30', '15:00 - 15:30'];
    const types = ['Consultation', 'Follow-up', 'Routine Check'];
    const appointments = [];

    for (let i = 0; i < patientUsers.length; i++) {
      for (let j = 0; j < 2; j++) {
        const daysOffset = Math.floor(Math.random() * 14) - 7;
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + daysOffset);
        apptDate.setHours(0, 0, 0, 0);

        const doctorIdx = (i + j) % doctorUsers.length;
        const status = statuses[(i + j) % statuses.length];
        const fee = doctorProfiles[doctorIdx].consultationFee;

        const appt = await Appointment.create({
          patient: patientUsers[i]._id,
          doctor: doctorUsers[doctorIdx]._id,
          doctorProfile: doctorProfiles[doctorIdx]._id,
          date: apptDate,
          timeSlot: slots[(i + j) % slots.length],
          type: types[j % types.length],
          status,
          symptoms: 'General checkup and routine blood tests',
          consultationFee: fee,
          isPaid: status === 'Completed',
          completedAt: status === 'Completed' ? new Date() : undefined,
        });
        appointments.push(appt);

        // Create bill for completed appointments
        if (status === 'Completed') {
          const tax = Math.round(fee * 0.05);
          await Billing.create({
            patient: patientUsers[i]._id,
            appointment: appt._id,
            items: [
              { description: 'Consultation Fee', quantity: 1, unitPrice: fee, total: fee },
              { description: 'Registration Fee', quantity: 1, unitPrice: 100, total: 100 },
            ],
            subtotal: fee + 100,
            tax,
            totalAmount: fee + 100 + tax,
            status: Math.random() > 0.3 ? 'Paid' : 'Pending',
            paymentMethod: 'Card',
            paymentDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
        }
      }
    }
    console.log(`📅 Created ${appointments.length} appointments with billing records`);

    // Create Prescriptions for completed appointments
    const completedAppts = appointments.filter(a => a.status === 'Completed');
    for (const appt of completedAppts) {
      await Prescription.create({
        appointment: appt._id,
        patient: appt.patient,
        doctor: appt.doctor,
        diagnosis: ['Hypertension Stage 1', 'Type 2 Diabetes', 'Acute Pharyngitis', 'Vitamin D Deficiency'][Math.floor(Math.random() * 4)],
        medicines: [
          { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after breakfast' },
          { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '60 days', instructions: 'Take with meals' },
        ],
        labTests: [{ name: 'Complete Blood Count (CBC)', urgency: 'Routine' }, { name: 'HbA1c', urgency: 'Routine' }],
        notes: 'Patient advised to maintain a low-sodium diet and exercise regularly.',
        followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    console.log(`💊 Created ${completedAppts.length} prescriptions`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@medcare.com   / Admin@123');
    console.log('   Doctor:  dr.arjun@medcare.com / Doctor@123');
    console.log('   Patient: ravi.kumar@gmail.com / Patient@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
