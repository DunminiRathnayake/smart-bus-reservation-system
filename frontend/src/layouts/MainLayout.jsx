import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              SmartGo
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-sky-400 transition-colors">Search Trips</Link>
            {token ? (
              <>
                <Link to="/bookings" className="hover:text-sky-400 transition-colors">My Bookings</Link>
                {user.role === 'ROLE_ADMIN' && (
                  <Link to="/admin" className="hover:text-sky-400 transition-colors">Admin Dashboard</Link>
                )}
                {user.role === 'ROLE_CONDUCTOR' && (
                  <Link to="/conductor" className="hover:text-sky-400 transition-colors">Conductor Portal</Link>
                )}
                <div className="flex items-center space-x-4 border-l border-slate-850 pl-6">
                  <span className="text-sm text-slate-400">Hi, {user.fullName || 'User'}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-sky-400 transition-colors">Login</Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md font-semibold text-sm transition-colors text-slate-950"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SmartGo. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
