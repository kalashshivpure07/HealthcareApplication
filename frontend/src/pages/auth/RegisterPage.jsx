import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Heart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password)
      return toast.error('Please fill in all required fields.');
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match.');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register({ ...form, role: 'patient' });
      toast.success('Account created! Welcome to MedCare.');
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, color: 'white', maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={28} fill="white" strokeWidth={0} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.8rem' }}>MedCare</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Join thousands of patients managing their health better.
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.85, lineHeight: 1.7 }}>
            Create your free account to book appointments, access medical records, and manage your healthcare journey — all in one place.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card slide-up">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Heart size={22} fill="white" strokeWidth={0} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.3rem' }}>MedCare</span>
          </div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">Register as a patient to get started</p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name <span className="required">*</span></label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input id="reg-first" name="firstName" type="text" className="form-input" placeholder="John" value={form.firstName} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name <span className="required">*</span></label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input id="reg-last" name="lastName" type="text" className="form-input" placeholder="Doe" value={form.lastName} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@email.com" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone size={16} className="input-icon" />
                <input id="reg-phone" name="phone" type="tel" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password <span className="required">*</span></label>
                <div className="input-icon-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="reg-pwd" name="password" type={showPwd ? 'text' : 'password'}
                    className="form-input" placeholder="Min 6 chars"
                    value={form.password} onChange={handleChange}
                    style={{ paddingRight: 36 }}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input id="reg-cpwd" name="confirmPassword" type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 16 }}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
