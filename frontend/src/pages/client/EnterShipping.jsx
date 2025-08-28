import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { getCart } from '../../utils/cart';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function EnterShipping() {
  const navigate = useNavigate();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const orderData = JSON.parse(localStorage.getItem("orderData"));
  // Calculate order summary
  const subtotal = orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 2000 ? 0 : 15;
  const discount = subtotal > 3000 ? subtotal * 0.05 : 0;
  const total = subtotal + tax + shipping - discount;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const shippingData = {
        shippingAddress: {
          name: data.contactName,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          phone: data.contactPhone,
        },
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        notes: data.notes || '',
      };

      const token = localStorage.getItem('token');
      const id = params.id;
      console.log("Shipping Data:", shippingData);
      console.log("Order ID:", id);
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL+`/api/order/${id}/shipping-info`,shippingData,
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      if (response.data.success) {
        toast.success('Shipping information saved successfully');
        navigate(`/${id}/payment`); // Navigate to payment page
      } else {
        toast.error(response.data.message || 'Failed to save shipping information');
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      toast.error(error.response?.data?.message || 'Failed to submit shipping information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Cart</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Information</h1>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Shipping Form - Left Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Shipping Details</h2>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Contact Information */}
                  <div className="sm:col-span-6 border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                        <div className="mt-4">
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="contactName"
                          autoComplete="name"
                          className={`block w-full rounded-md shadow-sm ${errors.contactName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                          {...register('contactName', { required: 'Full Name is required' })}
                        />
                        {errors.contactName && (
                          <p className="mt-2 text-sm text-red-600">{errors.contactName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                        Email address *
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          id="contactEmail"
                          autoComplete="email"
                          className={`block w-full rounded-md shadow-sm ${errors.contactEmail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                          {...register('contactEmail', { required: 'Email is required' })}
                        />
                        {errors.contactEmail && (
                          <p className="mt-2 text-sm text-red-600">{errors.contactEmail.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                        Phone number *
                      </label>
                      <div className="mt-1">
                        <input
                          type="tel"
                          id="contactPhone"
                          autoComplete="tel"
                          className={`block w-full rounded-md shadow-sm ${errors.contactPhone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                          {...register('contactPhone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9]{10,15}$/,
                              message: 'Please enter a valid phone number'
                            }
                          })}
                        />
                        {errors.contactPhone && (
                          <p className="mt-2 text-sm text-red-600">{errors.contactPhone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="sm:col-span-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                    
                    <div className="mt-4">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Street address *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="street"
                          autoComplete="street-address"
                          className={`block w-full rounded-md shadow-sm ${errors.street ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                          {...register('street', { required: 'Street address is required' })}
                        />
                        {errors.street && (
                          <p className="mt-2 text-sm text-red-600">{errors.street.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-4">
                      <div className="sm:col-span-3">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="city"
                            autoComplete="address-level2"
                            className={`block w-full rounded-md shadow-sm ${errors.city ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                            {...register('city', { required: 'City is required' })}
                          />
                          {errors.city && (
                            <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State / Province *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="state"
                            autoComplete="address-level1"
                            className={`block w-full rounded-md shadow-sm ${errors.state ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                            {...register('state', { required: 'State is required' })}
                          />
                          {errors.state && (
                            <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-4">
                      <div className="sm:col-span-3">
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                          ZIP / Postal code *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="zipCode"
                            autoComplete="postal-code"
                            className={`block w-full rounded-md shadow-sm ${errors.zipCode ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                            {...register('zipCode', { 
                              required: 'ZIP code is required',
                              pattern: {
                                value: /^[0-9]{5,10}$/,
                                message: 'Please enter a valid ZIP code'
                              }
                            })}
                          />
                          {errors.zipCode && (
                            <p className="mt-2 text-sm text-red-600">{errors.zipCode.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="sm:col-span-6 mt-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Order notes (optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        {...register('notes')}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-3 inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-900">Items ({orderData.items.length})</h3>
                  <div className="space-y-4">
                    {orderData.items.map((item) => (
                      <div key={item.productId} className="flex items-start">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-md object-cover bg-gray-100"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-900">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount:</span>
                      <span className="text-green-600 font-medium">-Rs. {discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `Rs. ${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">Rs. {tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-semibold text-gray-900">Rs. {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}