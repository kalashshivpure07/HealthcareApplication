import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, Stethoscope, FileText, CreditCard, User } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import { useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Overview',
    items: [
      { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Healthcare',
    items: [
      { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
      { to: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
      { to: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
      { to: '/patient/billing', label: 'Billing & Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/patient/profile', label: 'My Profile', icon: User },
    ],
  },
];

const pageTitles = {
  '/patient': { title: 'Patient Dashboard', subtitle: 'Your health overview' },
  '/patient/appointments': { title: 'My Appointments', subtitle: 'Manage your appointments' },
  '/patient/doctors': { title: 'Find Doctors', subtitle: 'Browse and book specialists' },
  '/patient/prescriptions': { title: 'Prescriptions', subtitle: 'Your medication records' },
  '/patient/billing': { title: 'Billing & Payments', subtitle: 'Manage your bills' },
  '/patient/profile': { title: 'My Profile', subtitle: 'Update your information' },
};

export default function PatientLayout() {
  const { pathname } = useLocation();
  const pageInfo = pageTitles[pathname] || { title: 'Patient Portal', subtitle: '' };

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
