import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-100">Sign In</h3>
        <p className="text-sm text-slate-400">Access bookings and preferences.</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-2.5 px-3 focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-2.5 px-3 focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={() => alert("Login mock trigger")}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-bold transition-all"
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

export default Login;
