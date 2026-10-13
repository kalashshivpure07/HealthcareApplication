import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  logout:   ()     => API.post('/auth/logout'),
  getMe:    ()     => API.get('/auth/me'),
  updatePassword: (data) => API.put('/auth/update-password', data),
};

// Doctors
export const doctorAPI = {
  getAll:         (params) => API.get('/doctors', { params }),
  getById:        (id)     => API.get(`/doctors/${id}`),
  getSlots:       (id, date) => API.get(`/doctors/${id}/slots`, { params: { date } }),
  update:         (id, data) => API.put(`/doctors/${id}`, data),
  getAppointments:(id, params) => API.get(`/doctors/${id}/appointments`, { params }),
};

// Patients
export const patientAPI = {
  getProfile:  ()     => API.get('/patients/profile'),
  updateProfile:(data) => API.put('/patients/profile', data),
  getAll:      (params) => API.get('/patients', { params }),
  getById:     (id)   => API.get(`/patients/${id}`),
};

// Appointments
export const appointmentAPI = {
  book:        (data)  => API.post('/appointments', data),
  getAll:      (params)=> API.get('/appointments', { params }),
  getById:     (id)    => API.get(`/appointments/${id}`),
  updateStatus:(id, data) => API.put(`/appointments/${id}/status`, data),
  cancel:      (id, data) => API.put(`/appointments/${id}/cancel`, data),
};

// Prescriptions
export const prescriptionAPI = {
  create:  (data) => API.post('/prescriptions', data),
  getAll:  (params) => API.get('/prescriptions', { params }),
  getById: (id)   => API.get(`/prescriptions/${id}`),
};

// Billing
export const billingAPI = {
  getAll:  (params) => API.get('/billing', { params }),
  getById: (id)     => API.get(`/billing/${id}`),
  pay:     (id, data) => API.put(`/billing/${id}/pay`, data),
  create:  (data)   => API.post('/billing', data),
};

// Notifications
export const notificationAPI = {
  getAll:     ()   => API.get('/notifications'),
  markRead:   (id) => API.put(`/notifications/${id}/read`),
  markAllRead:()   => API.put('/notifications/read-all'),
  delete:     (id) => API.delete(`/notifications/${id}`),
};

// Admin
export const adminAPI = {
  getUsers:       (params) => API.get('/admin/users', { params }),
  toggleStatus:   (id)     => API.put(`/admin/users/${id}/toggle-status`),
  deleteUser:     (id)     => API.delete(`/admin/users/${id}`),
  getAnalytics:   ()       => API.get('/admin/analytics'),
  createDoctor:   (data)   => API.post('/admin/doctors', data),
};

// Users
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  getById:       (id)   => API.get(`/users/${id}`),
};

export default API;
