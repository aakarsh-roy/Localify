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
  ArrowRight,
  Shield
} from 'lucide-react';
import { providerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/ui/StarRating';
import ReviewCard from '../components/reviews/ReviewCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-950 mb-2 tracking-tight">Provider Not Found</h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">The provider you're looking for doesn't exist or may have been removed.</p>
          <Button variant="primary" onClick={() => navigate('/search')}>Browse Providers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 pt-8 pb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 animate-fade-in-up relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-5">
              <Avatar 
                src={provider.avatarUrl}
                alt={provider.businessName}
                fallback={provider.businessName?.charAt(0)}
                size="xl"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">{provider.businessName}</h1>
                  {provider.verificationStatus === 'verified' && (
                    <CheckCircle className="h-6 w-6 text-neutral-950 fill-neutral-100 shrink-0" />
                  )}
                </div>
                <p className="text-neutral-500 font-medium text-lg mb-4">{provider.user?.name}</p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={provider.averageRating || 0} size="sm" showValue={false} />
                    <span className="text-neutral-950 font-bold">{(provider.averageRating || 0).toFixed(1)}</span>
                    <span className="text-neutral-500">({provider.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span>{provider.location?.city}, {provider.location?.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span>{provider.experience} years experience</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 mt-4 md:mt-0">
              <Badge 
                variant={provider.availability?.isAvailable ? 'success' : 'secondary'}
                className="justify-center h-11 px-4 text-sm font-semibold"
              >
                {provider.availability?.isAvailable ? 'Available Now' : 'Currently Unavailable'}
              </Badge>
              <Button 
                variant="primary"
                size="lg"
                onClick={handleBookNow}
                disabled={!provider.availability?.isAvailable}
              >
                <Calendar className="h-4.5 w-4.5 mr-2" />
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up animate-delay-100">
            {/* Tabs */}
            <Card className="overflow-hidden bg-white shadow-subtle border border-neutral-200">
              <div className="border-b border-neutral-200 bg-white">
                <nav className="flex overflow-x-auto hide-scrollbar">
                  {[{key: 'services', label: 'Services'}, {key: 'about', label: 'About'}, {key: 'reviews', label: `Reviews (${provider.totalReviews})`}].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-8 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'border-neutral-950 text-neutral-950 bg-white'
                          : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <CardContent className="p-8">
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    {provider.services?.length > 0 ? (
                      provider.services.map((service, index) => (
                        <div 
                          key={index}
                          className="flex sm:items-center sm:flex-row flex-col items-start justify-between p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-950 hover:shadow-subtle transition-all group gap-4"
                        >
                          <div>
                            <h3 className="font-bold text-neutral-950 tracking-tight text-lg mb-1">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-xl">{service.description}</p>
                            )}
                          </div>
                          <div className="sm:text-right shrink-0 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200 sm:bg-transparent sm:border-transparent sm:px-0 sm:py-0">
                            <p className="font-extrabold text-neutral-950 text-xl">₹{service.price}</p>
                            <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{service.priceType}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-neutral-500">No services listed.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="prose prose-neutral max-w-none">
                    <h3 className="text-xl font-bold text-neutral-950 mb-4 tracking-tight">About</h3>
                    <p className="text-neutral-600 whitespace-pre-wrap font-medium leading-relaxed text-base">{provider.description || 'No description provided.'}</p>

                    {provider.availability?.workingDays && (
                      <div className="mt-10 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                        <h4 className="font-bold text-neutral-950 tracking-tight mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-neutral-950" />
                          Working Hours
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Days</p>
                            <p className="text-neutral-950 font-medium">
                              {provider.availability.workingDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Hours</p>
                            <p className="text-neutral-950 font-medium">
                              {provider.availability.workingHours?.start} - {provider.availability.workingHours?.end}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-8 w-8 text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-950 mb-1 tracking-tight">No reviews yet</h3>
                        <p className="text-neutral-500 font-medium">Be the first to book and review this provider!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review._id} review={review} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in-up animate-delay-200">
            {/* Contact Card */}
            <Card className="bg-white shadow-subtle border border-neutral-200">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {provider.user?.phone && (
                    <div className="flex items-center gap-3 text-neutral-700">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                        <Phone className="h-4.5 w-4.5 text-neutral-700" />
                      </div>
                      <span className="font-semibold text-neutral-950">{provider.user.phone}</span>
                    </div>
                  )}
                  {provider.user?.email && (
                    <div className="flex items-center gap-3 text-neutral-700">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                        <Mail className="h-4.5 w-4.5 text-neutral-700" />
                      </div>
                      <span className="font-semibold text-neutral-950 break-all">{provider.user.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 text-neutral-700">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      <MapPin className="h-4.5 w-4.5 text-neutral-700" />
                    </div>
                    <span className="font-semibold text-neutral-950 mt-1.5 leading-tight">
                      {provider.location?.address}<br />
                      <span className="text-neutral-500 font-medium text-sm">{provider.location?.city}, {provider.location?.state}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white shadow-subtle border border-neutral-200">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-5 w-5 text-neutral-950 fill-neutral-950" />
                      <span className="text-2xl font-bold text-neutral-950 tracking-tight">
                        {(provider.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Average Rating</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-2xl font-bold text-neutral-950 tracking-tight mb-1">{provider.totalReviews || 0}</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Total Reviews</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-2xl font-bold text-neutral-950 tracking-tight mb-1">{provider.totalCompletedJobs || 0}</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Jobs Completed</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-2xl font-bold text-neutral-950 tracking-tight mb-1">{provider.experience}</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Years Exp.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book CTA */}
            <div className="bg-neutral-950 rounded-[24px] p-8 text-white shadow-elevated relative overflow-hidden group">
              <h3 className="font-bold text-xl mb-2 relative z-10 tracking-tight">Ready to book?</h3>
              <p className="text-neutral-400 text-sm mb-6 relative z-10 font-medium">
                Schedule a service with {provider.businessName} today
              </p>
              <Button
                variant="outline"
                onClick={handleBookNow}
                disabled={!provider.availability?.isAvailable}
                className="w-full relative z-10 bg-white text-neutral-950 hover:bg-neutral-100"
                size="lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Service
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
