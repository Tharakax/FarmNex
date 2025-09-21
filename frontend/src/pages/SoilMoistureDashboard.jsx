import React, { useState, useEffect } from 'react';
import SoilMoistureWidget from '../components/SoilMoistureWidget.jsx';

const SoilMoistureDashboard = () => {
  const [systemStatus, setSystemStatus] = useState({
    backend: 'checking',
    arduino: 'checking',
    database: 'checking'
  });

  // Check system status on component mount
  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check backend health
      const backendResponse = await fetch('http://localhost:3000/api/soil/devices');
      const backendHealthy = backendResponse.ok;
      
      setSystemStatus(prev => ({
        ...prev,
        backend: backendHealthy ? 'online' : 'offline',
        database: backendHealthy ? 'connected' : 'disconnected'
      }));
      
      // Check for recent Arduino data
      try {
        const arduinoResponse = await fetch('http://localhost:3000/api/soil/latest?deviceId=ARDUINO-UNO-001');
        const arduinoData = await arduinoResponse.json();
        
        if (arduinoData.success && arduinoData.data) {
          const dataAge = new Date() - new Date(arduinoData.data.createdAt);
          setSystemStatus(prev => ({
            ...prev,
            arduino: dataAge < 120000 ? 'online' : 'offline' // 2 minutes threshold
          }));
        } else {
          setSystemStatus(prev => ({ ...prev, arduino: 'offline' }));
        }
      } catch (error) {
        setSystemStatus(prev => ({ ...prev, arduino: 'offline' }));
      }
      
    } catch (error) {
      console.error('System status check failed:', error);
      setSystemStatus({
        backend: 'offline',
        arduino: 'offline',
        database: 'disconnected'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'offline':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'checking':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return '🟢';
      case 'offline':
      case 'disconnected':
        return '🔴';
      case 'checking':
      default:
        return '🟡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌱 Soil Moisture Monitoring System
          </h1>
          <p className="text-lg text-gray-600">
            Real-time Arduino sensor data collection and analysis
          </p>
        </div>

        {/* System Status Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            🔧 System Status
            <button 
              onClick={checkSystemStatus}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              🔄 Refresh
            </button>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${getStatusColor(systemStatus.backend)}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Backend Server</span>
                <span className="text-2xl">{getStatusIcon(systemStatus.backend)}</span>
              </div>
              <p className="text-sm mt-1 capitalize">{systemStatus.backend}</p>
              <p className="text-xs opacity-75">Port 3000</p>
            </div>
            
            <div className={`p-4 rounded-lg ${getStatusColor(systemStatus.arduino)}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Arduino Sensor</span>
                <span className="text-2xl">{getStatusIcon(systemStatus.arduino)}</span>
              </div>
              <p className="text-sm mt-1 capitalize">{systemStatus.arduino}</p>
              <p className="text-xs opacity-75">COM4 - UNO-001</p>
            </div>
            
            <div className={`p-4 rounded-lg ${getStatusColor(systemStatus.database)}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Database</span>
                <span className="text-2xl">{getStatusIcon(systemStatus.database)}</span>
              </div>
              <p className="text-sm mt-1 capitalize">{systemStatus.database}</p>
              <p className="text-xs opacity-75">MongoDB</p>
            </div>
          </div>
        </div>

        {/* Main Soil Moisture Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SoilMoistureWidget 
              deviceId="ARDUINO-UNO-001"
              title="Primary Soil Sensor"
              refreshInterval={3000} // 3 second refresh for demo
              className="shadow-lg"
            />
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Monitoring Features</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  <div>
                    <strong>Real-time Data:</strong> Updates every 3 seconds from Arduino
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  <div>
                    <strong>Automatic Storage:</strong> All readings saved to database
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  <div>
                    <strong>Smart Alerts:</strong> Visual status indicators for soil conditions
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  <div>
                    <strong>Historical Trends:</strong> 24-hour data visualization
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  <div>
                    <strong>Connection Monitoring:</strong> Automatic reconnection on failures
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Moisture Levels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🔴</span>
                    <strong>DRY (0-29%)</strong>
                  </div>
                  <span className="text-sm text-gray-600">Needs watering</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🟢</span>
                    <strong>OPTIMAL (30-70%)</strong>
                  </div>
                  <span className="text-sm text-gray-600">Perfect level</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🔵</span>
                    <strong>WET (71-100%)</strong>
                  </div>
                  <span className="text-sm text-gray-600">Well watered</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚙️ System Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Device:</strong> Arduino UNO</div>
                <div><strong>Sensor:</strong> Capacitive soil moisture sensor</div>
                <div><strong>Communication:</strong> USB Serial (COM4)</div>
                <div><strong>Baud Rate:</strong> 9600</div>
                <div><strong>API Endpoint:</strong> /api/iot/soil</div>
                <div><strong>Update Frequency:</strong> 1 reading per second</div>
                <div><strong>Data Retention:</strong> Unlimited (stored in MongoDB)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button 
                onClick={() => window.open('/api/soil/latest?deviceId=ARDUINO-UNO-001', '_blank')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                📊 Latest Reading
              </button>
              <button 
                onClick={() => window.open('/api/soil/history?deviceId=ARDUINO-UNO-001', '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                📈 View History
              </button>
              <button 
                onClick={() => window.open('/api/soil/stats?deviceId=ARDUINO-UNO-001', '_blank')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                📋 Statistics
              </button>
              <button 
                onClick={() => window.open('/api/soil/devices', '_blank')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                🔗 All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilMoistureDashboard;