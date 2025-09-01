import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  File,
  FileText,
  Image,
  Video,
  Mic,
  Archive,
  Sheet,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import {
  validateFile,
  formatFileSize,
  simulateFileUpload,
  getFileIcon,
  isImagePreviewable,
  createPreviewUrl,
  revokePreviewUrl
} from '../../utils/fileUtils';

const FileUpload = ({
  files = [],
  onFilesChange,
  multiple = true,
  maxFiles = 10,
  className = '',
  disabled = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Get appropriate icon component based on file category
  const getIconComponent = (category) => {
    switch (category) {
      case 'document':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Mic;
      case 'archive':
        return Archive;
      case 'spreadsheet':
        return Sheet;
      default:
        return File;
    }
  };

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles) => {
    if (disabled) return;

    const fileList = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + fileList.length > maxFiles) {
      setErrors(prev => ({
        ...prev,
        general: `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - files.length} more file(s).`
      }));
      return;
    }

    // Clear general error
    setErrors(prev => ({ ...prev, general: null }));

    // Process each file
    for (const file of fileList) {
      const fileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          [fileId]: validation.error
        }));
        continue;
      }

      // Create preview URL for images
      if (isImagePreviewable(file.type)) {
        const previewUrl = createPreviewUrl(file);
        setPreviewUrls(prev => ({ ...prev, [fileId]: previewUrl }));
      }

      // Start upload simulation
      setUploading(prev => ({ ...prev, [fileId]: true }));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        const uploadedFile = await simulateFileUpload(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        });

        // Add uploaded file to the list
        const fileWithTempId = { ...uploadedFile, tempId: fileId };
        onFilesChange([...files, fileWithTempId]);

        // Clean up upload state
        setUploading(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });

      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [fileId]: error.message
        }));
        setUploading(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }
    }
  }, [files, onFilesChange, maxFiles, disabled]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles, disabled]);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  // Remove file
  const removeFile = (fileToRemove) => {
    // Clean up preview URL if it exists
    if (fileToRemove.tempId && previewUrls[fileToRemove.tempId]) {
      revokePreviewUrl(previewUrls[fileToRemove.tempId]);
      setPreviewUrls(prev => {
        const newState = { ...prev };
        delete newState[fileToRemove.tempId];
        return newState;
      });
    }

    // Remove from files list
    const updatedFiles = files.filter(file => 
      file.id !== fileToRemove.id && file.tempId !== fileToRemove.tempId
    );
    onFilesChange(updatedFiles);

    // Clean up any errors
    if (fileToRemove.tempId) {
      setErrors(prev => {
        const newState = { ...prev };
        delete newState[fileToRemove.tempId];
        return newState;
      });
    }
  };

  // Preview image
  const previewImage = (file) => {
    if (file.url && file.url !== `#${file.name}`) {
      window.open(file.url, '_blank');
    } else if (file.tempId && previewUrls[file.tempId]) {
      window.open(previewUrls[file.tempId], '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver && !disabled
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.mp3,.wav,.m4a,.zip,.rar,.xls,.xlsx"
        />
        
        <Upload className={`mx-auto h-12 w-12 ${disabled ? 'text-gray-300' : 'text-gray-400'} mb-4`} />
        
        <div className="space-y-2">
          <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {dragOver ? 'Drop files here' : 'Upload training materials'}
          </p>
          <p className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
            Drag and drop files here, or click to browse
          </p>
          <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
            Supports: PDF, DOC, DOCX, TXT, Images, Videos, Audio, Archives, Spreadsheets
          </p>
          {maxFiles > 1 && (
            <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
              Maximum {maxFiles} files • {files.length} uploaded
            </p>
          )}
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errors.general}</p>
        </div>
      )}

      {/* File List */}
      {(files.length > 0 || Object.keys(uploading).length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length})
          </h4>
          
          <div className="space-y-2">
            {/* Show uploading files */}
            {Object.entries(uploading).map(([tempId, isUploading]) => {
              if (!isUploading) return null;
              
              const progress = uploadProgress[tempId] || 0;
              const error = errors[tempId];
              
              return (
                <div key={tempId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        Uploading...
                      </p>
                      <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {error && (
                      <p className="text-xs text-red-600 mt-1">{error}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Show uploaded files */}
            {files.map((file) => {
              const IconComponent = getIconComponent(file.category);
              const hasPreview = file.tempId && previewUrls[file.tempId];
              const isImage = file.category === 'image';
              
              return (
                <div key={file.id || file.tempId} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {hasPreview ? (
                      <div className="relative w-12 h-12">
                        <img
                          src={previewUrls[file.tempId]}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <button
                          onClick={() => previewImage(file)}
                          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-md transition-opacity flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center ${
                        file.category === 'image' ? 'bg-green-100' :
                        file.category === 'video' ? 'bg-red-100' :
                        file.category === 'document' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          file.category === 'image' ? 'text-green-600' :
                          file.category === 'video' ? 'text-red-600' :
                          file.category === 'document' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500 capitalize">
                        {file.category}
                      </p>
                      {file.extension && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <p className="text-xs text-gray-500 uppercase">
                            {file.extension}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {isImage && (hasPreview || file.url) && (
                      <button
                        onClick={() => previewImage(file)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Preview image"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {file.url && file.url !== `#${file.name}` && (
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(file)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
