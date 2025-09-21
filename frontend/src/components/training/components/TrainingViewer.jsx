import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Calendar,
  User,
  Eye,
  Clock,
  Tag,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { formatAuthorName } from '../../../utils/userUtils';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

/**
 * Consolidated Training Material Viewer Component
 * Handles viewing of videos, PDFs, images, articles, and external links
 * Can be used as modal or embedded viewer
 */
const TrainingViewer = ({ 
  material, 
  isOpen = true, 
  onClose, 
  embedded = false,
  showMetadata = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Close modal on escape key
    const handleEsc = (e) => {
      if (e.keyCode === 27 && onClose) {
        onClose();
      }
    };
    
    if (isOpen && !embedded) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, embedded]);

  if (!isOpen || !material) return null;

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-600" />;
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Crop Management': 'bg-green-100 text-green-800',
      'Livestock': 'bg-brown-100 text-brown-800',
      'Equipment': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    try {
      if (material.fileName) {
        const fileUrl = `http://localhost:3000/uploads/${material.fileName}`;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = material.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (material.uploadLink) {
        window.open(material.uploadLink, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const renderVideoPlayer = () => {
    const videoUrl = material.fileName ? 
      `http://localhost:3000/uploads/${material.fileName}` : 
      material.uploadLink;
    
    return (
      <EnhancedVideoPlayer
        src={videoUrl}
        title={material.title}
        className="max-h-96"
        onTimeUpdate={(time) => {
          // Optional: Track video progress
          console.log('Video progress:', time);
        }}
        onEnded={() => {
          // Optional: Handle video completion
          console.log('Video completed');
        }}
      />
    );
  };

  const renderPDFViewer = () => (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <FileText className="h-24 w-24 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {material.title}
      </h3>
      <p className="text-gray-600 mb-4">
        {material.fileSize ? `File size: ${formatFileSize(material.fileSize)}` : 'PDF document ready for viewing'}
      </p>
      <button
        onClick={handleDownload}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </button>
    </div>
  );

  const renderImageViewer = () => (
    <div className="relative">
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={material.fileName ? 
            `http://localhost:3000/uploads/${material.fileName}` : 
            "/api/placeholder/800/600"
          }
          alt={material.title}
          className="w-full h-auto max-h-96 object-contain"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        />
      </div>
      
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setRotation((rotation + 90) % 360)}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Rotate"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderArticle = () => (
    <div className="prose max-w-none">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{material.title}</h2>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {material.description}
        </div>
        
        {material.uploadLink && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">External Resource</p>
            <a
              href={material.uploadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View External Content
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (material.type?.toLowerCase()) {
      case 'video':
        return renderVideoPlayer();
      case 'pdf':
        return renderPDFViewer();
      case 'image':
        return renderImageViewer();
      case 'article':
      default:
        return renderArticle();
    }
  };

  const content = (
    <div className={embedded ? '' : 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4'}>
      <div className={`bg-white rounded-xl ${embedded ? 'w-full' : 'max-w-6xl max-h-[90vh]'} overflow-auto`}>
        {/* Header */}
        {!embedded && (
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              {getTypeIcon(material.type)}
              <h2 className="text-xl font-semibold">{material.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {material.difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(material.difficulty)}`}>
                  {material.difficulty}
                </span>
              )}
              {material.category && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(material.category)}`}>
                  {material.category}
                </span>
              )}
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {material.type}
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              {material.views && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {material.views} views
                </div>
              )}
              {material.createdBy && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {formatAuthorName(material.createdBy)}
                </div>
              )}
              {material.createdAt && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(material.createdAt)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>

        {/* Description (if not article type) */}
        {material.type?.toLowerCase() !== 'article' && material.description && (
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {material.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="p-6 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {material.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return content;
};

export default TrainingViewer;