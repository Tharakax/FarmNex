// Weather API Test Utility
// Use this to test your OpenWeatherMap API key

const testWeatherAPI = async (apiKey) => {
  if (!apiKey || apiKey === 'your_openweather_api_key_here') {
    console.error('❌ Please set a valid API key in your .env file');
    return false;
  }

  console.log('🌤️ Testing OpenWeatherMap API connection...');
  
  try {
    // Test with Colombo, Sri Lanka coordinates
    const lat = 6.9271;
    const lon = 79.8612;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      
      if (response.status === 401) {
        console.error('🔑 Invalid API key. Please check your VITE_WEATHER_API_KEY in .env file');
      } else if (response.status === 429) {
        console.error('⏰ API rate limit exceeded. Please wait a moment and try again');
      } else {
        console.error('🌐 API error. Please check your internet connection and try again');
      }
      
      return false;
    }

    const data = await response.json();
    
    console.log('✅ API connection successful!');
    console.log('📍 Location:', data.name, ',', data.sys.country);
    console.log('🌡️ Temperature:', Math.round(data.main.temp), '°C');
    console.log('💧 Humidity:', data.main.humidity, '%');
    console.log('🌤️ Weather:', data.weather[0].description);
    console.log('💨 Wind Speed:', data.wind.speed, 'm/s');
    
    return true;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('🌐 Please check your internet connection');
    return false;
  }
};

// Function to test API key from environment
export const testCurrentAPIKey = () => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  return testWeatherAPI(apiKey);
};

// Function to test a specific API key
export const testAPIKey = (apiKey) => {
  return testWeatherAPI(apiKey);
};

// Usage examples:
// testCurrentAPIKey(); // Test the API key from .env
// testAPIKey('your_api_key_here'); // Test a specific API key

export default { testCurrentAPIKey, testAPIKey };