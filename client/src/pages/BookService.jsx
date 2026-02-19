import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, IndianRupee, FileText, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import { providerAPI, bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const BookService = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    selectedService: null,
    scheduledDate: '',
    scheduledTime: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    description: ''
  });

  useEffect(() => {
    fetchProvider();
    loadRazorpayScript();
  }, [providerId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchProvider = async () => {
    try {
      const response = await providerAPI.getById(providerId);
      setProvider(response.data.data.provider);
      
      // Pre-select first service if available
      if (response.data.data.provider.services?.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedService: response.data.data.provider.services[0]
        }));
      }

      // Pre-fill address from user location if available
      if (user?.location) {
        setFormData(prev => ({
          ...prev,
          address: {
            street: user.location.address || '',
            city: user.location.city || '',
            state: user.location.state || '',
            zipCode: user.location.zipCode || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
      toast.error('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceSelect = (service) => {
    setFormData(prev => ({ ...prev, selectedService: service }));
  };

  const initiatePayment = async (bookingId, amount) => {
    try {
      const orderResponse = await paymentAPI.createOrder({
        amount: amount,
        bookingId: bookingId
      });

      const { orderId, keyId } = orderResponse.data.data;

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Localify',
        description: `Payment for ${formData.selectedService.name} | Demo: Use NET BANKING to complete payment`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingId
            });
            toast.success('Payment successful! Booking confirmed.');
            navigate('/my-bookings');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          demo_info: 'For demo payments, please select NET BANKING and use any bank to complete the test transaction.'
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            setSubmitting(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedService) {
      toast.error('Please select a service');
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    setSubmitting(true);
    try {
      const bookingResponse = await bookingAPI.create({
        providerId,
        service: {
          name: formData.selectedService.name,
          price: formData.selectedService.price,
          priceType: formData.selectedService.priceType
        },
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        address: formData.address,
        description: formData.description
      });

      const bookingId = bookingResponse.data.data._id;
      const amount = formData.selectedService.price;

      await initiatePayment(bookingId, amount);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
          <button onClick={() => navigate('/search')} className="btn-primary">
            Browse Providers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-4xl mx-auto px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Service */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-4 w-4 text-primary-600" />
                  </div>
                  Select Service
                </h2>
                <div className="space-y-3">
                  {provider.services?.map((service, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.selectedService?.name === service.name
                          ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="service"
                          checked={formData.selectedService?.name === service.name}
                          onChange={() => handleServiceSelect(service)}
                          className="text-primary-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">₹{service.price}</p>
                        <p className="text-xs text-gray-500 capitalize">{service.priceType}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary-600" />
                  </div>
                  Select Date & Time
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Service Address */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary-600" />
                  </div>
                  Service Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
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
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  Additional Details
                </h2>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe your requirements or any specific details..."
                />
              </div>

              {/* Demo Payment Info */}
              <div className="mb-4 p-4 bg-blue-50/80 border border-blue-200/60 rounded-xl">
                <p className="text-sm text-blue-800 font-semibold">Demo Mode</p>
                <p className="text-xs text-blue-600 mt-1">
                  Use <strong>NET BANKING</strong> and select any bank to complete the test payment.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
              >
                <CreditCard className="h-5 w-5" />
                {submitting ? 'Processing...' : 'Pay & Confirm Booking'}
                {!submitting && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              {/* Provider Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">
                    {provider.businessName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{provider.businessName}</p>
                  <p className="text-sm text-gray-500">{provider.location?.city}</p>
                </div>
              </div>

              {/* Selected Service */}
              {formData.selectedService && (
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Selected Service</p>
                  <p className="font-medium text-gray-900">{formData.selectedService.name}</p>
                </div>
              )}

              {/* Date & Time */}
              {formData.scheduledDate && formData.scheduledTime && (
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Scheduled</p>
                  <p className="font-medium text-gray-900">
                    {new Date(formData.scheduledDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {' at '}
                    {formData.scheduledTime}
                  </p>
                </div>
              )}

              {/* Total */}
              {formData.selectedService && (
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{formData.selectedService.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right capitalize">
                    {formData.selectedService.priceType}
                  </p>
                  <div className="mt-4 p-3 bg-emerald-50/80 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-4 w-4" />
                      Secure payment via Razorpay
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
