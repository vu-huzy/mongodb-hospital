const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  field_name: String,
  label: String,
  type: { type: String, default: 'string' },
  required: { type: Boolean, default: false }
}, { _id: false });

const specialtyTemplateSchema = new mongoose.Schema({
  specialty_code: { type: String, required: true, unique: true },
  specialty_name: { type: String, required: true },
  fields: [fieldSchema]
}, { timestamps: true });

module.exports = mongoose.model('SpecialtyTemplate', specialtyTemplateSchema, 'specialty_templates');
