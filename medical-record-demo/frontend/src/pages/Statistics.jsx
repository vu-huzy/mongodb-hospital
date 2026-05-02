import { useState, useEffect } from 'react';
import api from '../api/axiosClient';

export default function Statistics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/statistics/diagnosis-frequency');
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Group by month for summary
  const monthSummary = {};
  data.forEach(d => {
    if (!monthSummary[d.month]) monthSummary[d.month] = { total: 0, specialties: new Set() };
    monthSummary[d.month].total += d.count;
    monthSummary[d.month].specialties.add(d.specialty_name);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Statistics</h1>
          <p className="page-subtitle">Diagnosis frequency by month and specialty (Aggregation Pipeline)</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">Unique Diagnoses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{Object.keys(monthSummary).length}</div>
          <div className="stat-label">Months with Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>{data.reduce((s, d) => s + d.count, 0)}</div>
          <div className="stat-label">Total Visits</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">📊 Diagnosis Frequency</h3>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : data.length === 0 ? (
          <div className="empty-state"><p>No statistics data available</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Specialty</th>
                  <th>Diagnosis</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-purple">{d.month}</span></td>
                    <td><span className="badge badge-blue">{d.specialty_name}</span></td>
                    <td>{d.chan_doan}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>{d.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Aggregation Pipeline Info */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">🔧 Aggregation Pipeline Used</h3>
        <pre className="json-preview" style={{ position: 'static' }}>{JSON.stringify([
          { "$unwind": "$visits" },
          { "$group": { "_id": { "month": { "$dateToString": { "format": "%Y-%m", "date": "$visits.visit_date" } }, "specialty": "$visits.specialty_name", "diagnosis": "$visits.chan_doan" }, "count": { "$sum": 1 } } },
          { "$project": { "_id": 0, "month": "$_id.month", "specialty_name": "$_id.specialty", "chan_doan": "$_id.diagnosis", "count": 1 } },
          { "$sort": { "month": 1, "specialty_name": 1, "count": -1 } }
        ], null, 2)}</pre>
      </div>
    </div>
  );
}
