const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// GET /api/search/visits?q=...&specialty=...&doctor=...&from=...&to=...
router.get('/visits', async (req, res) => {
  try {
    const { q, specialty, doctor, from, to } = req.query;
    
    const pipeline = [
      { $unwind: '$visits' }
    ];

    const matchConditions = {};

    // Text search on symptoms and doctor notes
    if (q) {
      matchConditions.$or = [
        { 'visits.trieu_chung': { $regex: q, $options: 'i' } },
        { 'visits.ghi_chu_bac_si': { $regex: q, $options: 'i' } },
        { 'visits.chan_doan': { $regex: q, $options: 'i' } }
      ];
    }

    if (specialty) {
      matchConditions['visits.specialty_code'] = specialty;
    }

    if (doctor) {
      matchConditions['visits.doctor_code'] = doctor;
    }

    if (from || to) {
      matchConditions['visits.visit_date'] = {};
      if (from) matchConditions['visits.visit_date'].$gte = new Date(from);
      if (to) matchConditions['visits.visit_date'].$lte = new Date(to + 'T23:59:59');
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push({
      $project: {
        patient_code: 1,
        patient_name: '$full_name',
        visit_id: '$visits.visit_id',
        visit_date: '$visits.visit_date',
        specialty_code: '$visits.specialty_code',
        specialty_name: '$visits.specialty_name',
        doctor_code: '$visits.doctor_code',
        trieu_chung: '$visits.trieu_chung',
        chan_doan: '$visits.chan_doan',
        ghi_chu_bac_si: '$visits.ghi_chu_bac_si'
      }
    });

    pipeline.push({ $sort: { visit_date: -1 } });
    pipeline.push({ $limit: 100 });

    const results = await Patient.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
