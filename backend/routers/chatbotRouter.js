import express from 'express';
import ChatbotService from '../services/chatbotService.js';

const router = express.Router();
const chatbotService = new ChatbotService();

// Chat endpoint - main conversational interface
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Generate intelligent response
    const result = await chatbotService.generateResponse(message, userId);

    res.json({
      success: true,
      data: {
        ...result,
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      fallback: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.'
    });
  }
});

// Quick suggestions endpoint (with intent parameter)
router.get('/suggestions/:intent', async (req, res) => {
  try {
    const { intent } = req.params;
    const suggestions = chatbotService.generateSuggestions(intent || 'GENERAL', [], []);

    res.json({
      success: true,
      data: {
        suggestions,
        intent: intent || 'GENERAL'
      }
    });

  } catch (error) {
    console.error('Suggestions API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions'
    });
  }
});

// Quick suggestions endpoint (without intent parameter - default)
router.get('/suggestions', async (req, res) => {
  try {
    const suggestions = chatbotService.generateSuggestions('GENERAL', [], []);

    res.json({
      success: true,
      data: {
        suggestions,
        intent: 'GENERAL'
      }
    });

  } catch (error) {
    console.error('Suggestions API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions'
    });
  }
});

// Get current seasonal information
router.get('/seasonal-info', async (req, res) => {
  try {
    const seasonalData = chatbotService.weatherService.getSeasonalAdvice();

    res.json({
      success: true,
      data: {
        ...seasonalData,
        sriLankanCrops: chatbotService.sriLankanCrops,
        sriLankanLivestock: chatbotService.sriLankanLivestock,
        districts: chatbotService.districts
      }
    });

  } catch (error) {
    console.error('Seasonal info API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get seasonal information'
    });
  }
});

// Get agricultural context data
router.get('/context/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let contextData = {};

    switch (type) {
      case 'crops':
        contextData = {
          crops: chatbotService.sriLankanCrops,
          seasonal: chatbotService.seasonalInfo
        };
        break;
      case 'livestock':
        contextData = {
          livestock: chatbotService.sriLankanLivestock
        };
        break;
      case 'districts':
        contextData = {
          districts: chatbotService.districts
        };
        break;
      case 'all':
        contextData = {
          crops: chatbotService.sriLankanCrops,
          livestock: chatbotService.sriLankanLivestock,
          districts: chatbotService.districts,
          seasonal: chatbotService.seasonalInfo,
          intents: Object.keys(chatbotService.intents)
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid context type. Use: crops, livestock, districts, or all'
        });
    }

    res.json({
      success: true,
      data: contextData
    });

  } catch (error) {
    console.error('Context API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get context data'
    });
  }
});

// Intent detection endpoint
router.post('/intent', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for intent detection'
      });
    }

    const intentResult = chatbotService.detectIntent(message);

    res.json({
      success: true,
      data: intentResult
    });

  } catch (error) {
    console.error('Intent detection API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect intent'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'FarmNex Chatbot API',
      status: 'healthy',
      version: '1.0.0',
      features: [
        'Sri Lankan agricultural context',
        'Intent-based responses',
        'Real farm data integration',
        'Seasonal farming advice',
        'Multi-language support ready'
      ],
      timestamp: new Date().toISOString()
    }
  });
});

// Get available training materials for chatbot context
router.get('/training-context', async (req, res) => {
  try {
    const { query } = req.query;
    let contextData;

    if (query) {
      contextData = await chatbotService.getRelevantTraining(query);
    } else {
      // Get general training materials
      contextData = await chatbotService.getRelevantTraining('farming agriculture');
    }

    res.json({
      success: true,
      data: {
        trainingMaterials: contextData,
        count: contextData.length
      }
    });

  } catch (error) {
    console.error('Training context API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get training context'
    });
  }
});

// Get weather forecast for district (with district parameter)
router.get('/weather/:district', async (req, res) => {
  try {
    const { district } = req.params;
    const targetDistrict = district || 'Colombo';
    
    const forecast = await chatbotService.weatherService.getWeatherForecast(targetDistrict);
    const districtInfo = chatbotService.weatherService.getDistrictRecommendations(targetDistrict);

    res.json({
      success: true,
      data: {
        forecast,
        districtInfo,
        availableDistricts: chatbotService.districts
      }
    });

  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weather information'
    });
  }
});

// Get weather forecast for default district (without parameter)
router.get('/weather', async (req, res) => {
  try {
    const targetDistrict = 'Colombo'; // Default district
    
    const forecast = await chatbotService.weatherService.getWeatherForecast(targetDistrict);
    const districtInfo = chatbotService.weatherService.getDistrictRecommendations(targetDistrict);

    res.json({
      success: true,
      data: {
        forecast,
        districtInfo,
        availableDistricts: chatbotService.districts
      }
    });

  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weather information'
    });
  }
});

// Get crop-specific weather advice
router.get('/weather-advice/:crop', async (req, res) => {
  try {
    const { crop } = req.params;
    const { season } = req.query;
    
    const advice = chatbotService.weatherService.getCropSpecificWeatherAdvice(crop, season);

    res.json({
      success: true,
      data: advice
    });

  } catch (error) {
    console.error('Weather advice API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get crop weather advice'
    });
  }
});

// Get soil data context for responses
router.get('/soil-context/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const soilData = await chatbotService.getLatestSoilData(userId);

    res.json({
      success: true,
      data: {
        soilReading: soilData,
        hasData: !!soilData,
        moistureStatus: soilData ? soilData.getMoistureStatus() : null
      }
    });

  } catch (error) {
    console.error('Soil context API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get soil context'
    });
  }
});

// Get soil data context for responses (without userId parameter)
router.get('/soil-context', async (req, res) => {
  try {
    const soilData = await chatbotService.getLatestSoilData(null);

    res.json({
      success: true,
      data: {
        soilReading: soilData,
        hasData: !!soilData,
        moistureStatus: soilData ? soilData.getMoistureStatus() : null
      }
    });

  } catch (error) {
    console.error('Soil context API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get soil context'
    });
  }
});

export default router;
