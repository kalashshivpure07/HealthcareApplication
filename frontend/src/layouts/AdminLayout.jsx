import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Users, Calendar, CreditCard } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

const navItems = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
      { to: '/admin/patients', label: 'Patients', icon: Users },
      { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
      { to: '/admin/billing', label: 'Billing', icon: CreditCard },
    ],
  },
];

const pageTitles = {
  '/admin': { title: 'Admin Dashboard', subtitle: 'System-wide analytics and oversight' },
  '/admin/doctors': { title: 'Manage Doctors', subtitle: 'Add and manage doctor profiles' },
  '/admin/patients': { title: 'Manage Patients', subtitle: 'Patient records and accounts' },
  '/admin/appointments': { title: 'All Appointments', subtitle: 'System-wide appointment tracking' },
  '/admin/billing': { title: 'Billing & Finance', subtitle: 'Financial records and reports' },
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const pageInfo = pageTitles[pathname] || { title: 'Admin Portal', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="main-content">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
