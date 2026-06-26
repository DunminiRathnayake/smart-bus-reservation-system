import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center py-20 space-y-6 max-w-md mx-auto">
      <h1 className="text-8xl font-extrabold text-slate-800">404</h1>
      <h2 className="text-2xl font-bold text-slate-200">Page Not Found</h2>
      <p className="text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-md text-slate-950 font-semibold text-sm transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
