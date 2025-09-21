import express from 'express';
import SoilReading from '../models/soilReading.js';

const router = express.Router();

// Middleware for IoT device authentication
const authenticateIoTDevice = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  const expectedKey = process.env.IOT_API_KEY;

  if (!expectedKey) {
    console.error('IOT_API_KEY not configured in environment variables');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
  }

  if (!apiKey || apiKey !== expectedKey) {
    console.log('Unauthorized IoT access attempt:', { 
      providedKey: apiKey ? 'PROVIDED' : 'MISSING',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Invalid API Key' 
    });
  }

  next();
};

// IoT Device Data Ingestion Endpoint
// POST /api/iot/soil
router.post('/iot/soil', authenticateIoTDevice, async (req, res) => {
  try {
    const { 
      deviceId, 
      moisture, 
      raw, 
      fieldId, 
      location,
      temperature,
      batteryLevel 
    } = req.body || {};

    // Validate required fields
    if (!deviceId || typeof moisture !== 'number') {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId (string) and moisture (number) are required' 
      });
    }

    // Validate moisture range
    if (moisture < 0 || moisture > 100) {
      return res.status(400).json({
        success: false,
        message: 'moisture must be between 0 and 100'
      });
    }

    // Create reading
    const readingData = {
      deviceId: deviceId.trim(),
      moisture,
      ...(raw !== undefined && { raw }),
      ...(fieldId && { fieldId: fieldId.trim() }),
      ...(location && { location }),
      ...(temperature !== undefined && { temperature }),
      ...(batteryLevel !== undefined && { batteryLevel })
    };

    const reading = await SoilReading.create(readingData);
    
    console.log('Soil reading saved:', {
      deviceId: reading.deviceId,
      moisture: reading.moisture,
      timestamp: reading.createdAt
    });

    res.status(201).json({ 
      success: true, 
      data: { 
        id: reading._id,
        deviceId: reading.deviceId,
        moisture: reading.moisture,
        timestamp: reading.createdAt
      } 
    });

  } catch (error) {
    console.error('Error saving soil reading:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get Latest Reading for a Device
// GET /api/soil/latest?deviceId=ESP32-001
router.get('/soil/latest', async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId parameter is required' 
      });
    }

    const latest = await SoilReading.getLatest(deviceId.trim());

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for this device'
      });
    }

    // Add status information
    const status = latest.getMoistureStatus();

    res.json({ 
      success: true, 
      data: {
        ...latest.toObject(),
        status
      }
    });

  } catch (error) {
    console.error('Error fetching latest soil reading:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get Reading History for a Device
// GET /api/soil/history?deviceId=ESP32-001&limit=50&hours=24
router.get('/soil/history', async (req, res) => {
  try {
    const { deviceId, limit = 100, hours } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId parameter is required' 
      });
    }

    let query = { deviceId: deviceId.trim() };

    // Optional time filtering
    if (hours) {
      const hoursAgo = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
      query.createdAt = { $gte: hoursAgo };
    }

    const readings = await SoilReading.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 100, 1000));

    // Add status to each reading
    const readingsWithStatus = readings.map(reading => ({
      ...reading.toObject(),
      status: reading.getMoistureStatus()
    }));

    res.json({ 
      success: true, 
      data: readingsWithStatus,
      meta: {
        count: readings.length,
        deviceId: deviceId.trim(),
        ...(hours && { timeRange: `${hours} hours` })
      }
    });

  } catch (error) {
    console.error('Error fetching soil reading history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get Device Statistics
// GET /api/soil/stats?deviceId=ESP32-001&days=7
router.get('/soil/stats', async (req, res) => {
  try {
    const { deviceId, days = 7 } = req.query;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId parameter is required' 
      });
    }

    const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    const readings = await SoilReading.find({
      deviceId: deviceId.trim(),
      createdAt: { $gte: daysAgo }
    }).select('moisture createdAt');

    if (readings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for the specified period'
      });
    }

    const moistureValues = readings.map(r => r.moisture);
    const avgMoisture = moistureValues.reduce((a, b) => a + b, 0) / moistureValues.length;
    const minMoisture = Math.min(...moistureValues);
    const maxMoisture = Math.max(...moistureValues);

    // Calculate status distribution
    const statusCounts = { dry: 0, optimal: 0, wet: 0 };
    readings.forEach(reading => {
      const status = reading.getMoistureStatus ? reading.getMoistureStatus().status : 
                    reading.moisture < 30 ? 'dry' : reading.moisture > 70 ? 'wet' : 'optimal';
      statusCounts[status]++;
    });

    res.json({
      success: true,
      data: {
        deviceId: deviceId.trim(),
        period: `${days} days`,
        totalReadings: readings.length,
        moisture: {
          current: readings[0]?.moisture,
          average: Math.round(avgMoisture * 10) / 10,
          minimum: minMoisture,
          maximum: maxMoisture
        },
        statusDistribution: statusCounts,
        lastReading: readings[0]?.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching soil statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get All Active Devices
// GET /api/soil/devices
router.get('/soil/devices', async (req, res) => {
  try {
    const { active = true } = req.query;
    
    let matchCondition = {};
    
    // If active=true, only show devices with readings in last 24 hours
    if (active === 'true') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      matchCondition.createdAt = { $gte: oneDayAgo };
    }

    const devices = await SoilReading.aggregate([
      ...(Object.keys(matchCondition).length > 0 ? [{ $match: matchCondition }] : []),
      {
        $group: {
          _id: '$deviceId',
          lastReading: { $max: '$createdAt' },
          totalReadings: { $sum: 1 },
          avgMoisture: { $avg: '$moisture' },
          latestMoisture: { $first: '$moisture' }
        }
      },
      {
        $project: {
          deviceId: '$_id',
          lastReading: 1,
          totalReadings: 1,
          avgMoisture: { $round: ['$avgMoisture', 1] },
          latestMoisture: 1,
          _id: 0
        }
      },
      { $sort: { lastReading: -1 } }
    ]);

    res.json({
      success: true,
      data: devices,
      meta: {
        count: devices.length,
        filter: active === 'true' ? 'Active in last 24 hours' : 'All devices'
      }
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;
