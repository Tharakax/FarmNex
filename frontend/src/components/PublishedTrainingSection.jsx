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
      const response = await fetch('/api/training/published?limit=6');
      const data = await response.json();
      
      if (data.success) {
        setMaterials(data.materials);
      } else {
        setError('Failed to fetch training materials');
      }
    } catch (err) {
      console.error('Error fetching published materials:', err);
      setError('Failed to load training materials');
      // No mock data - only show real materials from farmers
      setMaterials([]);
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
      case 'guide':
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Only show the section if there are published materials from farmers
  if (materials.length === 0) {
    return null; // Don't show section if no materials
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
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(material.type)}
                    <span className="text-sm font-medium text-gray-600">{material.type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                    {material.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                  {material.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {material.description}
                </p>

                {/* Material Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(material.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {material.views}
                    </span>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {material.category}
                  </span>
                  {material.tags && material.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {material.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link 
                  to={`/training/${material._id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {material.type === 'Video' ? (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <BookOpen className="h-4 w-4 mr-2" />
                  )}
                  {material.type === 'Video' ? 'Watch Now' : 'Read More'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            to="/training"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Explore All Training Materials
            <ArrowRight className="h-5 w-5 ml-2" />
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
