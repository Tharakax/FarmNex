import React, { useState } from 'react';
import FileUpload from '../common/FileUpload';

const FileUploadDemo = () => {
  const [files, setFiles] = useState([]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload Demo</h1>
        <p className="text-gray-600">
          Test the file upload functionality with drag-and-drop, progress tracking, and validation
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Training Materials</h2>
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          multiple={true}
          maxFiles={10}
        />
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            File Summary ({files.length} files)
          </h2>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id || file.tempId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.category} • {file.extension?.toUpperCase()} • {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Uploaded
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total size: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Features Demonstrated</h2>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Drag and drop file upload
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Click to browse files
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            File type validation (PDF, DOC, images, videos, etc.)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            File size validation and formatting
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Upload progress simulation
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Image preview functionality
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            File management (remove files)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
            Multiple file upload support
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Supported File Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Documents</h3>
            <ul className="text-gray-600 space-y-1">
              <li>PDF (50MB)</li>
              <li>DOC/DOCX (25MB)</li>
              <li>TXT (5MB)</li>
              <li>XLS/XLSX (25MB)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Images</h3>
            <ul className="text-gray-600 space-y-1">
              <li>JPG/JPEG (10MB)</li>
              <li>PNG (10MB)</li>
              <li>GIF (5MB)</li>
              <li>WebP (10MB)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Videos</h3>
            <ul className="text-gray-600 space-y-1">
              <li>MP4 (500MB)</li>
              <li>AVI (500MB)</li>
              <li>MOV (500MB)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Audio</h3>
            <ul className="text-gray-600 space-y-1">
              <li>MP3 (50MB)</li>
              <li>WAV (100MB)</li>
              <li>M4A (50MB)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo;
