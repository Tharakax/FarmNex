import Swal from 'sweetalert2';

/**
 * SweetAlert utility functions to replace native alert(), confirm(), and provide enhanced notifications
 */

// Replace alert() - Simple notification
export const showAlert = (message, title = 'Alert', type = 'info') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: type,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6'
  });
};

// Replace confirm() - Confirmation dialog
export const showConfirm = (message, title = 'Confirm', options = {}) => {
  const defaultOptions = {
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    ...options
  };

  return Swal.fire(defaultOptions);
};

// Success notification
export const showSuccess = (message, title = 'Success!') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#28a745'
  });
};

// Error notification
export const showError = (message, title = 'Error!') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc3545'
  });
};

// Warning notification
export const showWarning = (message, title = 'Warning!') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ffc107'
  });
};

// Info notification
export const showInfo = (message, title = 'Information') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#17a2b8'
  });
};

// Toast notification (small, auto-dismiss)
export const showToast = (message, type = 'success', position = 'top-end') => {
  const Toast = Swal.mixin({
    toast: true,
    position: position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  return Toast.fire({
    icon: type,
    title: message
  });
};

// Loading/Progress notification
export const showLoading = (message = 'Loading...', title = 'Please wait') => {
  return Swal.fire({
    title: title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close any open SweetAlert
export const closeAlert = () => {
  Swal.close();
};

// Input dialog (replaces prompt())
export const showInput = (message, title = 'Input', inputType = 'text', placeholder = '') => {
  return Swal.fire({
    title: title,
    text: message,
    input: inputType,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to write something!'
      }
    }
  });
};

// Delete confirmation (common use case)
export const showDeleteConfirm = (itemName = 'this item') => {
  return Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert this! This will permanently delete ${itemName}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });
};

// ===========================================
// ENHANCED FORM VALIDATION ALERTS
// ===========================================

// Form validation errors with better formatting
export const showValidationError = (errors, title = 'Please Fix These Issues') => {
  let htmlContent = '<div class="text-left">';
  
  if (Array.isArray(errors)) {
    // Array of error messages
    htmlContent += '<ul class="list-disc list-inside space-y-1">';
    errors.forEach(error => {
      const message = typeof error === 'string' ? error : error.message;
      htmlContent += `<li class="text-sm text-gray-700">${message}</li>`;
    });
    htmlContent += '</ul>';
  } else if (typeof errors === 'object') {
    // Object with field errors
    htmlContent += '<div class="space-y-2">';
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      if (fieldErrors && fieldErrors.length > 0) {
        htmlContent += `<div class="border-l-4 border-red-500 pl-3">`;
        htmlContent += `<div class="font-semibold text-red-600 capitalize">${field.replace(/([A-Z])/g, ' $1')}</div>`;
        fieldErrors.forEach(error => {
          htmlContent += `<div class="text-sm text-gray-700 ml-2">• ${error}</div>`;
        });
        htmlContent += '</div>';
      }
    });
    htmlContent += '</div>';
  } else {
    // Single error message
    htmlContent += `<p class="text-gray-700">${errors}</p>`;
  }
  
  htmlContent += '</div>';
  
  return Swal.fire({
    title: title,
    html: htmlContent,
    icon: 'error',
    confirmButtonText: 'Fix Issues',
    confirmButtonColor: '#dc3545',
    customClass: {
      popup: 'swal-wide'
    },
    didOpen: () => {
      // Add custom CSS for better formatting
      const style = document.createElement('style');
      style.textContent = `
        .swal-wide {
          width: 600px !important;
          max-width: 90vw !important;
        }
        .swal2-html-container {
          max-height: 400px !important;
          overflow-y: auto !important;
          text-align: left !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
};

// Critical validation warning (for high-value items, dangerous operations)
export const showCriticalValidation = (message, title = 'Critical Validation') => {
  return Swal.fire({
    title: title,
    html: `
      <div class="text-left">
        <div class="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-orange-400 mr-2"></i>
            <p class="text-orange-800">${message}</p>
          </div>
        </div>
        <p class="text-sm text-gray-600">Please confirm this is correct before proceeding.</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Continue',
    cancelButtonText: 'Let me check',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#6b7280',
    reverseButtons: true
  });
};

// Success validation with recommendations
export const showValidationSuccess = (message, recommendations = []) => {
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
  
  return Swal.fire({
    title: 'Validation Successful!',
    html: htmlContent,
    icon: 'success',
    confirmButtonText: 'Continue',
    confirmButtonColor: '#28a745'
  });
};

// Form submission confirmation
export const showSubmissionConfirm = (formType = 'form', data = {}) => {
  const itemName = data.name || 'this item';
  const action = data._id ? 'update' : 'add';
  const actionText = action === 'update' ? 'Update' : 'Add';
  
  let htmlContent = '<div class="text-left">';
  htmlContent += `<p class="mb-3">You are about to ${action} <strong>${itemName}</strong>.</p>`;
  
  if (data.price && data.quantity) {
    const totalValue = (parseFloat(data.price) * parseInt(data.quantity)).toFixed(2);
    htmlContent += `<div class="bg-gray-50 p-3 rounded mb-3">`;
    htmlContent += `<p class="text-sm"><strong>Total Value:</strong> LKR ${totalValue}</p>`;
    if (data.category) {
      htmlContent += `<p class="text-sm"><strong>Category:</strong> ${data.category}</p>`;
    }
    htmlContent += '</div>';
  }
  
  htmlContent += '<p class="text-sm text-gray-600">This action will be saved to your inventory.</p>';
  htmlContent += '</div>';
  
  return Swal.fire({
    title: `${actionText} Supply Item?`,
    html: htmlContent,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Yes, ${actionText}`,
    cancelButtonText: 'Review Again',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6b7280'
  });
};

// Field-specific validation hint
export const showFieldHint = (fieldName, hint, type = 'info') => {
  return Swal.fire({
    title: `${fieldName} Help`,
    text: hint,
    icon: type,
    confirmButtonText: 'Got it!',
    confirmButtonColor: '#17a2b8',
    timer: 5000,
    timerProgressBar: true,
    toast: true,
    position: 'top-right',
    showConfirmButton: false
  });
};

// Bulk validation warning (for batch operations)
export const showBulkValidationWarning = (issues, totalItems) => {
  let htmlContent = '<div class="text-left">';
  htmlContent += `<p class="mb-3">Found issues in ${issues.length} out of ${totalItems} items:</p>`;
  
  htmlContent += '<div class="max-h-48 overflow-y-auto space-y-2">';
  issues.forEach((issue, index) => {
    htmlContent += '<div class="bg-red-50 border border-red-200 rounded p-2">';
    htmlContent += `<p class="font-semibold text-red-800">Item ${index + 1}: ${issue.name || 'Unnamed'}</p>`;
    if (issue.errors && issue.errors.length > 0) {
      htmlContent += '<ul class="text-sm text-red-700 mt-1">';
      issue.errors.forEach(error => {
        htmlContent += `<li>• ${error}</li>`;
      });
      htmlContent += '</ul>';
    }
    htmlContent += '</div>';
  });
  htmlContent += '</div>';
  
  htmlContent += '</div>';
  
  return Swal.fire({
    title: 'Bulk Validation Issues',
    html: htmlContent,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Fix Issues',
    cancelButtonText: 'Skip Invalid Items',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#f59e0b',
    customClass: {
      popup: 'swal-wide'
    }
  });
};
