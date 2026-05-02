require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const templateRoutes = require('./routes/templateRoutes');
const searchRoutes = require('./routes/searchRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

app.use('/api/patients', patientRoutes);
app.use('/api/patients/:patientId/visits', visitRoutes);
app.use('/api', templateRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB:', MONGODB_URI);

    // Create indexes
    const Patient = require('./models/Patient');
    try {
      await Patient.collection.createIndex({
        'visits.trieu_chung': 'text',
        'visits.ghi_chu_bac_si': 'text'
      });
      console.log('Text index created on visits.trieu_chung and visits.ghi_chu_bac_si');
    } catch (e) {
      if (e.code === 85 || e.code === 86) {
        console.log('Text index already exists');
      } else {
        console.log('Text index creation note:', e.message);
      }
    }

    try {
      await Patient.collection.createIndex({ 'visits.specialty_code': 1 });
      await Patient.collection.createIndex({ 'visits.visit_date': 1 });
      await Patient.collection.createIndex({ 'visits.doctor_code': 1 });
      console.log('Filter indexes created');
    } catch (e) {
      console.log('Filter indexes note:', e.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
