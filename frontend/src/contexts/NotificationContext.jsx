import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load existing notifications
    notificationAPI.getAll()
      .then(res => setNotifications(res.data.data || []))
      .catch(() => {});

    // Connect socket
    const s = io('http://localhost:5000', { withCredentials: true });
    s.emit('join', user._id);
    s.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });
    setSocket(s);

    return () => { s.disconnect(); };
  }, [user]);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id) => {
    await notificationAPI.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotif }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be within NotificationProvider');
  return ctx;
};
