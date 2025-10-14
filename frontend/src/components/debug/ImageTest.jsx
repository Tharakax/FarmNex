import React, { useEffect } from 'react';
import { getProductPlaceholder, handleImageError } from '../../utils/imageUtils';

const ImageTest = () => {
  // Test data similar to what we found in the database
  const testImages = [
    {
      name: 'Organic Carrots',
      image: 'http://localhost:3000/uploads/data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCg...',
      description: 'Short corrupted data URL'
    },
    {
      name: 'Red Apple',
      image: 'http://localhost:3000/uploads/data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QB0RXhpZgAATU0AKgAAAAgABQEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAMb+AAIAAAARAAAAWgAAAAAAAABIAAA...',
      description: 'Short corrupted data URL'
    },
    {
      name: 'Test Placeholder',
      image: null,
      description: 'No image - should show placeholder'
    },
    {
      name: 'Via Placeholder Test',
      image: 'https://via.placeholder.com/150x150/gray/white?text=Product',
      description: 'External placeholder - should be replaced'
    }
  ];

  // Test the resolveImage function
  const resolveImage = (src, itemName = 'Product') => {
    console.log(`\n=== Testing ${itemName} ===`);
    console.log('Original src:', src?.substring(0, 100) + (src?.length > 100 ? '...' : ''));
    
    if (!src) {
      console.log('No image source, using placeholder');
      return getProductPlaceholder(itemName);
    }
    
    // Handle malformed data URLs that have URL prefixes
    if (src.includes('data:image')) {
      const dataUrlIndex = src.indexOf('data:image');
      if (dataUrlIndex > 0) {
        // Extract just the data URL part
        const cleanDataUrl = src.substring(dataUrlIndex);
        console.log('Clean data URL length:', cleanDataUrl.length);
        
        // Check if the data URL is corrupted (too short to be valid)
        if (cleanDataUrl.length < 500) {
          console.log('Corrupted short data URL, using placeholder');
          return getProductPlaceholder(itemName);
        }
        
        console.log('Fixed malformed data URL');
        return cleanDataUrl;
      }
      
      // Check if it's a corrupted short data URL without prefix
      if (src.length < 500) {
        console.log('Corrupted short data URL without prefix, using placeholder');
        return getProductPlaceholder(itemName);
      }
      
      console.log('Using proper data URL');
      return src; // It's already a proper data URL
    }
    
    // Handle external via.placeholder URLs - replace with local placeholders
    if (src.includes('via.placeholder.com')) {
      console.log('Replacing via.placeholder with local placeholder');
      return getProductPlaceholder(itemName);
    }
    
    // Handle regular URLs
    if (src.startsWith('http')) {
      console.log('Using HTTP URL');
      return src;
    }
    
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    if (src.startsWith('/')) {
      const resolvedUrl = `${base}${src}`;
      console.log('Resolved relative URL:', resolvedUrl);
      return resolvedUrl;
    }
    
    // assume it's an uploads-relative path
    const uploadsUrl = `${base}/uploads/${src}`;
    console.log('Resolved uploads path:', uploadsUrl);
    return uploadsUrl;
  };

  useEffect(() => {
    console.log('=== IMAGE RESOLUTION TEST ===');
    testImages.forEach(item => {
      const resolved = resolveImage(item.image, item.name);
      console.log(`Final result for ${item.name}:`, resolved.substring(0, 100) + (resolved.length > 100 ? '...' : ''));
    });
  }, []);

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">Image Resolution Test</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testImages.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            <div className="flex items-center space-x-4">
              <img 
                src={resolveImage(item.image, item.name)}
                alt={item.name}
                className="w-16 h-16 object-cover rounded border"
                onError={(e) => {
                  console.log(`Image failed to load for ${item.name}`);
                  handleImageError(e, 64, 64, item.name);
                }}
              />
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  Original: {item.image ? `${item.image.substring(0, 50)}...` : 'null'}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Resolved: {resolveImage(item.image, item.name).substring(0, 50)}...
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest;