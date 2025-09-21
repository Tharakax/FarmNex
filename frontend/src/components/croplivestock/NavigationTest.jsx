import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const NavigationTest = () => {
  const navigate = useNavigate();

  const testNavigation = (route) => {
    console.log('Testing navigation to:', route);
    toast.success(`Testing navigation to ${route}`);
    
    try {
      navigate(route);
      console.log('Navigation completed successfully');
    } catch (error) {
      console.error('Navigation failed:', error);
      toast.error('Navigation failed');
    }
  };

  const testWindowLocation = (route) => {
    console.log('Testing window.location to:', route);
    toast.success(`Testing window.location to ${route}`);
    window.location.href = route;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Navigation Test Component</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">React Router Navigate</h3>
          <div className="space-y-2">
            <button 
              onClick={() => testNavigation('/crops')}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Navigate to /crops
            </button>
            <button 
              onClick={() => testNavigation('/crops/add')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Navigate to /crops/add
            </button>
            <button 
              onClick={() => testNavigation('/livestock')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Navigate to /livestock
            </button>
            <button 
              onClick={() => testNavigation('/livestock/add')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Navigate to /livestock/add
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Window Location</h3>
          <div className="space-y-2">
            <button 
              onClick={() => testWindowLocation('/crops')}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Window.location to /crops
            </button>
            <button 
              onClick={() => testWindowLocation('/crops/add')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Window.location to /crops/add
            </button>
            <button 
              onClick={() => testWindowLocation('/livestock')}
              className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Window.location to /livestock
            </button>
            <button 
              onClick={() => testWindowLocation('/livestock/add')}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Window.location to /livestock/add
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Check the browser console and toast notifications to see if clicks are being registered.
          Open browser dev tools (F12) and watch the Console tab.
        </p>
      </div>
    </div>
  );
};

export default NavigationTest;