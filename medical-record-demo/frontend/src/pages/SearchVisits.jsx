import { useState, useEffect } from 'react';
import api from '../api/axiosClient';

export default function SearchVisits() {
  const [templates, setTemplates] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({ q: '', specialty: '', doctor: '', from: '', to: '' });

  useEffect(() => {
    api.get('/specialty-templates').then(r => setTemplates(r.data)).catch(() => {});
    api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.doctor) params.doctor = filters.doctor;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await api.get('/search/visits', { params });
      setResults(res.data);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  };

  const getDoctorName = (code) => {
    const d = doctors.find(doc => doc.doctor_code === code);
    return d ? d.full_name : code;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Search & Filter Visits</h1>
          <p className="page-subtitle">Full-text search on symptoms and doctor notes</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="filters-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Keyword (triệu chứng / ghi chú / chẩn đoán)</label>
            <input className="form-control" value={filters.q} onChange={e => setFilters({...filters, q: e.target.value})} placeholder="sốt, đau răng, khó thở..." />
          </div>
          <div className="form-group">
            <label className="form-label">Specialty</label>
            <select className="form-control" value={filters.specialty} onChange={e => setFilters({...filters, specialty: e.target.value})}>
              <option value="">All</option>
              {templates.map(t => <option key={t.specialty_code} value={t.specialty_code}>{t.specialty_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Doctor</label>
            <select className="form-control" value={filters.doctor} onChange={e => setFilters({...filters, doctor: e.target.value})}>
              <option value="">All</option>
              {doctors.map(d => <option key={d.doctor_code} value={d.doctor_code}>{d.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} />
          </div>
          <div className="form-group" style={{ flex: 'none' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-primary" onClick={handleSearch}>🔍 Search</button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /> Searching...</div>
        ) : !searched ? (
          <div className="empty-state"><p>Enter filters and click Search</p></div>
        ) : results.length === 0 ? (
          <div className="empty-state"><p>No results found</p></div>
        ) : (
          <>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Found {results.length} visit(s)</p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Specialty</th>
                    <th>Doctor</th>
                    <th>Symptoms</th>
                    <th>Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.patient_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.patient_code}</div>
                      </td>
                      <td>{r.visit_date ? new Date(r.visit_date).toLocaleDateString() : ''}</td>
                      <td><span className="badge badge-blue">{r.specialty_name}</span></td>
                      <td>{getDoctorName(r.doctor_code)}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.trieu_chung}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.chan_doan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
