import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Reusable BackButton
const BackButton = ({
  fallback,
  label = 'Back',
  floating = false,
  className = '',
  onClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getParentPath = (path) => {
    if (!path) return '/';
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    parts.pop();
    const parent = '/' + parts.join('/');
    return parent === '' ? '/' : parent;
  };

  const resolvedFallback = fallback ?? getParentPath(location.pathname);

  const handleBack = (e) => {
    e.preventDefault();
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(resolvedFallback, { replace: true });
      }
      if (onClick) onClick(e);
    } catch (err) {
      // Fallback just in case
      navigate(resolvedFallback, { replace: true });
    }
  };

  const floatingClasses = floating
    ? 'fixed left-4 top-4 z-50 shadow-lg bg-white/95 backdrop-blur-sm border-2 border-gray-300'
    : '';

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md ${floatingClasses} ${className}`}
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

// Global floating back button to appear on all pages
export const GlobalBackButton = ({ fallback }) => {
  const location = useLocation();
  
  // Hide back button on main dashboard and home pages where it's not needed
  const hiddenRoutes = [
    '/',
    '/home',
    '/farmerdashboard',
    '/farmer-dashboard',
    '/admin',
    '/admindash',
    '/customerdash',
    '/customer-dashboard'
  ];
  
  // Also hide on routes that match certain patterns (like admin dashboards with paths)
  const hiddenPatterns = [
    /^\/admin($|\/)/,  // /admin or /admin/anything
    /^\/farmerdashboard($|\/)/,  // /farmerdashboard or /farmerdashboard/anything
    /^\/farmer-dashboard($|\/)/  // /farmer-dashboard or /farmer-dashboard/anything
  ];
  
  const shouldShow = !hiddenRoutes.includes(location.pathname) && 
                    !hiddenPatterns.some(pattern => pattern.test(location.pathname));

  if (!shouldShow) return null;
  return <BackButton fallback={fallback} floating />;
};

export default BackButton;
