import React from 'react';

const SearchBus = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Find Bus Departures</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From</label>
            <input type="text" placeholder="Origin" className="w-full bg-slate-950 border border-slate-850 rounded-md py-2.5 px-3 focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To</label>
            <input type="text" placeholder="Destination" className="w-full bg-slate-950 border border-slate-850 rounded-md py-2.5 px-3 focus:outline-none focus:border-sky-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
            <input type="date" className="w-full bg-slate-950 border border-slate-850 rounded-md py-2.5 px-3 focus:outline-none focus:border-sky-500" />
          </div>
        </div>
        <button onClick={() => alert("Search trigger")} className="w-full py-3 bg-sky-500 hover:bg-sky-600 rounded-lg text-slate-950 font-bold transition-all shadow-md">
          Search Buses
        </button>
      </div>
    </div>
  );
};

export default SearchBus;
