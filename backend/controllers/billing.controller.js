const Billing = require('../models/Billing.model');
const Notification = require('../models/Notification.model');

// @desc    Get all bills
// @route   GET /api/billing
// @access  Private
exports.getBills = async (req, res) => {
  const query = {};
  if (req.user.role === 'patient') query.patient = req.user._id;

  const { status } = req.query;
  if (status) query.status = status;

  const bills = await Billing.find(query)
    .populate('patient', 'firstName lastName email')
    .populate('appointment', 'date timeSlot doctor')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bills.length, data: bills });
};

// @desc    Get single bill
// @route   GET /api/billing/:id
// @access  Private
exports.getBillById = async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone')
    .populate({ path: 'appointment', populate: { path: 'doctor', select: 'firstName lastName' } });

  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
  res.status(200).json({ success: true, data: bill });
};

// @desc    Mark bill as paid
// @route   PUT /api/billing/:id/pay
// @access  Patient, Admin
exports.markAsPaid = async (req, res) => {
  const { paymentMethod } = req.body;
  const bill = await Billing.findById(req.params.id);
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
  if (bill.status === 'Paid') return res.status(400).json({ success: false, message: 'Bill already paid.' });

  bill.status = 'Paid';
  bill.paymentMethod = paymentMethod || 'Cash';
  bill.paymentDate = new Date();
  await bill.save();

  // Notify patient
  const io = req.app.get('io');
  const notif = await Notification.create({
    recipient: bill.patient,
    type: 'bill_paid',
    title: 'Payment Confirmed',
    message: `Your payment of ₹${bill.totalAmount} (Invoice: ${bill.invoiceNumber}) has been confirmed.`,
    link: '/patient/billing',
  });
  if (io) io.to(bill.patient.toString()).emit('notification', notif);

  res.status(200).json({ success: true, data: bill });
};

// @desc    Create a bill manually
// @route   POST /api/billing
// @access  Admin
exports.createBill = async (req, res) => {
  const bill = await Billing.create(req.body);
  res.status(201).json({ success: true, data: bill });
};
