import React from 'react';
import { XCircle, ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PaymentUnsuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Failed</h1>
          <p className="mt-2 text-lg text-gray-600">
            We encountered an issue processing your payment. Please try again.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Order ID: {orderId}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-medium text-red-800">What went wrong?</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Possible reasons:</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Insufficient funds in your account</li>
                  <li>• Incorrect card details entered</li>
                  <li>• Card expiration date has passed</li>
                  <li>• Temporary issue with your bank</li>
                  <li>• Security checks failed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-medium text-blue-800">What to do next?</h2>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <CreditCard className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Try a different payment method</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Use a different credit/debit card or try PayPal, bank transfer, or cash on delivery.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Contact your bank</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your bank might be blocking the transaction. Contact them to authorize the payment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CreditCard className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Check your details</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ensure all card details are entered correctly, including expiration date and CVV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(`/payment/${orderId}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Try Payment Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@farmnex.com" className="text-blue-600 hover:text-blue-500">
              support@farmnex.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}