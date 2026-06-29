import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../services/api';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, CalendarDays, SearchX } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const MyBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const currentStatus = searchParams.get('status') || '';

  useEffect(() => {
    fetchBookings();
  }, [searchParams]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getBookings({
        status: currentStatus || undefined,
        page: searchParams.get('page') || 1,
        limit: 10
      });
      setBookings(response.data.data.bookings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    setSearchParams(params);
  };

  const statusTabs = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neutral-950 rounded-[12px] flex items-center justify-center shadow-subtle">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">My Bookings</h1>
            <p className="text-[10px] font-bold text-neutral-500 mt-1 uppercase tracking-wider">{pagination.total} total bookings</p>
          </div>
        </div>

        {/* Status Tabs */}
        <Card className="mb-8 overflow-x-auto hide-scrollbar bg-white border border-neutral-200 shadow-sm">
          <div className="flex border-b border-neutral-200">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusFilter(tab.value)}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  currentStatus === tab.value
                    ? 'border-neutral-950 text-neutral-950'
                    : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center animate-fade-in-up">
            <motion.img 
              src="/images/empty-bookings.png" 
              alt="No bookings found" 
              className="w-48 h-auto mx-auto mb-6 drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -5 }}
            />
            <h3 className="text-xl font-bold text-neutral-950 mb-2 tracking-tight">No bookings found</h3>
              <p className="text-neutral-500 font-medium">
                {currentStatus 
                  ? `You don't have any ${currentStatus} bookings`
                  : "You haven't made any bookings yet"
                }
              </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-5">
              {bookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-10 gap-3">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', i + 1);
                      setSearchParams(params);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-[12px] text-sm font-bold transition-all shadow-sm ${
                      pagination.page === i + 1
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-950 hover:text-neutral-950'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
