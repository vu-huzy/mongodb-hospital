const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinic_code: { type: String, required: true, unique: true },
  clinic_name: { type: String, required: true },
  address: String,
  phone: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema, 'clinics');
