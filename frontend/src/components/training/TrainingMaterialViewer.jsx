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
  RotateCw
} from 'lucide-react';
import { formatAuthorName } from '../../utils/userUtils';

const TrainingMaterialViewer = ({ material, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Close modal on escape key
    const handleEsc = (e) => {
      if (e.keyCode === 27) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !material) return null;

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-600" />;
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
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
      } else {
        alert('No file available for download.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const renderVideoPlayer = () => {
    // Construct the correct video URL from fileName
    const videoUrl = material.fileName ? `http://localhost:3000/uploads/${material.fileName}` : "/api/placeholder/video";
    
    console.log('Video URL:', videoUrl); // Debug log
    
    return (
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          className="w-full h-auto max-h-96"
          controls
          poster="/api/placeholder/800/400"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video error:', e.target.error);
            console.log('Video URL that failed:', videoUrl);
          }}
          onLoadStart={() => console.log('Video load started')}
          onCanPlay={() => console.log('Video can play')}
          onLoadedData={() => console.log('Video data loaded')}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video overlay info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
          {material.fileName || 'Video File'}
        </div>
      </div>
    );
  };

  const renderPDFViewer = () => (
    <div className="bg-gray-100 rounded-lg p-8 text-center">
      <FileText className="h-24 w-24 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {material.fileName || 'PDF Document'}
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
      
      {/* PDF Preview (mock) */}
      <div className="mt-6 border border-gray-300 rounded-lg p-4 bg-white">
        <p className="text-gray-600 text-sm">
          PDF preview would be displayed here in a real implementation.
        </p>
      </div>
    </div>
  );

  const renderImageViewer = () => (
    <div className="relative">
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <img
          src="/api/placeholder/800/600"
          alt={material.title}
          className="w-full h-auto max-h-96 object-contain"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        />
      </div>
      
      {/* Image controls */}
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
        <button
          onClick={() => { setZoomLevel(1); setRotation(0); }}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );

  const renderArticleContent = () => (
    <div className="prose prose-sm max-w-none">
      <div className="bg-gray-50 rounded-lg p-6">
        {material.content ? (
          <div className="whitespace-pre-wrap">
            {material.content}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No content available for this article.</p>
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
      default:
        return renderArticleContent();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            {getTypeIcon(material.type)}
            <div>
              <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                {material.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(material.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {material.views} views
                </span>
                {material.estimatedDuration && (
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {material.estimatedDuration}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {material.fileName && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Material Info */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                {material.difficulty}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {material.category}
              </span>
              {material.tags?.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  <Tag className="h-3 w-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            
            <p className="text-gray-700 mb-4">
              {material.description}
            </p>
            
            {material.createdBy && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                Created by {formatAuthorName(material.createdBy)}
              </div>
            )}
          </div>

          {/* Main Content */}
          {renderContent()}
          
          {/* Learning Objectives */}
          {material.learningObjectives && material.learningObjectives.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                {material.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Prerequisites */}
          {material.prerequisites && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Prerequisites</h3>
              <p className="text-sm text-yellow-800">{material.prerequisites}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingMaterialViewer;