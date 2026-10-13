import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy imports for code splitting
const LoginPage      = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/auth/RegisterPage'));

// Patient Pages
const PatientLayout        = lazy(() => import('./layouts/PatientLayout'));
const PatientDashboard     = lazy(() => import('./pages/patient/Dashboard'));
const PatientAppointments  = lazy(() => import('./pages/patient/Appointments'));
const PatientDoctors       = lazy(() => import('./pages/patient/Doctors'));
const PatientPrescriptions = lazy(() => import('./pages/patient/Prescriptions'));
const PatientBilling       = lazy(() => import('./pages/patient/Billing'));
const PatientProfile       = lazy(() => import('./pages/patient/Profile'));

// Doctor Pages
const DoctorLayout       = lazy(() => import('./layouts/DoctorLayout'));
const DoctorDashboard    = lazy(() => import('./pages/doctor/Dashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/Appointments'));
const DoctorPatients     = lazy(() => import('./pages/doctor/Patients'));
const DoctorPrescriptions= lazy(() => import('./pages/doctor/Prescriptions'));
const DoctorProfile      = lazy(() => import('./pages/doctor/Profile'));

// Admin Pages
const AdminLayout    = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminDoctors   = lazy(() => import('./pages/admin/Doctors'));
const AdminPatients  = lazy(() => import('./pages/admin/Patients'));
const AdminAppointments = lazy(() => import('./pages/admin/Appointments'));
const AdminBilling   = lazy(() => import('./pages/admin/Billing'));

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const roleMap = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
  return <Navigate to={roleMap[user.role] || '/login'} replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Patient Routes */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="doctors" element={<PatientDoctors />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="billing" element={<PatientBilling />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="billing" element={<AdminBilling />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}
