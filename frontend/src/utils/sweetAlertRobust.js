// Robust SweetAlert utility that works with both npm package and CDN
let Swal = null;

// Try to import SweetAlert2 from multiple sources
const initializeSwal = async () => {
  try {
    // Method 1: Try ES6 import
    const swalModule = await import('sweetalert2');
    Swal = swalModule.default || swalModule;
    console.log('✅ SweetAlert2 loaded via ES6 import:', Swal);
    return Swal;
  } catch (error) {
    console.warn('❌ ES6 import failed:', error);
  }

  try {
    // Method 2: Try global window.Swal (CDN)
    if (typeof window !== 'undefined' && window.Swal) {
      Swal = window.Swal;
      console.log('✅ SweetAlert2 loaded via CDN (window.Swal):', Swal);
      return Swal;
    }
  } catch (error) {
    console.warn('❌ CDN fallback failed:', error);
  }

  console.error('❌ SweetAlert2 could not be loaded from any source');
  return null;
};

// Initialize on module load
let swalPromise = initializeSwal();

// Helper function to ensure Swal is loaded
const getSwal = async () => {
  if (!Swal) {
    Swal = await swalPromise;
  }
  return Swal;
};

// Validation Error Alert
export const showValidationError = async (errors, title = 'Please Fix These Issues') => {
  console.log('🔧 showValidationError called:', errors, title);
  
  const swal = await getSwal();
  if (!swal) {
    console.error('❌ SweetAlert2 not available, using alert');
    const errorText = Array.isArray(errors) ? errors.join('\n') : errors;
    alert(`${title}:\n\n${errorText}`);
    return { isConfirmed: true };
  }

  let htmlContent = '<div style="text-align: left;">';
  
  if (Array.isArray(errors)) {
    htmlContent += '<ul style="margin: 0; padding-left: 20px;">';
    errors.forEach(error => {
      const message = typeof error === 'string' ? error : error.message;
      htmlContent += `<li style="margin: 5px 0; color: #666;">${message}</li>`;
    });
    htmlContent += '</ul>';
  } else {
    htmlContent += `<p style="margin: 0; color: #666;">${errors}</p>`;
  }
  
  htmlContent += '</div>';
  
  try {
    return await swal.fire({
      title: title,
      html: htmlContent,
      icon: 'error',
      confirmButtonText: 'Fix Issues',
      confirmButtonColor: '#dc3545',
      width: '500px',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        content: 'swal2-content'
      }
    });
  } catch (error) {
    console.error('❌ SweetAlert fire failed:', error);
    const errorText = Array.isArray(errors) ? errors.join('\n') : errors;
    alert(`${title}:\n\n${errorText}`);
    return { isConfirmed: true };
  }
};

// Success Alert
export const showSuccess = async (message, title = 'Success!') => {
  console.log('🔧 showSuccess called:', message, title);
  
  const swal = await getSwal();
  if (!swal) {
    alert(`${title}: ${message}`);
    return { isConfirmed: true };
  }

  try {
    return await swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#28a745'
    });
  } catch (error) {
    console.error('❌ SweetAlert fire failed:', error);
    alert(`${title}: ${message}`);
    return { isConfirmed: true };
  }
};

// Error Alert
export const showError = async (message, title = 'Error!') => {
  console.log('🔧 showError called:', message, title);
  
  const swal = await getSwal();
  if (!swal) {
    alert(`${title}: ${message}`);
    return { isConfirmed: true };
  }

  try {
    return await swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc3545'
    });
  } catch (error) {
    console.error('❌ SweetAlert fire failed:', error);
    alert(`${title}: ${message}`);
    return { isConfirmed: true };
  }
};

// Warning Alert
export const showWarning = async (message, title = 'Warning!') => {
  console.log('🔧 showWarning called:', message, title);
  
  const swal = await getSwal();
  if (!swal) {
    alert(`${title}: ${message}`);
    return { isConfirmed: true };
  }

  try {
    return await swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ffc107'
    });
  } catch (error) {
    console.error('❌ SweetAlert fire failed:', error);
    alert(`${title}: ${message}`);
    return { isConfirmed: true };
  }
};

// Confirmation Dialog
export const showConfirm = async (message, title = 'Confirm') => {
  console.log('🔧 showConfirm called:', message, title);
  
  const swal = await getSwal();
  if (!swal) {
    const result = confirm(`${title}: ${message}`);
    return { isConfirmed: result };
  }

  try {
    return await swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });
  } catch (error) {
    console.error('❌ SweetAlert fire failed:', error);
    const result = confirm(`${title}: ${message}`);
    return { isConfirmed: result };
  }
};

// Toast Notification
export const showToast = async (message, type = 'success', position = 'top-end') => {
  console.log('🔧 showToast called:', message, type);
  
  const swal = await getSwal();
  if (!swal) {
    // Fallback: show a temporary div for toast
    const toast = document.createElement('div');
    toast.innerHTML = `<div style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 10px 15px; border-radius: 5px; z-index: 9999; font-size: 14px;">${message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
    return;
  }

  try {
    const Toast = swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    return await Toast.fire({
      icon: type,
      title: message
    });
  } catch (error) {
    console.error('❌ SweetAlert toast failed:', error);
    // Fallback toast
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107';
    toast.innerHTML = `<div style="position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white; padding: 10px 15px; border-radius: 5px; z-index: 9999; font-size: 14px;">${message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }
};

// Validation Success with Recommendations
export const showValidationSuccess = async (message, recommendations = []) => {
  console.log('🔧 showValidationSuccess called:', message, recommendations);
  
  const swal = await getSwal();
  if (!swal) {
    let alertText = message;
    if (recommendations.length > 0) {
      alertText += '\n\nRecommendations:\n' + recommendations.join('\n');
    }
    alert(alertText);
    return { isConfirmed: true };
  }

  let htmlContent = `<div style="text-align: left;">`;
  htmlContent += `<p style="color: #28a745; margin-bottom: 15px;">${message}</p>`;
  
  if (recommendations.length > 0) {
    htmlContent += '<div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 10px; margin-top: 10px;">';
    htmlContent += '<p style="color: #1976d2; font-weight: bold; margin: 0 0 8px 0;">💡 Recommendations:</p>';
    htmlContent += '<ul style="margin: 0; padding-left: 20px; color: #1976d2;">';
    recommendations.forEach(rec => {
      htmlContent += `<li style="margin: 3px 0;">${rec}</li>`;
    });
    htmlContent += '</ul></div>';
  }
  
  htmlContent += '</div>';
  
  try {
    return await swal.fire({
      title: 'Success!',
      html: htmlContent,
      icon: 'success',
      confirmButtonText: 'Continue',
      confirmButtonColor: '#28a745',
      width: '500px'
    });
  } catch (error) {
    console.error('❌ SweetAlert fire failed:', error);
    let alertText = message;
    if (recommendations.length > 0) {
      alertText += '\n\nRecommendations:\n' + recommendations.join('\n');
    }
    alert(alertText);
    return { isConfirmed: true };
  }
};

// Export initialization function for testing
export const testSweetAlert = async () => {
  console.log('🧪 Testing SweetAlert initialization...');
  const swal = await getSwal();
  console.log('🧪 SweetAlert instance:', swal);
  return swal !== null;
};