import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Eye, 
  Gauge, 
  Droplets, 
  Thermometer,
  RefreshCw,
  MapPin,
  Sunrise,
  Sunset,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Umbrella,
  Zap,
  Activity,
  BarChart3,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { weatherAPI } from '../services/weatherAPI';
import WeatherWidget from './WeatherWidget';

const WeatherDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [weatherData, setWeatherData] = useState({
    current: null,
    forecast: [],
    alerts: [],
    insights: [],
    loading: true,
    error: null
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load weather data
  const loadWeatherData = async (showRefreshing = true) => {
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      const [currentResult, forecastResult, alertsResult] = await Promise.all([
        weatherAPI.getCurrentWeather(),
        weatherAPI.getForecast(),
        weatherAPI.getWeatherAlerts()
      ]);

      if (currentResult.success && forecastResult.success) {
        const insights = weatherAPI.getAgriculturalInsights(
          currentResult.data.current, 
          forecastResult.data.forecast
        );

        setWeatherData({
          current: currentResult.data,
          forecast: forecastResult.data.forecast,
          alerts: alertsResult.success ? alertsResult.data.alerts : [],
          insights,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      setWeatherData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    } finally {
      if (showRefreshing) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  // Get weather condition icon
  const getWeatherIcon = (condition, size = 24) => {
    const iconMap = {
      'Clear': Sun,
      'Clouds': Cloud,
      'Rain': CloudRain,
      'Drizzle': CloudRain,
      'Thunderstorm': Zap,
      'Snow': Cloud,
      'Mist': Cloud,
      'Fog': Cloud,
      'Haze': Cloud
    };
    
    const IconComponent = iconMap[condition] || Sun;
    return <IconComponent size={size} />;
  };

  // Weather Overview Component
  const WeatherOverview = () => {
    if (weatherData.loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        </div>
      );
    }

    if (weatherData.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Weather Data</h3>
          <p className="text-red-600 mb-4">{weatherData.error}</p>
          <button
            onClick={() => loadWeatherData()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    const { current, forecast, alerts, insights } = weatherData;

    return (
      <div className="space-y-6">
        {/* Weather Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Temperature</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {current?.current.temperature || '--'}°C
                </p>
                <p className="text-sm text-gray-500">
                  Feels like {current?.current.feelsLike || '--'}°C
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Thermometer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Humidity</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {current?.current.humidity || '--'}%
                </p>
                <p className="text-sm text-gray-500">Air moisture level</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wind Speed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {current?.current.windSpeed || '--'} m/s
                </p>
                <p className="text-sm text-gray-500">
                  {weatherAPI.getWindDirection(current?.current.windDirection)} direction
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Wind className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visibility</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {current?.current.visibility || '--'} km
                </p>
                <p className="text-sm text-gray-500">Clear view distance</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Weather Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WeatherWidget 
              title="Current Weather" 
              showForecast={false} 
              className="h-full"
            />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Alerts */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    Weather Alerts ({alerts.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high'
                          ? 'bg-red-50 border-red-500'
                          : alert.severity === 'moderate'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.severity === 'high'
                              ? 'bg-red-100 text-red-800'
                              : alert.severity === 'moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{alert.description}</p>
                      {alert.recommendations && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600 mb-2">Recommendations:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agricultural Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 text-green-500 mr-2" />
                  Agricultural Recommendations
                </h3>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        insight.type === 'warning'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="text-2xl mr-3 flex-shrink-0">{insight.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-gray-700 text-sm">{insight.message}</p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                              insight.category === 'irrigation'
                                ? 'bg-blue-100 text-blue-800'
                                : insight.category === 'protection'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {insight.category.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Detailed Forecast Component
  const DetailedForecast = () => {
    const { forecast } = weatherData;

    if (weatherData.loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">5-Day Weather Forecast</h3>
          
          <div className="space-y-4">
            {forecast.map((day, index) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center min-w-[80px]">
                    <div className="font-medium text-gray-900">
                      {index === 0 ? 'Today' : day.dayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getWeatherIcon(day.condition, 32)}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {day.description}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Temperature</div>
                    <div className="font-semibold text-gray-900">
                      {day.tempMax}° / {day.tempMin}°
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Humidity</div>
                    <div className="font-semibold text-gray-900">{day.humidity}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Wind</div>
                    <div className="font-semibold text-gray-900">{day.windSpeed} m/s</div>
                  </div>
                  
                  {day.precipitationChance > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Rain</div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        <Umbrella className="h-4 w-4 mr-1" />
                        {day.precipitationChance}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Weather History/Analytics Component
  const WeatherAnalytics = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Weather Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {weatherData.current?.current.temperature || '--'}°C
              </div>
              <div className="text-blue-700 font-medium">Current Temperature</div>
              <div className="text-blue-600 text-sm mt-1">
                Average for this time of year: 28°C
              </div>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {weatherData.current?.current.humidity || '--'}%
              </div>
              <div className="text-green-700 font-medium">Humidity Level</div>
              <div className="text-green-600 text-sm mt-1">
                Ideal range: 60-70%
              </div>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {weatherData.current?.current.windSpeed || '--'} m/s
              </div>
              <div className="text-purple-700 font-medium">Wind Speed</div>
              <div className="text-purple-600 text-sm mt-1">
                Gentle breeze conditions
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Weekly Outlook</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2 text-center">
                {weatherData.forecast.map((day, index) => (
                  <div key={day.date} className="p-2">
                    <div className="text-xs text-gray-600 mb-1">
                      {day.dayName.slice(0, 3)}
                    </div>
                    <div className="mb-2">
                      {getWeatherIcon(day.condition, 20)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {day.tempMax}°
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.tempMin}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'forecast', name: 'Detailed Forecast', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  // Render active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'forecast':
        return <DetailedForecast />;
      case 'analytics':
        return <WeatherAnalytics />;
      case 'overview':
      default:
        return <WeatherOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Information</h1>
          <p className="text-gray-600 mt-1">
            Monitor weather conditions and get agricultural insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadWeatherData()}
            disabled={isRefreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeView === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderActiveView()}
    </div>
  );
};

export default WeatherDashboard;