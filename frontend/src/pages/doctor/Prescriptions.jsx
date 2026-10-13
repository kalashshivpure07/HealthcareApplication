import React, { useEffect, useState } from 'react';
import { prescriptionAPI } from '../../services/api';
import { FileText, Pill } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getAll()
      .then(r => setPrescriptions(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issued Prescriptions</h1>
          <p className="page-sub">All prescriptions you have issued to patients</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>{prescriptions.length} Total</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><FileText size={32} /></div><div className="empty-state-title">No prescriptions issued yet</div></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Issued On</th><th>Follow-up</th></tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.patient?.firstName} {p.patient?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.patient?.email}</div>
                  </td>
                  <td><span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{p.diagnosis}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.medicines?.slice(0,2).map((m, i) => <span key={i} className="badge badge-gray">{m.name}</span>)}
                      {(p.medicines?.length || 0) > 2 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{p.medicines.length - 2}</span>}
                    </div>
                  </td>
                  <td>{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                  <td>{p.followUpDate ? <span className="badge badge-info">{format(new Date(p.followUpDate), 'dd MMM yyyy')}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
