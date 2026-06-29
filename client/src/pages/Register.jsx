import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, ArrowRight, Briefcase, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'user';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: initialRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      });
      
      toast.success('Registration successful!');
      
      if (formData.role === 'provider') {
        navigate('/become-provider');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = "w-full px-4 py-3 pl-10 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all placeholder:text-neutral-400 shadow-sm font-medium";

  return (
    <div className="min-h-screen flex flex-row-reverse bg-neutral-50/50">
      <div className="flex-1 hidden lg:flex items-center justify-center p-12 bg-neutral-100 relative overflow-hidden border-l border-neutral-200">
        <div className="absolute inset-0 bg-gradient-to-bl from-neutral-200 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
        <motion.img 
          src="/images/auth-register.png" 
          alt="Join Localify" 
          className="w-full max-w-lg drop-shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        />
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Create your account</h1>
          <p className="text-neutral-500 mt-2 text-lg font-medium">Join Localify and get started today</p>
        </div>

        <Card className="shadow-subtle border-neutral-200 bg-white">
          <CardContent className="p-8">
            {/* Role Selection */}
            <div className="flex rounded-xl bg-neutral-100 p-1 mb-8 border border-neutral-200">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
                  formData.role === 'user'
                    ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-950 border border-transparent'
                }`}
              >
                <UserPlus className="h-4.5 w-4.5" />
                I need services
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'provider' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${
                  formData.role === 'provider'
                    ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-950 border border-transparent'
                }`}
              >
                <Briefcase className="h-4.5 w-4.5" />
                I provide services
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={baseInputClass}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={baseInputClass}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={baseInputClass}
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${baseInputClass} pr-11`}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-950 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={baseInputClass}
                    placeholder="Repeat your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start pt-2">
                <input type="checkbox" className="w-4.5 h-4.5 rounded-md text-neutral-950 border-neutral-300 focus:ring-neutral-950 mt-0.5" required />
                <span className="ml-3 text-sm text-neutral-600 font-bold leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-neutral-950 hover:text-neutral-600 underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-neutral-950 hover:text-neutral-600 underline">Privacy Policy</a>
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full !py-3.5 text-base flex items-center justify-center gap-2 mt-4 shadow-subtle"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-neutral-100 pt-6">
              <p className="text-sm font-medium text-neutral-500">
                Already have an account?{' '}
                <Link to="/login" className="text-neutral-950 hover:text-neutral-600 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
