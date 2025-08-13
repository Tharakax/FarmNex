import React, { useState } from 'react';
import { ShoppingCart, Leaf, Star, Users, Truck, Shield, ArrowRight, Menu, X } from 'lucide-react';
import Navigation from '../components/navigation';
import SimpleChatbot from '../components/SimpleChatbot';
import { NavLink } from 'react-router-dom';



const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const featuredProducts = [
    {
      id: 1,
      name: "Organic Tomatoes",
      price: "$4.99/lb",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      rating: 4.8,
      badge: "Fresh"
    },
    {
      id: 2,
      name: "Fresh Spinach",
      price: "$3.49/bunch",
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop",
      rating: 4.9,
      badge: "Organic"
    },
    {
      id: 3,
      name: "Bell Peppers",
      price: "$2.99/lb",
      image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop",
      rating: 4.7,
      badge: "Local"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "The freshest organic produce I've ever purchased! CropCart has become my go-to for all vegetables.",
      rating: 5
    },
    {
      name: "Michael Chen",
      text: "Excellent quality and fast delivery. Love supporting local organic farmers through CropCart.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      text: "Amazing selection and the produce stays fresh for weeks. Highly recommend!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div>
        <Navigation />
      </div>

      <div className='pt-10'>
        
        {/* Hero Section with Background Image */}
        <section 
          id="home" 
          className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.pexels.com/photos/8633675/pexels-photo-8633675.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Fresh <span className="text-green-400">Organic</span> Crops
                <br />
                <span className="text-green-400">Delivered</span> to Your Door
              </h1>
              <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
                Experience the finest organic produce sourced directly from local farms. 
                Fresh, healthy, and sustainable - that's our promise to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink to="/products">
                <button 
            
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg">
                  Shop Now
                </button>
                </NavLink>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors backdrop-blur-sm"
                 
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
          
          {/* Floating animation elements */}
          <div className="absolute top-20 left-10 animate-bounce">
            <div className="w-8 h-8 bg-green-400 rounded-full opacity-70"></div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse">
            <div className="w-6 h-6 bg-yellow-400 rounded-full opacity-60"></div>
          </div>
          <div className="absolute bottom-32 left-1/4 animate-bounce" style={{animationDelay: '1s'}}>
            <div className="w-4 h-4 bg-orange-400 rounded-full opacity-50"></div>
          </div>
        </section>

        {/* Features Section with Background Pattern */}
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url('https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CropCart?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're committed to bringing you the freshest, highest quality organic produce 
                while supporting sustainable farming practices.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Organic</h3>
                <p className="text-gray-600">Certified organic produce grown without harmful pesticides or chemicals.</p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Same-day delivery available to ensure maximum freshness.</p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">100% satisfaction guarantee or your money back.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products with Subtle Background */}
        <section 
          id="products" 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600">Handpicked fresh produce from our trusted local farmers</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform hover:scale-110"
                    />
                    <span className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-medium shadow-lg">
                      {product.badge}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm ml-2">({product.rating})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">{product.price}</span>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-md">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 inline-flex items-center shadow-lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials with Background Image */}
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url('https://images.pexels.com/photos/219794/pexels-photo-219794.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-gray-600">Join thousands of satisfied customers who trust CropCart</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 shadow-md">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{testimonial.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section with Dynamic Background */}
        <section 
          className="py-16 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to Start Your Organic Journey?</h2>
            <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Join our community of health-conscious customers and enjoy fresh, organic produce delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Start Shopping
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105 backdrop-blur-sm">
                Subscribe to Newsletter
              </button>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
        </section>

        {/* Footer with Dark Background */}
        <footer 
          className="relative py-12"
          style={{
            backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.95)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Leaf className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold">CropCart</span>
                </div>
                <p className="text-gray-300">
                  Your trusted source for fresh, organic produce delivered straight from local farms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                <div className="space-y-2 text-gray-300">
                  <p>Email: info@cropcart.com</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Address: 123 Farm Street, Green Valley, CA 90210</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 CropCart. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Chatbot Widget */}
      <SimpleChatbot />
    </div>
  );
};

export default HomePage;
