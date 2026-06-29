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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

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

  const baseInputClass = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all placeholder:text-neutral-400 shadow-sm font-medium";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neutral-950 rounded-[16px] flex items-center justify-center mx-auto mb-5 shadow-elevated">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Become a Service Provider</h1>
          <p className="text-neutral-500 mt-2 text-lg font-medium">Join our network and grow your business</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                  <Briefcase className="h-5 w-5 text-neutral-950" />
                </div>
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={baseInputClass}
                    placeholder="Your business name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`${baseInputClass} resize-none`}
                    rows={4}
                    placeholder="Describe your services and experience..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className={baseInputClass}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                  <MapPin className="h-5 w-5 text-neutral-950" />
                </div>
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    className={baseInputClass}
                    placeholder="Street address"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      className={baseInputClass}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      className={baseInputClass}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                      className={baseInputClass}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    name="serviceRadius"
                    value={formData.serviceRadius}
                    onChange={handleInputChange}
                    className={baseInputClass}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-neutral-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-3 tracking-tight">
                  <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                    <IndianRupee className="h-5 w-5 text-neutral-950" />
                  </div>
                  Services Offered
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                >
                  <Plus className="h-4.5 w-4.5 mr-1" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {formData.services.map((service, index) => (
                  <div key={index} className="p-5 bg-neutral-50 rounded-2xl relative border border-neutral-200 shadow-sm transition-all hover:border-neutral-950">
                    {formData.services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                    <div className="grid sm:grid-cols-2 gap-5 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                          Category
                        </label>
                        <select
                          value={service.category}
                          onChange={(e) => handleServiceChange(index, 'category', e.target.value)}
                          className={baseInputClass}
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          className={baseInputClass}
                          placeholder="e.g., Electrical Repair"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                          className={baseInputClass}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                          Price Type
                        </label>
                        <select
                          value={service.priceType}
                          onChange={(e) => handleServiceChange(index, 'priceType', e.target.value)}
                          className={baseInputClass}
                        >
                          <option value="fixed">Fixed</option>
                          <option value="hourly">Hourly</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                        Service Description
                      </label>
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        className={baseInputClass}
                        placeholder="Brief description of this service"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                  <Clock className="h-5 w-5 text-neutral-950" />
                </div>
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-3 uppercase tracking-wider">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {weekDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkingDayToggle(day)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all shadow-sm ${
                          formData.availability.workingDays.includes(day)
                            ? 'bg-neutral-950 text-white border border-neutral-950'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-950 hover:text-neutral-950'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5 pt-4 border-t border-neutral-100">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
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
                      className={baseInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
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
                      className={baseInputClass}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full !py-4 text-base shadow-elevated"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Register as Provider
                <ArrowRight className="h-5 w-5 ml-auto" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProviderRegister;
