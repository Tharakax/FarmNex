import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Save, 
  FileText, 
  Image, 
  Video, 
  File,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm, showToast } from '../../utils/sweetAlert';

const AddEditTrainingForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingMaterial = null,
  isLoading = false 
}) => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: editingMaterial?.title || '',
    description: editingMaterial?.description || '',
    category: editingMaterial?.category || '',
    type: editingMaterial?.type || 'Article',
    difficulty: editingMaterial?.difficulty || 'Beginner',
    tags: editingMaterial?.tags?.join(', ') || '',
    content: editingMaterial?.content || '',
    status: editingMaterial?.status || 'draft'
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Update form data when editingMaterial changes
  useEffect(() => {
    if (editingMaterial) {
      setFormData({
        title: editingMaterial.title || '',
        description: editingMaterial.description || '',
        category: editingMaterial.category || '',
        type: editingMaterial.type || 'Article',
        difficulty: editingMaterial.difficulty || 'Beginner',
        tags: editingMaterial.tags?.join(', ') || '',
        content: editingMaterial.content || '',
        status: editingMaterial.status || 'draft'
      });
    } else {
      // Reset form for new material
      setFormData({
        title: '',
        description: '',
        category: '',
        type: 'Article',
        difficulty: 'Beginner',
        tags: '',
        content: '',
        status: 'draft'
      });
    }
    setSelectedFile(null);
    setErrors({});
  }, [editingMaterial]);

  const categories = [
    'Crop Management',
    'Livestock',
    'Equipment',
    'Finance',
    'Marketing',
    'General'
  ];

  const types = [
    { value: 'Article', label: 'Article', icon: FileText },
    { value: 'Video', label: 'Video', icon: Video },
    { value: 'PDF', label: 'PDF Document', icon: File },
    { value: 'Guide', label: 'Guide', icon: Image },
    { value: 'FAQ', label: 'FAQ', icon: FileText }
  ];

  const difficulties = [
    { value: 'Beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'Intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

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

  const handleFileSelect = (file) => {
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        showError('File size exceeds the 50MB limit. Please choose a smaller file.');
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 50MB'
        }));
        return;
      }
      
      // Validate file type based on content type
      const allowedTypes = {
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'],
        'PDF': ['application/pdf'],
        'Guide': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
        'Article': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      };
      
      const typeAllowed = allowedTypes[formData.type] || [];
      if (typeAllowed.length > 0 && !typeAllowed.includes(file.type)) {
        showWarning(`Invalid file type for ${formData.type}. Please upload a supported format.`);
        setErrors(prev => ({
          ...prev,
          file: `Invalid file type for ${formData.type}. Please upload a supported format.`
        }));
        return;
      }
      
      setSelectedFile(file);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
      showToast(`File "${file.name}" selected successfully!`, 'success');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
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
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Content validation for articles
    if (formData.type === 'Article') {
      if (!formData.content.trim()) {
        newErrors.content = 'Content is required for articles';
      } else if (formData.content.length < 50) {
        newErrors.content = 'Article content must be at least 50 characters long';
      } else if (formData.content.length > 50000) {
        newErrors.content = 'Article content must not exceed 50,000 characters';
      }
    }
    
    // File validation for non-article types
    if ((formData.type === 'Video' || formData.type === 'PDF' || formData.type === 'Guide') && !selectedFile && !editingMaterial) {
      newErrors.file = 'File is required for this content type';
    }
    
    // File type validation
    if (selectedFile) {
      const allowedTypes = {
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'],
        'PDF': ['application/pdf'],
        'Guide': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
        'Article': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'] // For thumbnails
      };
      
      const typeAllowed = allowedTypes[formData.type] || [];
      if (typeAllowed.length > 0 && !typeAllowed.includes(selectedFile.type)) {
        newErrors.file = `Invalid file type for ${formData.type}. Please upload a supported format.`;
      }
      
      // File size validation (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        newErrors.file = 'File size must be less than 50MB';
      }
    }
    
    // Tags validation
    if (formData.tags.trim()) {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 10) {
        newErrors.tags = 'Maximum of 10 tags allowed';
      }
      const invalidTags = tags.filter(tag => tag.length > 50);
      if (invalidTags.length > 0) {
        newErrors.tags = 'Each tag must be less than 50 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Please correct the validation errors before submitting.');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await onSave(submitData, selectedFile);
      showSuccess(
        `Training material ${editingMaterial ? 'updated' : 'created'} successfully!`,
        'Success!'
      );
    } catch (error) {
      console.error('Error saving material:', error);
      showError(
        `Failed to ${editingMaterial ? 'update' : 'create'} training material. Please try again.`,
        'Error!'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      type: 'Article',
      difficulty: 'Beginner',
      tags: '',
      content: '',
      status: 'draft'
    });
    setSelectedFile(null);
    setErrors({});
  };

  const handleClose = async () => {
    if (!isLoading) {
      // Check if form has unsaved changes
      const hasUnsavedChanges = formData.title || formData.description || formData.content || selectedFile;
      
      if (hasUnsavedChanges) {
        const result = await showConfirm(
          'You have unsaved changes. Are you sure you want to close without saving?',
          'Unsaved Changes'
        );
        
        if (!result.isConfirmed) {
          return;
        }
      }
      
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingMaterial ? 'Edit Training Material' : 'Add New Training Material'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter material title"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.title && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                <p className="text-gray-400 text-xs">
                  {formData.title.length}/100
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {types.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                        formData.type === type.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="flex space-x-2">
                {difficulties.map(diff => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.value }))}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.difficulty === diff.value
                        ? diff.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what this training material covers"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
                <p className={`text-xs ${
                  formData.description.length > 800 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {formData.description.length}/1000
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.tags ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter tags separated by commas (e.g., farming, crops, irrigation)"
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.tags ? (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.tags}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">Separate multiple tags with commas (max 10 tags)</p>
                  )}
                </div>
                <p className="text-gray-400 text-xs">
                  {formData.tags.split(',').filter(tag => tag.trim()).length}/10 tags
                </p>
              </div>
            </div>

            {/* Content (for articles) */}
            {formData.type === 'Article' && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Write your article content here..."
                  maxLength={50000}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.content && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.content}
                      </p>
                    )}
                  </div>
                  <p className={`text-xs ${
                    formData.content.length > 40000 ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {formData.content.length}/50,000
                  </p>
                </div>
              </div>
            )}

            {/* File Upload (for non-article types) */}
            {formData.type !== 'Article' && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File {!editingMaterial && <span className="text-red-500">*</span>}
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver 
                      ? 'border-green-400 bg-green-50' 
                      : errors.file 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      {selectedFile ? (
                        <span className="text-green-600 font-medium">
                          Selected: {selectedFile.name}
                        </span>
                      ) : (
                        <>Drop your file here or </>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      browse files
                    </button>
                    <p className="text-gray-400 text-sm">
                      Maximum file size: 50MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept={formData.type === 'Video' ? 'video/*' : formData.type === 'PDF' ? '.pdf' : 'image/*'}
                  />
                </div>
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.file}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{editingMaterial ? 'Update' : 'Save'} Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditTrainingForm;
