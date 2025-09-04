import React, { useState, useEffect } from 'react';
import './SoilMoistureWidget.css';

const SoilMoistureWidget = ({ 
  deviceId = 'ESP32-SOIL-001', 
  title = 'Soil Moisture Monitor',
  refreshInterval = 30000, // 30 seconds
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

  // Get API base URL from environment or default
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  // Fetch latest reading
  const fetchLatestReading = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/soil/latest?deviceId=${deviceId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setData(prev => ({
          ...prev,
          current: result.data,
          error: null,
          lastUpdated: new Date(),
          loading: false
        }));
        setIsConnected(true);
      } else {
        throw new Error(result.message || 'No data available');
      }
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
      setIsConnected(false);
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

  // Get status styling
  const getStatusStyle = (moisture) => {
    if (!moisture && moisture !== 0) return { color: '#666', bg: '#f5f5f5' };
    
    if (moisture < 30) {
      return { 
        color: '#dc3545', 
        bg: '#ffe6e6', 
        icon: '🔴',
        status: 'DRY',
        message: 'Needs watering soon'
      };
    } else if (moisture > 70) {
      return { 
        color: '#007bff', 
        bg: '#e6f3ff', 
        icon: '🔵',
        status: 'WET',
        message: 'Well watered'
      };
    }
    return { 
      color: '#28a745', 
      bg: '#e6ffe6', 
      icon: '🟢',
      status: 'OPTIMAL',
      message: 'Perfect moisture level'
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
          <h3>{title}</h3>
          <span className="device-id">{deviceId}</span>
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Live' : 'Offline'}
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
            <span className="status-message">
              {statusInfo.message}
            </span>
          </div>
        </div>

        {history.length > 1 && (
          <div className="moisture-trend" style={{ color: statusInfo.color }}>
            {generateSparkline(history)}
            <span className="trend-label">24h trend</span>
          </div>
        )}
      </div>

      <div className="widget-details">
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Last Reading:</span>
            <span className="detail-value">
              {current?.createdAt 
                ? new Date(current.createdAt).toLocaleTimeString()
                : '--'
              }
            </span>
          </div>
          {current?.raw && (
            <div className="detail-item">
              <span className="detail-label">Raw Value:</span>
              <span className="detail-value">{current.raw}</span>
            </div>
          )}
        </div>

        {stats && (
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">24h Average:</span>
              <span className="detail-value">{stats.moisture?.average}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Readings:</span>
              <span className="detail-value">{stats.totalReadings}</span>
            </div>
          </div>
        )}

        {current?.temperature && (
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-label">Temperature:</span>
              <span className="detail-value">{current.temperature}°C</span>
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
