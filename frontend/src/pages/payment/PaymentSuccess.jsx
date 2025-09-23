import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Calendar, ArrowLeft, Home, Mail, Download } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}`
        );
        
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          console.error('Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Thank you for your order. Your payment has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Order ID: {orderId}
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <div className="px-6 py-5">
            {order && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.name}<br />
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                      {order.shippingAddress?.phone}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Order Details</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> {order.status}<br />
                      <strong>Payment Method:</strong> {order.paymentMethod}<br />
                      <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Items Ordered</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs. {order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 mt-1">
                      <span>Discount</span>
                      <span>-Rs. {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : `Rs. ${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Tax</span>
                    <span>Rs. {order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900 mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>Rs. {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">What's Next?</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Order Confirmation</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You will receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 mt-4">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Shipping Updates</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We'll send you shipping updates as your order is processed and dispatched.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 mt-4">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Delivery</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Expected delivery: 2-5 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          <button
            onClick={() => navigate('/customerdash')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Order History
          </button>
          <button
            onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL}/api/order/receipt/${orderId}/pdf`, '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}