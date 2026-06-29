import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, MapPin, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (result.data.user.role === 'admin') {
        navigate('/admin');
      } else if (result.data.user.role === 'provider') {
        navigate('/provider-dashboard');
      } else {
        navigate(from);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = "w-full px-4 py-3 pl-10 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all placeholder:text-neutral-400 shadow-sm font-medium";

  return (
    <div className="min-h-screen flex bg-neutral-50/50">
      <div className="flex-1 hidden lg:flex items-center justify-center p-12 bg-neutral-100 relative overflow-hidden border-r border-neutral-200">
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-200 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
        <motion.img 
          src="/images/auth-login.png" 
          alt="Login to Localify" 
          className="w-full max-w-lg drop-shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        />
      </div>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Welcome back</h1>
          <p className="text-neutral-500 mt-2 text-lg font-medium">Sign in to your account to continue</p>
        </div>

        <Card className="shadow-subtle border-neutral-200 bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={baseInputClass}
                    placeholder="you@example.com"
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${baseInputClass} pr-11`}
                    placeholder="Enter your password"
                    required
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

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-4.5 h-4.5 rounded-md text-neutral-950 border-neutral-300 focus:ring-neutral-950" />
                  <span className="ml-2 text-sm font-bold text-neutral-600 group-hover:text-neutral-950 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm text-neutral-950 hover:text-neutral-600 font-bold transition-colors">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full !py-3.5 text-base flex items-center justify-center gap-2 shadow-subtle"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-neutral-100 pt-6">
              <p className="text-sm font-medium text-neutral-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-neutral-950 hover:text-neutral-600 font-bold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <div className="mt-8 p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <p className="text-[10px] text-neutral-500 font-bold mb-3 uppercase tracking-wider">Demo Credentials</p>
          <div className="text-sm text-neutral-600 space-y-2 font-medium">
            <p className="flex items-center gap-2">
              <span className="px-2 py-1 bg-neutral-100 text-neutral-950 rounded-lg font-bold text-[10px] uppercase border border-neutral-200">User</span>
              aakarsh@example.com / user123
            </p>
            <p className="flex items-center gap-2">
              <span className="px-2 py-1 bg-neutral-100 text-neutral-950 rounded-lg font-bold text-[10px] uppercase border border-neutral-200">Provider</span>
              provider0@example.com / provider123
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
