const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// GET /api/statistics/diagnosis-frequency
router.get('/diagnosis-frequency', async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$visits' },
      {
        $group: {
          _id: {
            month: {
              $dateToString: {
                format: '%Y-%m',
                date: '$visits.visit_date'
              }
            },
            specialty: '$visits.specialty_name',
            diagnosis: '$visits.chan_doan'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          specialty_name: '$_id.specialty',
          chan_doan: '$_id.diagnosis',
          count: 1
        }
      },
      {
        $sort: {
          month: 1,
          specialty_name: 1,
          count: -1
        }
      }
    ];

    const results = await Patient.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
