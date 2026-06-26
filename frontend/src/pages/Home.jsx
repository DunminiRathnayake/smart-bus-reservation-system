import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Ticket, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Welcome */}
      <section className="text-center max-w-3xl mx-auto space-y-6 py-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent">
          Explore Routes, Book Easily
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl">
          Reserve specific seat layouts, complete checkouts, and retrieve digital ticket boarding codes for your next destination.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/search-bus"
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg text-slate-950 font-bold tracking-wide transition-all shadow-lg flex items-center gap-2"
          >
            <Search className="h-5 w-5" /> Book Your Seat
          </Link>
        </div>
      </section>

      {/* Grid Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 w-fit rounded-lg">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Fast Reservations</h3>
          <p className="text-slate-400 text-sm">
            Check seat availability charts and secure coordinates on standard or luxury buses.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Digital Tickets</h3>
          <p className="text-slate-400 text-sm">
            Receive verifiable QR codes instantly and download print-ready PDF invoices.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 w-fit rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Driver Scheduling</h3>
          <p className="text-slate-400 text-sm">
            Enterprise-level admin panels managing routes, schedules, buses, and driver logs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
