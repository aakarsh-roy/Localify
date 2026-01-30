import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  ChevronRight,
  Zap,
  Droplet,
  Hammer,
  Wind,
  Paintbrush,
  Sparkles,
  Wrench,
  Bug
} from 'lucide-react';
import { categoryAPI, providerAPI } from '../services/api';
import ProviderCard from '../components/providers/ProviderCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const iconMap = {
  'zap': Zap,
  'droplet': Droplet,
  'hammer': Hammer,
  'wind': Wind,
  'paintbrush': Paintbrush,
  'sparkles': Sparkles,
  'wrench': Wrench,
  'bug': Bug
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, providersRes] = await Promise.all([
        categoryAPI.getAll(),
        providerAPI.getAll({ limit: 6, sortBy: 'rating' })
      ]);
      setCategories(categoriesRes.data.data);
      setTopProviders(providersRes.data.data.providers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (location) params.set('city', location);
    window.location.href = `/search?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Trusted Local Service Providers
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Connect with verified electricians, plumbers, carpenters, and more in your area
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl p-2 shadow-lg">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 text-gray-900"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 text-gray-900"
                  />
                </div>
                <button type="submit" className="btn-primary px-8 py-3">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a wide range of home services provided by verified professionals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || Wrench;
              return (
                <Link
                  key={category._id}
                  to={`/search?category=${category._id}`}
                  className="group p-6 bg-gray-50 rounded-xl hover:bg-primary-50 hover:shadow-md transition-all text-center"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Book a service in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-xl mb-2">Search</h3>
              <p className="text-gray-600">
                Find service providers near you by category or location
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-xl mb-2">Compare & Book</h3>
              <p className="text-gray-600">
                View ratings, reviews, and prices to choose the best provider
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-xl mb-2">Get Service</h3>
              <p className="text-gray-600">
                Provider arrives at your location and completes the job
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Providers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Top Rated Providers</h2>
              <p className="text-gray-600 mt-2">Highly rated service providers in your area</p>
            </div>
            <Link 
              to="/search" 
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProviders.map((provider) => (
              <ProviderCard key={provider._id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Localify</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified Providers</h3>
              <p className="text-gray-600">
                All service providers are verified and background checked for your safety
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Genuine Reviews</h3>
              <p className="text-gray-600">
                Read real reviews from customers who have used the services
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick Booking</h3>
              <p className="text-gray-600">
                Book services instantly and get confirmation within minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Are You a Service Provider?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of professionals and grow your business with Localify
          </p>
          <Link to="/register?role=provider" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
            Register as Provider
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
