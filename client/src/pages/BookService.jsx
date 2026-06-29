import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, IndianRupee, FileText, CreditCard, ArrowRight, ShieldCheck, Shield } from 'lucide-react';
import { providerAPI, bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';

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
          color: '#09090b' // zinc-950
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
          <h2 className="text-2xl font-bold text-neutral-950 tracking-tight mb-2">Provider Not Found</h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto font-medium">The provider you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/search')}>Browse Providers</Button>
        </div>
      </div>
    );
  }

  const baseInputClass = "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all placeholder:text-neutral-400 shadow-sm";

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neutral-950 rounded-[12px] flex items-center justify-center shadow-subtle">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Book a Service</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Service */}
              <Card className="bg-white shadow-subtle border border-neutral-200">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <IndianRupee className="h-4.5 w-4.5 text-neutral-950" />
                    </div>
                    Select Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {provider.services?.map((service, index) => (
                      <label
                        key={index}
                        className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all ${
                          formData.selectedService?.name === service.name
                            ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950 shadow-subtle'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="service"
                            checked={formData.selectedService?.name === service.name}
                            onChange={() => handleServiceSelect(service)}
                            className="w-5 h-5 text-neutral-950 border-neutral-300 focus:ring-neutral-950"
                          />
                          <div>
                            <p className="font-bold text-neutral-950 text-lg mb-0.5 tracking-tight">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-neutral-500 max-w-md font-medium">{service.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-neutral-950 text-xl">₹{service.price}</p>
                          <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{service.priceType}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card className="bg-white shadow-subtle border border-neutral-200">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-4.5 w-4.5 text-neutral-950" />
                    </div>
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-neutral-950 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleInputChange}
                        min={getMinDate()}
                        className={baseInputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-950 mb-2">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleInputChange}
                        className={baseInputClass}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Address */}
              <Card className="bg-white shadow-subtle border border-neutral-200">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-4.5 w-4.5 text-neutral-950" />
                    </div>
                    Service Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-neutral-950 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className={baseInputClass}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-neutral-950 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className={baseInputClass}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-950 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          className={baseInputClass}
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-950 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          className={baseInputClass}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card className="bg-white shadow-subtle border border-neutral-200">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-4.5 w-4.5 text-neutral-950" />
                    </div>
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${baseInputClass} resize-none`}
                    placeholder="Describe your requirements or any specific details..."
                  />
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-elevated border-neutral-200 bg-white">
              <CardHeader className="border-b border-neutral-100 bg-white pb-5">
                <CardTitle className="tracking-tight">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Provider Info */}
                <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
                  <Avatar 
                    src={provider.avatarUrl}
                    alt={provider.businessName}
                    fallback={provider.businessName?.charAt(0)}
                    size="lg"
                  />
                  <div>
                    <p className="font-bold text-neutral-950 text-lg mb-0.5 tracking-tight">{provider.businessName}</p>
                    <p className="text-sm text-neutral-500 font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {provider.location?.city || 'Location not set'}
                    </p>
                  </div>
                </div>

                {/* Selected Service */}
                {formData.selectedService && (
                  <div className="py-5 border-b border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Selected Service</p>
                    <p className="font-bold text-neutral-950 text-lg tracking-tight">{formData.selectedService.name}</p>
                  </div>
                )}

                {/* Date & Time */}
                {formData.scheduledDate && formData.scheduledTime && (
                  <div className="py-5 border-b border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Scheduled For</p>
                    <p className="font-bold text-neutral-950 text-lg flex items-center gap-2 tracking-tight">
                      {new Date(formData.scheduledDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      <span className="text-neutral-300">•</span>
                      {formData.scheduledTime}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-neutral-500 font-medium">Total Amount</span>
                    <span className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                      ₹{formData.selectedService?.price || '0'}
                    </span>
                  </div>
                  {formData.selectedService && (
                    <p className="text-[10px] font-bold text-neutral-500 text-right uppercase tracking-wider">
                      {formData.selectedService.priceType}
                    </p>
                  )}
                  
                  {/* Demo Payment Info */}
                  <div className="mt-8 mb-6 p-4 bg-neutral-100 border border-neutral-200 rounded-2xl">
                    <p className="text-sm text-neutral-950 font-bold mb-1 tracking-tight">Demo Mode</p>
                    <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                      Use <strong className="font-bold">NET BANKING</strong> and select any bank to complete the test payment.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 text-base shadow-subtle"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {submitting ? 'Processing...' : 'Pay & Confirm'}
                    {!submitting && <ArrowRight className="h-5 w-5 ml-2" />}
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-neutral-500">
                    <ShieldCheck className="h-4 w-4" />
                    Secure payment via Razorpay
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
