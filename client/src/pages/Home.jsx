import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import Button from '../components/ui/Button';

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
  const navigate = useNavigate();

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
    navigate(`/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-sm font-medium mb-8 border border-neutral-200 text-neutral-800">
                <BadgeCheck className="h-4 w-4 text-neutral-900" />
                Trusted by 10,000+ homeowners
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tighter text-neutral-950 text-balance">
                Find Trusted Local
                <span className="block mt-2 text-neutral-500">
                  Service Providers
                </span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-500 mb-10 max-w-xl text-balance">
                Connect with verified electricians, plumbers, carpenters, and more in your area. Quality service, just a click away.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2.5 border border-neutral-200 shadow-elevated animate-fade-in-up animate-delay-200 max-w-xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="What service do you need?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent focus:bg-neutral-50 text-neutral-900 placeholder-neutral-400 outline-none transition-all"
                    />
                  </div>
                  <div className="hidden md:block w-px bg-neutral-200 my-2"></div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Your location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent focus:bg-neutral-50 text-neutral-900 placeholder-neutral-400 outline-none transition-all"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="md:w-auto w-full">
                    Search
                  </Button>
                </div>
              </form>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-8 mt-10 text-neutral-600 text-sm animate-fade-in-up animate-delay-300 font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-neutral-900" />
                  Verified Providers
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-neutral-900 fill-neutral-900" />
                  4.8 Average Rating
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              {/* Background gradient blob for the image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-100 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
              <motion.img 
                src="/images/hero.png" 
                alt="Local service professionals" 
                className="w-full h-auto max-w-2xl mx-auto drop-shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tighter mb-4">Our Services</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
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
                  className="group bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-card hover:-translate-y-[2px] transition-all duration-300 ease-out shadow-subtle"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="mx-auto mb-6 w-full max-w-[220px] aspect-square overflow-hidden rounded-2xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    <img 
                      src={`/images/service-${category.name.toLowerCase().replace(/\s+/g, '-')}.png`} 
                      alt={`Professional Indian ${category.name}`}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-[1.05] transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-neutral-950 mb-1 tracking-tight">{category.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tighter mb-4">How It Works</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Book a service in 3 simple steps</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 w-full max-w-[400px] relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-100 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
              <motion.img 
                src="/images/timeline.png"
                alt="How it works timeline"
                className="w-full h-auto drop-shadow-2xl"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex-1 grid gap-8 w-full">
              {[
                { step: 1, title: 'Search & Select', desc: 'Find service providers near you by category or location and review their profiles.', icon: Search },
                { step: 2, title: 'Book Professional', desc: 'Choose a time that works for you and securely book the verified professional.', icon: Star },
                { step: 3, title: 'Get Job Done', desc: 'The professional arrives at your location and completes the service to your satisfaction.', icon: BadgeCheck }
              ].map((item) => (
                <div key={item.step} className="flex gap-5 items-start p-5 rounded-2xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-neutral-200 shadow-sm shadow-neutral-100">
                    <item.icon className="h-5 w-5 text-neutral-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-950 mb-2 tracking-tight">{item.step}. {item.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Providers */}
      <section className="py-24 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tighter mb-2 text-left">Top Rated Providers</h2>
              <p className="text-lg text-neutral-500 text-left">Highly rated service providers in your area</p>
            </div>
            <Link 
              to="/search" 
              className="inline-flex items-center gap-1.5 text-neutral-950 hover:text-neutral-600 font-medium text-sm group transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
      <section className="py-24 bg-neutral-950 text-white overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-white">Why Choose Localify</h2>
              <p className="text-lg text-neutral-400 max-w-xl">Everything you need for hassle-free home services. We ensure all providers are verified and maintain high quality standards.</p>
            </div>
            <div className="flex-1 w-full max-w-[320px] relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-800 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
              <motion.img 
                src="/images/trust.png" 
                alt="Trust and verification" 
                className="w-full h-auto drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Shield, 
                title: 'Verified Providers', 
                desc: 'All service providers are verified and background checked for your safety' 
              },
              { 
                icon: Star, 
                title: 'Genuine Reviews', 
                desc: 'Read real reviews from customers who have used the services' 
              },
              { 
                icon: Clock, 
                title: 'Quick Booking', 
                desc: 'Book services instantly and get confirmation within minutes' 
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:bg-neutral-800 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white text-neutral-950">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-white tracking-tight">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="rounded-[24px] bg-neutral-50 border border-neutral-200 p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter text-neutral-950">
              Are You a Service Provider?
            </h2>
            <p className="text-neutral-500 mb-10 text-lg max-w-2xl mx-auto">
              Join thousands of professionals and grow your business with Localify. 
              Reach more customers in your local area.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/register?role=provider')}
            >
              Register as Provider
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
