import React, { useEffect } from 'react';

const SweetAlertDebug = () => {
  useEffect(() => {
    console.log('SweetAlertDebug component mounted');
    
    // Test direct SweetAlert2 import
    const testSweetAlert = async () => {
      try {
        console.log('Testing SweetAlert2 import...');
        
        const Swal = (await import('sweetalert2')).default;
        console.log('SweetAlert2 imported successfully:', Swal);
        
        // Test if it works
        await Swal.fire({
          title: 'SweetAlert2 Works!',
          text: 'This popup shows that SweetAlert2 is working correctly',
          icon: 'success',
          confirmButtonText: 'Great!'
        });
        
        console.log('SweetAlert2 test completed successfully');
        
      } catch (error) {
        console.error('SweetAlert2 test failed:', error);
        alert('SweetAlert2 test failed: ' + error.message);
      }
    };
    
    // Test our utility functions
    const testUtilityFunctions = async () => {
      try {
        console.log('Testing utility functions...');
        
        const { showSuccess, showError, showValidationError } = await import('../utils/sweetAlert');
        console.log('Utility functions imported:', { showSuccess, showError, showValidationError });
        
        // Test basic success
        setTimeout(async () => {
          try {
            await showSuccess('Utility functions work!', 'Success');
            console.log('showSuccess test completed');
          } catch (error) {
            console.error('showSuccess test failed:', error);
          }
        }, 2000);
        
        // Test validation error
        setTimeout(async () => {
          try {
            await showValidationError([
              'This is a test validation error',
              'Multiple errors can be shown',
              'All formatted nicely'
            ], 'Test Validation');
            console.log('showValidationError test completed');
          } catch (error) {
            console.error('showValidationError test failed:', error);
          }
        }, 4000);
        
      } catch (error) {
        console.error('Utility functions test failed:', error);
      }
    };
    
    // Run tests with delay
    setTimeout(testSweetAlert, 1000);
    setTimeout(testUtilityFunctions, 3000);
    
  }, []);

  return (
    <div className="p-8 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">SweetAlert2 Debug Component</h2>
      <div className="space-y-2 text-sm">
        <p>• This component automatically tests SweetAlert2 when it loads</p>
        <p>• Check the browser console for detailed logs</p>
        <p>• You should see 2 popups appear automatically</p>
        <p>• If no popups appear, check the console for errors</p>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-medium text-yellow-800 mb-2">Expected behavior:</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Success popup should appear after 1 second</li>
          <li>2. Validation error popup should appear after 4 seconds</li>
          <li>3. Console should show detailed logging</li>
        </ol>
      </div>
    </div>
  );
};

export default SweetAlertDebug;