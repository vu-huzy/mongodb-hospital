import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';

const EMPTY_PATIENT = {
  patient_code: '',
  full_name: '',
  dob: '',
  gender: 'male',
  phone: '',
  address: '',
  clinic_code: ''
};

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PATIENT);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    loadPatients();
    api.get('/clinics').then(r => setClinics(r.data)).catch(() => {});
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load patients' });
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_PATIENT);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      patient_code: p.patient_code,
      full_name: p.full_name,
      dob: p.dob ? p.dob.split('T')[0] : '',
      gender: p.gender || 'male',
      phone: p.phone || '',
      address: p.address || '',
      clinic_code: p.clinic_code || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/patients/${editing}`, form);
        setMsg({ type: 'success', text: 'Patient updated!' });
      } else {
        await api.post('/patients', form);
        setMsg({ type: 'success', text: 'Patient added!' });
      }
      setShowModal(false);
      loadPatients();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Save failed' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      setMsg({ type: 'success', text: 'Patient deleted!' });
      loadPatients();
    } catch (e) {
      setMsg({ type: 'error', text: 'Delete failed' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.patient_code?.toLowerCase().includes(search.toLowerCase())
  );

  const getClinicName = (code) => {
    const c = clinics.find(cl => cl.clinic_code === code);
    return c ? c.clinic_name : code;
  };

  const specialtyBadge = (spec) => {
    const colors = {
      'Cardiology': 'badge-red',
      'Dental': 'badge-yellow',
      'General Medicine': 'badge-green',
      'Respiratory': 'badge-purple'
    };
    return colors[spec] || 'badge-blue';
  };

  return (
    <div className="page-container">
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Management</h1>
          <p className="page-subtitle">{patients.length} patients registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by name, phone, or patient code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading patients...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No patients found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Clinic</th>
                  <th>Last Specialty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{p.patient_code}</span></td>
                    <td>{p.full_name}</td>
                    <td>{p.gender === 'male' ? '♂ Male' : '♀ Female'}</td>
                    <td>{p.phone}</td>
                    <td style={{ fontSize: '0.75rem' }}>{getClinicName(p.clinic_code)}</td>
                    <td>
                      {p.last_specialty && (
                        <span className={`badge ${specialtyBadge(p.last_specialty)}`}>
                          {p.last_specialty}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group">
                        <Link to={`/patients/${p._id}`} className="btn btn-outline btn-sm">View</Link>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editing ? 'Edit Patient' : 'Add New Patient'}</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patient Code *</label>
                <input className="form-control" value={form.patient_code} onChange={e => setForm({...form, patient_code: e.target.value})} placeholder="P006" />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Nguyen Van A" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0912345678" />
              </div>
              <div className="form-group">
                <label className="form-label">Clinic</label>
                <select className="form-control" value={form.clinic_code} onChange={e => setForm({...form, clinic_code: e.target.value})}>
                  <option value="">-- Select --</option>
                  {clinics.map(c => (
                    <option key={c.clinic_code} value={c.clinic_code}>{c.clinic_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Ha Noi" />
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
