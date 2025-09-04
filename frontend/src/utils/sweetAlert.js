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
