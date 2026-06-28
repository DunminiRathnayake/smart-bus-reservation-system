import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';

/**
 * Admin Layout integrating reusable Sidebar and AdminHeader navigation components.
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    addToast('Admin signed out successfully.', 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden">
      {/* Mobile Drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Admin Content Area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Top Header navbar */}
        <AdminHeader
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        {/* Content Viewport */}
        <main className="flex-grow p-4 sm:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900/60 py-4 bg-slate-950/40 text-center text-[10px] text-slate-650 tracking-wider">
          © {new Date().getFullYear()} SmartGo. Administrator session.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
