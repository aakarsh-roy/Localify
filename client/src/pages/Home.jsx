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
  Bug,
  ArrowRight,
  Users,
  BadgeCheck
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl animate-float" />
          <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-pulse-soft" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20">
              <BadgeCheck className="h-4 w-4" />
              Trusted by 10,000+ homeowners
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Find Trusted Local
              <span className="block mt-1">Service Providers</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100/90 mb-10 max-w-2xl mx-auto">
              Connect with verified electricians, plumbers, carpenters, and more in your area. Quality service, just a click away.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl shadow-primary-900/30 animate-fade-in-up animation-delay-200">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 focus:ring-2 focus:ring-primary-500/30 text-gray-900 placeholder-gray-400 bg-gray-50"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 focus:ring-2 focus:ring-primary-500/30 text-gray-900 placeholder-gray-400 bg-gray-50"
                  />
                </div>
                <button type="submit" className="btn-primary !py-3.5 px-8 flex items-center justify-center gap-2">
                  <Search className="h-4.5 w-4.5" />
                  Search
                </button>
              </div>
            </form>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-primary-100/80 text-sm animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Verified Providers
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                4.8 Average Rating
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                500+ Professionals
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Choose from a wide range of home services provided by verified professionals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, idx) => {
              const Icon = iconMap[category.icon] || Wrench;
              return (
                <Link
                  key={category._id}
                  to={`/search?category=${category._id}`}
                  className="group card-interactive p-6 text-center"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Book a service in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200" />
            
            {[
              { step: 1, title: 'Search', desc: 'Find service providers near you by category or location', icon: Search },
              { step: 2, title: 'Compare & Book', desc: 'View ratings, reviews, and prices to choose the best provider', icon: Star },
              { step: 3, title: 'Get Service', desc: 'Provider arrives at your location and completes the job', icon: BadgeCheck }
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-card flex items-center justify-center mx-auto mb-5 border border-gray-100 group hover:shadow-card-hover transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Providers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title !mb-2 !text-left">Top Rated Providers</h2>
              <p className="section-subtitle !mb-0 !mx-0 !text-left">Highly rated service providers in your area</p>
            </div>
            <Link 
              to="/search" 
              className="hidden sm:flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold text-sm group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProviders.map((provider) => (
              <ProviderCard key={provider._id} provider={provider} />
            ))}
          </div>

          <div className="sm:hidden text-center mt-8">
            <Link to="/search" className="btn-secondary inline-flex items-center gap-2">
              View All Providers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Why Choose Localify</h2>
            <p className="section-subtitle">Everything you need for hassle-free home services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Shield, 
                color: 'from-emerald-50 to-emerald-100', 
                iconColor: 'text-emerald-600',
                title: 'Verified Providers', 
                desc: 'All service providers are verified and background checked for your safety' 
              },
              { 
                icon: Star, 
                color: 'from-amber-50 to-amber-100', 
                iconColor: 'text-amber-600',
                title: 'Genuine Reviews', 
                desc: 'Read real reviews from customers who have used the services' 
              },
              { 
                icon: Clock, 
                color: 'from-blue-50 to-blue-100', 
                iconColor: 'text-blue-600',
                title: 'Quick Booking', 
                desc: 'Book services instantly and get confirmation within minutes' 
              }
            ].map((feature) => (
              <div key={feature.title} className="card-interactive p-7">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Are You a Service Provider?
          </h2>
          <p className="text-primary-100/90 mb-10 text-lg max-w-2xl mx-auto">
            Join thousands of professionals and grow your business with Localify. 
            Reach more customers in your local area.
          </p>
          <Link 
            to="/register?role=provider" 
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Register as Provider
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
