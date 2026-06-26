import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Calendar, Route, ShieldAlert, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
  const links = [
    { name: 'Bus Management', path: '/admin/buses', icon: Bus, desc: 'Manage buses, seat configurations, and status.' },
    { name: 'Driver Management', path: '/admin/drivers', icon: UserCheck, desc: 'Register drivers and adjust shift availability.' },
    { name: 'Route Management', path: '/admin/routes', icon: Route, desc: 'Setup terminals, intermediate stops, and distances.' },
    { name: 'Schedule Management', path: '/admin/schedules', icon: Calendar, desc: 'Create daily/weekly recurring trip schedules.' },
    { name: 'Booking Management', path: '/admin/bookings', icon: ShieldAlert, desc: 'View logs and perform override cancellations.' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Admin Console Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all space-y-4 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 bg-sky-500/10 text-sky-400 w-fit rounded-lg">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{link.name}</h3>
                <p className="text-slate-400 text-sm">{link.desc}</p>
              </div>
              <span className="text-sky-400 text-xs font-semibold hover:underline mt-4 block">Open Module →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
