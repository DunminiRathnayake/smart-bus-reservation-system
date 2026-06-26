import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Passenger Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h4 className="text-slate-400 text-sm font-semibold uppercase">Total Trips</h4>
          <p className="text-3xl font-extrabold mt-2 text-sky-400">12</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h4 className="text-slate-400 text-sm font-semibold uppercase">Active Tickets</h4>
          <p className="text-3xl font-extrabold mt-2 text-emerald-400">1</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h4 className="text-slate-400 text-sm font-semibold uppercase">Reviews Submitted</h4>
          <p className="text-3xl font-extrabold mt-2 text-indigo-400">8</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
