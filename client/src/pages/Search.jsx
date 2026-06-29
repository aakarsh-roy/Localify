import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, SlidersHorizontal, X, SearchX, IndianRupee, CheckCircle2 } from 'lucide-react';
import { providerAPI, categoryAPI } from '../services/api';
import ProviderCard from '../components/providers/ProviderCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    available: searchParams.get('available') || ''
  });

  useEffect(() => {
    fetchCategories();

    // Close suggestions on outside click
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounced autocomplete
  const fetchSuggestions = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await providerAPI.getSuggestions(value);
        setSuggestions(response.data.data);
        setShowSuggestions(response.data.data.length > 0);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search') || undefined,
        city: searchParams.get('city') || undefined,
        category: searchParams.get('category') || undefined,
        minRating: searchParams.get('minRating') || undefined,
        sortBy: searchParams.get('sortBy') || 'rating',
        page: searchParams.get('page') || 1,
        limit: 12,
        minPrice: searchParams.get('minPrice') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
        available: searchParams.get('available') || undefined
      };

      const response = await providerAPI.getAll(params);
      setProviders(response.data.data.providers);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearchInput = (value) => {
    setFilters({ ...filters, search: value });
    fetchSuggestions(value);
  };

  const selectSuggestion = (text) => {
    setFilters({ ...filters, search: text });
    setShowSuggestions(false);
    setSuggestions([]);
    // Auto-search on suggestion selection
    const params = new URLSearchParams(searchParams);
    params.set('search', text);
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') applyFilters();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        selectSuggestion(suggestions[activeSuggestion].text);
      } else {
        setShowSuggestions(false);
        applyFilters();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.delete('page');
    setSearchParams(params);
    setShowFilters(false);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      category: '',
      minRating: '',
      sortBy: 'rating',
      minPrice: '',
      maxPrice: '',
      available: ''
    });
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== 'sortBy'
  ).length;

  const baseInputClass = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white text-neutral-900 outline-none transition-all placeholder:text-neutral-400 shadow-sm";

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Search Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-[72px] z-40">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input with Autocomplete */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search services, providers..."
                value={filters.search}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className={`${baseInputClass} pl-10`}
                autoComplete="off"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-neutral-200 shadow-elevated z-50 overflow-hidden animate-fade-in-down"
                >
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestion(item.text)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                        idx === activeSuggestion
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{item.text}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                        item.type === 'provider'
                          ? 'bg-neutral-200 text-neutral-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Location (City, Zip, etc.)"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className={`${baseInputClass} pl-10`}
              />
            </div>

            {/* Filter Button */}
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="relative md:w-auto w-full bg-white"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-950 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Button onClick={applyFilters} variant="primary" className="md:w-auto w-full">
              Search
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white rounded-2xl border border-neutral-200 shadow-popover animate-fade-in-down origin-top">
              <div className="flex flex-wrap gap-5">
                {/* Category */}
                <div className="w-full sm:w-auto sm:min-w-[180px]">
                  <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={baseInputClass}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Rating */}
                <div className="w-full sm:w-auto sm:min-w-[160px]">
                  <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className={baseInputClass}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-2">
                    Price Range (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className={`${baseInputClass} pl-8 w-28`}
                      />
                    </div>
                    <span className="text-neutral-400 text-sm">–</span>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className={`${baseInputClass} pl-8 w-28`}
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="w-full sm:w-auto sm:min-w-[160px]">
                  <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={baseInputClass}
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>

                {/* Availability Toggle */}
                <div className="w-full sm:w-auto flex flex-col">
                  <label className="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-2">
                    Availability
                  </label>
                  <button
                    onClick={() => handleFilterChange('available', filters.available === 'true' ? '' : 'true')}
                    className={`flex items-center justify-center gap-2 px-4 h-[44px] rounded-xl border text-sm font-medium transition-all ${
                      filters.available === 'true'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${filters.available === 'true' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                    Available Now
                  </button>
                </div>

                <div className="w-full sm:w-auto flex items-end">
                  <button
                    onClick={clearFilters}
                    className="h-[44px] px-3 text-neutral-500 hover:text-red-600 text-sm flex items-center justify-center gap-1.5 font-medium transition-colors rounded-xl hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-neutral-500 font-medium tracking-tight">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Searching...
              </span>
            ) : (
              <>{pagination.total} provider{pagination.total !== 1 ? 's' : ''} found</>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSpinner key={i} variant="skeleton" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-transparent shadow-none animate-fade-in-up">
            <motion.img 
              src="/images/empty-search.png" 
              alt="No results found" 
              className="w-48 h-auto mx-auto mb-6 drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -5 }}
            />
            <h3 className="text-xl font-bold text-neutral-950 mb-2 tracking-tight">No providers found</h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">We couldn't find any service providers matching your current search criteria. Try adjusting your filters.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      pagination.page === i + 1
                        ? 'bg-neutral-950 text-white shadow-subtle border border-neutral-950'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 shadow-sm'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
