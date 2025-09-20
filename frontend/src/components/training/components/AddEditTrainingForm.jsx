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
import { showSuccess, showError, showWarning, showConfirm, showToast, showValidationError, showValidationSuccess } from '../../../utils/sweetAlertRobust';

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
  const [validFields, setValidFields] = useState({});

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
      setErrors({}); // Clear errors for editing
      setValidFields({});
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
      // Set initial validation errors for required fields
      setErrors({
        file: 'File upload is mandatory - Please select a file',
        tags: 'At least one tag is required'
      });
      setValidFields({});
    }
    setSelectedFile(null);
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
    // Basic sanitization (trim only for textareas at submit, keep user typing experience here)
    const nextValue = value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate a single field for onBlur/inline feedback
  const validateField = (field, current = formData, file = selectedFile) => {
    switch (field) {
      case 'title': {
        const v = (current.title || '').trim();
        if (!v) return 'Title is required';
        if (v.length < 5) return 'Title must be at least 5 characters long';
        if (v.length > 100) return 'Title must not exceed 100 characters';
        return '';
      }
      case 'description': {
        const v = (current.description || '').trim();
        if (!v) return 'Description is required';
        if (v.length < 20) return 'Description must be at least 20 characters long';
        if (v.length > 1000) return 'Description must not exceed 1000 characters';
        return '';
      }
      case 'category': {
        const v = current.category;
        if (!v) return 'Category is required';
        return '';
      }
      case 'content': {
        if (current.type === 'Article') {
          const v = (current.content || '').trim();
          if (!v) return 'Content is required for articles';
          if (v.length < 50) return 'Article content must be at least 50 characters long';
          if (v.length > 50000) return 'Article content must not exceed 50,000 characters';
        }
        return '';
      }
      case 'file': {
        // File is MANDATORY for ALL content types
        if (!file && !editingMaterial) {
          return 'File upload is mandatory - Please select a file';
        }
        if (file) {
          const allowedTypes = {
            'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'],
            'PDF': ['application/pdf'],
            'Guide': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
            'Article': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
            'FAQ': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
          };
          const typeAllowed = allowedTypes[current.type] || [];
          if (typeAllowed.length > 0 && !typeAllowed.includes(file.type)) {
            return `Invalid file type for ${current.type}. Please upload a supported format.`;
          }
          // 50MB limit for modal form
          if (file.size > 50 * 1024 * 1024) {
            return 'File size must be less than 50MB';
          }
        }
        return '';
      }
      case 'tags': {
        const raw = current.tags || '';
        const trimmed = raw.trim();
        if (!trimmed) return 'At least one tag is required';
        const tags = trimmed.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length === 0) return 'At least one tag is required';
        if (tags.length > 10) return 'Maximum of 10 tags allowed';
        if (tags.some(t => t.length > 50)) return 'Each tag must be less than 50 characters';
        return '';
      }
      case 'status': {
        if (!current.status) return 'Status is required';
        return '';
      }
      case 'type': {
        if (!current.type) return 'Content type is required';
        return '';
      }
      case 'difficulty': {
        if (!current.difficulty) return 'Difficulty level is required';
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const msg = validateField(name);
    if (msg) {
      setErrors(prev => ({ ...prev, [name]: msg }));
      setValidFields(prev => ({ ...prev, [name]: false }));
    } else {
      // Clear error if validation passes
      setErrors(prev => ({ ...prev, [name]: '' }));
      setValidFields(prev => ({ ...prev, [name]: true }));
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
        'Article': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
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
      setValidFields(prev => ({
        ...prev,
        file: true
      }));
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      showToast(`✅ File "${file.name}" (${fileSize}MB) selected successfully!`, 'success');
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
    const alertErrors = [];
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      alertErrors.push('Title is required.');
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
      alertErrors.push('Title must be at least 5 characters long.');
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
      alertErrors.push('Title must not exceed 100 characters.');
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      alertErrors.push('Description is required.');
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
      alertErrors.push('Description must be at least 20 characters long.');
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
      alertErrors.push('Description must not exceed 1000 characters.');
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
      alertErrors.push('Category is required.');
    }
    
    // Content validation for articles
    if (formData.type === 'Article') {
      if (!formData.content.trim()) {
        newErrors.content = 'Content is required for articles';
        alertErrors.push('Content is required for articles.');
      } else if (formData.content.length < 50) {
        newErrors.content = 'Article content must be at least 50 characters long';
        alertErrors.push('Article content must be at least 50 characters long.');
      } else if (formData.content.length > 50000) {
        newErrors.content = 'Article content must not exceed 50,000 characters';
        alertErrors.push('Article content must not exceed 50,000 characters.');
      }
    }
    
    // File validation - MANDATORY for ALL content types
    if (!selectedFile && !editingMaterial) {
      newErrors.file = 'File upload is mandatory - Please select a file';
      alertErrors.push('File upload is mandatory - Please select a file.');
    }
    
    // File type validation
    if (selectedFile) {
      const allowedTypes = {
        'Video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'],
        'PDF': ['application/pdf'],
        'Guide': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
        'Article': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
        'FAQ': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
      };
      
      const typeAllowed = allowedTypes[formData.type] || [];
      if (typeAllowed.length > 0 && !typeAllowed.includes(selectedFile.type)) {
        newErrors.file = `Invalid file type for ${formData.type}. Please upload a supported format.`;
        alertErrors.push(`Invalid file type for ${formData.type}.`);
      }
      
      // File size validation (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        newErrors.file = 'File size must be less than 50MB';
        alertErrors.push('File size must be less than 50MB.');
      }
    }
    
    // Tags validation (required)
    if (!formData.tags.trim()) {
      newErrors.tags = 'At least one tag is required';
      alertErrors.push('At least one tag is required.');
    } else {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.length === 0) {
        newErrors.tags = 'At least one tag is required';
        alertErrors.push('At least one tag is required.');
      } else {
        if (tags.length > 10) {
          newErrors.tags = 'Maximum of 10 tags allowed';
          alertErrors.push('Maximum of 10 tags allowed.');
        }
        const invalidTags = tags.filter(tag => tag.length > 50);
        if (invalidTags.length > 0) {
          newErrors.tags = 'Each tag must be less than 50 characters';
          alertErrors.push('Each tag must be less than 50 characters.');
        }
      }
    }
    
    // Content Type validation
    if (!formData.type) {
      newErrors.type = 'Content type is required';
      alertErrors.push('Content type is required.');
    }
    
    // Difficulty Level validation
    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty level is required';
      alertErrors.push('Difficulty level is required.');
    }
    
    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required';
      alertErrors.push('Status is required.');
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, alertErrors };
  };

  const handleSubmit = async (e) => {
    console.log('=== FORM SUBMIT STARTED ===');
    console.log('Event:', e);
    console.log('Form data:', formData);
    console.log('Selected file:', selectedFile);
    
    e.preventDefault();
    console.log('Form validation starting...');

    const { isValid, alertErrors } = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Validation issues:', alertErrors);
    
    if (!isValid) {
      console.log('Form validation failed - showing SweetAlert');
      showValidationError(alertErrors, 'Please Fix These Issues');
      return;
    }
    
    console.log('Form validation passed - proceeding with save');
    
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      console.log('Final submit data:', submitData);
      console.log('onSave function:', typeof onSave, onSave);
      
      if (!onSave) {
        throw new Error('onSave function is not provided!');
      }
      
      console.log('Calling onSave function...');
      await onSave(submitData, selectedFile);
      
      console.log('onSave completed successfully');
      
      // Show enhanced success message with recommendations
      const recommendations = [];
      
      if (formData.status === 'draft') {
        recommendations.push('Remember to publish your material when ready');
      }
      if (!formData.tags || formData.tags.trim() === '') {
        recommendations.push('Consider adding tags to help users find your content');
      }
      if (formData.type === 'Article' && formData.content.length < 200) {
        recommendations.push('Consider adding more detailed content for better engagement');
      }
      
      if (recommendations.length > 0) {
        showValidationSuccess(
          `Training material ${editingMaterial ? 'updated' : 'created'} successfully!`,
          recommendations
        );
      } else {
        showSuccess(
          `Training material ${editingMaterial ? 'updated' : 'created'} successfully!`,
          'Success!'
        );
      }
    } catch (error) {
      console.error('Error saving material:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        submitData: formData,
        selectedFile
      });
      showError(
        `Failed to ${editingMaterial ? 'update' : 'create'} training material. Error: ${error.message}`,
        'Error!'
      );
    }
    
    console.log('=== FORM SUBMIT COMPLETED ===');
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
    setValidFields({});
  };

  const handleClose = async () => {
    if (!isLoading) {
      // Check if form has unsaved changes
      const hasUnsavedChanges = formData.title || formData.description || formData.content || formData.tags || selectedFile;
      
      if (hasUnsavedChanges) {
        let message = 'You have unsaved changes. Are you sure you want to close without saving?';
        if (selectedFile) {
          message = 'You have unsaved changes including a selected file. Are you sure you want to close without saving?';
        }
        const result = await showConfirm(
          message,
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
        <form noValidate onSubmit={(e) => {
          console.log('=== FORM onSubmit TRIGGERED ===');
          console.log('Form submit event:', e);
          handleSubmit(e);
        }} className="p-6 space-y-6">
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
                    onBlur={handleBlur}
                    aria-invalid={!!errors.title}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.title ? 'border-red-500' : validFields.title ? 'border-green-500' : 'border-gray-300'
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
                  {!errors.title && validFields.title && (
                    <p className="text-green-600 text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Title looks good!
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
                    onBlur={handleBlur}
                    aria-invalid={!!errors.category}
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
                Content Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {types.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={async () => {
                        // Check if there's a selected file and warn about type change
                        if (selectedFile && formData.type !== type.value) {
                          const result = await showConfirm(
                            `Changing content type may affect file compatibility. Your selected file (${selectedFile.name}) might not be valid for ${type.value} content. Continue?`,
                            'Content Type Change Warning'
                          );
                          if (!result.isConfirmed) {
                            return;
                          }
                        }
                        
                        setFormData(prev => ({ ...prev, type: type.value }));
                        // Trigger validation for type field
                        const msg = validateField('type', { ...formData, type: type.value });
                        if (msg) {
                          setErrors(prev => ({ ...prev, type: msg }));
                          setValidFields(prev => ({ ...prev, type: false }));
                        } else {
                          setErrors(prev => ({ ...prev, type: '' }));
                          setValidFields(prev => ({ ...prev, type: true }));
                        }
                        
                        // Re-validate file if one is selected
                        if (selectedFile) {
                          const fileMsg = validateField('file', { ...formData, type: type.value }, selectedFile);
                          if (fileMsg) {
                            setErrors(prev => ({ ...prev, file: fileMsg }));
                            showWarning(fileMsg, 'File Validation Warning');
                          } else {
                            setErrors(prev => ({ ...prev, file: '' }));
                          }
                        }
                      }}
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
              {errors.type && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                {difficulties.map(diff => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, difficulty: diff.value }));
                      // Trigger validation for difficulty field
                      const msg = validateField('difficulty', { ...formData, difficulty: diff.value });
                      if (msg) {
                        setErrors(prev => ({ ...prev, difficulty: msg }));
                        setValidFields(prev => ({ ...prev, difficulty: false }));
                      } else {
                        setErrors(prev => ({ ...prev, difficulty: '' }));
                        setValidFields(prev => ({ ...prev, difficulty: true }));
                      }
                    }}
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
              {errors.difficulty && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.difficulty}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.status}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.status}
                </p>
              )}
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
                    onBlur={handleBlur}
                    rows={3}
                    aria-invalid={!!errors.description}
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
                Tags <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.tags}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.tags ? 'border-red-500' : validFields.tags ? 'border-green-500' : 'border-gray-300'
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
                  ) : validFields.tags ? (
                    <p className="text-green-600 text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Tags added successfully!
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">Required: Add at least one tag, separate multiple tags with commas (max 10 tags)</p>
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
                  onBlur={handleBlur}
                  rows={8}
                  aria-invalid={!!errors.content}
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

            {/* File Upload - REQUIRED */}
            <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File <span className="text-red-500">*</span> <span className="text-sm text-gray-600">(Required)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver 
                      ? 'border-green-400 bg-green-50' 
                      : errors.file 
                        ? 'border-red-400 bg-red-50' 
                        : selectedFile
                          ? 'border-green-400 bg-green-50'
                          : 'border-red-200 bg-red-25 hover:border-red-300'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${
                    selectedFile ? 'text-green-500' : 'text-red-400'
                  }`} />
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      {selectedFile ? (
                        <span className="text-green-600 font-medium">
                          Selected: {selectedFile.name}
                        </span>
                      ) : (
                        <><strong>File Required:</strong> Drop your file here or </>
                      )}
                    </p>
                    {selectedFile ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          change file
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await showConfirm(
                              'Are you sure you want to remove the selected file?',
                              'Remove File'
                            );
                            if (result.isConfirmed) {
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                              setErrors(prev => ({ ...prev, file: 'File upload is mandatory - Please select a file' }));
                              setValidFields(prev => ({ ...prev, file: false }));
                              showToast('File removed', 'info');
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          remove file
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        browse files
                      </button>
                    )}
                    <p className="text-gray-400 text-sm">
                      <strong>Required:</strong> Upload a file (Maximum size: 50MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept={formData.type === 'Video' ? 'video/*' : formData.type === 'PDF' ? '.pdf' : 'image/*,.pdf'}
                  />
                </div>
                <div className="mt-2">
                  {errors.file ? (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.file}
                    </p>
                  ) : selectedFile ? (
                    <p className="text-green-600 text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      File selected successfully! ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                    </p>
                  ) : (
                    <p className="text-red-500 text-sm flex items-center font-medium">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      ⚠️ File upload is mandatory - Please select a file
                    </p>
                  )}
                </div>
              </div>
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
