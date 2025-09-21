import Swal from 'sweetalert2';

// Simple SweetAlert utilities without fallback to native alerts
// This will help us debug if SweetAlert2 is working properly

export const showValidationError = async (errors, title = 'Please Fix These Issues') => {
  console.log('showValidationError called with:', errors, title);
  
  let htmlContent = '<div class="text-left">';
  
  if (Array.isArray(errors)) {
    htmlContent += '<ul class="list-disc list-inside space-y-1">';
    errors.forEach(error => {
      const message = typeof error === 'string' ? error : error.message;
      htmlContent += `<li class="text-sm text-gray-700">${message}</li>`;
    });
    htmlContent += '</ul>';
  } else {
    htmlContent += `<p class="text-gray-700">${errors}</p>`;
  }
  
  htmlContent += '</div>';
  
  return await Swal.fire({
    title: title,
    html: htmlContent,
    icon: 'error',
    confirmButtonText: 'Fix Issues',
    confirmButtonColor: '#dc3545',
    width: '600px'
  });
};

export const showSuccess = async (message, title = 'Success!') => {
  console.log('showSuccess called with:', message, title);
  
  return await Swal.fire({
    title: title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#28a745'
  });
};

export const showError = async (message, title = 'Error!') => {
  console.log('showError called with:', message, title);
  
  return await Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545'
  });
};

export const showWarning = async (message, title = 'Warning!') => {
  console.log('showWarning called with:', message, title);
  
  return await Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ffc107'
  });
};

export const showConfirm = async (message, title = 'Confirm') => {
  console.log('showConfirm called with:', message, title);
  
  return await Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  });
};

export const showToast = async (message, type = 'success', position = 'top-end') => {
  console.log('showToast called with:', message, type);
  
  const Toast = Swal.mixin({
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
};

export const showValidationSuccess = async (message, recommendations = []) => {
  console.log('showValidationSuccess called with:', message, recommendations);
  
  let htmlContent = `<div class="text-left">`;
  htmlContent += `<p class="text-green-700 mb-3">${message}</p>`;
  
  if (recommendations.length > 0) {
    htmlContent += '<div class="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">';
    htmlContent += '<p class="text-blue-800 font-semibold mb-2">💡 Recommendations:</p>';
    htmlContent += '<ul class="text-sm text-blue-700 space-y-1">';
    recommendations.forEach(rec => {
      htmlContent += `<li>• ${rec}</li>`;
    });
    htmlContent += '</ul></div>';
  }
  
  htmlContent += '</div>';
  
  return await Swal.fire({
    title: 'Success!',
    html: htmlContent,
    icon: 'success',
    confirmButtonText: 'Continue',
    confirmButtonColor: '#28a745'
  });
};