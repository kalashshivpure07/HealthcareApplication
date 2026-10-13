import React, { useEffect, useState } from 'react';
import { patientAPI, appointmentAPI } from '../../services/api';
import { Search, Users, Heart, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    patientAPI.getAll()
      .then(r => setPatients(r.data.data || []))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    const name = `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || p.user?.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Patients</h1>
          <p className="page-sub">View patient health records and history</p>
        </div>
        <div className="search-bar">
          <Search size={16} color="var(--gray-400)" />
          <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><Users size={32} /></div><div className="empty-state-title">No patients found</div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20 }}>
          {/* Patient List */}
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Blood Group</th><th>Gender</th><th>Allergies</th><th>Conditions</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} style={{ cursor: 'pointer', background: selected?._id === p._id ? 'var(--primary-50)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                          {`${p.user?.firstName?.[0] || ''}${p.user?.lastName?.[0] || ''}`}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.user?.firstName} {p.user?.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.bloodGroup ? <span className="badge badge-danger">{p.bloodGroup}</span> : '—'}</td>
                    <td>{p.gender || '—'}</td>
                    <td>
                      {p.allergies?.length > 0
                        ? <span className="badge badge-warning">{p.allergies.slice(0,2).join(', ')}{p.allergies.length > 2 ? `+${p.allergies.length-2}` : ''}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      }
                    </td>
                    <td>
                      {p.chronicConditions?.length > 0
                        ? <span className="badge badge-purple">{p.chronicConditions[0]}{p.chronicConditions.length > 1 ? ` +${p.chronicConditions.length-1}` : ''}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      }
                    </td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(selected?._id === p._id ? null : p)}>
                      {selected?._id === p._id ? 'Close' : 'View'}
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Patient Detail Panel */}
          {selected && (
            <div className="card slide-in" style={{ height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="card-title">Patient Details</div>
                <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px', background: 'var(--gray-50)', borderRadius: 10 }}>
                <div className="user-avatar" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                  {`${selected.user?.firstName?.[0] || ''}${selected.user?.lastName?.[0] || ''}`}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selected.user?.firstName} {selected.user?.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selected.user?.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selected.user?.phone}</div>
                </div>
              </div>
              {[
                ['Blood Group', selected.bloodGroup || '—'],
                ['Gender', selected.gender || '—'],
                ['Date of Birth', selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              {selected.allergies?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--danger)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><AlertCircle size={13} /> Allergies</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.allergies.map(a => <span key={a} className="badge badge-danger">{a}</span>)}
                  </div>
                </div>
              )}
              {selected.chronicConditions?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary-700)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Heart size={13} /> Chronic Conditions</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.chronicConditions.map(c => <span key={c} className="badge badge-purple">{c}</span>)}
                  </div>
                </div>
              )}
              {selected.address?.city && (
                <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  📍 {selected.address.street}, {selected.address.city}, {selected.address.state}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
