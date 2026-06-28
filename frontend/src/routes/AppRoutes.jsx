import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import PassengerLayout from '../layouts/PassengerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '../pages/Home';
import SearchBus from '../pages/SearchBus';

// Auth pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Passenger pages
import Dashboard from '../pages/Dashboard';
import BookingHistory from '../pages/BookingHistory';
import Profile from '../pages/Profile';
import ScheduleDetails from '../pages/ScheduleDetails';
import SeatSelection from '../pages/SeatSelection';
import BookingReview from '../pages/BookingReview';
import PaymentPage from '../pages/PaymentPage';
import TicketDetails from '../pages/TicketDetails';
import Tickets from '../pages/Tickets';
import Notifications from '../pages/Notifications';

// Admin pages
import AdminDashboard from '../pages/AdminDashboard';
import BusManagement from '../pages/BusManagement';
import DriverManagement from '../pages/DriverManagement';
import RouteManagement from '../pages/RouteManagement';
import ScheduleManagement from '../pages/ScheduleManagement';
import BookingManagement from '../pages/BookingManagement';
import NotFound from '../pages/NotFound';
import Forbidden from '../pages/Forbidden';

/**
 * React Router v7 modular routing structure mapping roles and layout wrappers.
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Home and Searches) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search-bus" element={<SearchBus />} />
          <Route path="/forbidden" element={<Forbidden />} />
        </Route>

        {/* Authentication flow layouts (Login, Signup) - Guest Only */}
        <Route element={<ProtectedRoute guestOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* Passenger Protected Layouts */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_PASSENGER']} />}>
          <Route element={<PassengerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search-bus" element={<SearchBus />} />
            <Route path="/schedules/:scheduleId" element={<ScheduleDetails />} />
            <Route path="/schedules/:scheduleId/seats" element={<SeatSelection />} />
            <Route path="/schedules/:scheduleId/book" element={<BookingReview />} />
            <Route path="/schedules/:scheduleId/pay/:bookingId" element={<PaymentPage />} />
            <Route path="/tickets/:ticketId" element={<TicketDetails />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin Management Layouts */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/buses" element={<BusManagement />} />
            <Route path="/admin/drivers" element={<DriverManagement />} />
            <Route path="/admin/routes" element={<RouteManagement />} />
            <Route path="/admin/schedules" element={<ScheduleManagement />} />
            <Route path="/admin/bookings" element={<BookingManagement />} />
            <Route
              path="/admin/payments"
              element={
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h2 className="text-xl font-bold text-slate-200 mb-2">Payment Transactions</h2>
                  <p className="text-slate-400 text-sm">Administrative payment tracking details and refunds manager console.</p>
                </div>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h2 className="text-xl font-bold text-slate-200 mb-2">Reports & Analytics</h2>
                  <p className="text-slate-400 text-sm">System dashboard, revenue trends, and conductor metrics console.</p>
                </div>
              }
            />
          </Route>
        </Route>

        {/* Wildcard 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
