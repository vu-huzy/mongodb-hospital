const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicine_name: String,
  dosage: String,
  frequency: String,
  duration: String,
  note: String
}, { _id: false });

const customMetricSchema = new mongoose.Schema({
  name: String,
  value: mongoose.Schema.Types.Mixed,
  unit: String
}, { _id: false });

const visitSchema = new mongoose.Schema({
  visit_id: String,
  visit_date: Date,
  specialty_code: String,
  specialty_name: String,
  doctor_code: String,
  clinic_code: String,
  trieu_chung: String,
  chan_doan: String,
  ghi_chu_bac_si: String,
  specialty_data: mongoose.Schema.Types.Mixed,
  custom_metrics: [customMetricSchema],
  prescriptions: [prescriptionSchema]
}, { _id: false });

const patientSchema = new mongoose.Schema({
  patient_code: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  dob: Date,
  gender: String,
  phone: String,
  address: String,
  clinic_code: String,
  last_visit_date: Date,
  last_specialty: String,
  visits: [visitSchema]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema, 'patients');
