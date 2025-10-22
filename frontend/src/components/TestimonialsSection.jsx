import React, { useState, useEffect } from 'react';
import { Star, Users, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:3000/api/feedback?limit=100&sortBy=createdAt&sortOrder=desc');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch feedbacks: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
          // Debug: Log the raw data to see what's being returned
          console.log('Raw feedback data:', data.data);
          
          // Filter only approved feedbacks - handle different possible formats
          const approvedOnly = data.data.filter(feedback => {
            // Check for various possible formats of isApproved
            return feedback.isApproved === true || 
                   feedback.isApproved === 'true' ||
                   feedback.status === 'approved';
          });
          
          console.log('Total feedbacks:', data.data.length);
          console.log('Approved feedbacks:', approvedOnly.length);
          console.log('Approved feedback details:', approvedOnly);
          
          // Format the testimonials
          const formattedTestimonials = approvedOnly.map(feedback => ({
            id: feedback._id,
            name: feedback.customerName || 'Anonymous',
            text: feedback.message || '',
            rating: feedback.rating || 5,
            subject: feedback.subject || 'Great Service'
          }));
          
          setTestimonials(formattedTestimonials);
        } else {
          throw new Error(data.message || 'Failed to fetch feedbacks');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={20}
            className={index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section 
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.97)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&crop=center')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section 
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.97)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&crop=center')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block p-6 bg-red-100 rounded-full mb-6">
              <Users className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Testimonials</h2>
            <p className="text-gray-600 text-lg">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section 
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.97)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&crop=center')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
              <Users className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 text-lg">Be the first to share your experience with FarmNex!</p>
            <p className="text-gray-500 text-sm mt-2">No approved testimonials yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.97)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&crop=center')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold uppercase tracking-wide">
              Testimonials
            </span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Join thousands of satisfied farmers who trust FarmNex for their farm management needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="group relative"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`
              }}
            >
              <div className="h-full p-8 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                {/* Quote icon */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="h-6 w-6 text-white" />
                </div>
                
                {/* Rating */}
                <div className="mb-4 pt-2">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Subject */}
                {testimonial.subject && (
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {testimonial.subject}
                  </h3>
                )}
                
                {/* Testimonial text */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                {/* Customer info */}
                <div className="flex items-center pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">{testimonial.name}</span>
                    <span className="text-sm text-green-600 font-medium">Verified Customer</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        {testimonials.length > 3 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              View All Testimonials
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;