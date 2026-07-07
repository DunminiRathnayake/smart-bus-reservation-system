import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  email: z.string().email('Please provide a valid email address'),
  phoneNumber: z.string().min(5, 'Please provide a valid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

/**
 * Premium Register Page with validation checks aligning with backend auth validations.
 */
const Register = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setBackendError('');
    try {
      const response = await authService.register(data);
      if (response.success) {
        addToast('Registration successful! Please login to continue.', 'success');
        navigate('/login', { state: { redirectTo: location.state?.redirectTo } });
      } else {
        setBackendError(response.message || 'Registration failed.');
        addToast(response.message || 'Registration failed.', 'error');
      }
    } catch (error) {
      const msg = error.normalizedMessage || 'Registration failed. Check details.';
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
          Create Account
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Join SmartGo to reserve seats, review routes, and manage tickets.
        </p>
      </div>

      {backendError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
          {backendError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...registerField('fullName')}
            className={`w-full bg-slate-950 border ${
              errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
            } rounded-xl py-2.5 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            {...registerField('email')}
            className={`w-full bg-slate-950 border ${
              errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
            } rounded-xl py-2.5 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+1 555-5555"
            {...registerField('phoneNumber')}
            className={`w-full bg-slate-950 border ${
              errors.phoneNumber ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
            } rounded-xl py-2.5 px-4 focus:outline-none transition-colors text-sm text-slate-200`}
            disabled={isSubmitting}
          />
          {errors.phoneNumber && (
            <p className="text-red-400 text-xs mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
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
              } rounded-xl py-2.5 pl-4 pr-12 focus:outline-none transition-colors text-sm text-slate-200`}
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...registerField('confirmPassword')}
              className={`w-full bg-slate-950 border ${
                errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl py-2.5 pl-4 pr-12 focus:outline-none transition-colors text-sm text-slate-200`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/10"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-900 pt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold">
          Log in here
        </Link>
      </div>
    </div>
  );
};

export default Register;
