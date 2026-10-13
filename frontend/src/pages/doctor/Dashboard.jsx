import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, prescriptionAPI, doctorAPI } from '../../services/api';
import { Calendar, Users, CheckCircle, Clock, ChevronRight, Activity } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const map = { Pending: 'badge-warning', Confirmed: 'badge-info', Completed: 'badge-success', Cancelled: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAll({ limit: 50 }),
      appointmentAPI.getAll({ date: format(new Date(), 'yyyy-MM-dd') }),
    ]).then(([all, today]) => {
      setAppointments(all.data.data || []);
      setTodayAppts(today.data.data || []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const pending   = appointments.filter(a => a.status === 'Pending').length;
  const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
  const completed = appointments.filter(a => a.status === 'Completed').length;
  const uniquePatients = new Set(appointments.map(a => a.patient?._id)).size;

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-greeting">Good day,</div>
          <div className="hero-title">Dr. {user?.firstName} {user?.lastName}</div>
          <div className="hero-sub">Here's your practice overview. You have <strong style={{ color: 'white' }}>{todayAppts.length}</strong> appointment{todayAppts.length !== 1 ? 's' : ''} today.</div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-value">{todayAppts.length}</div><div className="hero-stat-label">Today's Appointments</div></div>
            <div className="hero-stat"><div className="hero-stat-value">{pending}</div><div className="hero-stat-label">Pending Requests</div></div>
            <div className="hero-stat"><div className="hero-stat-value">{uniquePatients}</div><div className="hero-stat-label">Total Patients</div></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { color: 'green', icon: CheckCircle, value: completed, label: 'Completed', sub: 'All time' },
          { color: 'blue',  icon: Calendar,   value: confirmed, label: 'Confirmed', sub: 'Upcoming' },
          { color: 'orange',icon: Clock,       value: pending,   label: 'Pending Approval', sub: 'Needs action' },
          { color: 'purple',icon: Users,       value: uniquePatients, label: 'Total Patients', sub: 'Unique patients' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}><s.icon size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Today's Appointments</div>
          <Link to="/doctor/appointments" className="btn btn-ghost btn-sm">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><div className="spinner spinner-lg" /></div>
        ) : todayAppts.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-icon"><Calendar size={28} /></div>
            <div className="empty-state-title">No appointments today</div>
            <div className="empty-state-text">Enjoy your free day!</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.map(appt => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {`${appt.patient?.firstName?.[0] || ''}${appt.patient?.lastName?.[0] || ''}`}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{appt.patient?.firstName} {appt.patient?.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.patient?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{appt.timeSlot}</span></td>
                    <td><span className="badge badge-gray">{appt.type}</span></td>
                    <td style={{ maxWidth: 200 }}><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.symptoms || '—'}</span></td>
                    <td><StatusBadge status={appt.status} /></td>
                    <td>
                      {appt.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <ConfirmBtn apptId={appt._id} onUpdate={newAppt => setTodayAppts(prev => prev.map(a => a._id === appt._id ? { ...a, status: newAppt.status } : a))} />
                        </div>
                      )}
                      {appt.status === 'Confirmed' && (
                        <CompleteBtn apptId={appt._id} onUpdate={() => setTodayAppts(prev => prev.map(a => a._id === appt._id ? { ...a, status: 'Completed' } : a))} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmBtn({ apptId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      const r = await appointmentAPI.updateStatus(apptId, { status: 'Confirmed' });
      onUpdate(r.data.data);
      toast.success('Appointment confirmed!');
    } catch { toast.error('Failed.'); }
    finally { setLoading(false); }
  };
  return <button className="btn btn-primary btn-sm" onClick={handle} disabled={loading}>{loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Confirm'}</button>;
}

function CompleteBtn({ apptId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await appointmentAPI.updateStatus(apptId, { status: 'Completed' });
      onUpdate();
      toast.success('Marked as completed!');
    } catch { toast.error('Failed.'); }
    finally { setLoading(false); }
  };
  return <button className="btn btn-secondary btn-sm" onClick={handle} disabled={loading}>{loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Complete'}</button>;
}
