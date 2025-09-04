import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Save, ArrowLeft, Upload, Trash2, FileText, Video, BookOpen, 
  AlertCircle, CheckCircle, Info, Tag, User, Calendar,
  Eye, Clock, Target, Lightbulb, Award
} from 'lucide-react';
import Header from '../../components/Header.jsx';
import { trainingAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/sweetAlert';

const AddEditTraining = ({ materialToEdit, onSaveSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id || materialToEdit);
  const [dragActive, setDragActive] = useState(false);

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
    if (materialToEdit) {
      setFormData({
        title: materialToEdit.title || '',
        description: materialToEdit.description || '',
        type: materialToEdit.type || 'Article',
        uploadLink: materialToEdit.uploadLink || '',
        tags: materialToEdit.tags ? materialToEdit.tags.join(', ') : '',
        difficulty: materialToEdit.difficulty || 'Beginner',
        category: materialToEdit.category || 'General',
        createdBy: materialToEdit.createdBy || 'Admin'
      });
    } else if (isEditing && id) {
      fetchMaterial();
    }
  }, [id, isEditing, materialToEdit]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const material = await trainingAPI.getMaterialById(id);
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
      await showError('Failed to load training material');
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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        file: selectedFile
      };

      if (isEditing) {
        await trainingAPI.updateMaterial(materialToEdit?._id || id, submitData);
        if (onSaveSuccess) {
          onSaveSuccess('Training material updated successfully!');
        } else {
          await showSuccess('Training material updated successfully!');
        }
      } else {
        await trainingAPI.createMaterial(submitData);
        if (onSaveSuccess) {
          onSaveSuccess('Training material created successfully!');
        } else {
          await showSuccess('Training material created successfully!');
        }
      }
      
      if (!onSaveSuccess) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving material:', error);
      await showError(isEditing ? 'Failed to update training material' : 'Failed to create training material');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'Video': return Video;
      case 'PDF': return FileText;
      case 'Guide': 
      case 'Article': 
      case 'FAQ': return BookOpen;
      default: return FileText;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    document.getElementById('file-input').value = '';
  };

  if (loading && (isEditing || materialToEdit)) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading training material...</p>
        </div>
      </div>
    );
  }

  const ContentTypeIcon = getContentTypeIcon(formData.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Only show Header if not being used within dashboard */}
      {!onCancel && <Header />}
      
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${!onCancel ? 'pt-24 pb-12' : 'py-8'}`}>
        {/* Professional Header */}
        <div className="mb-8">
          {onCancel && (
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Materials
            </button>
          )}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ContentTypeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Training Material' : 'Create Training Material'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update the training content details' : 'Share your knowledge with the farming community'}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Training Details</h2>
                  <p className="text-sm text-gray-600">Fill in the information below</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(formData.difficulty)}`}>
                {formData.difficulty} Level
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Information Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title */}
                <div className="lg:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-green-600" />
                      <span>Training Title *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    placeholder="e.g., 'Modern Irrigation Techniques for Small Farms'"
                  />
                  {errors.title && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{errors.title}</p>
                    </div>
                  )}
                </div>

                {/* Content Type & Category */}
                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <ContentTypeIcon className="h-4 w-4 text-green-600" />
                      <span>Content Type *</span>
                    </div>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white ${errors.type ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <option value="Article">📄 Article</option>
                    <option value="Video">🎥 Video Tutorial</option>
                    <option value="Guide">📋 Step-by-Step Guide</option>
                    <option value="PDF">📁 PDF Document</option>
                    <option value="FAQ">❓ FAQ</option>
                  </select>
                  {errors.type && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{errors.type}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span>Category *</span>
                    </div>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <option value="General">🌱 General Farming</option>
                    <option value="Crop Management">🌾 Crop Management</option>
                    <option value="Livestock">🐄 Livestock</option>
                    <option value="Equipment">🚜 Equipment & Tools</option>
                    <option value="Finance">💰 Farm Finance</option>
                    <option value="Marketing">📈 Marketing & Sales</option>
                  </select>
                  {errors.category && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{errors.category}</p>
                    </div>
                  )}
                </div>

                {/* Difficulty & Author */}
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span>Difficulty Level</span>
                    </div>
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white border-gray-200 hover:border-gray-300"
                  >
                    <option value="Beginner">🟢 Beginner</option>
                    <option value="Intermediate">🟡 Intermediate</option>
                    <option value="Advanced">🔴 Advanced</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="createdBy" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span>Author Name</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="createdBy"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white border-gray-200 hover:border-gray-300"
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Content Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-green-600" />
                      <span>Detailed Description *</span>
                    </div>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    placeholder="Provide a comprehensive description of what farmers will learn from this material. Include key benefits, techniques covered, and expected outcomes..."
                  />
                  {errors.description && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{errors.description}</p>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Write a detailed description to help farmers understand the value</span>
                    <span>{formData.description.length}/1000 characters</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span>Tags</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white border-gray-200 hover:border-gray-300"
                    placeholder="irrigation, water management, sustainability, efficiency"
                  />
                  <p className="mt-2 text-sm text-gray-500 flex items-center space-x-1">
                    <Info className="h-3 w-3" />
                    <span>Add relevant keywords separated by commas to help farmers find this content</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Content Upload Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <Upload className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Content Upload</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* External Link */}
                <div>
                  <label htmlFor="uploadLink" className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span>External Link</span>
                    </div>
                  </label>
                  <input
                    type="url"
                    id="uploadLink"
                    name="uploadLink"
                    value={formData.uploadLink}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white ${errors.uploadLink ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    placeholder="https://youtube.com/watch?v=example or https://example.com"
                  />
                  <p className="mt-2 text-sm text-gray-500">Link to YouTube video, website, or online resource</p>
                  {errors.uploadLink && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{errors.uploadLink}</p>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-green-600" />
                      <span>Upload File</span>
                    </div>
                  </label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${dragActive ? 'border-green-400 bg-green-50' : selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center space-x-1 mx-auto transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove File</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <label
                            htmlFor="file-input"
                            className="cursor-pointer text-green-600 hover:text-green-700 font-semibold"
                          >
                            Choose file
                            <input
                              id="file-input"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif"
                            />
                          </label>
                          <span className="text-gray-600"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          PDF, DOC, MP4, Images up to 100MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 -m-8 mt-0 p-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Draft will be saved automatically</span>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{isEditing ? 'Update Material' : 'Create Material'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Tips for Creating Great Training Content</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use clear, descriptive titles that explain what farmers will learn</li>
                <li>• Include practical examples and real-world applications</li>
                <li>• Add relevant tags to make content easily discoverable</li>
                <li>• For videos, ensure good audio quality and clear visual demonstrations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditTraining;
