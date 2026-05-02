import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewVisit, setViewVisit] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    loadPatient();
    api.get('/doctors').then(r => setDoctors(r.data)).catch(() => {});
    api.get('/clinics').then(r => setClinics(r.data)).catch(() => {});
  }, [id]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load patient' });
    }
    setLoading(false);
  };

  const deleteVisit = async (visitId) => {
    if (!confirm('Delete this visit?')) return;
    try {
      await api.delete(`/patients/${id}/visits/${visitId}`);
      setMsg({ type: 'success', text: 'Visit deleted!' });
      loadPatient();
    } catch (e) {
      setMsg({ type: 'error', text: 'Delete failed' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const getName = (list, codeField, nameField, code) => {
    const item = list.find(x => x[codeField] === code);
    return item ? item[nameField] : code;
  };

  if (loading) return <div className="page-container"><div className="loading"><div className="spinner" /> Loading...</div></div>;
  if (!patient) return <div className="page-container"><p>Patient not found</p></div>;

  const visits = patient.visits || [];

  return (
    <div className="page-container">
      <Link to="/" className="back-link">← Back to Patient List</Link>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">📋 Patient Information</h2>
        <div className="detail-grid">
          {[
            ['Patient Code', patient.patient_code],
            ['Full Name', patient.full_name],
            ['DOB', patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'],
            ['Gender', patient.gender === 'male' ? '♂ Male' : '♀ Female'],
            ['Phone', patient.phone],
            ['Address', patient.address],
            ['Clinic', getName(clinics, 'clinic_code', 'clinic_name', patient.clinic_code)],
            ['Last Specialty', patient.last_specialty || 'N/A'],
          ].map(([label, value]) => (
            <div className="detail-item" key={label}>
              <span className="detail-label">{label}</span>
              <span className="detail-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>🩺 Visit History ({visits.length})</h2>
          <Link to="/smart-form" className="btn btn-primary btn-sm">+ Add Visit</Link>
        </div>

        {visits.length === 0 ? (
          <div className="empty-state"><p>No visits recorded</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Visit ID</th><th>Date</th><th>Specialty</th><th>Doctor</th><th>Diagnosis</th><th>Actions</th></tr></thead>
              <tbody>
                {visits.map((v, i) => (
                  <tr key={v.visit_id || i}>
                    <td style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{v.visit_id}</td>
                    <td>{v.visit_date ? new Date(v.visit_date).toLocaleDateString() : ''}</td>
                    <td><span className="badge badge-blue">{v.specialty_name || v.specialty_code}</span></td>
                    <td>{getName(doctors, 'doctor_code', 'full_name', v.doctor_code)}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.chan_doan}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-outline btn-sm" onClick={() => setViewVisit(v)}>View JSON</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteVisit(v.visit_id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewVisit && (
        <div className="modal-overlay" onClick={() => setViewVisit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Visit {viewVisit.visit_id}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setViewVisit(null)}>✕</button>
            </div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>RAW JSON DOCUMENT</h4>
            <pre className="visit-detail-json">{JSON.stringify(viewVisit, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
