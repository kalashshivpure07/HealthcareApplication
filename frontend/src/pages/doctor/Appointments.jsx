import React, { useEffect, useState } from 'react';
import { appointmentAPI, prescriptionAPI } from '../../services/api';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, X, CheckCircle, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

function StatusBadge({ status }) {
  const map = { Pending: 'badge-warning', Confirmed: 'badge-info', Completed: 'badge-success', Cancelled: 'badge-danger', 'No-show': 'badge-gray' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

function PrescriptionModal({ appointment, onClose, onSuccess }) {
  const [form, setForm] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    labTests: [],
    notes: '',
    followUpDate: '',
  });
  const [saving, setSaving] = useState(false);

  const addMedicine = () => setForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] }));
  const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateMedicine = (i, field, value) => setForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: value } : m) }));

  const handleSubmit = async () => {
    if (!form.diagnosis || !form.medicines[0].name)
      return toast.error('Please fill diagnosis and at least one medicine.');
    setSaving(true);
    try {
      await prescriptionAPI.create({
        appointmentId: appointment._id,
        patientId: appointment.patient?._id,
        ...form,
        followUpDate: form.followUpDate || undefined,
      });
      toast.success('Prescription issued successfully!');
      onSuccess();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create prescription.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Issue Prescription</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ background: 'var(--primary-50)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: '0.875rem' }}>
          Patient: <strong>{appointment.patient?.firstName} {appointment.patient?.lastName}</strong> · {appointment.timeSlot}
        </div>
        <div className="form-group">
          <label className="form-label">Diagnosis <span className="required">*</span></label>
          <input className="form-input" placeholder="e.g. Hypertension Stage 1" value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Medicines <span className="required">*</span></label>
            <button className="btn btn-ghost btn-sm" onClick={addMedicine} style={{ fontSize: '0.8rem' }}>+ Add Medicine</button>
          </div>
          {form.medicines.map((m, i) => (
            <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)' }}>Medicine {i + 1}</span>
                {i > 0 && <button className="btn btn-ghost btn-sm" onClick={() => removeMedicine(i)} style={{ color: 'var(--danger)', padding: '2px 6px' }}>Remove</button>}
              </div>
              <div className="form-grid" style={{ gap: 8 }}>
                <input className="form-input" placeholder="Medicine name*" value={m.name} onChange={e => updateMedicine(i, 'name', e.target.value)} style={{ fontSize: '0.82rem' }} />
                <input className="form-input" placeholder="Dosage (e.g. 5mg)" value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} style={{ fontSize: '0.82rem' }} />
                <input className="form-input" placeholder="Frequency (e.g. Twice daily)" value={m.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} style={{ fontSize: '0.82rem' }} />
                <input className="form-input" placeholder="Duration (e.g. 30 days)" value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} style={{ fontSize: '0.82rem' }} />
              </div>
              <input className="form-input" placeholder="Instructions (e.g. Take after meals)" value={m.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} style={{ fontSize: '0.82rem', marginTop: 8 }} />
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Notes for Patient</label>
          <textarea className="form-textarea" placeholder="Dietary advice, precautions, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: 70 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Follow-up Date</label>
          <input type="date" className="form-input" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : <><Pill size={14} /> Issue Prescription</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [prescModal, setPrescModal] = useState(null);

  const load = () => {
    appointmentAPI.getAll()
      .then(r => setAppointments(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status.toLowerCase() === filter);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status.toLowerCase()}!`);
    } catch { toast.error('Failed to update.'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub">Manage all your patient appointments</p>
        </div>
      </div>

      <div className="tabs">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ marginLeft: 6, background: filter === s ? 'var(--primary-100)' : 'var(--gray-200)', color: filter === s ? 'var(--primary-700)' : 'var(--gray-600)', borderRadius: 'var(--radius-full)', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
              {s === 'all' ? appointments.length : appointments.filter(a => a.status.toLowerCase() === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><Calendar size={32} /></div><div className="empty-state-title">No appointments</div></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Symptoms</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => (
                <tr key={appt._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {`${appt.patient?.firstName?.[0] || ''}${appt.patient?.lastName?.[0] || ''}`}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{appt.patient?.firstName} {appt.patient?.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.patient?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{format(new Date(appt.date), 'dd MMM yyyy')}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{appt.timeSlot}</div>
                  </td>
                  <td><span className="badge badge-gray">{appt.type}</span></td>
                  <td style={{ maxWidth: 180 }}><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.symptoms || '—'}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-700)' }}>₹{appt.consultationFee}</td>
                  <td><StatusBadge status={appt.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {appt.status === 'Pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(appt._id, 'Confirmed')}>Confirm</button>
                      )}
                      {appt.status === 'Confirmed' && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(appt._id, 'Completed')}>Complete</button>
                          <button className="btn btn-sm" style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6 }} onClick={() => setPrescModal(appt)}>
                            <Pill size={12} /> Prescribe
                          </button>
                        </>
                      )}
                      {appt.status === 'Completed' && (
                        <button className="btn btn-sm" style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6 }} onClick={() => setPrescModal(appt)}>
                          <Pill size={12} /> Prescribe
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {prescModal && (
        <PrescriptionModal
          appointment={prescModal}
          onClose={() => setPrescModal(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
