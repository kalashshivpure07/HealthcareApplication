import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText, CreditCard, TrendingUp, ChevronRight, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, prescriptionAPI, billingAPI } from '../../services/api';
import { format, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-warning', Confirmed: 'badge-info', Completed: 'badge-success',
    Cancelled: 'badge-danger', 'No-show': 'badge-gray',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

function formatApptDate(date) {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'dd MMM yyyy');
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAll({ limit: 5 }),
      prescriptionAPI.getAll(),
      billingAPI.getAll({ status: 'Pending' }),
    ]).then(([a, p, b]) => {
      setAppointments(a.data.data || []);
      setPrescriptions(p.data.data || []);
      setBills(b.data.data || []);
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['Pending', 'Confirmed'].includes(a.status));
  const pendingBillsTotal = bills.reduce((s, b) => s + b.totalAmount, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-greeting">👋 Welcome back,</div>
          <div className="hero-title">{user?.firstName} {user?.lastName}</div>
          <div className="hero-sub">Here's your health summary for today. Stay on top of your appointments and health records.</div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{upcoming.length}</div>
              <div className="hero-stat-label">Upcoming Appts</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{prescriptions.length}</div>
              <div className="hero-stat-label">Prescriptions</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">₹{pendingBillsTotal.toLocaleString()}</div>
              <div className="hero-stat-label">Pending Bills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { color: 'green', icon: Calendar, value: upcoming.length, label: 'Upcoming Appointments', sub: 'Pending + Confirmed' },
          { color: 'blue',  icon: FileText,  value: prescriptions.length, label: 'Active Prescriptions', sub: 'From your doctors' },
          { color: 'orange',icon: CreditCard, value: bills.length, label: 'Pending Bills', sub: `₹${pendingBillsTotal.toLocaleString()} total` },
          { color: 'purple',icon: Stethoscope, value: appointments.filter(a => a.status === 'Completed').length, label: 'Completed Visits', sub: 'All time' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Appointments</div>
            <Link to="/patient/appointments" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon"><Calendar size={28} /></div>
              <div className="empty-state-title">No upcoming appointments</div>
              <div className="empty-state-text">Book an appointment with a doctor</div>
              <Link to="/patient/doctors" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Find Doctors
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.slice(0, 4).map(appt => (
                <div key={appt._id} className="appt-card">
                  <div className="appt-date-box">
                    <div className="appt-date-day">{format(new Date(appt.date), 'd')}</div>
                    <div className="appt-date-mon">{format(new Date(appt.date), 'MMM')}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                      Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <Clock size={12} />
                      {appt.timeSlot} · {formatApptDate(appt.date)}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span className={`badge ${appt.type === 'Emergency' ? 'badge-danger' : 'badge-info'}`}>{appt.type}</span>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Prescriptions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Prescriptions</div>
            <Link to="/patient/prescriptions" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {prescriptions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon"><FileText size={28} /></div>
              <div className="empty-state-title">No prescriptions yet</div>
              <div className="empty-state-text">Prescriptions from your doctors will appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {prescriptions.slice(0, 4).map(p => (
                <div key={p._id} style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{p.diagnosis}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Dr. {p.doctor?.firstName} {p.doctor?.lastName}
                      </div>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {p.medicines?.slice(0, 2).map((m, i) => (
                      <span key={i} style={{ fontSize: '0.72rem', background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                        {m.name}
                      </span>
                    ))}
                    {(p.medicines?.length || 0) > 2 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 0' }}>
                        +{p.medicines.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Bills */}
      {bills.length > 0 && (
        <div className="card" style={{ marginTop: 20, borderLeft: '4px solid var(--warning)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={20} color="var(--warning)" />
              <span className="card-title">Pending Bills</span>
            </div>
            <Link to="/patient/billing" className="btn btn-primary btn-sm">Pay Now</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {bills.slice(0, 3).map(bill => (
              <div key={bill._id} style={{ padding: '14px 16px', background: '#fff7ed', borderRadius: 'var(--radius)', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{bill.invoiceNumber}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due: {bill.dueDate ? format(new Date(bill.dueDate), 'dd MMM') : 'N/A'}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#c2410c' }}>₹{bill.totalAmount?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
