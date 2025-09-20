import React from 'react';
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  showConfirm, 
  showAlert,
  showToast,
  showValidationError,
  showValidationSuccess 
} from '../utils/sweetAlert';
import SweetAlertDebug from '../components/SweetAlertDebug';

const SweetAlertTest = () => {
  
  const testBasicAlert = () => {
    console.log('Testing basic alert...');
    showAlert('This is a basic alert message!', 'Alert Test');
  };

  const testSuccess = () => {
    console.log('Testing success alert...');
    showSuccess('Operation completed successfully!', 'Success!');
  };

  const testError = () => {
    console.log('Testing error alert...');
    showError('Something went wrong!', 'Error!');
  };

  const testWarning = () => {
    console.log('Testing warning alert...');
    showWarning('Please be careful!', 'Warning!');
  };

  const testInfo = () => {
    console.log('Testing info alert...');
    showInfo('Here is some important information.', 'Information');
  };

  const testConfirm = async () => {
    console.log('Testing confirm dialog...');
    const result = await showConfirm('Are you sure you want to continue?', 'Confirm Action');
    console.log('Confirm result:', result);
    
    if (result.isConfirmed) {
      showSuccess('You confirmed the action!');
    } else {
      showInfo('Action cancelled.');
    }
  };

  const testToast = () => {
    console.log('Testing toast notification...');
    showToast('This is a toast notification!', 'success');
  };

  const testValidationError = () => {
    console.log('Testing validation error...');
    const errors = [
      'Title is required.',
      'Description must be at least 20 characters.',
      'Category must be selected.',
      'File size is too large.'
    ];
    showValidationError(errors, 'Please Fix These Issues');
  };

  const testValidationSuccess = () => {
    console.log('Testing validation success...');
    showValidationSuccess(
      'Form submitted successfully!',
      [
        'Consider adding more tags for better discoverability',
        'Remember to publish your content when ready'
      ]
    );
  };

  const testDirectSwal = () => {
    console.log('Testing direct Swal import...');
    
    // Direct import test
    import('sweetalert2').then(({ default: Swal }) => {
      console.log('Swal imported directly:', Swal);
      Swal.fire({
        title: 'Direct Import Test',
        text: 'This is using direct Swal import',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }).catch(error => {
      console.error('Failed to import Swal directly:', error);
      alert('Failed to import SweetAlert2 directly: ' + error.message);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">SweetAlert2 Test Page</h1>
        
        {/* Debug Component - Auto-tests SweetAlert */}
        <SweetAlertDebug />
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 mt-8">
          <h2 className="text-2xl font-semibold mb-6">Manual SweetAlert Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testBasicAlert}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Test Basic Alert
            </button>
            
            <button
              onClick={testSuccess}
              className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Test Success
            </button>
            
            <button
              onClick={testError}
              className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Test Error
            </button>
            
            <button
              onClick={testWarning}
              className="bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Test Warning
            </button>
            
            <button
              onClick={testInfo}
              className="bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Test Info
            </button>
            
            <button
              onClick={testConfirm}
              className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Test Confirm
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testToast}
              className="bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition-colors"
            >
              Test Toast
            </button>
            
            <button
              onClick={testValidationError}
              className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Test Validation Error
            </button>
            
            <button
              onClick={testValidationSuccess}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Validation Success
            </button>
          </div>
          
          <div className="text-center">
            <button
              onClick={testDirectSwal}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Test Direct Swal Import
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Debugging Information</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Open browser Developer Tools (F12)</li>
              <li>Go to Console tab</li>
              <li>Click any button above</li>
              <li>Watch console for messages and errors</li>
              <li>Check if SweetAlert popup appears</li>
            </ol>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800">If no popups appear:</h4>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Check console for JavaScript errors</li>
                <li>• Verify SweetAlert2 is properly imported</li>
                <li>• Check if browser is blocking popups</li>
                <li>• Try the "Direct Import Test" button</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Navigate to other test pages:
          </p>
          <div className="space-x-4">
            <a
              href="/validation-demo"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Validation Demo
            </a>
            <a
              href="/training-test"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Training Form Test
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweetAlertTest;