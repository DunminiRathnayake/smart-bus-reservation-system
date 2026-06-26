import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-100">Log In</h3>
        <p className="text-sm text-slate-400">
          Access your bookings and search preference tools.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={() => alert("Login feature is ready for implementation.")}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-bold transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-sky-400 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
