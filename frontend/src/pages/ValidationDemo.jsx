import React, { useState } from 'react';
import { showValidationError } from '../utils/sweetAlert';

const ValidationDemo = () => {
  const [demoType, setDemoType] = useState('simple');

  const showSimpleValidation = () => {
    const errors = [
      'Title is required.',
      'Description must be at least 20 characters long.',
      'Category is required.',
      'File size must be less than 50MB.'
    ];
    showValidationError(errors, 'Please Fix These Issues');
  };

  const showComplexValidation = () => {
    const errors = {
      title: ['Title is required', 'Title must be at least 5 characters long'],
      description: ['Description must be at least 20 characters long'],
      file: ['Invalid file type for Video', 'File size must be less than 50MB'],
      tags: ['Maximum of 10 tags allowed']
    };
    showValidationError(errors, 'Training Material Validation Errors');
  };

  const showTrainingValidation = () => {
    const errors = [
      'Title is required.',
      'Description must be at least 20 characters long.',
      'Category is required.',
      'Content is required for articles.',
      'Article content must be at least 50 characters long.',
      'A file is required for Video content.',
      'Invalid file type for Video.',
      'File size must be less than 50MB.',
      'Maximum of 10 tags allowed.',
      'Each tag must be less than 50 characters.'
    ];
    showValidationError(errors, 'Training Material Form Validation');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Training Form Validation Demo</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">SweetAlert2 Validation Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Simple List</h3>
              <p className="text-blue-700 mb-4">Shows validation errors in a simple bulleted list format.</p>
              <button
                onClick={showSimpleValidation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show Simple Validation
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Grouped by Field</h3>
              <p className="text-green-700 mb-4">Shows validation errors grouped by form field with colored sections.</p>
              <button
                onClick={showComplexValidation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Show Complex Validation
              </button>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Training Form</h3>
              <p className="text-purple-700 mb-4">Shows all possible training material form validation errors.</p>
              <button
                onClick={showTrainingValidation}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Show Training Validation
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Form Validation Rules</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Training Material Form Rules:</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-900">Title</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required field</li>
                      <li>• Minimum 5 characters</li>
                      <li>• Maximum 100 characters</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-900">Description</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required field</li>
                      <li>• Minimum 20 characters</li>
                      <li>• Maximum 1000 characters</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-yellow-900">Category</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required field</li>
                      <li>• Must select from dropdown</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-purple-900">Content (Articles)</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required for Article type</li>
                      <li>• Minimum 50 characters</li>
                      <li>• Maximum 50,000 characters</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium text-red-900">File Upload</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required for Video/PDF/Guide types</li>
                      <li>• Maximum 50MB file size</li>
                      <li>• Valid file types only</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-medium text-indigo-900">Tags</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Optional field</li>
                      <li>• Maximum 10 tags</li>
                      <li>• Each tag max 50 characters</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/training-test"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Test the Training Form →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ValidationDemo;