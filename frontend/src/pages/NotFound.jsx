import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="text-center py-20 max-w-md mx-auto space-y-6">
      <div className="flex justify-center text-slate-700">
        <ShieldAlert className="h-20 w-20" />
      </div>
      <h1 className="text-4xl font-extrabold">404</h1>
      <h2 className="text-xl font-bold">Page Not Found</h2>
      <p className="text-slate-400">
        The requested path is not configured.
      </p>
      <Link to="/" className="inline-block px-5 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-bold transition-all">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
