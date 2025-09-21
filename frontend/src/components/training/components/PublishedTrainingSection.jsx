import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Calendar, 
  Eye, 
  Tag,
  ArrowRight,
  PlayCircle,
  Download,
  Clock,
  Star
} from 'lucide-react';

const PublishedTrainingSection = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublishedMaterials();
  }, []);

  const fetchPublishedMaterials = async () => {
    try {
      console.log('PublishedTrainingSection: Fetching published materials...');
      const baseURL = 'http://localhost:3000';
      const url = `${baseURL}/api/training/published?limit=6`;
      console.log('PublishedTrainingSection: API URL:', url);
      
      const response = await fetch(url);
      console.log('PublishedTrainingSection: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('PublishedTrainingSection: API response:', data);
      
      if (data.success && data.materials) {
        console.log('PublishedTrainingSection: Found', data.materials.length, 'materials');
        setMaterials(data.materials);
      } else {
        console.log('PublishedTrainingSection: No materials found or API error');
        setError('No published training materials found');
        setMaterials([]);
      }
    } catch (err) {
      console.error('PublishedTrainingSection: Error fetching materials:', err);
      setError(`Failed to load training materials: ${err.message}`);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'guide':
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const parseAndCleanTags = (tags) => {
    if (!tags) return [];
    
    let tagsArray = [];
    
    // Handle different tag formats
    if (Array.isArray(tags)) {
      tagsArray = tags;
    } else if (typeof tags === 'string') {
      // If it's a comma-separated string
      if (tags.includes(',')) {
        tagsArray = tags.split(',');
      } else {
        tagsArray = [tags];
      }
    }
    
    // Clean and filter tags
    const cleanedTags = tagsArray
      .map(tag => {
        if (typeof tag !== 'string') {
          tag = String(tag);
        }
        // Remove all brackets, quotes, backslashes and trim
        return tag.replace(/[\[\]"\\]/g, '').trim();
      })
      .filter(tag => tag && tag.length > 0) // Remove empty strings
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 3); // Limit to 3 tags for cards
    
    return cleanedTags;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading training materials...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show debug info and handle empty materials
  if (materials.length === 0 && !loading && !error) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Published Training Materials</h2>
            <p className="text-gray-600 mb-4">There are currently no published training materials available.</p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">Debug: Component loaded but no materials found.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Don't show section if there's an error without materials
  if (error && materials.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Training Materials Unavailable</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="bg-red-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-red-800">Please check the console for more details.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Structured Learning Paths</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow our curated learning paths designed by agricultural experts
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {materials.map((material) => (
            <div 
              key={material._id} 
              className="group bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-3 relative backdrop-blur-sm"
            >
              {/* Premium Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-blue-50/30 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Premium Card Header with Enhanced Gradient */}
              <div className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20 p-6 pb-4 border-b border-gray-100">
                {/* Type Badge - Enhanced */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg border-2 backdrop-blur-sm ${
                    material.type === 'Video' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-red-200' :
                    material.type === 'PDF' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-blue-200' :
                    'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-300 shadow-purple-200'
                  }`}>
                    {getTypeIcon(material.type)}
                    <span className="font-semibold tracking-wide">{material.type}</span>
                  </div>
                  
                  {/* Enhanced Difficulty Badge */}
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-lg border-2 backdrop-blur-sm ${
                    material.difficulty === 'Beginner' ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-green-300 shadow-green-200' :
                    material.difficulty === 'Intermediate' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-orange-300 shadow-orange-200' :
                    'bg-gradient-to-r from-rose-400 to-red-500 text-white border-red-300 shadow-red-200'
                  }`}>
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {material.difficulty}
                  </span>
                </div>

                {/* Enhanced Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors duration-300 leading-tight relative z-10">
                  {material.title}
                </h3>

                {/* Enhanced Description */}
                <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed font-medium relative z-10">
                  {material.description}
                </p>

                {/* Premium Category Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-blue-700 rounded-xl text-sm font-bold shadow-lg border-2 border-blue-200/50">
                    <Tag className="h-4 w-4" />
                    {material.category}
                  </span>
                </div>
              </div>

              {/* Enhanced Card Body */}
              <div className="p-6 bg-white/95 backdrop-blur-sm relative z-10">
                {/* Premium Metadata Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 mb-6 border border-gray-200/50 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Creation Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Created</div>
                        <div className="text-gray-900 font-bold text-sm">{formatDate(material.createdAt)}</div>
                      </div>
                    </div>
                    
                    {/* Views Count */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-md">
                        <Eye className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Views</div>
                        <div className="text-gray-900 font-bold text-sm">{material.views || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Tags Section */}
                {material.tags && parseAndCleanTags(material.tags).length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {parseAndCleanTags(material.tags).map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span className="capitalize">{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ultra Premium Action Button */}
                <Link 
                  to={`/training/${material._id}`}
                  className="group/btn relative w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:from-green-700 hover:via-emerald-600 hover:to-green-700 overflow-hidden border-2 border-green-400/20"
                  style={{ color: '#ffffff' }}
                >
                  {/* Button Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                  
                  {/* Button Content */}
                  <div className="relative flex items-center gap-3 z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                      material.type === 'Video' ? 'bg-red-500/30 group-hover/btn:bg-red-400/40' : 'bg-blue-500/30 group-hover/btn:bg-blue-400/40'
                    }`}>
                      {material.type === 'Video' ? (
                        <PlayCircle className="h-6 w-6 text-white" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <span className="text-lg font-extrabold tracking-wide text-white">
                      {material.type === 'Video' ? 'Watch Training Video' : 'Read Training Material'}
                    </span>
                    <ArrowRight className="h-6 w-6 text-white transition-transform duration-300 group-hover/btn:translate-x-2" />
                  </div>
                </Link>
              </div>

              {/* Premium Card Border Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 border-transparent group-hover:border-green-300/30"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            to="/training"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ color: '#ffffff' }}
          >
            <BookOpen className="h-5 w-5 mr-2 text-white" />
            <span className="text-white font-bold">Explore All Training Materials</span>
            <ArrowRight className="h-5 w-5 ml-2 text-white" />
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{materials.length}+</div>
              <div className="text-sm text-gray-600">Training Materials</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {materials.reduce((sum, m) => sum + m.views, 0)}+
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(materials.map(m => m.category))].length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {[...new Set(materials.map(m => m.type))].length}
              </div>
              <div className="text-sm text-gray-600">Content Types</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublishedTrainingSection;
