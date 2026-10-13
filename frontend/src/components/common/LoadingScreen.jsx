import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fffe 100%)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#1e293b' }}>
          MedCare
        </span>
      </div>
      <div className="spinner spinner-lg" />
      <p style={{ marginTop: '16px', color: '#64748b', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
        Loading your dashboard…
      </p>
    </div>
  );
}
