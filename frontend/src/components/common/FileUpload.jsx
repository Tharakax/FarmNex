import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Presentation,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import {
  validateFile,
  formatFileSize,
  simulateFileUpload,
  getFileIcon,
  getFileInfo,
  isImagePreviewable,
  createPreviewUrl,
  revokePreviewUrl
} from '../../utils/fileUtils';
import { 
  smartUpload, 
  formatUploadSpeed, 
  estimateTimeRemaining,
  CHUNK_CONFIG 
} from '../../utils/chunkedUpload';
import {
  autoCompress,
  canCompress,
  estimateCompression,
  formatCompressionResults
} from '../../utils/fileCompression';
import {
  findResumableUpload,
  resumableUpload,
  getUploadProgress
} from '../../utils/resumableUpload';

const FileUpload = ({
  files = [],
  onFilesChange,
  multiple = true,
  maxFiles = 10,
  className = '',
  disabled = false,
  enableCompression = true
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadSpeed, setUploadSpeed] = useState({});
  const [uploadETA, setUploadETA] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [errors, setErrors] = useState({});
  const [abortControllers, setAbortControllers] = useState({});
  const [compressionResults, setCompressionResults] = useState({});
  const [resumableUploads, setResumableUploads] = useState({});
  const [networkStatus, setNetworkStatus] = useState('online');
  const [retryAttempts, setRetryAttempts] = useState({});
  const fileInputRef = useRef(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      case 'presentation':
        return Presentation;
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

      // Create abort controller for cancellation
      const abortController = new AbortController();
      setAbortControllers(prev => ({ ...prev, [fileId]: abortController }));

      // Initialize upload state
      setUploading(prev => ({ ...prev, [fileId]: true }));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      setUploadSpeed(prev => ({ ...prev, [fileId]: 0 }));
      setUploadETA(prev => ({ ...prev, [fileId]: 'Calculating...' }));

      try {
        let processedFile = file;
        
        // Apply compression if enabled and applicable
        if (enableCompression && canCompress(file)) {
          try {
            const compressedFile = await autoCompress(file);
            if (compressedFile.size < file.size) {
              processedFile = compressedFile;
              const compressionResult = formatCompressionResults(file, compressedFile);
              setCompressionResults(prev => ({ ...prev, [fileId]: compressionResult }));
            }
          } catch (compressionError) {
            console.warn('Compression failed, using original file:', compressionError);
          }
        }
        
        // Determine if this is a large file
        const isLargeFile = processedFile.size >= CHUNK_CONFIG.CHUNKED_UPLOAD_THRESHOLD;
        const uploadUrl = '/api/training/upload'; // This should be your actual upload endpoint

        let uploadedFile;

        if (isLargeFile) {
          // Use smart upload for large files with enhanced progress tracking
          const result = await smartUpload(processedFile, uploadUrl, {
            signal: abortController.signal,
            onProgress: (progressData) => {
              setUploadProgress(prev => ({ ...prev, [fileId]: progressData.overallProgress }));
              if (progressData.speed) {
                setUploadSpeed(prev => ({ ...prev, [fileId]: progressData.speed }));
                setUploadETA(prev => ({ 
                  ...prev, 
                  [fileId]: estimateTimeRemaining(progressData.uploaded, progressData.total, progressData.speed)
                }));
              }
            },
            onChunkComplete: (chunkData) => {
              console.log(`Chunk ${chunkData.chunkIndex + 1}/${chunkData.totalChunks} uploaded`);
            }
          });
          
          uploadedFile = {
            id: result.uploadId,
            name: processedFile.name,
            size: processedFile.size,
            type: processedFile.type,
            originalName: file.name,
            originalSize: file.size,
            category: getFileInfo(processedFile.type).category,
            extension: getFileInfo(processedFile.type).ext,
            url: result.finalResult?.url || `#${processedFile.name}`,
            uploadedAt: new Date().toISOString(),
            lastModified: new Date(processedFile.lastModified).toISOString()
          };
        } else {
          // Use regular upload for smaller files
          uploadedFile = await simulateFileUpload(processedFile, (progress) => {
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          });
          
          // Add original file info if compressed
          if (processedFile !== file) {
            uploadedFile.originalName = file.name;
            uploadedFile.originalSize = file.size;
          }
        }

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
        setUploadSpeed(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        setUploadETA(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        setAbortControllers(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });

      } catch (error) {
        if (error.message !== 'Upload cancelled by user') {
          // Enhanced error handling with user-friendly messages
          let userFriendlyMessage = error.message;
          let canRetry = false;
          
          // Network-related errors
          if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
            userFriendlyMessage = 'Network connection lost. Please check your internet connection and try again.';
            canRetry = true;
          }
          // Timeout errors
          else if (error.message.includes('timeout')) {
            userFriendlyMessage = 'Upload timed out. This may be due to a slow connection or large file size.';
            canRetry = true;
          }
          // Server errors
          else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            userFriendlyMessage = 'Server error occurred. Please try again in a few moments.';
            canRetry = true;
          }
          // File size errors
          else if (error.message.includes('size') && error.message.includes('exceed')) {
            userFriendlyMessage = 'File is too large. Please choose a smaller file or try compressing it.';
            canRetry = false;
          }
          // File type errors
          else if (error.message.includes('type') && error.message.includes('not supported')) {
            userFriendlyMessage = 'File type not supported. Please choose a different file format.';
            canRetry = false;
          }
          // Generic upload errors
          else if (error.message.includes('Upload failed')) {
            userFriendlyMessage = 'Upload failed. Please check your connection and try again.';
            canRetry = true;
          }
          
          setErrors(prev => ({
            ...prev,
            [fileId]: {
              message: userFriendlyMessage,
              originalError: error.message,
              canRetry,
              timestamp: new Date().toISOString()
            }
          }));
        }
        
        // Clean up all state on error
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
        setUploadSpeed(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        setUploadETA(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
        setAbortControllers(prev => {
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

  // Cancel upload function
  const cancelUpload = (fileId) => {
    const abortController = abortControllers[fileId];
    if (abortController) {
      abortController.abort();
    }
    
    // Clean up all state for this file
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
    setUploadSpeed(prev => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
    setUploadETA(prev => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
    setAbortControllers(prev => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
    setErrors(prev => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
  };

  // Retry failed upload
  const retryUpload = async (fileId) => {
    const error = errors[fileId];
    if (!error || !error.canRetry) return;

    // Clear previous error
    setErrors(prev => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });

    // Find the original file info (this would need to be stored)
    // For now, we'll show a message to re-select the file
    alert('Please re-select and upload the file again.');
  };

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
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.avi,.mov,.webm,.mkv,.mp3,.wav,.m4a,.ogg,.flac,.zip,.rar,.7z,.xls,.xlsx,.ppt,.pptx"
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
            Supports: PDF, DOC, DOCX, TXT, Images, Videos, Audio, Archives, Spreadsheets, Presentations
          </p>
          {maxFiles > 1 && (
            <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
              Maximum {maxFiles} files • {files.length} uploaded
            </p>
          )}
        </div>
      </div>

      {/* General Error and Network Status */}
      {errors.general && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errors.general}</p>
        </div>
      )}
      
      {networkStatus === 'offline' && (
        <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">You're currently offline</p>
            <p className="text-xs text-orange-500 mt-1">
              Files will be uploaded automatically when your connection is restored.
            </p>
          </div>
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
              const speed = uploadSpeed[tempId] || 0;
              const eta = uploadETA[tempId] || 'Calculating...';
              const error = errors[tempId];
              const canCancel = abortControllers[tempId];
              
              return (
                <div key={tempId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        Uploading...
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
                        {canCancel && (
                          <button
                            onClick={() => cancelUpload(tempId)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                            title="Cancel upload"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Upload stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        {speed > 0 && (
                          <span className="flex items-center space-x-1">
                            <span>Speed:</span>
                            <span className="font-medium">{formatUploadSpeed(speed)}</span>
                          </span>
                        )}
                        {eta !== 'Calculating...' && (
                          <span className="flex items-center space-x-1">
                            <span>ETA:</span>
                            <span className="font-medium">{eta}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Compression info during upload */}
                    {compressionResults[tempId] && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                        <span>Compressed: {compressionResults[tempId].ratio}% smaller</span>
                        <span className="ml-2">({formatFileSize(compressionResults[tempId].sizeSaved)} saved)</span>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-red-700 font-medium">
                              {typeof error === 'object' ? error.message : error}
                            </p>
                            {typeof error === 'object' && error.canRetry && (
                              <div className="mt-2 flex items-center space-x-3">
                                <button
                                  onClick={() => retryUpload(tempId)}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                                >
                                  Retry Upload
                                </button>
                                <span className="text-xs text-red-500">
                                  Error at {new Date(error.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                            {networkStatus === 'offline' && (
                              <div className="mt-2 text-xs text-red-600">
                                <span>You're currently offline. Upload will resume when connection is restored.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            });

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
                        file.category === 'audio' ? 'bg-purple-100' :
                        file.category === 'presentation' ? 'bg-orange-100' :
                        file.category === 'spreadsheet' ? 'bg-emerald-100' :
                        file.category === 'archive' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          file.category === 'image' ? 'text-green-600' :
                          file.category === 'video' ? 'text-red-600' :
                          file.category === 'document' ? 'text-blue-600' :
                          file.category === 'audio' ? 'text-purple-600' :
                          file.category === 'presentation' ? 'text-orange-600' :
                          file.category === 'spreadsheet' ? 'text-emerald-600' :
                          file.category === 'archive' ? 'text-yellow-600' :
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
                        {file.originalSize && file.originalSize !== file.size && (
                          <span className="text-green-600 ml-1">
                            (was {formatFileSize(file.originalSize)})
                          </span>
                        )}
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
                    
                    {/* Show compression info for uploaded files */}
                    {file.originalSize && file.originalSize !== file.size && (
                      <div className="text-xs text-green-600 mt-1">
                        Compressed by {Math.round(((file.originalSize - file.size) / file.originalSize) * 100)}%
                      </div>
                    )}
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
