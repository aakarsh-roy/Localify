import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, SearchX, IndianRupee, CheckCircle2 } from 'lucide-react';
import { providerAPI, categoryAPI } from '../services/api';
import ProviderCard from '../components/providers/ProviderCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Search Header */}
      <div className="glass border-b border-gray-200/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input with Autocomplete */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search services, providers..."
                value={filters.search}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="input-field pl-10"
                autoComplete="off"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-fade-in-down"
                >
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestion(item.text)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                        idx === activeSuggestion
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{item.text}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        item.type === 'provider'
                          ? 'bg-primary-50 text-primary-600'
                          : 'bg-purple-50 text-purple-600'
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
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 relative ${showFilters ? '!bg-primary-50 !text-primary-700 !border-primary-200' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button onClick={applyFilters} className="btn-primary">
              Search
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in-down">
              <div className="flex flex-wrap gap-4">
                {/* Category */}
                <div className="w-full sm:w-auto sm:min-w-[180px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Price Range (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="input-field pl-8 w-28"
                      />
                    </div>
                    <span className="text-gray-400 text-sm">–</span>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="input-field pl-8 w-28"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="w-full sm:w-auto sm:min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="input-field"
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Availability
                  </label>
                  <button
                    onClick={() => handleFilterChange('available', filters.available === 'true' ? '' : 'true')}
                    className={`flex items-center gap-2 px-4 h-[42px] rounded-xl border text-sm font-medium transition-all ${
                      filters.available === 'true'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${filters.available === 'true' ? 'text-green-600' : 'text-gray-400'}`} />
                    Available Now
                  </button>
                </div>

                <div className="w-full sm:w-auto flex items-end">
                  <button
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1.5 font-medium transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 font-medium">
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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <SearchX className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you need</p>
            <button onClick={clearFilters} className="btn-secondary">
              Clear All Filters
            </button>
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
              <div className="flex justify-center mt-10 gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary !py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      pagination.page === i + 1
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary !py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
