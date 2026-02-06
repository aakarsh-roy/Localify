import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Star, 
  Calendar,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { providerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/ui/StarRating';
import ReviewCard from '../components/reviews/ReviewCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProviderProfile = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    fetchProvider();
  }, [id]);

  const fetchProvider = async () => {
    try {
      const response = await providerAPI.getById(id);
      setProvider(response.data.data.provider);
      setReviews(response.data.data.reviews);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
    } else {
      navigate(`/book/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-4">The provider you're looking for doesn't exist.</p>
          <Link to="/search" className="btn-primary">Browse Providers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-primary-600 font-bold text-3xl">
                  {provider.businessName?.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{provider.businessName}</h1>
                  {provider.verificationStatus === 'verified' && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <p className="text-gray-600 mb-2">{provider.user?.name}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <StarRating rating={provider.averageRating || 0} size="sm" />
                    <span className="text-gray-600">({provider.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{provider.location?.city}, {provider.location?.state}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{provider.experience} years experience</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                provider.availability?.isAvailable 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {provider.availability?.isAvailable ? 'Available Now' : 'Currently Unavailable'}
              </div>
              <button 
                onClick={handleBookNow}
                className="btn-primary"
                disabled={!provider.availability?.isAvailable}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'services'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Services
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'about'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'reviews'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Reviews ({provider.totalReviews})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    {provider.services?.map((service, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">₹{service.price}</p>
                          <p className="text-xs text-gray-500 capitalize">{service.priceType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{provider.description}</p>

                    {provider.availability?.workingDays && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-2">Working Hours</h4>
                        <p className="text-gray-600">
                          {provider.availability.workingDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                        </p>
                        <p className="text-gray-600">
                          {provider.availability.workingHours?.start} - {provider.availability.workingHours?.end}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No reviews yet</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review._id} review={review} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {provider.user?.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span>{provider.user.phone}</span>
                  </div>
                )}
                {provider.user?.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span>{provider.user.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span>
                    {provider.location?.address}<br />
                    {provider.location?.city}, {provider.location?.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold text-gray-900">
                      {(provider.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Average Rating</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{provider.totalReviews || 0}</p>
                  <p className="text-xs text-gray-500">Total Reviews</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{provider.totalCompletedJobs || 0}</p>
                  <p className="text-xs text-gray-500">Jobs Completed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{provider.experience}</p>
                  <p className="text-xs text-gray-500">Years Exp.</p>
                </div>
              </div>
            </div>

            {/* Book CTA */}
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Ready to book?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Schedule a service with {provider.businessName} today
              </p>
              <button
                onClick={handleBookNow}
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={!provider.availability?.isAvailable}
              >
                <Calendar className="h-5 w-5" />
                Book Service
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
