import React, { useState, useEffect } from 'react';
import './SoilMoistureWidget.css';

const SoilMoistureWidget = ({ 
  deviceId = 'ARDUINO-UNO-001', 
  title = 'Soil Moisture Monitor',
  refreshInterval = 5000, // 5 seconds for faster updates
  className = '' 
}) => {
  const [data, setData] = useState({
    current: null,
    history: [],
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(0);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [lastDataTime, setLastDataTime] = useState(null);

  // Get API base URL from environment or default
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  // Fetch latest reading with refresh indicator
  const fetchLatestReading = async (showRefreshing = true) => {
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/soil/latest?deviceId=${deviceId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const dataAge = new Date() - new Date(result.data.createdAt);
        const isRecentData = dataAge < 120000; // Less than 2 minutes old
        
        setData(prev => ({
          ...prev,
          current: result.data,
          error: null,
          lastUpdated: new Date(),
          loading: false
        }));
        
        setIsConnected(isRecentData);
        setConnectionRetries(0);
        setLastDataTime(new Date(result.data.createdAt));
        
        // Show connection status based on data freshness
        if (!isRecentData) {
          console.warn(`Soil sensor data is ${Math.round(dataAge/1000)} seconds old - sensor may be disconnected`);
        }
      } else {
        throw new Error(result.message || 'No data available');
      }
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
      setConnectionRetries(prev => prev + 1);
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
      setIsConnected(false);
    } finally {
      if (showRefreshing) {
        setTimeout(() => setIsRefreshing(false), 500); // Show refresh indicator for 500ms
      }
    }
  };

  // Fetch reading history for mini chart
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/soil/history?deviceId=${deviceId}&limit=20&hours=24`);
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({
          ...prev,
          history: result.data || []
        }));
      }
    } catch (error) {
      console.error('Error fetching soil moisture history:', error);
    }
  };

  // Fetch device statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/soil/stats?deviceId=${deviceId}&days=1`);
      const result = await response.json();
      
      if (result.success) {
        setData(prev => ({
          ...prev,
          stats: result.data
        }));
      }
    } catch (error) {
      console.error('Error fetching soil moisture stats:', error);
    }
  };

  // Page visibility detection for auto-resume when website is reopened
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible - refreshing soil sensor data...');
        fetchLatestReading();
        fetchHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initial data fetch and setup intervals
  useEffect(() => {
    fetchLatestReading();
    fetchHistory();
    fetchStats();

    // Set up refresh interval
    const interval = setInterval(() => {
      fetchLatestReading();
      fetchHistory();
    }, refreshInterval);

    // Refresh stats less frequently
    const statsInterval = setInterval(fetchStats, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, [deviceId, refreshInterval]);

  // Get status styling with better contrast
  const getStatusStyle = (moisture) => {
    if (!moisture && moisture !== 0) return { 
      color: '#666', 
      bg: '#f8f9fa', 
      textColor: '#2c3e50',
      headingColor: '#2c3e50'
    };
    
    if (moisture < 30) {
      return { 
        color: '#dc2626', 
        bg: '#fef2f2', 
        icon: '🔴',
        status: 'DRY',
        message: 'Needs watering soon',
        textColor: '#991b1b',
        headingColor: '#1f2937'
      };
    } else if (moisture > 70) {
      return { 
        color: '#1d4ed8', 
        bg: '#eff6ff', 
        icon: '🔵',
        status: 'WET',
        message: 'Well watered',
        textColor: '#1e40af',
        headingColor: '#1f2937'
      };
    }
    return { 
      color: '#16a34a', 
      bg: '#f0fdf4', 
      icon: '🟢',
      status: 'OPTIMAL',
      message: 'Perfect moisture level',
      textColor: '#166534',
      headingColor: '#1f2937'
    };
  };

  // Generate mini sparkline
  const generateSparkline = (history) => {
    if (!history || history.length < 2) return null;
    
    const points = history.slice(0, 10).reverse(); // Last 10 points, chronological order
    const max = Math.max(...points.map(p => p.moisture));
    const min = Math.min(...points.map(p => p.moisture));
    const range = max - min || 1;
    
    const width = 120;
    const height = 30;
    
    const coords = points.map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.moisture - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="sparkline">
        <polyline
          points={coords}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.7"
        />
        {points.map((point, index) => {
          const x = (index / (points.length - 1)) * width;
          const y = height - ((point.moisture - min) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="currentColor"
              opacity={index === points.length - 1 ? 1 : 0.5}
            />
          );
        })}
      </svg>
    );
  };

  const { current, history, stats, loading, error, lastUpdated } = data;
  const statusInfo = getStatusStyle(current?.moisture);

  if (loading && !current) {
    return (
      <div className={`soil-moisture-widget loading ${className}`}>
        <div className="widget-header">
          <h3>{title}</h3>
          <div className="connection-status disconnected">
            <span className="status-dot"></span>
            Loading...
          </div>
        </div>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Connecting to soil sensor...</p>
        </div>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className={`soil-moisture-widget error ${className}`}>
        <div className="widget-header">
          <h3>{title}</h3>
          <div className="connection-status error">
            <span className="status-dot"></span>
            Error
          </div>
        </div>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <p>Unable to connect to soil sensor</p>
          <small>{error}</small>
          <button onClick={fetchLatestReading} className="retry-button">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`soil-moisture-widget ${className}`} style={{ backgroundColor: statusInfo.bg }}>
      <div className="widget-header">
        <div className="title-section">
          <h3 style={{ color: statusInfo.headingColor || '#2c3e50' }}>{title}</h3>
          <span className="device-id" style={{ color: statusInfo.textColor || '#7f8c8d' }}>{deviceId}</span>
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot" style={{ animation: isRefreshing ? 'pulse 1s infinite' : 'none' }}></span>
          {isRefreshing ? 'Updating...' : (isConnected ? 'Live' : `Offline ${connectionRetries > 0 ? `(${connectionRetries} attempts)` : ''}`)}
        </div>
      </div>

      <div className="moisture-display">
        <div className="main-reading">
          <div className="moisture-value" style={{ color: statusInfo.color }}>
            {statusInfo.icon} {current?.moisture?.toFixed(1) || '--'}%
          </div>
          <div className="moisture-status">
            <span className="status-text" style={{ color: statusInfo.color }}>
              {statusInfo.status}
            </span>
            <span className="status-message" style={{ color: statusInfo.textColor || '#666' }}>
              {statusInfo.message}
            </span>
          </div>
        </div>

        {history.length > 1 && (
          <div className="moisture-trend" style={{ color: statusInfo.color }}>
            {generateSparkline(history)}
            <span className="trend-label" style={{ color: statusInfo.textColor || statusInfo.color }}>24H TREND</span>
          </div>
        )}
      </div>

      <div className="widget-details">
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label" style={{ color: statusInfo.textColor || '#666' }}>Last Reading:</span>
            <span className="detail-value" style={{ color: statusInfo.headingColor || '#2c3e50' }}>
              {current?.createdAt 
                ? (() => {
                    const age = Math.round((new Date() - new Date(current.createdAt)) / 1000);
                    if (age < 60) return `${age}s ago`;
                    if (age < 3600) return `${Math.round(age/60)}m ago`;
                    return new Date(current.createdAt).toLocaleTimeString();
                  })()
                : '--'
              }
            </span>
          </div>
          {current?.raw && (
            <div className="detail-item">
              <span className="detail-label" style={{ color: statusInfo.textColor || '#666' }}>Raw Value:</span>
              <span className="detail-value" style={{ color: statusInfo.headingColor || '#2c3e50' }}>{current.raw}</span>
            </div>
          )}
        </div>

        {stats && (
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label" style={{ color: statusInfo.textColor || '#666' }}>24h Average:</span>
              <span className="detail-value" style={{ color: statusInfo.headingColor || '#2c3e50' }}>{stats.moisture?.average}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label" style={{ color: statusInfo.textColor || '#666' }}>Readings:</span>
              <span className="detail-value" style={{ color: statusInfo.headingColor || '#2c3e50' }}>{stats.totalReadings}</span>
            </div>
          </div>
        )}

        {current?.temperature && (
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label" style={{ color: statusInfo.textColor || '#666' }}>Temperature:</span>
              <span className="detail-value" style={{ color: statusInfo.headingColor || '#2c3e50' }}>{current.temperature}°C</span>
            </div>
          </div>
        )}
      </div>

      <div className="widget-footer">
        <button 
          onClick={() => {
            fetchLatestReading();
            fetchHistory();
            fetchStats();
          }}
          className="refresh-button"
          disabled={loading}
        >
          🔄 Refresh
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

export default SoilMoistureWidget;
