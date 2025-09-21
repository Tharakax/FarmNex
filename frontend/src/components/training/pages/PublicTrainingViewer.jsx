import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Calendar, 
  Eye, 
  ArrowLeft,
  Download,
  User,
  Clock,
  Play,
  Image
} from 'lucide-react';
import Navigation from '../../navigation';
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';

const PublicTrainingViewer = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        console.log('Fetching material with ID:', id);
        const response = await fetch(`http://localhost:3000/api/training/published/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.material) {
          setMaterial(data.material);
          console.log('Material loaded successfully:', data.material.title);
        } else {
          console.log('Material not found or not published:', data);
          setError('Material not found or not published');
        }
      } catch (err) {
        console.error('Error fetching material:', err);
        setError(`Failed to load training material: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const getTypeIcon = (type) => {
    if (!type) return <FileText className="h-6 w-6 text-gray-600" />;
    
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-6 w-6 text-red-600" />;
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'image':
        return <Image className="h-6 w-6 text-green-600" />;
      case 'guide':
      case 'article':
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
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
      .slice(0, 6); // Limit to 6 tags
    
    return cleanedTags;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading training material...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-6xl mb-4">404</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Material Not Found</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: if material is null after loading
  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Material Not Available</h2>
            <p className="text-gray-600 mb-8">The requested training material could not be loaded.</p>
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
      <Navigation />
      
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="relative z-10 pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Navigation */}
        <div className="mb-8">
          <Link 
            to="/"
            className="group inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-green-700 border-2 border-green-200/50 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="tracking-wide">Back to Training Hub</span>
          </Link>
        </div>

        {/* Premium Material Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gray-200/50 p-10 mb-12 relative overflow-hidden">
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-blue-50/30 to-indigo-50/50 pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Type and Difficulty Badges */}
            <div className="flex items-center justify-between mb-8">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold shadow-xl border-2 backdrop-blur-sm ${
                material.type === 'Video' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300/50 shadow-red-300/50' :
                material.type === 'PDF' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300/50 shadow-blue-300/50' :
                material.type === 'Image' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300/50 shadow-green-300/50' :
                'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300/50 shadow-purple-300/50'
              }`}>
                {getTypeIcon(material.type)}
                <span className="tracking-wider">{material.type || 'Unknown'}</span>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-xl border-2 backdrop-blur-sm ${
                material.difficulty === 'Beginner' ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-green-300/50 shadow-green-300/50' :
                material.difficulty === 'Intermediate' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-orange-300/50 shadow-orange-300/50' :
                'bg-gradient-to-r from-rose-400 to-red-500 text-white border-red-300/50 shadow-red-300/50'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="tracking-wider">{material.difficulty || 'Unknown'}</span>
              </div>
            </div>
            
            {/* Enhanced Title and Description */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight bg-gradient-to-r from-green-700 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                {material.title}
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium tracking-wide">
                {material.description}
              </p>
            </div>

            {/* Premium Material Info Grid */}
            <div className="bg-gradient-to-r from-gray-50 via-blue-50/30 to-gray-50 rounded-3xl p-8 mb-8 border-2 border-gray-200/50 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-200/50">
                    <Calendar className="h-7 w-7 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Created</div>
                    <div className="font-bold text-gray-900 text-lg">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg border-2 border-purple-200/50">
                    <Eye className="h-7 w-7 text-purple-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Views</div>
                    <div className="font-bold text-gray-900 text-lg">{material.views || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg border-2 border-green-200/50">
                    <User className="h-7 w-7 text-green-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Author</div>
                    <div className="font-bold text-gray-900 text-lg">{material.createdBy}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-lg border-2 border-orange-200/50">
                    <FileText className="h-7 w-7 text-orange-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Type</div>
                    <div className="font-bold text-gray-900 text-lg">{material.type || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Tags and Category Section */}
            <div className="text-center">
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl text-lg font-bold shadow-xl border-2 border-blue-300/50">
                  <BookOpen className="h-5 w-5" />
                  <span className="tracking-wide">{material.category || 'Uncategorized'}</span>
                </span>
              </div>
              
              {material.tags && parseAndCleanTags(material.tags).length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Tags</div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {parseAndCleanTags(material.tags).map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-xl text-sm font-semibold border border-gray-300/50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="capitalize">{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Premium Content Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gray-200/50 overflow-hidden relative">
          {/* Content Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-blue-50/20 pointer-events-none"></div>
          
          {/* Premium Video Content */}
          {material.type === 'Video' && material.fileName && (
            <div className="p-10 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Training Video</h2>
                <p className="text-gray-600 font-medium">Watch this comprehensive training video to enhance your farming skills</p>
              </div>
              
              <div className="relative shadow-2xl border-4 border-gray-200/50 rounded-3xl overflow-hidden">
                <EnhancedVideoPlayer
                  src={`http://localhost:3000/uploads/${material.fileName}`}
                  title={material.title}
                  className="max-h-[600px]"
                  onTimeUpdate={(time) => {
                    // Optional: Track video progress for analytics
                    console.log('Video progress:', time);
                  }}
                  onEnded={() => {
                    // Optional: Handle video completion
                    console.log('Video completed');
                  }}
                />
              </div>
              
              <div className="mt-8 flex items-center justify-center bg-gradient-to-r from-gray-50 to-red-50/30 rounded-2xl p-6 border-2 border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
                    <Video className="h-6 w-6 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Video File</p>
                    <p className="font-bold text-gray-900">{material.fileName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium PDF Content */}
          {material.type === 'PDF' && material.fileName && (
            <div className="p-10 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Training Document</h2>
                <p className="text-gray-600 font-medium">Read through this comprehensive training document</p>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-xl border-2 border-blue-400/30">
                  <Play className="h-5 w-5 text-white" />
                  <span className="tracking-wide text-white font-extrabold">PDF Document Available</span>
                </div>
              </div>
              
              <iframe
                src={`http://localhost:3000/uploads/${material.fileName}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full rounded-3xl border-4 border-gray-200/50 shadow-2xl"
                style={{ height: '700px', minHeight: '500px' }}
                title={`PDF: ${material.title}`}
              >
                <p className="text-center p-8">
                  Your browser does not support PDFs. 
                  <a href={`http://localhost:3000/uploads/${material.fileName}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold underline">
                    Click here to view the PDF
                  </a>
                </p>
              </iframe>
            </div>
          )}

          {/* Premium Image Content */}
          {material.type === 'Image' && material.fileName && (
            <div className="p-10 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Training Image</h2>
                <p className="text-gray-600 font-medium">Study this detailed training image</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl shadow-xl border-2 border-green-400/30">
                  <Image className="h-5 w-5 text-white" />
                  <span className="tracking-wide text-white font-extrabold">Training Image</span>
                </div>
              </div>
              
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200/50">
                <img 
                  src={`http://localhost:3000/uploads/${material.fileName}`}
                  alt={material.title}
                  className="w-full object-contain max-h-[600px] bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Premium Text Content */}
          {material.content && (
            <div className="p-10 border-t-2 border-gray-200/50 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">Training Content</h2>
                <p className="text-gray-600 font-medium">Detailed information and instructions</p>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-3xl p-8 border-2 border-gray-200/50 shadow-inner">
                <div className="prose prose-xl max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium tracking-wide">
                    {material.content}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premium Call-to-Action Section */}
        <div className="mt-16 text-center relative">
          <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl border-2 border-gray-200/50 relative overflow-hidden">
            {/* CTA Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Ready for More Learning?</h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">Discover more professional training materials to enhance your agricultural skills</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/#training"
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-white text-green-700 font-extrabold rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-3xl border-2 border-white/30"
                  style={{ color: '#15803d' }}
                >
                  <BookOpen className="h-6 w-6 text-green-700 transition-transform duration-300 group-hover:scale-125" />
                  <span className="text-xl tracking-wide text-green-700 font-extrabold">Explore Training Hub</span>
                  <ArrowLeft className="h-6 w-6 text-green-700 rotate-180 transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
                
                <Link 
                  to="/training"
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-transparent text-white font-extrabold rounded-2xl border-2 border-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-3xl"
                  style={{ color: '#ffffff' }}
                >
                  <Video className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-125" />
                  <span className="text-xl tracking-wide text-white font-extrabold">Browse All Materials</span>
                </Link>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTrainingViewer;