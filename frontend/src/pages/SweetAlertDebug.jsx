import React, { useEffect } from 'react';
import { testSweetAlert, showValidationError, showSuccess, showConfirm } from '../utils/sweetAlertRobust';
// Also import direct Swal for comparison
let Swal = null;
try {
  Swal = require('sweetalert2').default;
} catch (e) {
  console.warn('Direct SweetAlert2 import failed');
}

const SweetAlertDebug = () => {
  useEffect(() => {
    console.log('=== SweetAlert2 Debug Test ===');
    console.log('Swal object:', Swal);
    console.log('Swal.fire function:', typeof Swal.fire);
    
    // Test basic SweetAlert functionality
    const testSweetAlert = async () => {
      try {
        console.log('Testing direct Swal.fire...');
        
        // Test 1: Simple alert
        setTimeout(async () => {
          try {
            await Swal.fire({
              title: 'Debug Test 1',
              text: 'If you see this, SweetAlert2 is working!',
              icon: 'success',
              confirmButtonText: 'Great!'
            });
            console.log('✅ Test 1 passed - Basic SweetAlert works');
          } catch (error) {
            console.error('❌ Test 1 failed:', error);
          }
        }, 1000);

        // Test 2: Validation error style
        setTimeout(async () => {
          try {
            await Swal.fire({
              title: 'Debug Test 2',
              html: '<ul><li>Error 1: Test validation error</li><li>Error 2: Another test error</li></ul>',
              icon: 'error',
              confirmButtonText: 'Fix Issues'
            });
            console.log('✅ Test 2 passed - Validation error style works');
          } catch (error) {
            console.error('❌ Test 2 failed:', error);
          }
        }, 3000);

        // Test 3: Confirmation dialog
        setTimeout(async () => {
          try {
            const result = await Swal.fire({
              title: 'Debug Test 3',
              text: 'This is a confirmation test',
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No'
            });
            console.log('✅ Test 3 passed - Confirmation result:', result);
          } catch (error) {
            console.error('❌ Test 3 failed:', error);
          }
        }, 5000);

      } catch (error) {
        console.error('SweetAlert test error:', error);
      }
    };

    testSweetAlert();
  }, []);

  const testManualAlert = async () => {
    try {
      console.log('Manual test button clicked - using robust utilities');
      const result = await showSuccess('You clicked the test button!', 'Manual Test');
      console.log('Manual test result:', result);
    } catch (error) {
      console.error('Manual test error:', error);
    }
  };

  const testValidationError = async () => {
    try {
      console.log('Testing validation error with robust utilities');
      await showValidationError(['File is required for all content types'], 'File Required');
    } catch (error) {
      console.error('Validation test error:', error);
    }
  };

  const testConfirmDialog = async () => {
    try {
      console.log('Testing confirmation dialog with robust utilities');
      const result = await showConfirm('Do you want to continue with this test?', 'Confirm Test');
      console.log('Confirmation result:', result);
    } catch (error) {
      console.error('Confirmation test error:', error);
    }
  };

  const testRobustSwal = async () => {
    try {
      console.log('Testing robust SweetAlert initialization');
      const isWorking = await testSweetAlert();
      console.log('Robust SweetAlert working:', isWorking);
    } catch (error) {
      console.error('Robust SweetAlert test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🍭 SweetAlert2 Debug Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>SweetAlert2 Loaded: <span className="font-bold text-green-600">{Swal ? 'YES' : 'NO'}</span></p>
            <p>Swal.fire Available: <span className="font-bold text-green-600">{typeof Swal?.fire === 'function' ? 'YES' : 'NO'}</span></p>
            <p>Version: <span className="font-bold">{Swal?.version || 'Unknown'}</span></p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Auto-Tests Running</h2>
          <div className="space-y-2">
            <p>✅ Test 1 (1s): Basic SweetAlert</p>
            <p>✅ Test 2 (3s): Validation Error Style</p>
            <p>✅ Test 3 (5s): Confirmation Dialog</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Check browser console for test results. SweetAlert popups should appear automatically.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Tests (Robust Utilities)</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={testRobustSwal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Robust Init
            </button>
            <button
              onClick={testManualAlert}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Success Alert
            </button>
            <button
              onClick={testValidationError}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Test Validation Error
            </button>
            <button
              onClick={testConfirmDialog}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Test Confirmation
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Behavior:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• You should see styled SweetAlert popups, not browser alerts</li>
            <li>• Console should show "✅ Test passed" messages</li>
            <li>• If you see browser alerts instead, SweetAlert2 import/setup has issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SweetAlertDebug;