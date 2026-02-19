import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, User, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium text-primary-600">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your bookings</p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/search" className="card-interactive p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Find Services</p>
                <p className="text-sm text-gray-500">Browse providers</p>
              </div>
            </div>
          </Link>

          <Link to="/my-bookings" className="card-interactive p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Bookings</p>
                <p className="text-sm text-gray-500">{stats.total} total</p>
              </div>
            </div>
          </Link>

          <Link to="/become-provider" className="card-interactive p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
                <User className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Become Provider</p>
                <p className="text-sm text-gray-500">Offer services</p>
              </div>
            </div>
          </Link>

          <div className="card-interactive p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Edit profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 group">
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No bookings yet</p>
                <Link to="/search" className="text-primary-600 hover:text-primary-700 font-medium">
                  Find a service provider
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
