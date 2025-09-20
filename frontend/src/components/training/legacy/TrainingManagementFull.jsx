import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  CheckCircle,
  Plus,
  FileSpreadsheet,
  FileText,
  BookOpen,
  TrendingUp,
  Users,
  Target,
  List,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Video,
  Image,
  Download,
  X,
  Upload,
  Save,
  Loader
} from 'lucide-react';
import { parseAndCleanTags } from '../../../utils/tagUtils';
import { showValidationError, showSuccess, showError } from '../../../utils/sweetAlertRobust';

const TrainingManagementFull = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // State for different views and operations
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, materials, form
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalMaterials: 0,
    activeMaterials: 0,
    categories: 0,
    totalViews: 0
  });
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Article',
    content: '',
    tags: [],
    difficulty: 'Beginner',
    category: 'General',
    status: 'published'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState({});

  // Success/Error message auto-hide
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Validation function that returns results directly (without state updates)
  const performValidation = () => {
    console.log('🔧 Starting comprehensive validation...');
    const errors = {};
    const validated = {};
    
    // Title validation
    console.log('📝 Validating title:', formData.title);
    if (!formData.title || formData.title.trim().length === 0) {
      errors.title = 'Training material title is required and cannot be empty.';
      console.log('❌ Title validation failed: empty or missing');
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
      console.log('❌ Title validation failed: too short');
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters.';
      console.log('❌ Title validation failed: too long');
    } else {
      validated.title = true;
      console.log('✅ Title validation passed');
    }
    
    // Description validation
    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = 'Description is required to help users understand the content.';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long for clarity.';
    } else if (formData.description.trim().length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters.';
    } else {
      validated.description = true;
    }
    
    // Content validation - content is optional but if provided, must be valid
    const hasContent = formData.content && formData.content.trim().length > 0;
    const hasNewFile = selectedFile && selectedFile.size > 0;
    const hasExistingFile = editingMaterial && editingMaterial.fileName;
    
    // Validate content if provided
    if (hasContent) {
      if (formData.content.trim().length < 20) {
        errors.content = 'Content must be at least 20 characters long if provided.';
      } else if (formData.content.trim().length > 10000) {
        errors.content = 'Content cannot exceed 10,000 characters.';
      } else {
        validated.content = true;
      }
    } else {
      // Content is empty - this is OK, training materials can exist with just metadata
      validated.content = true;
    }
    
    // File validation - file is completely optional
    if (hasNewFile) {
      const fileSize = selectedFile.size;
      const fileName = selectedFile.name.toLowerCase();
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (fileSize > maxSize) {
        errors.file = 'File size cannot exceed 50MB. Please choose a smaller file.';
      } else if (fileSize === 0) {
        errors.file = 'The selected file appears to be empty. Please choose a valid file.';
      } else {
        // Validate file type based on selected type
        const validExtensions = {
          'Video': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
          'PDF': ['.pdf'],
          'Image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
          'Article': ['.doc', '.docx', '.txt', '.rtf']
        };
        
        const typeExtensions = validExtensions[formData.type] || [];
        const hasValidExtension = typeExtensions.some(ext => fileName.endsWith(ext));
        
        if (typeExtensions.length > 0 && !hasValidExtension) {
          errors.file = `For ${formData.type} type, please upload a file with one of these extensions: ${typeExtensions.join(', ')}`;
        } else {
          validated.file = true;
        }
      }
    } else {
      // No file selected - this is perfectly fine
      validated.file = true;
    }
    
    // Type validation (should always have a value, but let's be safe)
    if (!formData.type || formData.type.trim().length === 0) {
      errors.type = 'Content type must be selected.';
    } else {
      validated.type = true;
    }
    
    // Category validation
    if (!formData.category || formData.category.trim().length === 0) {
      errors.category = 'Category must be selected to help organize content.';
    } else {
      validated.category = true;
    }
    
    // Difficulty validation
    if (!formData.difficulty || formData.difficulty.trim().length === 0) {
      errors.difficulty = 'Difficulty level must be selected.';
    } else {
      validated.difficulty = true;
    }
    
    // Status validation
    if (!formData.status || formData.status.trim().length === 0) {
      errors.status = 'Status must be selected.';
    } else {
      validated.status = true;
    }
    
    // Tags validation - simplified for now
    if (formData.tags && formData.tags.length > 0) {
      if (formData.tags.length > 10) {
        errors.tags = 'Too many tags. Please limit to 10 tags maximum for better organization.';
      } else {
        // Check for tag quality
        const invalidTags = formData.tags.filter(tag => 
          !tag || tag.trim().length === 0 || tag.trim().length < 2 || tag.trim().length > 30
        );
        
        if (invalidTags.length > 0) {
          errors.tags = 'Each tag must be between 2 and 30 characters long and cannot be empty.';
        } else {
          validated.tags = true;
        }
      }
    } else {
      // No tags - temporarily allow this for testing
      console.log('⚠️ No tags provided - allowing for now');
      validated.tags = true;
    }
    
    console.log('🔍 Validation summary:');
    console.log('  ❌ Errors found:', Object.keys(errors).length, errors);
    console.log('  ✅ Fields validated:', Object.keys(validated).length, validated);
    
    const isValid = Object.keys(errors).length === 0;
    console.log('🏁 Final validation result:', isValid);
    
    return {
      isValid,
      errors,
      validated
    };
  };
  
  // Legacy validation function for compatibility (uses state)
  const validateForm = () => {
    const result = performValidation();
    setValidationErrors(result.errors);
    setValidatedFields(result.validated);
    return result.isValid;
  };
  
  // API Functions
  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training?limit=50', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load materials: ${response.status}`);
      }
      
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setErrorMessage('Failed to load training materials: ' + error.message);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training/statistics', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      let statsData = { totalMaterials: 0, totalViews: 0 };
      if (response.ok) {
        statsData = await response.json();
      }
      
      setStatistics({
        totalMaterials: statsData.totalMaterials || 0,
        activeMaterials: statsData.totalMaterials || 0,
        categories: 6,
        totalViews: statsData.totalViews || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics({
        totalMaterials: 0,
        activeMaterials: 0,
        categories: 6,
        totalViews: 0
      });
    }
  };

  // Load data when view changes
  useEffect(() => {
    if (currentView === 'materials') {
      fetchMaterials();
    } else if (currentView === 'dashboard') {
      fetchStatistics();
    }
  }, [currentView]);

  // Initial load
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Excel Export Handler
  const handleExportToExcel = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setErrorMessage('');
    
    try {
      // Fetch fresh materials data for export
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      let exportMaterials = [];
      if (response.ok) {
        const data = await response.json();
        exportMaterials = data.materials || [];
      }

      // Create properly formatted CSV content
      const csvRows = [
        // Header row
        ['Training Materials Export', `Generated on: ${new Date().toLocaleDateString()}`],
        [], // Empty row
        ['Title', 'Description', 'Category', 'Type', 'Difficulty', 'Status', 'Views', 'Created Date', 'Created By'],
        // Data rows
        ...exportMaterials.map(material => [
          `"${(material.title || '').replace(/"/g, '""')}"`,
          `"${(material.description || '').replace(/"/g, '""')}"`,
          material.category || 'Uncategorized',
          material.type || 'Unknown',
          material.difficulty || 'Unknown', 
          material.status || 'Unknown',
          material.views || 0,
          material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'Unknown',
          `"${(material.createdBy || '').replace(/"/g, '""')}"`
        ]),
        [], // Empty row
        ['Summary Statistics'],
        ['Total Materials', exportMaterials.length],
        ['Total Views', exportMaterials.reduce((sum, m) => sum + (m.views || 0), 0)]
      ];

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Training_Materials_Export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      setSuccessMessage('Training materials exported successfully! File downloaded.');
    } catch (error) {
      console.error('Export failed:', error);
      setErrorMessage('Failed to export training materials. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // PDF Export Handler
  const handleExportToPDF = async () => {
    if (isExportingPDF) return;

    setIsExportingPDF(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/training/export/pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to export PDF' }));
        throw new Error(errorData.message || 'Failed to export PDF');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Training_Materials_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('PDF report exported successfully! File downloaded.');
    } catch (error) {
      console.error('PDF export failed:', error);
      setErrorMessage('Failed to export PDF report: ' + error.message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Helper functions for validation styling
  const getFieldClasses = (fieldName, baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-green-500') => {
    if (validationErrors[fieldName]) {
      return `${baseClasses} border-red-500 bg-red-50 focus:border-red-500 ring-red-200`;
    } else if (validatedFields[fieldName]) {
      return `${baseClasses} border-green-500 bg-green-50 focus:border-green-600 ring-green-200`;
    } else {
      return `${baseClasses} border-gray-300 focus:border-green-500`;
    }
  };
  
  const clearValidationState = () => {
    setValidationErrors({});
    setValidatedFields({});
  };
  
  // Debug function to test validation
  const testValidation = () => {
    console.log('🧪 Testing validation...');
    console.log('📋 Current form data:', formData);
    console.log('📁 Selected file:', selectedFile);
    console.log('❌ Current errors before validation:', validationErrors);
    console.log('✅ Current validated fields before validation:', validatedFields);
    
    const isValid = validateForm();
    
    setTimeout(() => {
      console.log('🔍 Validation result:', isValid);
      console.log('❌ Errors after validation:', validationErrors);
      console.log('✅ Validated fields after validation:', validatedFields);
      
      if (!isValid) {
        alert('Validation failed! Check console for details.');
      } else {
        alert('Validation passed!');
      }
    }, 100);
  };
  
  // Individual field validation for onBlur events
  const validateField = (fieldName, value = null) => {
    const errors = { ...validationErrors };
    const validated = { ...validatedFields };
    
    // Remove existing errors and validation for this field
    delete errors[fieldName];
    delete validated[fieldName];
    
    const fieldValue = value !== null ? value : formData[fieldName];
    
    switch (fieldName) {
      case 'title':
        if (!fieldValue || fieldValue.trim().length === 0) {
          errors.title = 'Training material title is required.';
        } else if (fieldValue.trim().length < 3) {
          errors.title = 'Title must be at least 3 characters long.';
        } else if (fieldValue.trim().length > 200) {
          errors.title = 'Title cannot exceed 200 characters.';
        } else {
          validated.title = true;
        }
        break;
        
      case 'description':
        if (!fieldValue || fieldValue.trim().length === 0) {
          errors.description = 'Description is required.';
        } else if (fieldValue.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters long.';
        } else if (fieldValue.trim().length > 1000) {
          errors.description = 'Description cannot exceed 1000 characters.';
        } else {
          validated.description = true;
        }
        break;
        
      case 'content':
        if (fieldValue && fieldValue.trim().length > 0) {
          if (fieldValue.trim().length < 20) {
            errors.content = 'Content must be at least 20 characters long if provided.';
          } else if (fieldValue.trim().length > 10000) {
            errors.content = 'Content cannot exceed 10,000 characters.';
          } else {
            validated.content = true;
          }
        }
        break;
        
      case 'tags':
        const tags = value !== null ? value : formData.tags;
        if (!tags || tags.length === 0) {
          errors.tags = 'At least one tag is required.';
        } else if (tags.length > 10) {
          errors.tags = 'Too many tags. Maximum 10 allowed.';
        } else {
          const invalidTags = tags.filter(tag => 
            !tag || tag.trim().length === 0 || tag.trim().length < 2 || tag.trim().length > 30
          );
          
          if (invalidTags.length > 0) {
            errors.tags = 'Each tag must be 2-30 characters long.';
          } else {
            validated.tags = true;
          }
        }
        break;
        
      case 'file':
        // File validation - file is completely optional
        const hasNewFile = selectedFile && selectedFile.size > 0;
        
        if (hasNewFile) {
          const fileSize = selectedFile.size;
          const fileName = selectedFile.name.toLowerCase();
          const maxSize = 50 * 1024 * 1024; // 50MB
          
          if (fileSize > maxSize) {
            errors.file = 'File size cannot exceed 50MB.';
          } else if (fileSize === 0) {
            errors.file = 'The selected file appears to be empty.';
          } else {
            // Validate file type based on selected type
            const validExtensions = {
              'Video': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
              'PDF': ['.pdf'],
              'Image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
              'Article': ['.doc', '.docx', '.txt', '.rtf']
            };
            
            const typeExtensions = validExtensions[formData.type] || [];
            const hasValidExtension = typeExtensions.some(ext => fileName.endsWith(ext));
            
            if (typeExtensions.length > 0 && !hasValidExtension) {
              errors.file = `For ${formData.type} type, valid extensions: ${typeExtensions.join(', ')}`;
            } else {
              validated.file = true;
            }
          }
        } else {
          // No file selected - this is perfectly fine
          validated.file = true;
        }
        break;
    }
    
    setValidationErrors(errors);
    setValidatedFields(validated);
  };
  
  // Form handlers
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      title: '',
      description: '',
      type: 'Article',
      content: '',
      tags: [],
      difficulty: 'Beginner',
      category: 'General',
      status: 'published'
    });
    setSelectedFile(null);
    setTagInput('');
    clearValidationState();
    setShowForm(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title || '',
      description: material.description || '',
      type: material.type || 'Article',
      content: material.content || '',
      tags: material.tags || [],
      difficulty: material.difficulty || 'Beginner',
      category: material.category || 'General',
      status: material.status || 'published'
    });
    setSelectedFile(null);
    setTagInput('');
    clearValidationState();
    setShowForm(true);
  };

  const handleViewMaterial = (material) => {
    setViewingMaterial(material);
    setShowViewer(true);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this training material?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/training/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      setSuccessMessage('Training material deleted successfully!');
      fetchMaterials();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting material:', error);
      setErrorMessage('Failed to delete training material.');
    }
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Starting form validation...');
    console.log('📋 Current form data:', formData);
    console.log('📁 Current selected file:', selectedFile);
    
    // Perform comprehensive validation and get errors directly
    const validationResult = performValidation();
    const { isValid, errors, validated } = validationResult;
    
    console.log('🔍 Validation result:', isValid);
    console.log('❌ Validation errors:', errors);
    console.log('✅ Validated fields:', validated);
    
    // Update state with validation results
    setValidationErrors(errors);
    setValidatedFields(validated);
    
    if (!isValid) {
      // Show validation error summary using SweetAlert
      const errorMessages = Object.values(errors);
      console.log('📢 Preventing form submission due to validation errors:', errorMessages);
      
      try {
        await showValidationError(
          errorMessages,
          'Please fix the following validation errors:'
        );
      } catch (sweetAlertError) {
        console.error('SweetAlert error:', sweetAlertError);
        // Fallback to regular alert if SweetAlert fails
        alert('Please fix the following validation errors:\n\n' + errorMessages.join('\n'));
      }
      
      console.log('⛔ Form submission BLOCKED due to validation errors');
      return; // STOP HERE - do not proceed with form submission
    }
    
    // If validation passed, proceed with submission
    console.log('✅ Validation passed! Proceeding with form submission.');
    console.log('🚀 About to call submitForm()...');
    await submitForm();
    console.log('✨ submitForm() completed successfully');
  };
  
  const submitForm = async () => {
    setIsFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add file if selected
      if (selectedFile) {
        console.log('📁 Adding file to FormData:', selectedFile.name, selectedFile.size);
        formDataToSend.append('file', selectedFile);
      } else {
        console.log('📁 No file selected - proceeding without file upload');
      }

      const url = editingMaterial 
        ? `http://localhost:3000/api/training/${editingMaterial._id}`
        : 'http://localhost:3000/api/training';
      
      const method = editingMaterial ? 'PUT' : 'POST';

      console.log('🌐 Making API call to:', url, 'Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formDataToSend
      });

      console.log('📡 API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to save material');
      }
      
      const responseData = await response.json();
      console.log('✅ API Success Response:', responseData);

      // Show success message with SweetAlert
      await showSuccess(
        editingMaterial
          ? 'The training material has been successfully updated with your changes.'
          : 'Your new training material has been successfully created and is now available.',
        editingMaterial 
          ? 'Training Material Updated!' 
          : 'Training Material Created!'
      );
      
      setShowForm(false);
      setEditingMaterial(null);
      if (currentView === 'materials') {
        fetchMaterials();
      }
      fetchStatistics();
    } catch (error) {
      console.error('Error saving material:', error);
      await showError(
        `There was an error saving the training material: ${error.message}`,
        'Failed to Save Material'
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    
    // Validation checks
    if (!trimmedTag) {
      return; // Don't add empty tags
    }
    
    if (trimmedTag.length < 2) {
      setValidationErrors(prev => ({
        ...prev,
        tags: 'Tag must be at least 2 characters long.'
      }));
      return;
    }
    
    if (trimmedTag.length > 30) {
      setValidationErrors(prev => ({
        ...prev,
        tags: 'Tag cannot exceed 30 characters.'
      }));
      return;
    }
    
    if (formData.tags.length >= 10) {
      setValidationErrors(prev => ({
        ...prev,
        tags: 'Maximum 10 tags allowed.'
      }));
      return;
    }
    
    // Check for duplicates (case-insensitive)
    if (formData.tags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      setValidationErrors(prev => ({
        ...prev,
        tags: 'This tag has already been added.'
      }));
      return;
    }
    
    // Add the tag
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    
    // Clear input and revalidate
    setTagInput('');
    
    // Clear any existing tag validation errors since we successfully added a tag
    setValidationErrors(prev => {
      const { tags, ...rest } = prev;
      return rest;
    });
    
    // Revalidate tags after adding
    setTimeout(() => validateField('tags'), 50);
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'Video': return <Video className="h-5 w-5 text-red-600" />;
      case 'PDF': return <FileText className="h-5 w-5 text-red-600" />;
      case 'Image': return <Image className="h-5 w-5 text-green-600" />;
      default: return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  // Render Add/Edit Form
  const renderForm = () => {
    if (!showForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingMaterial ? 'Edit Training Material' : 'Add New Training Material'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  onBlur={() => validateField('title')}
                  className={getFieldClasses('title')}
                  placeholder="Enter training material title"
                />
                {validationErrors.title && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationErrors.title}</span>
                  </div>
                )}
                {validatedFields.title && !validationErrors.title && (
                  <div className="mt-1 flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Title looks good!</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  onBlur={() => validateField('description')}
                  className={getFieldClasses('description')}
                  placeholder="Enter a detailed description"
                />
                {validationErrors.description && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationErrors.description}</span>
                  </div>
                )}
                {validatedFields.description && !validationErrors.description && (
                  <div className="mt-1 flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Description looks comprehensive!</span>
                  </div>
                )}
              </div>

              {/* Type, Category, Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className={getFieldClasses('type')}
                  >
                    <option value="Article">Article</option>
                    <option value="Video">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="Image">Image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={getFieldClasses('category')}
                  >
                    <option value="General">General</option>
                    <option value="Crop Management">Crop Management</option>
                    <option value="Soil Health">Soil Health</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Water Management">Water Management</option>
                    <option value="Livestock">Livestock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className={getFieldClasses('difficulty')}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content (Optional)</label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  onBlur={() => validateField('content')}
                  className={getFieldClasses('content')}
                  placeholder="Enter the main content or training material text (optional)"
                />
                {validationErrors.content && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationErrors.content}</span>
                  </div>
                )}
                {validatedFields.content && !validationErrors.content && (
                  <div className="mt-1 flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Content is well detailed!</span>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Upload (Optional)</label>
                
                {/* Show existing file information when editing */}
                {editingMaterial && editingMaterial.fileName && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">Current File</h4>
                      <span className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded">
                        {editingMaterial.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      {editingMaterial.type === 'Video' && <Video className="h-5 w-5 text-blue-600" />}
                      {editingMaterial.type === 'PDF' && <FileText className="h-5 w-5 text-red-600" />}
                      {editingMaterial.type === 'Image' && <Image className="h-5 w-5 text-green-600" />}
                      {editingMaterial.type === 'Article' && <FileText className="h-5 w-5 text-blue-600" />}
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{editingMaterial.fileName}</div>
                        <div className="text-sm text-gray-600">
                          Size: {editingMaterial.fileSize ? (editingMaterial.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a 
                        href={`http://localhost:3000/uploads/${editingMaterial.fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </a>
                      <a 
                        href={`http://localhost:3000/uploads/${editingMaterial.fileName}`}
                        download
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </div>
                    
                    <div className="mt-3 text-xs text-blue-700">
                      💡 Upload a new file below to replace the current one, or leave empty to keep the existing file.
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                    // Trigger file validation when file changes
                    setTimeout(() => validateField('file'), 100);
                  }}
                  className={getFieldClasses('file', 'w-full px-3 py-2 border rounded-lg focus:ring-green-500')}
                  accept=".pdf,.doc,.docx,.mp4,.avi,.jpg,.jpeg,.png,.gif"
                />
                
                {selectedFile && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">New file selected:</span>
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      This will replace the existing file when you save.
                    </div>
                  </div>
                )}
                
                {!editingMaterial && !selectedFile && (
                  <div className="text-sm text-gray-500 mt-2">
                    Optional: Choose a file to upload (PDF, Video, Image, or Document)
                  </div>
                )}
                
                {validationErrors.file && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationErrors.file}</span>
                  </div>
                )}
                {validatedFields.file && !validationErrors.file && (
                  <div className="mt-1 flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>File is valid and ready for upload!</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional for Testing)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    onBlur={() => {
                      if (tagInput.trim()) {
                        addTag();
                      }
                      validateField('tags');
                    }}
                    className={getFieldClasses('tags', 'flex-1 px-3 py-2 border rounded-lg focus:ring-green-500')}
                    placeholder="Enter a tag and press Enter (2-30 characters)"
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          removeTag(tag);
                          // Revalidate after removing tag
                          setTimeout(() => validateField('tags'), 50);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="text-sm text-gray-500 mb-2">
                  {formData.tags.length}/10 tags • Help users discover your content with relevant keywords
                </div>
                
                {validationErrors.tags && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationErrors.tags}</span>
                  </div>
                )}
                {validatedFields.tags && !validationErrors.tags && (
                  <div className="mt-1 flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Great! Your tags will help users find this content.</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className={getFieldClasses('status')}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Debug Test Button - Temporary */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Tools</h4>
                <button
                  type="button"
                  onClick={testValidation}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  Test Validation (Check Console)
                </button>
              </div>
              
              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isFormLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isFormLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingMaterial ? 'Update Material' : 'Create Material'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render Materials List
  const renderMaterialsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Training Materials</h1>
        </div>
        <button
          onClick={handleAddMaterial}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Material</span>
        </button>
      </div>

      {loadingMaterials ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading materials...</p>
          </div>
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Materials</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first training material.</p>
          <button
            onClick={handleAddMaterial}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add First Material
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Training Materials</h3>
                  <p className="text-sm text-gray-600">{materials.length} total materials available</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{materials.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Resources</div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {materials.map((material) => (
              <div key={material._id} className="p-8 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-6 flex-1">
                    {/* File Preview */}
                    <div className="flex-shrink-0">
                      {material.fileName && material.type === 'Video' && (
                        <div className="relative">
                          <video 
                            className="w-40 h-28 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                            muted
                            preload="metadata"
                          >
                            <source 
                              src={`http://localhost:3000/uploads/${material.fileName}#t=1`} 
                              type="video/mp4" 
                            />
                          </video>
                          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[8px] border-l-green-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {material.fileName && material.type === 'Image' && (
                        <img 
                          src={`http://localhost:3000/uploads/${material.fileName}`}
                          alt={material.title}
                          className="w-40 h-28 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      {material.fileName && material.type === 'PDF' && (
                        <div className="w-40 h-28 rounded-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shadow-md">
                          <div className="text-center">
                            <FileText className="h-12 w-12 text-red-600 mx-auto mb-2" />
                            <span className="text-sm font-semibold text-red-700">PDF Document</span>
                          </div>
                        </div>
                      )}
                      {material.type === 'Article' && (
                        <div className="w-40 h-28 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-md">
                          <div className="text-center">
                            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                            <span className="text-sm font-semibold text-blue-700">Article</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        {getFileIcon(material.type)}
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                            {material.title}
                          </h4>
                          <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-2">
                            {material.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Professional Tags */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
                          <Target className="h-3.5 w-3.5 mr-1.5" />
                          {material.category}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-sm">
                          {getFileIcon(material.type)}
                          <span className="ml-1.5">{material.type}</span>
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full text-sm font-medium shadow-sm">
                          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                          {material.difficulty}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm ${
                          material.status === 'published' 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          {material.status}
                        </span>
                      </div>

                      {/* Professional Keywords */}
                      {material.tags && parseAndCleanTags(material.tags).length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-indigo-500 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Keywords & Topics</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {parseAndCleanTags(material.tags).map((tag, index) => {
                              // Different colors for different types of tags
                              const getTagColor = (tag) => {
                                const lowerTag = tag.toLowerCase();
                                if (lowerTag.includes('organic') || lowerTag.includes('natural')) {
                                  return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                }
                                if (lowerTag.includes('soil') || lowerTag.includes('preparation')) {
                                  return 'bg-amber-100 text-amber-800 border-amber-200';
                                }
                                if (lowerTag.includes('pest') || lowerTag.includes('control')) {
                                  return 'bg-red-100 text-red-800 border-red-200';
                                }
                                if (lowerTag.includes('farming') || lowerTag.includes('agriculture')) {
                                  return 'bg-green-100 text-green-800 border-green-200';
                                }
                                if (lowerTag.includes('crop') || lowerTag.includes('rotation')) {
                                  return 'bg-blue-100 text-blue-800 border-blue-200';
                                }
                                if (lowerTag.includes('water') || lowerTag.includes('irrigation')) {
                                  return 'bg-cyan-100 text-cyan-800 border-cyan-200';
                                }
                                return 'bg-gray-100 text-gray-800 border-gray-200';
                              };

                              return (
                                <span 
                                  key={index} 
                                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-md transform hover:scale-105 ${getTagColor(tag)}`}
                                >
                                  <span className="capitalize">{tag}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* File Preview for Videos, Images, and PDFs */}
                    {material.fileName && (material.type === 'Video' || material.type === 'Image' || material.type === 'PDF') && (
                      <div className="mb-3">
                        {material.type === 'Video' && (
                          <video 
                            className="w-32 h-20 rounded object-cover border"
                            muted
                            preload="metadata"
                          >
                            <source 
                              src={`http://localhost:3000/uploads/${material.fileName}#t=1`} 
                              type="video/mp4" 
                            />
                          </video>
                        )}
                        {material.type === 'Image' && (
                          <img 
                            src={`http://localhost:3000/uploads/${material.fileName}`}
                            alt={material.title}
                            className="w-32 h-20 rounded object-cover border"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        {material.type === 'PDF' && (
                          <div className="w-32 h-20 rounded border bg-red-50 flex items-center justify-center">
                            <div className="text-center">
                              <FileText className="h-8 w-8 text-red-600 mx-auto mb-1" />
                              <span className="text-xs text-red-700 font-medium">PDF</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                      {/* Professional Metadata */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Views:</span>
                            <span className="font-semibold text-gray-900">{material.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Created:</span>
                            <span className="font-semibold text-gray-900">{new Date(material.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-600">Author:</span>
                            <span className="font-semibold text-gray-900">{material.createdBy}</span>
                          </div>
                          {material.fileName && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-gray-600">File:</span>
                              <span className="font-semibold text-blue-600 truncate" title={material.fileName}>
                                {material.fileName.substring(0, 15)}...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleViewMaterial(material)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      title="View Material"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      title="Edit Material"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material._id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      title="Delete Material"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Material Viewer
  const renderViewer = () => {
    if (!showViewer || !viewingMaterial) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getFileIcon(viewingMaterial.type)}
                  <h2 className="text-2xl font-bold text-gray-900">{viewingMaterial.title}</h2>
                </div>
                <p className="text-gray-600">{viewingMaterial.description}</p>
              </div>
              <button
                onClick={() => setShowViewer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {viewingMaterial.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {viewingMaterial.type}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {viewingMaterial.difficulty}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {viewingMaterial.status}
                </span>
              </div>

              {viewingMaterial.content && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Content</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{viewingMaterial.content}</div>
                </div>
              )}

              {viewingMaterial.fileName && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Attached File</h3>
                  
                  {/* Video Player for Video Files */}
                  {viewingMaterial.type === 'Video' && viewingMaterial.fileName && (
                    <div className="mb-4">
                      <video 
                        controls 
                        className="w-full max-w-2xl rounded-lg shadow-md"
                        style={{ maxHeight: '400px' }}
                      >
                        <source 
                          src={`http://localhost:3000/uploads/${viewingMaterial.fileName}`} 
                          type="video/mp4" 
                        />
                        <source 
                          src={`http://localhost:3000/uploads/${viewingMaterial.fileName}`} 
                          type="video/avi" 
                        />
                        Your browser does not support the video tag.
                      </video>
                      <p className="text-sm text-gray-600 mt-2">
                        If the video doesn't play, try downloading it directly.
                      </p>
                    </div>
                  )}
                  
                  {/* Image Display for Image Files */}
                  {viewingMaterial.type === 'Image' && viewingMaterial.fileName && (
                    <div className="mb-4">
                      <img 
                        src={`http://localhost:3000/uploads/${viewingMaterial.fileName}`}
                        alt={viewingMaterial.title}
                        className="max-w-full rounded-lg shadow-md"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="text-red-600 text-sm hidden">
                        Error loading image. Try downloading the file directly.
                      </div>
                    </div>
                  )}
                  
                  {/* PDF Embed for PDF Files */}
                  {viewingMaterial.type === 'PDF' && viewingMaterial.fileName && (
                    <div className="mb-4">
                      <div className="bg-gray-100 rounded-lg p-4 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">PDF Document</h4>
                          <div className="flex gap-2">
                            <a 
                              href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Open in New Tab
                            </a>
                            <a 
                              href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`}
                              download
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Download PDF
                            </a>
                          </div>
                        </div>
                      </div>
                      <iframe
                        src={`http://localhost:3000/uploads/${viewingMaterial.fileName}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full rounded-lg border shadow-md"
                        style={{ height: '600px', minHeight: '400px' }}
                        title={`PDF: ${viewingMaterial.title}`}
                        onError={(e) => {
                          console.error('PDF iframe failed to load');
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      >
                        <div className="p-4 text-center border rounded-lg bg-yellow-50">
                          <p className="text-gray-700 mb-2">Your browser does not support embedded PDFs.</p>
                          <div className="space-x-2">
                            <a 
                              href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              View PDF in New Tab
                            </a>
                            <a 
                              href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`}
                              download
                              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Download PDF
                            </a>
                          </div>
                        </div>
                      </iframe>
                      <div style={{ display: 'none' }} className="p-4 text-center border rounded-lg bg-yellow-50">
                        <p className="text-gray-700 mb-2">PDF could not be displayed inline.</p>
                        <div className="space-x-2">
                          <a 
                            href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Open PDF in New Tab
                          </a>
                          <a 
                            href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`}
                            download
                            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Download PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Download Link */}
                  <div className="flex items-center gap-2 text-blue-700">
                    <Download className="h-4 w-4" />
                    <a 
                      href={`http://localhost:3000/uploads/${viewingMaterial.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {viewingMaterial.fileName}
                    </a>
                    <span className="text-sm text-blue-600">
                      ({(viewingMaterial.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}

              {viewingMaterial.tags && viewingMaterial.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {viewingMaterial.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 text-sm text-gray-500">
                <p>Created by: {viewingMaterial.createdBy}</p>
                <p>Created on: {new Date(viewingMaterial.createdAt).toLocaleString()}</p>
                <p>Views: {viewingMaterial.views || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Conditional Content Rendering */}
      {currentView === 'materials' ? (
        renderMaterialsList()
      ) : (
        <>
          {/* Professional Header Section */}
          <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-6 lg:space-y-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Training Management System
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and organize your agricultural training materials</p>
                  </div>
                </div>
              
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleExportToExcel}
                    disabled={isExporting || isExportingPDF}
                    className={`
                      flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 
                      transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                      disabled:transform-none font-semibold ${isExporting ? 'animate-pulse' : ''}
                    `}
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Exporting Excel...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-5 w-5" />
                        <span>Export Excel</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleExportToPDF}
                    disabled={isExporting || isExportingPDF}
                    className={`
                      flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 
                      transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                      disabled:transform-none font-semibold ${isExportingPDF ? 'animate-pulse' : ''}
                    `}
                  >
                    {isExportingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Exporting PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleAddMaterial}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Material</span>
                  </button>
                </div>
            </div>

            {/* Professional Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <div className="text-xs opacity-80 uppercase tracking-wide">Materials</div>
                  </div>
                  <BookOpen className="h-8 w-8 text-white opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{statistics.totalMaterials}</div>
                <div className="text-blue-100 text-sm">Total Content Available</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <div className="text-xs opacity-80 uppercase tracking-wide">Published</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-white opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{statistics.activeMaterials}</div>
                <div className="text-green-100 text-sm">Live Content Active</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <div className="text-xs opacity-80 uppercase tracking-wide">Categories</div>
                  </div>
                  <Target className="h-8 w-8 text-white opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{statistics.categories}</div>
                <div className="text-yellow-100 text-sm">Well Organized</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <div className="text-xs opacity-80 uppercase tracking-wide">Engagement</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{(statistics.totalViews || 0).toLocaleString()}</div>
                <div className="text-purple-100 text-sm">Total Views</div>
              </div>
            </div>
          </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setCurrentView('materials')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left"
              >
                <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">View All Materials</h4>
                <p className="text-sm text-gray-600">Browse and manage training content</p>
              </button>
              
              <button
                onClick={handleAddMaterial}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left"
              >
                <Plus className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Create Material</h4>
                <p className="text-sm text-gray-600">Add new training content</p>
              </button>
              
              <button
                onClick={handleExportToExcel}
                disabled={isExporting || isExportingPDF}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">Export Excel</h4>
                <p className="text-sm text-gray-600">Download Excel spreadsheet</p>
              </button>
              
              <button
                onClick={handleExportToPDF}
                disabled={isExporting || isExportingPDF}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-6 w-6 text-red-600 mb-2" />
                <h4 className="font-medium">Export PDF</h4>
                <p className="text-sm text-gray-600">Download PDF report</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {renderForm()}
      {renderViewer()}
    </div>
  );
};

export default TrainingManagementFull;