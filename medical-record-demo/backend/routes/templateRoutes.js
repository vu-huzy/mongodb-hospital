const express = require('express');
const router = express.Router();
const SpecialtyTemplate = require('../models/SpecialtyTemplate');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');

// GET all specialty templates
router.get('/specialty-templates', async (req, res) => {
  try {
    const templates = await SpecialtyTemplate.find({});
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single specialty template
router.get('/specialty-templates/:code', async (req, res) => {
  try {
    const template = await SpecialtyTemplate.findOne({ specialty_code: req.params.code });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'active' });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all clinics
router.get('/clinics', async (req, res) => {
  try {
    const clinics = await Clinic.find({ status: 'active' });
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
