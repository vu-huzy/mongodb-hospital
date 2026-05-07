import { useState, useEffect } from 'react';
import api from '../api/axiosClient';

export default function SmartMedicalForm() {
  const [patients, setPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    patient_id: '',
    specialty_code: '',
    specialty_name: '',
    doctor_code: '',
    clinic_code: '',
    trieu_chung: '',
    chan_doan: '',
    ghi_chu_bac_si: '',
    specialty_data: {},
    custom_metrics: [],
    prescriptions: []
  });

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => { });
    api.get('/specialty-templates').then(r => setTemplates(r.data)).catch(() => { });
    api.get('/doctors').then(r => setDoctors(r.data)).catch(() => { });
    api.get('/clinics').then(r => setClinics(r.data)).catch(() => { });
  }, []);

  const selectedTemplate = templates.find(t => t.specialty_code === form.specialty_code);

  const handleSpecialtyChange = (code) => {
    const tmpl = templates.find(t => t.specialty_code === code);
    setForm(f => ({
      ...f,
      specialty_code: code,
      specialty_name: tmpl ? tmpl.specialty_name : '',
      specialty_data: {}
    }));
  };

  const handleSpecialtyData = (fieldName, value, fieldType) => {
    setForm(f => ({
      ...f,
      specialty_data: {
        ...f.specialty_data,
        [fieldName]: fieldType === 'number' ? (value === '' ? '' : Number(value)) : value
      }
    }));
  };

  const addCustomMetric = () => {
    setForm(f => ({
      ...f,
      custom_metrics: [...f.custom_metrics, { name: '', value: '', unit: '' }]
    }));
  };

  const updateMetric = (idx, field, value) => {
    setForm(f => {
      const metrics = [...f.custom_metrics];
      metrics[idx] = { ...metrics[idx], [field]: value };
      return { ...f, custom_metrics: metrics };
    });
  };

  const removeMetric = (idx) => {
    setForm(f => ({
      ...f,
      custom_metrics: f.custom_metrics.filter((_, i) => i !== idx)
    }));
  };

  const addPrescription = () => {
    setForm(f => ({
      ...f,
      prescriptions: [...f.prescriptions, { medicine_name: '', dosage: '', frequency: '', duration: '', note: '' }]
    }));
  };

  const updatePrescription = (idx, field, value) => {
    setForm(f => {
      const rx = [...f.prescriptions];
      rx[idx] = { ...rx[idx], [field]: value };
      return { ...f, prescriptions: rx };
    });
  };

  const removePrescription = (idx) => {
    setForm(f => ({
      ...f,
      prescriptions: f.prescriptions.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    if (!form.patient_id) { setMsg({ type: 'error', text: 'Please select a patient' }); return; }
    if (!form.specialty_code) { setMsg({ type: 'error', text: 'Please select a specialty' }); return; }
    try {
      const visitData = {
        visit_date: new Date().toISOString(),
        specialty_code: form.specialty_code,
        specialty_name: form.specialty_name,
        doctor_code: form.doctor_code,
        clinic_code: form.clinic_code,
        trieu_chung: form.trieu_chung,
        chan_doan: form.chan_doan,
        ghi_chu_bac_si: form.ghi_chu_bac_si,
        specialty_data: form.specialty_data,
        custom_metrics: form.custom_metrics.filter(m => m.name),
        prescriptions: form.prescriptions.filter(p => p.medicine_name)
      };
      await api.post(`/patients/${form.patient_id}/visits`, visitData);
      setMsg({ type: 'success', text: 'Visit saved successfully!' });
      // Reset form
      setForm({
        patient_id: '',
        specialty_code: '',
        specialty_name: '',
        doctor_code: '',
        clinic_code: '',
        trieu_chung: '',
        chan_doan: '',
        ghi_chu_bac_si: '',
        specialty_data: {},
        custom_metrics: [],
        prescriptions: []
      });
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Save failed' });
    }
    setTimeout(() => setMsg(null), 4000);
  };

  // Build JSON preview
  const jsonPreview = {
    patient_id: form.patient_id || undefined,
    specialty_code: form.specialty_code || undefined,
    specialty_name: form.specialty_name || undefined,
    doctor_code: form.doctor_code || undefined,
    clinic_code: form.clinic_code || undefined,
    trieu_chung: form.trieu_chung || undefined,
    chan_doan: form.chan_doan || undefined,
    ghi_chu_bac_si: form.ghi_chu_bac_si || undefined,
    specialty_data: Object.keys(form.specialty_data).length > 0 ? form.specialty_data : undefined,
    custom_metrics: form.custom_metrics.length > 0 ? form.custom_metrics : undefined,
    prescriptions: form.prescriptions.length > 0 ? form.prescriptions : undefined
  };
  // Remove undefined keys
  Object.keys(jsonPreview).forEach(k => jsonPreview[k] === undefined && delete jsonPreview[k]);

  return (
    <div className="page-container">
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Medical Form</h1>
          <p className="page-subtitle">Dynamic form renders fields based on selected specialty</p>
        </div>
      </div>

      <div className="split-layout">
        {/* LEFT: Form */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">📝 Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-control" value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.patient_code} - {p.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Specialty *</label>
                <select className="form-control" value={form.specialty_code} onChange={e => handleSpecialtyChange(e.target.value)}>
                  <option value="">-- Select Specialty --</option>
                  {templates.map(t => <option key={t.specialty_code} value={t.specialty_code}>{t.specialty_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Doctor (Reference)</label>
                <select className="form-control" value={form.doctor_code} onChange={e => setForm({ ...form, doctor_code: e.target.value })}>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(d => <option key={d.doctor_code} value={d.doctor_code}>{d.full_name} ({d.specialty})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Clinic (Reference)</label>
                <select className="form-control" value={form.clinic_code} onChange={e => setForm({ ...form, clinic_code: e.target.value })}>
                  <option value="">-- Select Clinic --</option>
                  {clinics.map(c => <option key={c.clinic_code} value={c.clinic_code}>{c.clinic_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Triệu chứng</label>
              <textarea className="form-control" rows="2" value={form.trieu_chung} onChange={e => setForm({ ...form, trieu_chung: e.target.value })} placeholder="Mô tả triệu chứng..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Chẩn đoán</label>
                <input className="form-control" value={form.chan_doan} onChange={e => setForm({ ...form, chan_doan: e.target.value })} placeholder="Chẩn đoán..." />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú bác sĩ</label>
                <input className="form-control" value={form.ghi_chu_bac_si} onChange={e => setForm({ ...form, ghi_chu_bac_si: e.target.value })} placeholder="Ghi chú..." />
              </div>
            </div>
          </div>

          {/* Dynamic Specialty Fields */}
          {selectedTemplate && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 className="card-title">⚕️ {selectedTemplate.specialty_name} Fields</h3>
              <div className="form-row">
                {selectedTemplate.fields.map(field => (
                  <div className="form-group" key={field.field_name}>
                    <label className="form-label">{field.label} {field.required && '*'}</label>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      className="form-control"
                      value={form.specialty_data[field.field_name] || ''}
                      onChange={e => handleSpecialtyData(field.field_name, e.target.value, field.type)}
                      placeholder={field.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Metrics */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">📊 Custom Metrics</h3>
            {form.custom_metrics.map((m, i) => (
              <div className="list-item" key={i}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={m.name} onChange={e => updateMetric(i, 'name', e.target.value)} placeholder="SpO2" />
                </div>
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <input className="form-control" value={m.value} onChange={e => updateMetric(i, 'value', e.target.value)} placeholder="97" />
                </div>
                <div className="form-group" style={{ maxWidth: 80 }}>
                  <label className="form-label">Unit</label>
                  <input className="form-control" value={m.unit} onChange={e => updateMetric(i, 'unit', e.target.value)} placeholder="%" />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeMetric(i)}>✕</button>
              </div>
            ))}
            <button className="btn btn-outline" onClick={addCustomMetric}>+ Thêm chỉ số tùy chỉnh</button>
          </div>

          {/* Prescriptions */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">💊 Prescriptions (Embedded)</h3>
            {form.prescriptions.map((p, i) => (
              <div className="list-item" key={i} style={{ flexWrap: 'wrap' }}>
                <div className="form-group">
                  <label className="form-label">Medicine</label>
                  <input className="form-control" value={p.medicine_name} onChange={e => updatePrescription(i, 'medicine_name', e.target.value)} placeholder="Paracetamol" />
                </div>
                <div className="form-group" style={{ maxWidth: 100 }}>
                  <label className="form-label">Dosage</label>
                  <input className="form-control" value={p.dosage} onChange={e => updatePrescription(i, 'dosage', e.target.value)} placeholder="500mg" />
                </div>
                <div className="form-group" style={{ maxWidth: 120 }}>
                  <label className="form-label">Frequency</label>
                  <input className="form-control" value={p.frequency} onChange={e => updatePrescription(i, 'frequency', e.target.value)} placeholder="2 times/day" />
                </div>
                <div className="form-group" style={{ maxWidth: 90 }}>
                  <label className="form-label">Duration</label>
                  <input className="form-control" value={p.duration} onChange={e => updatePrescription(i, 'duration', e.target.value)} placeholder="3 days" />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removePrescription(i)}>✕</button>
              </div>
            ))}
            <button className="btn btn-outline" onClick={addPrescription}>+ Thêm thuốc</button>
          </div>

          <button className="btn btn-success" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} onClick={handleSave}>
            💾 Save Visit
          </button>
        </div>

        {/* RIGHT: JSON Preview */}
        <div>
          <div style={{ position: 'sticky', top: 76 }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              📄 Raw JSON Document (Realtime)
            </h3>
            <pre className="json-preview">{JSON.stringify(jsonPreview, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
