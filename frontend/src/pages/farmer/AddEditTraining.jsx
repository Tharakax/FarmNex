import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaUpload, FaTrash } from 'react-icons/fa';
import Header from '../../components/Header.jsx';
import { trainingAPI } from '../../services/api';

const AddEditTraining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Article',
    uploadLink: '',
    tags: '',
    difficulty: 'Beginner',
    category: 'General',
    createdBy: 'Admin'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchMaterial();
    }
  }, [id, isEditing]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getMaterialById(id);
      const material = response.data;
      setFormData({
        title: material.title || '',
        description: material.description || '',
        type: material.type || 'Article',
        uploadLink: material.uploadLink || '',
        tags: material.tags ? material.tags.join(', ') : '',
        difficulty: material.difficulty || 'Beginner',
        category: material.category || 'General',
        createdBy: material.createdBy || 'Admin'
      });
    } catch (error) {
      console.error('Error fetching material:', error);
      alert('Failed to load training material');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // If type is Video and no file is selected and no upload link, show error
    if (formData.type === 'Video' && !formData.uploadLink.trim() && !selectedFile) {
      newErrors.uploadLink = 'Either upload a video file or provide a video link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        file: selectedFile
      };

      if (isEditing) {
        await trainingAPI.updateMaterial(id, submitData);
        alert('Training material updated successfully!');
      } else {
        await trainingAPI.createMaterial(submitData);
        alert('Training material created successfully!');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving material:', error);
      alert(isEditing ? 'Failed to update training material' : 'Failed to create training material');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    document.getElementById('file-input').value = '';
  };

  if (loading && isEditing) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Edit Training Material' : 'Add New Training Material'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update the training material details' : 'Create a new training resource for farmers'}
            </p>
          </div>
          <Link
            to="/"
            className="btn-outline"
          >
            <FaArrowLeft className="inline mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="form-label">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Enter training title..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="form-label">
                    Content Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`form-input ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value="Article">Article</option>
                    <option value="Video">Video</option>
                    <option value="Guide">Step-by-Step Guide</option>
                    <option value="PDF">PDF Document</option>
                    <option value="FAQ">FAQ</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`form-input ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="General">General</option>
                    <option value="Crop Management">Crop Management</option>
                    <option value="Livestock">Livestock</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Difficulty */}
                <div>
                  <label htmlFor="difficulty" className="form-label">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="form-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="farming, crops, irrigation (separate with commas)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Provide a detailed description of the training material..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Upload Link */}
                <div>
                  <label htmlFor="uploadLink" className="form-label">
                    External Link (YouTube, Website, etc.)
                  </label>
                  <input
                    type="url"
                    id="uploadLink"
                    name="uploadLink"
                    value={formData.uploadLink}
                    onChange={handleInputChange}
                    className={`form-input ${errors.uploadLink ? 'border-red-500' : ''}`}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {errors.uploadLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.uploadLink}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label htmlFor="file-input" className="form-label">
                    Upload File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-farmer-green-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-input"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-farmer-green-600 hover:text-farmer-green-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-input"
                            name="file-input"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, MP4, AVI, MOV, WMV, images up to 100MB
                      </p>
                    </div>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FaUpload className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="ml-3 text-red-400 hover:text-red-500"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Created By */}
                <div>
                  <label htmlFor="createdBy" className="form-label">
                    Created By
                  </label>
                  <input
                    type="text"
                    id="createdBy"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Author name"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link
                  to="/"
                  className="btn-outline text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <>
                      <FaSave className="inline mr-2" />
                      {isEditing ? 'Update Training' : 'Create Training'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditTraining;
