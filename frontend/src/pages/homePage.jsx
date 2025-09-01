import React, { useState } from 'react';
import { ShoppingCart, Leaf, Star, Users, Truck, Shield, ArrowRight, Menu, X, BookOpen, Video, FileText, Award } from 'lucide-react';
import Navigation from '../components/navigation';
import SimpleChatbot from '../components/SimpleChatbot';
import { NavLink } from 'react-router-dom';



const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const featuredProducts = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: "$4.99/lb",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      rating: 4.8,
      badge: "Fresh"
    },
    {
      id: 2,
      name: "Farm Eggs",
      price: "$5.99/dozen",
      image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400&h=300&fit=crop",
      rating: 4.9,
      badge: "Premium"
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
      text: "The freshest farm products I've ever purchased! FarmNex has become my go-to for all farm produce.",
      rating: 5
    },
    {
      name: "Michael Chen",
      text: "Excellent quality and fast delivery. Love supporting local farmers through FarmNex.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      text: "Amazing selection of both crops and animal products. Everything stays fresh for weeks!",
      rating: 5
    }
  ];

  const trainingHighlights = [
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step farming techniques from expert agriculturists",
      count: "50+ Videos",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: FileText,
      title: "Comprehensive Guides",
      description: "Detailed farming guides and best practices documentation",
      count: "100+ Guides",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Award,
      title: "Expert Knowledge",
      description: "Learn from certified agricultural experts and experienced farmers",
      count: "Expert Led",
      color: "bg-purple-100 text-purple-600"
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-xl animate-pulse transform rotate-45 shadow-2xl"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-gradient-to-tl from-teal-300/15 to-green-500/15 rounded-full blur-2xl animate-bounce transform -rotate-12 shadow-2xl"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/25 to-green-600/25 rounded-full blur-lg animate-ping transform rotate-90 shadow-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-gradient-to-bl from-green-300/10 to-teal-400/10 rounded-full blur-xl animate-pulse transform rotate-180 shadow-2xl"></div>
      </div>
      
      <div>
        <Navigation />
      </div>

      <div className='pt-10'>
        
        {/* Hero Section with 3D Background */}
        <section 
          id="home" 
          className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center transform-gpu"
          style={{
            background: `
              linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.65) 100%),
              radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 70%),
              url('https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1920&h=1080&fit=crop&crop=center')
            `,
            backgroundSize: 'cover, 100% 100%, cover',
            backgroundPosition: 'center, center, center',
            backgroundAttachment: 'fixed, scroll, fixed',
            boxShadow: 'inset 0 0 200px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 transform-gpu" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.5)',
                transform: 'perspective(1000px) rotateX(5deg)',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))'
              }}>
                Fresh <span className="text-green-300 animate-pulse" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.6)',
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                }}>Farm</span> Products
                <br />
                <span className="text-green-300 animate-pulse" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.6)',
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.8))'
                }}>Delivered</span> to Your Door
              </h1>
              <p className="text-xl text-white mb-8 max-w-3xl mx-auto transform-gpu" style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7)',
                transform: 'perspective(800px) rotateX(2deg)',
                filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.7))',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: '12px 24px',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)'
              }}>
                Experience the finest farm products including fresh crops and quality animal products sourced directly from local farms. 
                Fresh, healthy, and sustainable - that's our promise to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink to="/products">
                  <button className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:via-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 hover:rotate-1 transform-gpu" style={{
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.6), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transform: 'perspective(500px) rotateX(-5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
                  }}>
                    Shop Now
                  </button>
                </NavLink>
                <NavLink to="/training">
                  <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all backdrop-blur-sm inline-flex items-center transform hover:scale-105 hover:-rotate-1 transform-gpu" style={{
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                    transform: 'perspective(500px) rotateX(-5deg)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
                  }}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explore Training
                  </button>
                </NavLink>
                <NavLink to="/login">
                  <button className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 transition-all backdrop-blur-sm inline-flex items-center transform hover:scale-105 hover:rotate-1 transform-gpu" style={{
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.6), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    transform: 'perspective(500px) rotateX(-5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
                  }}>
                    <Users className="mr-2 h-5 w-5" />
                    Join Us
                  </button>
                </NavLink>
              </div>
            </div>
          </div>
          
          {/* 3D Floating animation elements */}
          <div className="absolute top-20 left-10 animate-bounce transform-gpu" style={{
            transform: 'perspective(400px) rotateX(45deg) rotateY(45deg)'
          }}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-70 shadow-2xl" style={{
              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
            }}></div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse transform-gpu" style={{
            transform: 'perspective(400px) rotateX(-30deg) rotateY(-30deg)'
          }}>
            <div className="w-6 h-6 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full opacity-60 shadow-xl" style={{
              boxShadow: '0 6px 20px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)'
            }}></div>
          </div>
          <div className="absolute bottom-32 left-1/4 animate-bounce transform-gpu" style={{animationDelay: '1s', transform: 'perspective(300px) rotateX(60deg)'}}>
            <div className="w-4 h-4 bg-gradient-to-bl from-orange-400 to-red-500 rounded-full opacity-50 shadow-lg" style={{
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}></div>
          </div>
        </section>

        {/* Features Section with 3D Background Pattern */}
        <section 
          className="py-16 relative transform-gpu"
          style={{
            background: `
              linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(255, 255, 255, 0.95) 100%),
              radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
              url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&h=1080&fit=crop&crop=center')
            `,
            backgroundSize: 'cover, 100% 100%, 100% 100%, cover',
            backgroundAttachment: 'scroll, scroll, scroll, fixed',
            boxShadow: 'inset 0 0 50px rgba(34, 197, 94, 0.1), 0 -10px 30px rgba(34, 197, 94, 0.1)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FarmNex?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're committed to bringing you the freshest, highest quality farm products including crops and animal products 
                while supporting sustainable farming practices.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-rotate-1 transform-gpu" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(34, 197, 94, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                transform: 'perspective(500px) rotateX(-2deg)'
              }}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 transform-gpu" style={{
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
                  transform: 'perspective(300px) rotateX(-10deg)'
                }}>
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600">Premium quality farm products including fresh crops and ethically sourced animal products.</p>
              </div>
              
              <div className="text-center p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:rotate-1 transform-gpu" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(34, 197, 94, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                transform: 'perspective(500px) rotateX(-2deg)'
              }}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 transform-gpu" style={{
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
                  transform: 'perspective(300px) rotateX(-10deg)'
                }}>
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Same-day delivery available to ensure maximum freshness.</p>
              </div>
              
              <div className="text-center p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-rotate-1 transform-gpu" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(34, 197, 94, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                transform: 'perspective(500px) rotateX(-2deg)'
              }}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 transform-gpu" style={{
                  boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
                  transform: 'perspective(300px) rotateX(-10deg)'
                }}>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">100% satisfaction guarantee or your money back.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Training Section with 3D Background */}
        <section 
          id="training" 
          className="py-16 relative transform-gpu"
          style={{
            background: `
              linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(34, 197, 94, 0.2) 30%, rgba(15, 23, 42, 0.95) 70%, rgba(21, 128, 61, 0.3) 100%),
              radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
              url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=1080&fit=crop&crop=center')
            `,
            backgroundSize: 'cover, 100% 100%, 100% 100%, cover',
            backgroundPosition: 'center, center, center, center',
            backgroundAttachment: 'fixed, scroll, scroll, fixed',
            boxShadow: 'inset 0 0 100px rgba(34, 197, 94, 0.2)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Agricultural Training & Education</h2>
              <p className="text-gray-200 max-w-2xl mx-auto drop-shadow-md">
                Enhance your farming knowledge with our comprehensive training materials. 
                Learn modern techniques, sustainable practices, and boost your productivity.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {trainingHighlights.map((highlight, index) => {
                const IconComponent = highlight.icon;
                return (
                  <div key={index} className="transform-gpu p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:rotate-1" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(34, 197, 94, 0.08) 100%)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 10px 40px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
                    transform: 'perspective(600px) rotateX(-3deg)'
                  }}>
                    <div className={`w-16 h-16 ${highlight.color} rounded-full flex items-center justify-center mx-auto mb-4 transform-gpu`} style={{
                      boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255,255,255,0.9)',
                      transform: 'perspective(400px) rotateX(-15deg)'
                    }}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{highlight.title}</h3>
                    <p className="text-gray-600 text-center mb-3">{highlight.description}</p>
                    <div className="text-center">
                      <span className="inline-block bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {highlight.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <NavLink to="/training">
                <button className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore All Training Materials
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </NavLink>
            </div>
          </div>
        </section>
        {/* Featured Products with 3D Background */}
        <section 
          id="products" 
          className="py-16 relative transform-gpu"
          style={{
            background: `
              linear-gradient(145deg, rgba(249, 250, 251, 0.95) 0%, rgba(34, 197, 94, 0.03) 40%, rgba(249, 250, 251, 0.9) 100%),
              radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
              url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=1080&fit=crop&crop=center')
            `,
            backgroundSize: 'cover, 100% 100%, 100% 100%, cover',
            backgroundPosition: 'center, center, center, center',
            boxShadow: 'inset 0 0 80px rgba(34, 197, 94, 0.05)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600">Handpicked fresh crops and quality animal products from our trusted local farmers</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="rounded-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 hover:rotate-1 transform-gpu" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(34, 197, 94, 0.02) 100%)',
                  boxShadow: '0 10px 40px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
                  transform: 'perspective(800px) rotateX(-2deg)'
                }}>
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform hover:scale-110"
                    />
                    <span className="absolute top-4 left-4 text-white px-2 py-1 rounded-full text-sm font-medium transform-gpu" style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                      boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                      transform: 'perspective(200px) rotateX(-10deg)'
                    }}>
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
                      <button className="text-white px-4 py-2 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 hover:-rotate-1 transform-gpu" style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                        boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)',
                        transform: 'perspective(300px) rotateX(-5deg)'
                      }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 hover:rotate-1 inline-flex items-center transform-gpu" style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
                transform: 'perspective(400px) rotateX(-5deg)'
              }}>
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
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-gray-600">Join thousands of satisfied customers who trust FarmNex</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:rotate-1 transform-gpu" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(34, 197, 94, 0.03) 100%)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 40px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
                  transform: 'perspective(600px) rotateX(-2deg)'
                }}>
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
            backgroundImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9)), url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to Start Your Farm Fresh Journey?</h2>
            <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Join our community of health-conscious customers and enjoy fresh farm products including crops and animal products delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/products">
                <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                  Start Shopping
                </button>
              </NavLink>
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
            backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.95)), url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Leaf className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold">FarmNex</span>
                </div>
                <p className="text-gray-300">
                  Your trusted source for fresh farm products including crops and animal products delivered straight from local farms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><NavLink to="/" className="hover:text-white transition-colors">Home</NavLink></li>
                  <li><NavLink to="/products" className="hover:text-white transition-colors">Products</NavLink></li>
                  <li><NavLink to="/training" className="hover:text-white transition-colors">Training</NavLink></li>
                  <li><NavLink to="/about" className="hover:text-white transition-colors">About Us</NavLink></li>
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
                  <p>Email: info@farmnex.com</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Address: 123 Farm Street, Green Valley, CA 90210</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FarmNex. All rights reserved.</p>
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
