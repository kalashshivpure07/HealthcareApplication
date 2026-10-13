import React, { useEffect, useState } from 'react';
import { prescriptionAPI } from '../../services/api';
import { FileText, Pill, TestTube, CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function PrescriptionCard({ prescription }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary-100), #d1fae5)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={22} color="var(--primary-600)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>{prescription.diagnosis}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {format(new Date(prescription.createdAt), 'dd MMM yyyy')}
            </span>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {prescription.medicines?.length} medicine{prescription.medicines?.length !== 1 ? 's' : ''}
          </div>
          {expanded ? <ChevronUp size={18} color="var(--gray-400)" /> : <ChevronDown size={18} color="var(--gray-400)" />}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }} className="slide-up">
          {/* Medicines */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Pill size={16} color="var(--primary-600)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Medicines</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {prescription.medicines?.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {m.dosage} · {m.frequency} · {m.duration}
                    </div>
                    {m.instructions && <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', marginTop: 2 }}>{m.instructions}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Tests */}
          {prescription.labTests?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <TestTube size={16} color="var(--info)" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Lab Tests</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {prescription.labTests.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dbeafe', borderRadius: 8, padding: '6px 12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>{t.name}</span>
                    <span className={`badge ${t.urgency === 'STAT' ? 'badge-danger' : t.urgency === 'Urgent' ? 'badge-warning' : 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>{t.urgency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes + Follow-up */}
          {(prescription.notes || prescription.followUpDate) && (
            <div style={{ display: 'flex', gap: 12 }}>
              {prescription.notes && (
                <div style={{ flex: 1, background: '#fefce8', borderRadius: 8, padding: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#92400e', marginBottom: 4 }}>Doctor's Notes</div>
                  <div style={{ fontSize: '0.82rem', color: '#78350f' }}>{prescription.notes}</div>
                </div>
              )}
              {prescription.followUpDate && (
                <div style={{ background: 'var(--primary-50)', borderRadius: 8, padding: '12px', border: '1px solid var(--primary-200)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarClock size={20} color="var(--primary-600)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary-800)' }}>Follow-up Date</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                      {format(new Date(prescription.followUpDate), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getAll()
      .then(r => setPrescriptions(r.data.data || []))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Prescriptions</h1>
          <p className="page-sub">All prescriptions issued by your doctors</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
          {prescriptions.length} Total
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={32} /></div>
          <div className="empty-state-title">No prescriptions yet</div>
          <div className="empty-state-text">Prescriptions issued after your consultations will appear here</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {prescriptions.map(p => <PrescriptionCard key={p._id} prescription={p} />)}
        </div>
      )}
    </div>
  );
}
