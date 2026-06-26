import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-100">Create Account</h3>
        <p className="text-sm text-slate-400">
          Sign up to check seat maps and purchase tickets.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full bg-slate-950 border border-slate-850 rounded-md py-2 px-3 focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>
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
          onClick={() => alert("Registration feature is ready for implementation.")}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-bold transition-colors"
        >
          Sign Up
        </button>
      </form>

      <div className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-sky-400 hover:underline">
          Log in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
