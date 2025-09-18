import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Navigation from '../navigation';
import { 
  BookOpen, Video, FileText, Award, ArrowRight, Users, TrendingUp, Clock, 
  Play, Download, Star, CheckCircle, Target, Lightbulb, Calendar, Eye, PlayCircle 
} from 'lucide-react';

const TrainingShowcase = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublishedMaterials();
  }, []);

  const fetchPublishedMaterials = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/training/published');
      const data = await response.json();
      
      if (data.success) {
        setMaterials(data.materials);
      } else {
        setError('Failed to fetch training materials');
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load training materials');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const trainingCategories = [
    {
      id: 1,
      icon: Video,
      title: "Video Learning",
      description: "Interactive video tutorials with expert demonstrations",
      count: "50+ Videos",
      features: ["HD Quality", "Subtitles", "Mobile Friendly"],
      color: "bg-blue-500",
      bgGradient: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      icon: FileText,
      title: "Written Guides",
      description: "Comprehensive step-by-step farming guides and articles",
      count: "100+ Guides", 
      features: ["Downloadable", "Printable", "Illustrated"],
      color: "bg-green-500",
      bgGradient: "from-green-500 to-green-600"
    },
    {
      id: 3,
      icon: Award,
      title: "Certification",
      description: "Earn certificates in sustainable farming practices",
      count: "5+ Programs",
      features: ["Verified", "Industry Recognized", "Progress Tracking"],
      color: "bg-purple-500",
      bgGradient: "from-purple-500 to-purple-600"
    }
  ];

  const learningPaths = [
    {
      title: "Beginner Farmer",
      description: "Start your farming journey with basic techniques",
      duration: "4 weeks",
      modules: 12,
      level: "Beginner",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Sustainable Agriculture",
      description: "Learn eco-friendly and sustainable farming methods",
      duration: "6 weeks", 
      modules: 18,
      level: "Intermediate",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Advanced Crop Management",
      description: "Master advanced techniques for maximum yield",
      duration: "8 weeks",
      modules: 24,
      level: "Advanced", 
      color: "bg-purple-100 text-purple-800"
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Practical Skills",
      description: "Learn hands-on farming techniques you can apply immediately"
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from certified agricultural professionals with years of experience"
    },
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "94% of our learners report improved farming productivity"
    },
    {
      icon: Lightbulb,
      title: "Latest Techniques",
      description: "Stay updated with modern farming innovations and best practices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      
      <div className="pt-24">
        {/* Hero Section */}
        <section 
          className="relative py-20 px-4 sm:px-6 lg:px-8"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              Master <span className="text-green-400">Modern</span> Agriculture
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto drop-shadow-md">
              Unlock your farming potential with our comprehensive training platform. 
              From beginner basics to advanced techniques, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/training">
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Now
                </button>
              </NavLink>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors backdrop-blur-sm">
                View Learning Paths
              </button>
            </div>
          </div>
        </section>

        {/* Training Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Style</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We offer multiple formats to match your preferred learning style and schedule
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trainingCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
                    <div className={`bg-gradient-to-r ${category.bgGradient} p-6 text-white`}>
                      <IconComponent className="h-12 w-12 mb-4" />
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="opacity-90">{category.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="text-2xl font-bold text-gray-900 mb-4">{category.count}</div>
                      <div className="space-y-2 mb-6">
                        {category.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <NavLink to="/training" className="w-full">
                        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          Explore {category.title}
                        </button>
                      </NavLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Learning Paths */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Structured Learning Paths</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow our curated learning paths designed by agricultural experts
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {learningPaths.map((path, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${path.color}`}>
                      {path.level}
                    </span>
                    <span className="text-gray-500 text-sm">{path.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                  <p className="text-gray-600 mb-4">{path.description}</p>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-500">{path.modules} modules</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <NavLink to="/training" className="w-full">
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Start Learning
                    </button>
                  </NavLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Published Training Materials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Published Training Materials</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start learning with our published training materials created by agricultural experts
              </p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading training materials...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && materials.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-yellow-800">No published training materials available yet.</p>
                </div>
              </div>
            )}

            {!loading && materials.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {materials.map((material) => (
                  <div key={material._id} className="group bg-white rounded-2xl shadow-2xl border-2 border-gray-200/50 overflow-hidden hover:shadow-3xl transition-all duration-700 transform hover:scale-[1.03] hover:-translate-y-4 relative backdrop-blur-sm">
                    {/* Premium Card Header with Enhanced Gradient */}
                    <div className="relative bg-gradient-to-br from-green-50/80 via-blue-50/60 to-indigo-50/80 p-6 border-b border-gray-200/50">
                      {/* Type Badge - Top Right - Enhanced */}
                      <div className="absolute top-4 right-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border-2 backdrop-blur-lg ${
                          material.type === 'Video' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300/50 shadow-red-300/50' :
                          material.type === 'PDF' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300/50 shadow-blue-300/50' :
                          'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300/50 shadow-purple-300/50'
                        }`}>
                          {getTypeIcon(material.type)}
                          <span className="tracking-wider">{material.type}</span>
                        </div>
                      </div>

                      {/* Enhanced Difficulty Badge - Top Left */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-extrabold shadow-xl border-2 backdrop-blur-sm ${
                          material.difficulty === 'Beginner' ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-green-300/50 shadow-green-300/50' :
                          material.difficulty === 'Intermediate' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-orange-300/50 shadow-orange-300/50' :
                          'bg-gradient-to-r from-rose-400 to-red-500 text-white border-red-300/50 shadow-red-300/50'
                        }`}>
                          <Star className="h-4 w-4 mr-1.5 fill-current" />
                          <span className="tracking-wider">{material.difficulty}</span>
                        </span>
                      </div>

                      {/* Enhanced Title */}
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-4 line-clamp-2 group-hover:text-green-700 transition-colors duration-300 leading-tight tracking-tight">
                        {material.title}
                      </h3>

                      {/* Enhanced Category Badge */}
                      <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-sm text-blue-700 rounded-2xl text-sm font-bold shadow-xl border-2 border-blue-200/70">
                        <Target className="h-5 w-5" />
                        <span className="tracking-wide">{material.category}</span>
                      </div>
                    </div>

                    {/* Enhanced Card Body */}
                    <div className="p-6 bg-white/98 backdrop-blur-sm">
                      {/* Enhanced Description */}
                      <p className="text-gray-700 text-base leading-relaxed mb-6 line-clamp-3 font-medium tracking-wide">
                        {material.description}
                      </p>

                      {/* Premium Metadata Section */}
                      <div className="bg-gradient-to-r from-gray-50 via-blue-50/30 to-gray-50 rounded-2xl p-5 mb-6 border-2 border-gray-200/50 shadow-inner">
                        <div className="grid grid-cols-2 gap-5">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-200/50">
                              <Calendar className="h-6 w-6 text-blue-700" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Created</div>
                              <div className="text-gray-900 font-bold text-sm">{new Date(material.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg border-2 border-purple-200/50">
                              <Eye className="h-6 w-6 text-purple-700" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Views</div>
                              <div className="text-gray-900 font-bold text-sm">{material.views || 0}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ultra Premium Action Button */}
                      <Link 
                        to={`/training/${material._id}`}
                        className="group/btn relative w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 text-white font-extrabold rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-500 hover:scale-110 hover:from-green-700 hover:via-emerald-600 hover:to-green-700 overflow-hidden border-2 border-green-400/30"
                        style={{ color: '#ffffff' }}
                      >
                        {/* Multiple Button Background Effects */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 opacity-0 group-hover/btn:opacity-40 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></div>
                        
                        {/* Enhanced Button Content */}
                        <div className="relative flex items-center gap-4 z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl border-2 ${
                            material.type === 'Video' ? 'bg-red-500/40 border-red-300/50 group-hover/btn:bg-red-400/60' : 'bg-blue-500/40 border-blue-300/50 group-hover/btn:bg-blue-400/60'
                          }`}>
                            {material.type === 'Video' ? (
                              <PlayCircle className="h-7 w-7 text-white" />
                            ) : (
                              <BookOpen className="h-7 w-7 text-white" />
                            )}
                          </div>
                          <span className="text-xl font-extrabold tracking-wide text-white">
                            {material.type === 'Video' ? 'Watch Training Video' : 'Read Training Material'}
                          </span>
                          <ArrowRight className="h-7 w-7 text-white transition-transform duration-500 group-hover/btn:translate-x-3 group-hover/btn:scale-125" />
                        </div>

                        {/* Enhanced Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out delay-200"></div>
                      </Link>
                    </div>

                    {/* Enhanced Premium Card Border Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/30 via-blue-500/20 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none border-2 border-transparent group-hover:border-green-400/40"></div>
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-green-400/20 via-blue-400/10 to-purple-400/20 opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none blur-sm"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Training?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our training platform is designed by farmers, for farmers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-all">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&h=800&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Ready to Transform Your Farming?</h2>
            <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Join thousands of farmers who have improved their yields and practices through our training program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/training">
                <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse All Training
                </button>
              </NavLink>
              <NavLink to="/add">
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105 backdrop-blur-sm inline-flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Add Training Content
                </button>
              </NavLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TrainingShowcase;
