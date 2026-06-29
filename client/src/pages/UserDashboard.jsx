import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Search, User, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await userAPI.getBookings({ limit: 5 });
      const allBookings = response.data.data.bookings;
      setBookings(allBookings);

      // Calculate stats
      const pending = allBookings.filter(b => ['pending', 'accepted'].includes(b.status)).length;
      const completed = allBookings.filter(b => b.status === 'completed').length;
      setStats({
        total: response.data.data.pagination.total,
        pending,
        completed
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 animate-fade-in-up">
        {/* Welcome Section */}
        <div className="mb-10 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-neutral-950 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-[11px] font-bold text-neutral-950 uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight mb-4">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-neutral-500 text-lg font-medium max-w-md">Here's what's happening with your bookings. Manage your appointments and track services easily.</p>
          </div>
          
          <div className="relative z-10 w-full max-w-[280px] md:max-w-[320px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-200 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
            <motion.img 
              src="/images/customer-banner.png" 
              alt="Dashboard overview" 
              className="w-full h-auto drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <Link to="/search" className="block group">
            <Card className="hover:border-neutral-950 hover:shadow-subtle transition-all h-full bg-white border border-neutral-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center group-hover:bg-neutral-950 transition-colors">
                    <Search className="h-5 w-5 text-neutral-950 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-950 tracking-tight">Find Services</p>
                    <p className="text-sm text-neutral-500 font-medium">Browse providers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/my-bookings" className="block group">
            <Card className="hover:border-neutral-950 hover:shadow-subtle transition-all h-full bg-white border border-neutral-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center group-hover:bg-neutral-950 transition-colors">
                    <Calendar className="h-5 w-5 text-neutral-950 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-950 tracking-tight">My Bookings</p>
                    <p className="text-sm text-neutral-500 font-medium">{stats.total} total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/become-provider" className="block group">
            <Card className="hover:border-neutral-950 hover:shadow-subtle transition-all h-full bg-white border border-neutral-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center group-hover:bg-neutral-950 transition-colors">
                    <User className="h-5 w-5 text-neutral-950 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-950 tracking-tight">Become Provider</p>
                    <p className="text-sm text-neutral-500 font-medium">Offer services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="block group cursor-pointer">
            <Card className="hover:border-neutral-950 hover:shadow-subtle transition-all h-full bg-white border border-neutral-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center group-hover:bg-neutral-950 transition-colors">
                    <Settings className="h-5 w-5 text-neutral-950 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-950 tracking-tight">Settings</p>
                    <p className="text-sm text-neutral-500 font-medium">Edit profile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Total Bookings</p>
              <p className="text-4xl font-extrabold text-neutral-950 tracking-tight">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Pending</p>
              <p className="text-4xl font-extrabold text-neutral-950 tracking-tight">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Completed</p>
              <p className="text-4xl font-extrabold text-neutral-950 tracking-tight">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="mb-8 bg-white border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 pb-4">
            <CardTitle className="tracking-tight">Recent Bookings</CardTitle>
            <Link to="/my-bookings" className="text-neutral-950 hover:text-neutral-600 text-sm font-bold inline-flex items-center gap-1.5 group transition-colors">
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                  <Calendar className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-950 mb-2 tracking-tight">No bookings yet</h3>
                <p className="text-neutral-500 font-medium mb-6">Ready to find a service provider?</p>
                <Link to="/search" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold hover:bg-neutral-800 transition-colors shadow-subtle">
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
