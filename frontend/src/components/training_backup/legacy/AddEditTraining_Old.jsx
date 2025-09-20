import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Upload,
  FileText,
  Video,
  BookOpen,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Paperclip
} from 'lucide-react';
import FileUpload from '../common/FileUpload';
import { getAuthorName } from '../../utils/userUtils';
import { showSuccess, showError, showWarning, showConfirm, showToast } from '../../utils/sweetAlert';

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

const AddEditTraining = ({ material, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    type: 'Article',
    difficulty: 'Beginner',
    content: '',
    tags: [],
    estimatedDuration: '',
    prerequisites: '',
    learningObjectives: [],
    files: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    'Crop Management',
    'Livestock',
    'Equipment',
    'Finance',
    'Marketing',
    'General'
  ];

  const materialTypes = [
    'Article',
    'Video',
    'PDF',
    'Guide',
    'Tutorial',
    'Checklist',
    'FAQ'
  ];

  const difficultyLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  useEffect(() => {
    if (material && isEditing) {
      setFormData({
        title: material.title || '',
        description: material.description || '',
        category: material.category || 'General',
        type: material.type || 'Article',
        difficulty: material.difficulty || 'Beginner',
        content: material.content || '',
        tags: material.tags || [],
        estimatedDuration: material.estimatedDuration || '',
        prerequisites: material.prerequisites || '',
        learningObjectives: material.learningObjectives || [],
        files: material.files || []
      });
    }
  }, [material, isEditing]);

  // Handle file upload changes
  const handleFilesChange = (newFiles) => {
    setFormData(prev => ({
      ...prev,
      files: newFiles
    }));
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
        [name]: null
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) {
      showWarning('Please enter a tag before adding.');
      return;
    }
    
    if (trimmedTag.length > 50) {
      showWarning('Tags must be 50 characters or less.');
      return;
    }
    
    if (formData.tags.length >= 15) {
      showWarning('Maximum of 15 tags allowed.');
      return;
    }
    
    if (formData.tags.includes(trimmedTag)) {
      showWarning('This tag already exists.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setNewTag('');
    showToast(`Tag "${trimmedTag}" added successfully!`, 'success');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddObjective = () => {
    const trimmedObjective = newObjective.trim();
    
    if (!trimmedObjective) {
      showWarning('Please enter a learning objective before adding.');
      return;
    }
    
    if (trimmedObjective.length > 200) {
      showWarning('Learning objectives must be 200 characters or less.');
      return;
    }
    
    if (formData.learningObjectives.length >= 10) {
      showWarning('Maximum of 10 learning objectives allowed.');
      return;
    }
    
    if (formData.learningObjectives.includes(trimmedObjective)) {
      showWarning('This learning objective already exists.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, trimmedObjective]
    }));
    setNewObjective('');
    showToast('Learning objective added successfully!', 'success');
  };

  const handleRemoveObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    } else if (formData.content.length > 10000) {
      newErrors.content = 'Content must not exceed 10,000 characters';
    }

    // Prerequisites validation
    if (formData.prerequisites && formData.prerequisites.length > 300) {
      newErrors.prerequisites = 'Prerequisites must not exceed 300 characters';
    }

    // Learning objectives validation
    if (formData.learningObjectives.length > 10) {
      newErrors.learningObjectives = 'Maximum of 10 learning objectives allowed';
    }

    const invalidObjectives = formData.learningObjectives.filter(obj => obj.length > 200);
    if (invalidObjectives.length > 0) {
      newErrors.learningObjectives = 'Each learning objective must not exceed 200 characters';
    }

    // Tags validation
    if (formData.tags.length > 15) {
      newErrors.tags = 'Maximum of 15 tags allowed';
    }

    const invalidTags = formData.tags.filter(tag => tag.length > 50);
    if (invalidTags.length > 0) {
      newErrors.tags = 'Each tag must not exceed 50 characters';
    }

    // Estimated duration validation
    if (formData.estimatedDuration && formData.estimatedDuration.length > 50) {
      newErrors.estimatedDuration = 'Estimated duration must not exceed 50 characters';
    }

    // File validation
    if (formData.files.length > 10) {
      newErrors.files = 'Maximum of 10 files allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning('Please correct all validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const materialData = {
        ...formData,
        _id: material?._id || `material-${Date.now()}`,
        createdAt: material?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: getAuthorName(), // Use actual logged-in user data
        views: material?.views || 0
      };

      await onSave(materialData);
      
      showSuccess(
        `Training material ${isEditing ? 'updated' : 'created'} successfully!`,
        'Success!'
      );
    } catch (error) {
      console.error('Error saving material:', error);
      showError(
        `Failed to ${isEditing ? 'update' : 'create'} training material. Please try again.`,
        'Error!'
      );
      setErrors({ submit: 'Failed to save training material. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'Article':
      case 'Guide':
      case 'Tutorial':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Training Material' : 'Add New Training Material'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update the training material information' : 'Create a new training resource for farmers'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <Card>
          <div className="prose max-w-none">
            <div className="flex items-center space-x-3 mb-4">
              {getTypeIcon(formData.type)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 m-0">{formData.title || 'Untitled'}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {formData.category}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {formData.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {formData.type}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{formData.description}</p>
            
            {formData.estimatedDuration && (
              <p className="text-sm text-gray-500 mb-4">
                <strong>Duration:</strong> {formData.estimatedDuration}
              </p>
            )}
            
            {formData.prerequisites && (
              <div className="mb-4">
                <strong>Prerequisites:</strong>
                <p className="text-gray-600">{formData.prerequisites}</p>
              </div>
            )}
            
            {formData.learningObjectives.length > 0 && (
              <div className="mb-4">
                <strong>Learning Objectives:</strong>
                <ul className="list-disc list-inside text-gray-600 mt-2">
                  {formData.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="prose max-w-none">
              {formData.content ? (
                <div className="whitespace-pre-wrap">{formData.content}</div>
              ) : (
                <p className="text-gray-400 italic">No content added yet...</p>
              )}
            </div>
            
            {formData.files.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Paperclip className="h-4 w-4 text-gray-600" />
                  <strong className="text-sm text-gray-600">Attachments ({formData.files.length}):</strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.files.map((file) => {
                    const IconComponent = (() => {
                      switch (file.category) {
                        case 'document': return FileText;
                        case 'image': return 'Image';
                        case 'video': return Video;
                        case 'audio': return 'Mic';
                        default: return FileText;
                      }
                    })();
                    
                    return (
                      <div key={file.id || file.tempId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                          file.category === 'image' ? 'bg-green-100' :
                          file.category === 'video' ? 'bg-red-100' :
                          file.category === 'document' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          {typeof IconComponent === 'string' ? (
                            <span className={`text-lg ${
                              file.category === 'image' ? 'text-green-600' :
                              file.category === 'video' ? 'text-red-600' :
                              file.category === 'document' ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>📄</span>
                          ) : (
                            <IconComponent className={`h-5 w-5 ${
                              file.category === 'image' ? 'text-green-600' :
                              file.category === 'video' ? 'text-red-600' :
                              file.category === 'document' ? 'text-blue-600' :
                              'text-gray-600'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.size && `${(file.size / 1024 / 1024).toFixed(1)} MB`} • {file.extension?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {formData.tags.length > 0 && (
              <div className={`mt-6 pt-4 border-t border-gray-200 ${formData.files.length > 0 ? 'mt-4 pt-4' : ''}`}>
                <strong className="text-sm text-gray-600">Tags:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter material title"
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                  </div>
                  <p className="text-gray-400 text-xs">{formData.title.length}/100</p>
                </div>
              </div>

              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 15 minutes, 1 hour"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {materialTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the training material"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <p className={`text-xs ${
                  formData.description.length > 400 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {formData.description.length}/500
                </p>
              </div>
            </div>
          </Card>

          {/* Content */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Material Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter the main content of your training material. You can include step-by-step instructions, tips, and detailed explanations."
                maxLength={10000}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                </div>
                <p className={`text-xs ${
                  formData.content.length > 8000 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {formData.content.length}/10,000
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-1">
                Prerequisites
              </label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.prerequisites ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What should learners know before starting this material?"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.prerequisites && <p className="text-red-500 text-sm">{errors.prerequisites}</p>}
                </div>
                <p className={`text-xs ${
                  formData.prerequisites.length > 240 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {formData.prerequisites.length}/300
                </p>
              </div>
            </div>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
            <div className="space-y-3">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm text-gray-700">{objective}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a learning objective (max 200 chars)"
                  maxLength={200}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* File Attachments */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Paperclip className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">File Attachments</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload supporting files such as PDFs, images, videos, or other documents that complement your training material.
            </p>
            <FileUpload
              files={formData.files}
              onFilesChange={handleFilesChange}
              multiple={true}
              maxFiles={10}
              disabled={isSubmitting}
            />
          </Card>

          {/* Tags */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="space-y-3">
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a tag (max 50 chars, 15 tags total)"
                  maxLength={50}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* Submit Error */}
          {errors.submit && (
            <Card className="border-red-200 bg-red-50">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{errors.submit}</p>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Material' : 'Create Material'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddEditTraining;
