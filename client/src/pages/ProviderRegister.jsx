import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  IndianRupee,
  Plus,
  X,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { providerAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProviderRegister = () => {
  const { user, provider, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    experience: '',
    location: {
      coordinates: [0, 0],
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    services: [{ category: '', name: '', price: '', priceType: 'fixed', description: '' }],
    serviceRadius: 10,
    availability: {
      isAvailable: true,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '09:00', end: '18:00' }
    }
  });

  useEffect(() => {
    if (provider) {
      navigate('/provider-dashboard');
      return;
    }
    fetchCategories();
  }, [provider]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { category: '', name: '', price: '', priceType: 'fixed', description: '' }]
    }));
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  const handleWorkingDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.availability.workingDays.includes(day)
        ? prev.availability.workingDays.filter(d => d !== day)
        : [...prev.availability.workingDays, day];
      return {
        ...prev,
        availability: { ...prev.availability, workingDays: days }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.businessName || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.location.city || !formData.location.address) {
      toast.error('Please provide your location');
      return;
    }

    const validServices = formData.services.filter(s => s.name && s.price);
    if (validServices.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    setSubmitting(true);
    try {
      // For demo, use random coordinates
      const submitData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: [-73.935242 + Math.random() * 0.1, 40.730610 + Math.random() * 0.1]
        },
        services: validServices.map(s => ({
          ...s,
          price: parseFloat(s.price)
        })),
        experience: parseInt(formData.experience) || 0
      };

      await providerAPI.register(submitData);
      toast.success('Provider registration successful! Pending verification.');
      await checkAuth();
      navigate('/provider-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-3xl mx-auto px-4 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Become a Service Provider</h1>
          <p className="text-gray-500 mt-2">Join our network and grow your business</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
           <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
             <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                 <Briefcase className="h-4 w-4 text-primary-600" />
               </div>
              Business Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your business name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Describe your services and experience..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Location */}
           <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
             <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                 <MapPin className="h-4 w-4 text-primary-600" />
               </div>
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="location.zipCode"
                    value={formData.location.zipCode}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="ZIP"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  name="serviceRadius"
                  value={formData.serviceRadius}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Services */}
           <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                 <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                   <IndianRupee className="h-4 w-4 text-primary-600" />
                 </div>
                Services Offered
              </h2>
              <button
                type="button"
                onClick={addService}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </button>
            </div>
            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="p-4 bg-gray-50/80 rounded-xl relative border border-gray-100">
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={service.category}
                        onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Electrical Repair"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                        className="input-field"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Type
                      </label>
                      <select
                        value={service.priceType}
                        onChange={(e) => handleServiceChange(index, 'priceType', e.target.value)}
                        className="input-field"
                      >
                        <option value="fixed">Fixed</option>
                        <option value="hourly">Hourly</option>
                        <option value="negotiable">Negotiable</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Description
                    </label>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      className="input-field"
                      placeholder="Brief description of this service"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
           <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
             <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                 <Clock className="h-4 w-4 text-primary-600" />
               </div>
              Availability
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWorkingDayToggle(day)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                        formData.availability.workingDays.includes(day)
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.availability.workingHours.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        workingHours: { ...prev.availability.workingHours, start: e.target.value }
                      }
                    }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.availability.workingHours.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        workingHours: { ...prev.availability.workingHours, end: e.target.value }
                      }
                    }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
             className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
           >
             {submitting ? (
               'Submitting...'
             ) : (
               <>
                 <CheckCircle className="h-5 w-5" />
                 Register as Provider
                 <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProviderRegister;
