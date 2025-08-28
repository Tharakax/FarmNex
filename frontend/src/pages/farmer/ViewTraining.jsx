import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEdit, FaTrash, FaCalendar, FaUser } from 'react-icons/fa';
import Header from '../../components/Header.jsx';
import { trainingAPI } from '../../services/api';

const ViewTraining = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
<<<<<<< HEAD
      const material = await trainingAPI.getMaterialById(id);
      setMaterial(material);
=======
      const response = await trainingAPI.getMaterialById(id);
      setMaterial(response.data);
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
    } catch (err) {
      console.error('Error fetching material:', err);
      setError('Failed to load training material');
    } finally {
      setLoading(false);
    }
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
      'Crop Management': 'bg-farmer-green-100 text-farmer-green-800',
      'Livestock': 'bg-earth-brown-100 text-earth-brown-800',
      'Equipment': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              {error || 'Training material not found'}
            </h3>
            <p className="text-gray-600 mb-6">
              The training material you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/" className="btn-primary">
              <FaArrowLeft className="inline mr-2" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="btn-outline">
            <FaArrowLeft className="inline mr-2" />
            Back to Home
          </Link>
          <div className="flex space-x-3">
            <Link
              to={`/edit/${material._id}`}
              className="btn-secondary"
            >
              <FaEdit className="inline mr-2" />
              Edit
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-farmer-green-500 to-farmer-green-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">{material.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(material.difficulty)}`}>
                {material.difficulty}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(material.category)}`}>
                {material.category}
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium">
                {material.type}
              </span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <FaEye className="mr-2" />
                {material.views} views
              </div>
              <div className="flex items-center">
                <FaUser className="mr-2" />
                {material.createdBy}
              </div>
              <div className="flex items-center">
                <FaCalendar className="mr-2" />
                {formatDate(material.createdAt)}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {material.description}
                </p>
              </div>
            </div>

            {/* Resources Section */}
            {(material.uploadLink || material.fileName) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
                <div className="space-y-4">
                  {material.uploadLink && (
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                          🔗
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">External Link</p>
                        <p className="text-sm text-gray-600 truncate">{material.uploadLink}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href={material.uploadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm py-2 px-4"
                        >
                          Open Link
                        </a>
                      </div>
                    </div>
                  )}

                  {material.fileName && (
                    <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                          📄
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Uploaded File</p>
                        <p className="text-sm text-gray-600">
                          {material.fileName} ({(material.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href={`http://localhost:3000/uploads/${material.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm py-2 px-4"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {material.tags && material.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(material.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(material.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Views</dt>
                  <dd className="mt-1 text-sm text-gray-900">{material.views} times</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Author</dt>
                  <dd className="mt-1 text-sm text-gray-900">{material.createdBy}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTraining;
