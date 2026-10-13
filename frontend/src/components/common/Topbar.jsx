import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="notif-panel">
      <div className="notif-header">
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={markAllRead}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'unread' : ''}`}
              onClick={() => markRead(n._id)}
            >
              <div className="notif-item-title">{n.title}</div>
              <div className="notif-item-msg">{n.message}</div>
              <div className="notif-item-time">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const rolePrefix = `/${user?.role}`;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="topbar-right">
        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="notification-btn" onClick={() => { setShowNotifs(v => !v); setShowMenu(false); }}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>
          {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
        </div>

        {/* User menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ gap: 8, padding: '6px 12px', borderRadius: 10 }}
            onClick={() => { setShowMenu(v => !v); setShowNotifs(false); }}
          >
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" />
                : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
              }
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>
              {user?.firstName}
            </span>
            <ChevronDown size={14} />
          </button>
          {showMenu && (
            <div className="notif-panel" style={{ width: 200 }}>
              <div style={{ padding: '8px' }}>
                <button
                  className="nav-item"
                  onClick={() => { navigate(`${rolePrefix}/profile`); setShowMenu(false); }}
                  style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  className="nav-item"
                  onClick={handleLogout}
                  style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
