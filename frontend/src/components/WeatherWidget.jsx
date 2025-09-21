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
  AlertTriangle
} from 'lucide-react';
import { weatherAPI } from '../services/weatherAPI';
import './WeatherWidget.css';

const WeatherWidget = ({ 
  title = 'Weather Monitor',
  refreshInterval = 300000, // 5 minutes
  className = '',
  showForecast = true,
  compact = false
}) => {
  const [data, setData] = useState({
    current: null,
    forecast: [],
    alerts: [],
    insights: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch weather data
  const fetchWeatherData = async (showRefreshing = true) => {
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

        setData(prev => ({
          ...prev,
          current: currentResult.data,
          forecast: forecastResult.data.forecast,
          alerts: alertsResult.success ? alertsResult.data.alerts : [],
          insights,
          error: null,
          lastUpdated: new Date(),
          loading: false
        }));
        setIsConnected(true);
      } else {
        throw new Error('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
      setIsConnected(false);
    } finally {
      if (showRefreshing) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // Initial data fetch and setup intervals
  useEffect(() => {
    fetchWeatherData();

    const interval = setInterval(() => {
      fetchWeatherData(false); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Get weather condition icon
  const getWeatherIcon = (condition, size = 24) => {
    const iconMap = {
      'Clear': Sun,
      'Clouds': Cloud,
      'Rain': CloudRain,
      'Drizzle': CloudRain,
      'Thunderstorm': CloudRain,
      'Snow': Cloud,
      'Mist': Cloud,
      'Fog': Cloud,
      'Haze': Cloud
    };
    
    const IconComponent = iconMap[condition] || Sun;
    return <IconComponent size={size} />;
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const { current, forecast, alerts, insights, loading, error, lastUpdated } = data;

  if (loading && !current) {
    return (
      <div className={`weather-widget loading ${className}`}>
        <div className="widget-header">
          <h3>{title}</h3>
          <div className="connection-status disconnected">
            <span className="status-dot"></span>
            Loading...
          </div>
        </div>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className={`weather-widget error ${className}`}>
        <div className="widget-header">
          <h3>{title}</h3>
          <div className="connection-status error">
            <span className="status-dot"></span>
            Error
          </div>
        </div>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <p>Unable to fetch weather data</p>
          <small>{error}</small>
          <button onClick={() => fetchWeatherData()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`weather-widget compact ${className}`}>
        <div className="widget-header">
          <div className="title-section">
            <h3>{title}</h3>
            <div className="location">
              <MapPin size={12} />
              <span>{current?.location.city}</span>
            </div>
          </div>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot" style={{ animation: isRefreshing ? 'pulse 1s infinite' : 'none' }}></span>
            {isRefreshing ? 'Updating...' : (isConnected ? 'Live' : 'Offline')}
          </div>
        </div>

        <div className="compact-display">
          <div className="main-weather">
            <div className="weather-icon">
              {getWeatherIcon(current?.current.condition, 32)}
            </div>
            <div className="weather-info">
              <div className="temperature">
                {current?.current.temperature || '--'}°C
              </div>
              <div className="condition">
                {current?.current.description}
              </div>
            </div>
          </div>
          
          <div className="weather-details">
            <div className="detail-item">
              <Droplets size={14} />
              <span>{current?.current.humidity || '--'}%</span>
            </div>
            <div className="detail-item">
              <Wind size={14} />
              <span>{current?.current.windSpeed || '--'} m/s</span>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="alerts-compact">
            <AlertTriangle size={14} />
            <span>{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`weather-widget ${className}`}>
      <div className="widget-header">
        <div className="title-section">
          <h3>{title}</h3>
          <div className="location">
            <MapPin size={16} />
            <span>{current?.location.city}, {current?.location.country}</span>
          </div>
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot" style={{ animation: isRefreshing ? 'pulse 1s infinite' : 'none' }}></span>
          {isRefreshing ? 'Updating...' : (isConnected ? 'Live' : 'Offline')}
        </div>
      </div>

      {/* Current Weather */}
      <div className="current-weather">
        <div className="main-display">
          <div className="weather-icon-large">
            {getWeatherIcon(current?.current.condition, 64)}
            <span className="weather-emoji">
              {weatherAPI.getWeatherEmoji(current?.current.condition, current?.current.icon)}
            </span>
          </div>
          <div className="weather-info">
            <div className="temperature-display">
              <span className="current-temp">{current?.current.temperature || '--'}°</span>
              <span className="temp-unit">C</span>
            </div>
            <div className="weather-description">
              {current?.current.description}
            </div>
            <div className="feels-like">
              Feels like {current?.current.feelsLike || '--'}°C
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="weather-details">
        <div className="detail-row">
          <div className="detail-item">
            <Droplets size={16} />
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{current?.current.humidity || '--'}%</span>
          </div>
          <div className="detail-item">
            <Wind size={16} />
            <span className="detail-label">Wind</span>
            <span className="detail-value">
              {current?.current.windSpeed || '--'} m/s {weatherAPI.getWindDirection(current?.current.windDirection)}
            </span>
          </div>
        </div>
        
        <div className="detail-row">
          <div className="detail-item">
            <Gauge size={16} />
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{current?.current.pressure || '--'} hPa</span>
          </div>
          <div className="detail-item">
            <Eye size={16} />
            <span className="detail-label">Visibility</span>
            <span className="detail-value">{current?.current.visibility || '--'} km</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <Sunrise size={16} />
            <span className="detail-label">Sunrise</span>
            <span className="detail-value">
              {current?.current.sunrise ? formatTime(current.current.sunrise) : '--'}
            </span>
          </div>
          <div className="detail-item">
            <Sunset size={16} />
            <span className="detail-label">Sunset</span>
            <span className="detail-value">
              {current?.current.sunset ? formatTime(current.current.sunset) : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="weather-alerts">
          <h4>Weather Alerts</h4>
          {alerts.slice(0, 2).map(alert => (
            <div key={alert.id} className={`alert alert-${alert.severity}`}>
              <div className="alert-header">
                <AlertTriangle size={16} />
                <span className="alert-title">{alert.title}</span>
              </div>
              <p className="alert-description">{alert.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Agricultural Insights */}
      {insights.length > 0 && (
        <div className="agricultural-insights">
          <h4>Farm Recommendations</h4>
          <div className="insights-list">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className={`insight insight-${insight.type}`}>
                <span className="insight-icon">{insight.icon}</span>
                <div className="insight-content">
                  <span className="insight-title">{insight.title}</span>
                  <span className="insight-message">{insight.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {showForecast && forecast.length > 0 && (
        <div className="weather-forecast">
          <h4>5-Day Forecast</h4>
          <div className="forecast-list">
            {forecast.map((day, index) => (
              <div key={day.date} className="forecast-day">
                <div className="forecast-date">
                  {index === 0 ? 'Today' : day.dayName.slice(0, 3)}
                </div>
                <div className="forecast-icon">
                  {getWeatherIcon(day.condition, 24)}
                </div>
                <div className="forecast-temps">
                  <span className="temp-high">{day.tempMax}°</span>
                  <span className="temp-low">{day.tempMin}°</span>
                </div>
                <div className="forecast-rain">
                  {day.precipitationChance > 0 && (
                    <span>{day.precipitationChance}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="widget-footer">
        <button 
          onClick={() => fetchWeatherData()}
          className="refresh-button"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
        <span className="last-updated">
          {lastUpdated 
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : 'Never updated'
          }
        </span>
      </div>
    </div>
  );
};

export default WeatherWidget;