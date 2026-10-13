import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, User } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

const navItems = [
  {
    label: 'Overview',
    items: [
      { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Practice',
    items: [
      { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
      { to: '/doctor/patients', label: 'Patients', icon: Users },
      { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/doctor/profile', label: 'My Profile', icon: User },
    ],
  },
];

const pageTitles = {
  '/doctor': { title: 'Doctor Dashboard', subtitle: 'Your daily practice overview' },
  '/doctor/appointments': { title: 'Appointments', subtitle: 'Manage your patient appointments' },
  '/doctor/patients': { title: 'My Patients', subtitle: 'Patient health records' },
  '/doctor/prescriptions': { title: 'Prescriptions', subtitle: 'Issued prescriptions' },
  '/doctor/profile': { title: 'My Profile', subtitle: 'Update your details and availability' },
};

export default function DoctorLayout() {
  const { pathname } = useLocation();
  const pageInfo = pageTitles[pathname] || { title: 'Doctor Portal', subtitle: '' };

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
