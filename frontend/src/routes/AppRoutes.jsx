import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import SearchBus from '../pages/SearchBus';
import BookingHistory from '../pages/BookingHistory';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import BusManagement from '../pages/BusManagement';
import DriverManagement from '../pages/DriverManagement';
import RouteManagement from '../pages/RouteManagement';
import ScheduleManagement from '../pages/ScheduleManagement';
import BookingManagement from '../pages/BookingManagement';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search-bus" element={<SearchBus />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/buses" element={<BusManagement />} />
          <Route path="admin/drivers" element={<DriverManagement />} />
          <Route path="admin/routes" element={<RouteManagement />} />
          <Route path="admin/schedules" element={<ScheduleManagement />} />
          <Route path="admin/bookings" element={<BookingManagement />} />
          
          {/* Wildcard 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth Layout Routing */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
