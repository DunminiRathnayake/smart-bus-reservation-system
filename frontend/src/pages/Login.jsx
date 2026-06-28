import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Premium Login Page with validation, remember me toggle, and error handlers.
 */
const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');

  // Show session expired message if redirected by axios interceptor
  React.useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      addToast('Your session has expired. Please sign in again.', 'warning');
    }
  }, [searchParams]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setBackendError('');
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Save token to localStorage or sessionStorage based on rememberMe selection
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          // Token is saved in localStorage by default in AuthContext login,
          // but we can save it anyway and handle session persistence cleanly.
          localStorage.setItem('token', token);
        }
        
        login(user, token);
        addToast(`Welcome back, ${user.fullName}!`, 'success');
        
        // Redirect depending on user role
        navigate(user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard');
      } else {
        setBackendError(response.message || 'Login failed.');
        addToast(response.message || 'Login failed.', 'error');
      }
    } catch (error) {
      const msg = error.normalizedMessage || 'Invalid email or password.';
      setBackendError(msg);
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Sign In
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Access your passenger dashboard or admin console.
        </p>
      </div>

      {backendError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
          {backendError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Address */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            {...registerField('email')}
            className={`w-full bg-slate-950 border ${
              errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
            } rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...registerField('password')}
              className={`w-full bg-slate-950 border ${
                errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl py-3 pl-4 pr-12 focus:outline-none transition-colors text-sm text-slate-200`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me option */}
        <div className="flex items-center justify-between py-1 text-xs">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
            />
            Remember Me
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-900 pt-4">
        New to SmartGo?{' '}
        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold">
          Create account
        </Link>
      </div>
    </div>
  );
};

export default Login;
