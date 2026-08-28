import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/common/ProtectedRoute';
import { LoadingSpinner } from './components/common/EmptyState';

import CustomerLayout from './layouts/CustomerLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import { AboutPage, ContactPage, HelpCenterPage, PrivacyPage, TermsPage, CareersPage, BlogPage, MobileAppPage } from './pages/marketing/InfoPages';

const HomePage = lazy(() => import('./pages/marketing/HomePage'));
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage'));
const SalonListPage = lazy(() => import('./pages/customer/SalonListPage'));
const SalonDetailPage = lazy(() => import('./pages/customer/SalonDetailPage'));
const BookingPage = lazy(() => import('./pages/customer/BookingPage'));
const BookingListPage = lazy(() => import('./pages/customer/BookingListPage'));
const BookingDetailPage = lazy(() => import('./pages/customer/BookingDetailPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/marketing/NotFoundPage'));

const DashboardHome = lazy(() => import('./pages/salon/DashboardHome'));
const SalonProfile = lazy(() => import('./pages/salon/SalonProfile'));
const ServiceManagement = lazy(() => import('./pages/salon/ServiceManagement'));
const StaffManagement = lazy(() => import('./pages/salon/StaffManagement'));
const StaffLeavePage = lazy(() => import('./pages/salon/StaffLeavePage'));
const AppointmentManagement = lazy(() => import('./pages/salon/AppointmentManagement'));
const SalonReviews = lazy(() => import('./pages/salon/SalonReviews'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSalons = lazy(() => import('./pages/admin/AdminSalons'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminCatalog = lazy(() => import('./pages/admin/AdminCatalog'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Customer & Marketing Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/salons" element={<SalonListPage />} />
          <Route path="/salons/:slug" element={<SalonDetailPage />} />
          <Route path="/salons/:slug/book" element={
            <ProtectedRoute roles={['customer']}>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute roles={['customer']}>
              <BookingListPage />
            </ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute roles={['customer']}>
              <BookingDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/mobile-app" element={<MobileAppPage />} />
        </Route>

        {/* Salon Dashboard Routes */}
        <Route element={
          <ProtectedRoute roles={['salon_owner', 'salon_manager']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/salon" element={<SalonProfile />} />
          <Route path="/dashboard/services" element={<ServiceManagement />} />
          <Route path="/dashboard/staff" element={<StaffManagement />} />
          <Route path="/dashboard/staff-leave" element={<StaffLeavePage />} />
          <Route path="/dashboard/appointments" element={<AppointmentManagement />} />
          <Route path="/dashboard/reviews" element={<SalonReviews />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/salons" element={<AdminSalons />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/catalog" element={<AdminCatalog />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
