import React, { useEffect, useState } from 'react';
import { patientAPI, userAPI } from '../../services/api';
import { User, Mail, Phone, Droplet, Calendar, MapPin, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [basicForm, setBasicForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [medForm, setMedForm] = useState({ gender: '', bloodGroup: '', dateOfBirth: '', allergies: '', chronicConditions: '' });

  useEffect(() => {
    patientAPI.getProfile()
      .then(r => {
        const p = r.data.data;
        setProfile(p);
        setBasicForm({ firstName: p.user?.firstName || '', lastName: p.user?.lastName || '', phone: p.user?.phone || '' });
        setMedForm({
          gender: p.gender || '',
          bloodGroup: p.bloodGroup || '',
          dateOfBirth: p.dateOfBirth ? format(new Date(p.dateOfBirth), 'yyyy-MM-dd') : '',
          allergies: (p.allergies || []).join(', '),
          chronicConditions: (p.chronicConditions || []).join(', '),
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(basicForm);
      updateUser({ ...user, ...basicForm });
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const handleSaveMedical = async () => {
    setSaving(true);
    try {
      await patientAPI.updateProfile({
        ...medForm,
        allergies: medForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: medForm.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Medical information updated!');
    } catch { toast.error('Failed to update medical info.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>;

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <div className="fade-in">
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="doctor-avatar" style={{ width: 80, height: 80, fontSize: '2rem', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user?.firstName} {user?.lastName}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-success">Patient</span>
              {profile?.bloodGroup && <span className="badge badge-danger">Blood: {profile.bloodGroup}</span>}
              {profile?.gender && <span className="badge badge-gray">{profile.gender}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['basic', 'medical', 'insurance'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'basic' ? 'Basic Info' : t === 'medical' ? 'Medical Info' : 'Insurance'}
          </button>
        ))}
      </div>

      {activeTab === 'basic' && (
        <div className="card slide-up">
          <div className="card-header">
            <div className="card-title">Personal Information</div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input className="form-input" value={basicForm.firstName} onChange={e => setBasicForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input className="form-input" value={basicForm.lastName} onChange={e => setBasicForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input className="form-input" value={user?.email} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-icon-wrapper">
              <Phone size={16} className="input-icon" />
              <input className="form-input" value={basicForm.phone} onChange={e => setBasicForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveBasic} disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      )}

      {activeTab === 'medical' && (
        <div className="card slide-up">
          <div className="card-header"><div className="card-title">Medical Information</div></div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={medForm.gender} onChange={e => setMedForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Select gender</option>
                {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={medForm.bloodGroup} onChange={e => setMedForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <div className="input-icon-wrapper">
              <Calendar size={16} className="input-icon" />
              <input type="date" className="form-input" value={medForm.dateOfBirth} onChange={e => setMedForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Known Allergies</label>
            <div className="input-icon-wrapper">
              <AlertCircle size={16} className="input-icon" />
              <input className="form-input" value={medForm.allergies} onChange={e => setMedForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Penicillin, Sulfa drugs (comma-separated)" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Chronic Conditions</label>
            <input className="form-input" value={medForm.chronicConditions} onChange={e => setMedForm(f => ({ ...f, chronicConditions: e.target.value }))} placeholder="Diabetes, Hypertension (comma-separated)" />
          </div>
          <button className="btn btn-primary" onClick={handleSaveMedical} disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Save Medical Info</>}
          </button>
        </div>
      )}

      {activeTab === 'insurance' && (
        <div className="card slide-up">
          <div className="card-header"><div className="card-title">Insurance Details</div></div>
          {profile?.insurance?.provider ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Provider', profile.insurance.provider],
                ['Policy Number', profile.insurance.policyNumber],
                ['Expiry Date', profile.insurance.expiryDate ? format(new Date(profile.insurance.expiryDate), 'dd MMM yyyy') : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-title">No insurance info added</div>
              <div className="empty-state-text">Contact admin to update your insurance details</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
