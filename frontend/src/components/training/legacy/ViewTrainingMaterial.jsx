import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Video,
  FileText,
  BookOpen,
  Download,
  Eye,
  Calendar,
  User,
  Clock,
  Star,
  Share2,
  Bookmark,
  CheckCircle,
  PlayCircle,
  ExternalLink,
  Tag
} from 'lucide-react';
import { formatAuthorName } from '../../utils/userUtils';

// Card component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

const ViewTrainingMaterial = ({ material, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedMaterials, setRelatedMaterials] = useState([]);

  useEffect(() => {
    if (material) {
      // Simulate loading related materials
      setRelatedMaterials([
        {
          _id: 'related1',
          title: 'Advanced Soil Testing Methods',
          category: material.category,
          type: 'PDF',
          views: 87
        },
        {
          _id: 'related2',
          title: 'Nutrient Management Basics',
          category: material.category,
          type: 'Video',
          views: 156
        },
        {
          _id: 'related3',
          title: 'Crop Planning Guide',
          category: material.category,
          type: 'Article',
          views: 203
        }
      ]);

      // Mark material as viewed (increase view count)
      incrementViewCount();
    }
  }, [material]);

  const incrementViewCount = async () => {
    if (!material?._id) return;
    
    try {
      await fetch(`/api/training/${material._id}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleComplete = () => {
    setCompleted(!completed);
    // Here you would typically save progress to backend
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // Here you would typically save bookmark to backend
  };

  const handleDownload = () => {
    try {
      if (material.fileName) {
        // Download the actual file from the server
        const fileUrl = `http://localhost:3000/uploads/${material.fileName}`;
        const fileName = material.fileName;
        
        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank'; // Open in new tab as fallback
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloading file: ${fileName} from ${fileUrl}`);
      } else if (material.uploadLink) {
        // Fallback to external link if no uploaded file
        window.open(material.uploadLink, '_blank');
      } else {
        alert('No file available for download.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-6 w-6 text-red-600" />;
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'guide':
      case 'article':
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!material) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Material not found</h3>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Training
        </button>
      </div>

      {/* Material Header */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              {getTypeIcon(material.type)}
              <span className="text-lg font-medium text-gray-600">{material.type}</span>
              <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getDifficultyColor(material.difficulty)}`}>
                {material.difficulty}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {material.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-4">
              {material.description}
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(material.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {formatAuthorName(material.createdBy)}
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                {material.views} views
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-2 ml-6">
            <button
              onClick={handleComplete}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                completed 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {completed ? 'Completed' : 'Mark Complete'}
            </button>
            
            <button
              onClick={handleBookmark}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                bookmarked
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            {(material.fileName || material.uploadLink) && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            )}
          </div>
        </div>

        {/* Tags and Category */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {material.category}
            </span>
            {material.tags?.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                #{tag}
              </span>
            ))}
          </div>
          
          <button className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      </Card>

      {/* Content Section */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
        
        {material.type === 'Video' && (
          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            {material.fileName ? (
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-auto max-h-96"
                  controls
                  poster="/api/placeholder/800/400"
                  onError={(e) => {
                    console.error('Video error:', e.target.error);
                    console.log('Video URL that failed:', `http://localhost:3000/uploads/${material.fileName}`);
                  }}
                  onLoadStart={() => console.log('Video load started')}
                  onCanPlay={() => console.log('Video can play')}
                  onLoadedData={() => console.log('Video data loaded')}
                >
                  <source src={`http://localhost:3000/uploads/${material.fileName}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="text-center p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{material.title}</h3>
                  <p className="text-gray-600">Training Video</p>
                </div>
              </div>
            ) : material.uploadLink ? (
              <div className="text-center">
                <PlayCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Video Content</h3>
                <p className="text-gray-600 mb-4">Click to watch the training video</p>
                <button
                  onClick={() => window.open(material.uploadLink, '_blank')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Watch Video
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Video content will be available soon</p>
              </div>
            )}
          </div>
        )}

        {material.type === 'PDF' && (
          <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
            <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Document</h3>
            <p className="text-gray-600 mb-4">Download or view the PDF document</p>
            {material.uploadLink ? (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => window.open(material.uploadLink, '_blank')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Online
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </button>
              </div>
            ) : (
              <p className="text-gray-500">PDF content will be available soon</p>
            )}
          </div>
        )}

        {(material.type === 'Article' || material.type === 'Guide') && (
          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Article Content</h3>
              {material.content ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {material.content}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No content available for this article.
                </p>
              )}
              {material.uploadLink && (
                <div className="mt-6">
                  <button
                    onClick={() => window.open(material.uploadLink, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Content
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Related Materials */}
      {relatedMaterials.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedMaterials.map((related) => (
              <div
                key={related._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(related.type)}
                  <span className="text-sm font-medium text-gray-600">{related.type}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{related.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{related.category}</span>
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {related.views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Progress Tracking */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completion Status</span>
              <span className="text-sm text-gray-500">{completed ? '100%' : '0%'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  completed ? 'bg-green-600 w-full' : 'bg-blue-600 w-0'
                }`}
              />
            </div>
          </div>
          <div className="text-right">
            {completed ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Not started</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewTrainingMaterial;
