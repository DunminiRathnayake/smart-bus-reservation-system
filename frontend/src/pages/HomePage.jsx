import React from 'react';

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center py-12 max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent">
          Your Smart Journey Starts Here
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl">
          Reserve bus seats instantly, complete secure mock checkouts, and retrieve digital QR tickets directly on your phone.
        </p>
      </div>

      {/* Bus Search Placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-slate-200">Search Bus Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">From</label>
            <input
              type="text"
              placeholder="Origin City (e.g. New York)"
              className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500 rounded-md py-2 px-3 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">To</label>
            <input
              type="text"
              placeholder="Destination City (e.g. Washington)"
              className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500 rounded-md py-2 px-3 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Date</label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-850 focus:border-sky-500 rounded-md py-2 px-3 text-slate-100 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => alert("SmartGo search feature is ready for implementation.")}
          className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 rounded-lg text-slate-950 font-bold tracking-wide transition-all shadow-lg"
        >
          Search Buses
        </button>
      </div>
    </div>
  );
};

export default HomePage;
