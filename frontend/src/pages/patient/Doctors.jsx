import React, { useEffect, useState } from 'react';
import { doctorAPI, appointmentAPI } from '../../services/api';
import { Search, Star, Clock, DollarSign, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

function DoctorCard({ doctor, onBook }) {
  const user = doctor.user || {};
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  return (
    <div className="doctor-card" onClick={() => onBook(doctor)}>
      <div className="doctor-card-header">
        <div className="doctor-avatar">{initials}</div>
        <div>
          <div className="doctor-name">Dr. {user.firstName} {user.lastName}</div>
          <div className="doctor-spec">{doctor.specialization}</div>
          <div className="doctor-dept">{doctor.department}</div>
        </div>
      </div>
      <div className="doctor-card-body">
        <div className="doctor-meta">
          <div className="doctor-meta-item">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{Number(doctor.rating).toFixed(1)} ({doctor.totalRatings} reviews)</span>
          </div>
          <div className="doctor-meta-item">
            <Clock size={13} />
            <span>{doctor.experience} yrs exp</span>
          </div>
        </div>
        {doctor.bio && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
            {doctor.bio.length > 100 ? doctor.bio.slice(0, 100) + '…' : doctor.bio}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="doctor-fee">₹{doctor.consultationFee} <span>/ visit</span></div>
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onBook(doctor); }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ doctor, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('Consultation');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const user = doctor.user || {};

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await doctorAPI.getSlots(user._id, date);
      setSlots(res.data.slots || []);
      if (res.data.slots?.length === 0) toast('No available slots on this date.', { icon: 'ℹ️' });
    } catch { toast.error('Failed to load time slots.'); }
    finally { setLoadingSlots(false); }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return toast.error('Please select a date and time slot.');
    setBooking(true);
    try {
      await appointmentAPI.book({
        doctorId: user._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type, symptoms,
      });
      toast.success('Appointment booked successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment.');
    } finally { setBooking(false); }
  };

  // Min date = today
  const today = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Book Appointment</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Doctor info summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--primary-50)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20 }}>
          <div className="doctor-avatar" style={{ width: 48, height: 48, fontSize: '1rem', flexShrink: 0 }}>
            {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Dr. {user.firstName} {user.lastName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}>{doctor.specialization}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation: ₹{doctor.consultationFee}</div>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Select Date <span className="required">*</span></label>
            <input type="date" className="form-input" min={today} max={maxDate} value={selectedDate} onChange={e => handleDateChange(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Appointment Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              {['Consultation', 'Follow-up', 'Emergency', 'Routine Check'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedDate && (
          <div className="form-group">
            <label className="form-label">Available Time Slots <span className="required">*</span></label>
            {loadingSlots ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 38, width: 120, borderRadius: 8 }} />)}
              </div>
            ) : slots.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '12px 0' }}>
                No available slots for this date.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {slots.map(slot => (
                  <button
                    key={slot}
                    className={`btn btn-sm ${selectedSlot === slot ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedSlot(slot)}
                    style={{ borderRadius: 8 }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Symptoms / Reason for Visit</label>
          <textarea
            className="form-textarea"
            placeholder="Briefly describe your symptoms or reason for the visit..."
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            style={{ minHeight: 80 }}
          />
        </div>

        {selectedSlot && (
          <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: '0.875rem', color: 'var(--primary-800)' }}>
            <strong>Booking summary:</strong> {format(new Date(selectedDate), 'EEEE, dd MMMM yyyy')} at {selectedSlot} · ₹{doctor.consultationFee}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleBook} disabled={booking || !selectedSlot}>
            {booking ? <span className="spinner" /> : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  useEffect(() => {
    doctorAPI.getAll()
      .then(r => setDoctors(r.data.data || []))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const name = `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !specFilter || d.specialization === specFilter;
    return matchSearch && matchSpec;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Find Doctors</h1>
          <p className="page-sub">Browse our team of specialists and book your appointment</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
          {doctors.length} Doctors Available
        </span>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar">
          <Search size={16} color="var(--gray-400)" />
          <input placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 200 }} value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
          <option value="">All Specializations</option>
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || specFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSpecFilter(''); }}>
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="doctor-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ height: 120, background: 'var(--gray-100)' }} className="skeleton" />
              <div style={{ padding: 20 }}>
                <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, marginBottom: 16, width: '50%' }} />
                <div className="skeleton" style={{ height: 36, width: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={28} /></div>
          <div className="empty-state-title">No doctors found</div>
          <div className="empty-state-text">Try a different search or clear the filters</div>
        </div>
      ) : (
        <div className="doctor-grid">
          {filtered.map(d => (
            <DoctorCard key={d._id} doctor={d} onBook={setBookingDoctor} />
          ))}
        </div>
      )}

      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
