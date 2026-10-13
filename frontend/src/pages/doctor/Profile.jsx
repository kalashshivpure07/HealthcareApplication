import React, { useEffect, useState } from 'react';
import { doctorAPI, userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState({ bio: '', consultationFee: '', experience: '' });
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    doctorAPI.getById(user._id)
      .then(r => {
        const d = r.data.data;
        setDoctorProfile(d);
        setForm({ bio: d.bio || '', consultationFee: d.consultationFee || '', experience: d.experience || '' });
        const avail = DAYS.map(day => {
          const existing = d.availability?.find(a => a.day === day);
          return existing || { day, startTime: '09:00', endTime: '17:00', isAvailable: false };
        });
        setAvailability(avail);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      await doctorAPI.update(user._id, form);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      await doctorAPI.update(user._id, { availability: availability.filter(a => a.isAvailable) });
      toast.success('Availability saved!');
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  const updateDay = (idx, field, value) => {
    setAvailability(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="fade-in">
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="doctor-avatar" style={{ width: 80, height: 80, fontSize: '2rem', flexShrink: 0 }}>
            {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dr. {user?.firstName} {user?.lastName}</h2>
            <div style={{ color: 'var(--primary-600)', fontWeight: 600, marginTop: 2 }}>{doctorProfile?.specialization}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{doctorProfile?.department} · License: {doctorProfile?.licenseNumber}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-success">Verified Doctor</span>
              <span className="badge badge-info">{doctorProfile?.experience} yrs experience</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {['basic', 'availability'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'basic' ? 'Profile & Fees' : 'Availability'}
          </button>
        ))}
      </div>

      {activeTab === 'basic' && (
        <div className="card slide-up">
          <div className="card-header"><div className="card-title">Practice Information</div></div>
          <div className="form-group">
            <label className="form-label">Professional Bio</label>
            <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Brief description of your expertise..." />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              <input type="number" className="form-input" value={form.consultationFee} onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input type="number" className="form-input" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveBasic} disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="card slide-up">
          <div className="card-header"><div className="card-title">Weekly Availability</div></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>Set your working hours for each day of the week. Patients can only book slots during these times.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {availability.map((day, idx) => (
              <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: day.isAvailable ? 'var(--primary-50)' : 'var(--gray-50)', borderRadius: 10, border: `1px solid ${day.isAvailable ? 'var(--primary-200)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
                <input type="checkbox" checked={day.isAvailable} onChange={e => updateDay(idx, 'isAvailable', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary-500)' }} />
                <span style={{ width: 100, fontWeight: 600, fontSize: '0.875rem', color: day.isAvailable ? 'var(--primary-700)' : 'var(--gray-500)' }}>{day.day}</span>
                {day.isAvailable && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={14} color="var(--primary-500)" />
                      <input type="time" value={day.startTime} onChange={e => updateDay(idx, 'startTime', e.target.value)} className="form-input" style={{ width: 120, padding: '6px 10px' }} />
                      <span style={{ color: 'var(--text-muted)' }}>to</span>
                      <input type="time" value={day.endTime} onChange={e => updateDay(idx, 'endTime', e.target.value)} className="form-input" style={{ width: 120, padding: '6px 10px' }} />
                    </div>
                  </>
                )}
                {!day.isAvailable && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not available</span>}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSaveAvailability} disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Save Availability</>}
          </button>
        </div>
      )}
    </div>
  );
}
