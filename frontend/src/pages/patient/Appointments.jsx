import React, { useEffect, useState } from 'react';
import { appointmentAPI } from '../../services/api';
import { format } from 'date-fns';
import { Calendar, Clock, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function StatusBadge({ status }) {
  const map = { Pending: 'badge-warning', Confirmed: 'badge-info', Completed: 'badge-success', Cancelled: 'badge-danger', 'No-show': 'badge-gray' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    appointmentAPI.getAll()
      .then(r => setAppointments(r.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status.toLowerCase() === filter);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await appointmentAPI.cancel(cancelModal._id, { reason: cancelReason });
      setAppointments(prev => prev.map(a => a._id === cancelModal._id ? { ...a, status: 'Cancelled' } : a));
      toast.success('Appointment cancelled successfully.');
      setCancelModal(null);
      setCancelReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="page-sub">Track and manage all your healthcare visits</p>
        </div>
        <Link to="/patient/doctors" className="btn btn-primary">
          <Calendar size={16} /> Book Appointment
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && (
              <span style={{ marginLeft: 6, background: filter === s ? 'var(--primary-100)' : 'var(--gray-200)', color: filter === s ? 'var(--primary-700)' : 'var(--gray-600)', borderRadius: 'var(--radius-full)', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                {appointments.filter(a => a.status.toLowerCase() === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Calendar size={32} /></div>
          <div className="empty-state-title">No appointments found</div>
          <div className="empty-state-text">
            {filter === 'all' ? 'You haven\'t booked any appointments yet.' : `No ${filter} appointments.`}
          </div>
          {filter === 'all' && (
            <Link to="/patient/doctors" className="btn btn-primary" style={{ marginTop: 16 }}>Book Your First Appointment</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(appt => (
            <div key={appt._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Date Box */}
                <div className="appt-date-box">
                  <div className="appt-date-day">{format(new Date(appt.date), 'd')}</div>
                  <div className="appt-date-mon">{format(new Date(appt.date), 'MMM')}</div>
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>
                      Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                    </span>
                    <StatusBadge status={appt.status} />
                    <span className={`badge ${appt.type === 'Emergency' ? 'badge-danger' : 'badge-gray'}`}>{appt.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} /> {format(new Date(appt.date), 'EEEE, dd MMMM yyyy')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <Clock size={13} /> {appt.timeSlot}
                    </span>
                  </div>
                  {appt.doctorProfile && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', marginTop: 4, fontWeight: 500 }}>
                      {appt.doctorProfile.specialization} · {appt.doctorProfile.department}
                    </div>
                  )}
                  {appt.symptoms && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 6, background: 'var(--gray-50)', padding: '6px 10px', borderRadius: 6 }}>
                      <strong>Symptoms:</strong> {appt.symptoms}
                    </div>
                  )}
                  {appt.cancelReason && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertTriangle size={13} /> {appt.cancelReason}
                    </div>
                  )}
                </div>

                {/* Fee + Actions */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-700)' }}>
                    ₹{appt.consultationFee}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>Consultation fee</div>
                  {['Pending', 'Confirmed'].includes(appt.status) && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setCancelModal(appt)}
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--danger)' }}>Cancel Appointment</div>
              <button className="modal-close" onClick={() => setCancelModal(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
              Are you sure you want to cancel your appointment with{' '}
              <strong>Dr. {cancelModal.doctor?.firstName} {cancelModal.doctor?.lastName}</strong> on{' '}
              <strong>{format(new Date(cancelModal.date), 'dd MMM yyyy')}</strong> at <strong>{cancelModal.timeSlot}</strong>?
            </p>
            <div className="form-group">
              <label className="form-label">Reason for cancellation (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Let the doctor know why you're cancelling..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ minHeight: 80 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setCancelModal(null)}>Keep Appointment</button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="spinner" /> : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
