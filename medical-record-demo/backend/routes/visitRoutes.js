const express = require('express');
const router = express.Router({ mergeParams: true });
const Patient = require('../models/Patient');

// GET all visits for a patient
router.get('/', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId, { visits: 1 });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient.visits || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single visit
router.get('/:visitId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const visit = patient.visits.find(v => v.visit_id === req.params.visitId);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add visit to patient
router.post('/', async (req, res) => {
  try {
    const newVisit = req.body;
    // Auto-generate visit_id if not provided
    if (!newVisit.visit_id) {
      newVisit.visit_id = 'V' + Date.now();
    }
    if (!newVisit.visit_date) {
      newVisit.visit_date = new Date();
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.patientId,
      {
        $push: { visits: newVisit },
        $set: {
          last_visit_date: newVisit.visit_date,
          last_specialty: newVisit.specialty_name
        }
      },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.status(201).json(patient.visits[patient.visits.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update visit
router.put('/:visitId', async (req, res) => {
  try {
    const updateFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      updateFields[`visits.$.${key}`] = value;
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.patientId, 'visits.visit_id': req.params.visitId },
      { $set: updateFields },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient or visit not found' });

    const updatedVisit = patient.visits.find(v => v.visit_id === req.params.visitId);
    res.json(updatedVisit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE visit
router.delete('/:visitId', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.patientId,
      { $pull: { visits: { visit_id: req.params.visitId } } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Visit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
