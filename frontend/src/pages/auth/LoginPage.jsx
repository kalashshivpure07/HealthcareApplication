import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Heart, Activity, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.firstName}!`);
      const roleMap = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
      navigate(roleMap[user.role] || '/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { role: 'Admin', email: 'admin@medcare.com', password: 'Admin@123', color: '#7c3aed' },
    { role: 'Doctor', email: 'dr.arjun@medcare.com', password: 'Doctor@123', color: '#2563eb' },
    { role: 'Patient', email: 'ravi.kumar@gmail.com', password: 'Patient@123', color: '#16a34a' },
  ];

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, color: 'white', maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={28} fill="white" strokeWidth={0} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.8rem' }}>MedCare</span>
          </div>

          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Healthcare, <br />Simplified.
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.85, lineHeight: 1.7, marginBottom: 40 }}>
            A unified platform connecting patients, doctors, and administrators for seamless healthcare management.
          </p>

          {[
            { icon: Activity, label: 'Real-time appointment tracking' },
            { icon: Shield, label: 'HIPAA-compliant security' },
            { icon: Clock, label: '24/7 healthcare access' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
              </div>
              <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card slide-up">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Heart size={22} fill="white" strokeWidth={0} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: 'var(--gray-900)' }}>MedCare</span>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Sign in to access your healthcare portal</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>Quick Demo Login</span></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {demoLogins.map(d => (
              <button
                key={d.role}
                className="btn btn-secondary"
                onClick={() => { setEmail(d.email); setPassword(d.password); }}
                style={{ justifyContent: 'flex-start', gap: 12, padding: '10px 16px' }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: d.color }}>{d.role}:</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</span>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            New patient?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
