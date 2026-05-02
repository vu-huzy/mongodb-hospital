const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctor_code: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  specialty: String,
  clinic_code: String,
  phone: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema, 'doctors');
