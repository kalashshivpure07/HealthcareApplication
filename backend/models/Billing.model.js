const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  invoiceNumber: { type: String, unique: true },
  items: [{
    description: { type: String, required: true },
    quantity:    { type: Number, default: 1 },
    unitPrice:   { type: Number, required: true },
    total:       { type: Number, required: true },
  }],
  subtotal:    { type: Number, required: true },
  tax:         { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'], default: 'Pending' },
  paymentMethod:{ type: String, enum: ['Cash', 'Card', 'Insurance', 'Online', 'Cheque'] },
  paymentDate: { type: Date },
  insurance: {
    provider:    String,
    policyNumber:String,
    coveredAmount:Number,
  },
  dueDate:     { type: Date },
  notes:       { type: String },
}, { timestamps: true });

// Auto-generate invoice number
billingSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
