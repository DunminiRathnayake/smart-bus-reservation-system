import React from 'react';

const RouteManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Route Management</h2>
        <button onClick={() => alert("Add route")} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-bold text-sm transition-colors">
          Add Route
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 text-center text-slate-400">
        No routes defined. Add routes with sequenced terminal stops.
      </div>
    </div>
  );
};

export default RouteManagement;
