import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Sidebar({ navItems }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Heart size={22} fill="white" strokeWidth={0} />
        </div>
        <div>
          <div className="sidebar-logo-text">MedCare</div>
          <div className="sidebar-logo-sub">Healthcare System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="nav-section-label">{section.label}</div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={20} />
                {item.label}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" />
            : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div className="user-role">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
}
