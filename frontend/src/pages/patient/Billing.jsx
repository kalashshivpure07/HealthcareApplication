import React, { useEffect, useState } from 'react';
import { billingAPI } from '../../services/api';
import { CreditCard, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const map = { Paid: 'badge-success', Pending: 'badge-warning', Overdue: 'badge-danger', Cancelled: 'badge-gray' };
  const icons = { Paid: <CheckCircle size={11} />, Pending: <Clock size={11} />, Overdue: <AlertTriangle size={11} /> };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{icons[status]}{status}</span>;
}

export default function PatientBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('Card');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    billingAPI.getAll()
      .then(r => setBills(r.data.data || []))
      .catch(() => toast.error('Failed to load bills'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bills : bills.filter(b => b.status.toLowerCase() === filter);
  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.totalAmount, 0);
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((s, b) => s + b.totalAmount, 0);

  const handlePay = async () => {
    setPaying(true);
    try {
      await billingAPI.pay(payModal._id, { paymentMethod: payMethod });
      setBills(prev => prev.map(b => b._id === payModal._id ? { ...b, status: 'Paid', paymentMethod: payMethod } : b));
      toast.success('Payment successful!');
      setPayModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed.');
    } finally { setPaying(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-sub">Manage your hospital bills and payment history</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card green">
          <div className="stat-icon green"><CheckCircle size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">₹{totalPaid.toLocaleString()}</div>
            <div className="stat-label">Total Paid</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><Clock size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">₹{totalPending.toLocaleString()}</div>
            <div className="stat-label">Pending Amount</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><CreditCard size={22} /></div>
          <div className="stat-info">
            <div className="stat-value">{bills.length}</div>
            <div className="stat-label">Total Invoices</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {['all', 'pending', 'paid', 'overdue'].map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CreditCard size={32} /></div>
          <div className="empty-state-title">No bills found</div>
          <div className="empty-state-text">Your billing records will appear here after consultations</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(bill => (
            <div key={bill._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', background: bill.status === 'Pending' ? '#fff7ed' : 'var(--gray-50)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CreditCard size={18} color={bill.status === 'Pending' ? '#c2410c' : 'var(--gray-500)'} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{bill.invoiceNumber}</span>
                    <span style={{ marginLeft: 12 }}><StatusBadge status={bill.status} /></span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: bill.status === 'Paid' ? 'var(--primary-600)' : '#c2410c' }}>
                    ₹{bill.totalAmount?.toLocaleString()}
                  </span>
                  {bill.status === 'Pending' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setPayModal(bill)}>
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '16px 20px' }}>
                <table className="table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items?.map((item, i) => (
                      <tr key={i}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.unitPrice?.toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>₹{item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {bill.tax > 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 500 }}>Tax (5%)</td>
                        <td>₹{bill.tax?.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr style={{ background: 'var(--gray-50)' }}>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
                      <td style={{ fontWeight: 800, color: 'var(--primary-700)' }}>₹{bill.totalAmount?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Created: {format(new Date(bill.createdAt), 'dd MMM yyyy')}</span>
                  {bill.dueDate && <span>Due: {format(new Date(bill.dueDate), 'dd MMM yyyy')}</span>}
                  {bill.paymentDate && <span>Paid on: {format(new Date(bill.paymentDate), 'dd MMM yyyy')}</span>}
                  {bill.paymentMethod && <span>Method: {bill.paymentMethod}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Complete Payment</div>
              <button className="modal-close" onClick={() => setPayModal(null)}><X size={16} /></button>
            </div>
            <div style={{ background: 'var(--primary-50)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Invoice</span>
                <span style={{ fontWeight: 600 }}>{payModal.invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Amount Due</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-700)' }}>₹{payModal.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['Card', 'Cash', 'Online', 'Insurance', 'Cheque'].map(m => (
                  <button
                    key={m}
                    className={`btn btn-sm ${payMethod === m ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPayMethod(m)}
                    style={{ borderRadius: 8 }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setPayModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                {paying ? <span className="spinner" /> : `Pay ₹${payModal.totalAmount?.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
