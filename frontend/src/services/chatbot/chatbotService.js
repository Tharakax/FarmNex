// Enhanced FarmNex Chatbot API Service with Sri Lankan Agricultural Intelligence
class ChatbotService {
  constructor() {
    this.apiKey = import.meta.env.VITE_API_KEY || import.meta.env.REACT_APP_API_KEY;
    this.apiEndpoint = import.meta.env.VITE_CHATBOT_API_ENDPOINT || '/api/chatbot/chat';
    this.baseUrl = import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    this.apiService = import.meta.env.VITE_API_SERVICE || 'farmnex';
    this.userId = null;
    this.conversationContext = [];
  }

  /**
   * Send a message to the FarmNex intelligent chatbot service
   * @param {string} message - User's message
   * @param {string} userId - Optional user ID for personalized responses
   * @returns {Promise<Object>} Intelligent response from FarmNex service
   */
  async sendMessage(message, userId = null) {
    try {
      // Add message to conversation context
      this.conversationContext.push({
        type: 'user',
        message: message.trim(),
        timestamp: new Date().toISOString()
      });

      // Primary: Use FarmNex intelligent backend
      if (this.apiService === 'farmnex') {
        return await this.sendFarmNexMessage(message, userId);
      }
      
      // Fallback: Use external AI services if backend is unavailable
      if (this.apiService === 'google') {
        return await this.sendGoogleMessage(message, 'sri_lankan_agriculture');
      } else if (this.apiService === 'openai') {
        return await this.sendOpenAIMessage(message, 'sri_lankan_agriculture');
      } else {
        return await this.sendCustomMessage(message, 'sri_lankan_agriculture');
      }
    } catch (error) {
      console.error('FarmNex Chatbot API Error:', error);
      
      // Return structured error response with Sri Lankan context
      return {
        success: false,
        error: error.message,
        response: this.getSriLankanFallbackResponse(message),
        intent: 'ERROR',
        suggestions: this.getDefaultSuggestions(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send message to FarmNex intelligent backend service
   */
  async sendFarmNexMessage(message, userId) {
    const response = await fetch(`${this.baseUrl}${this.apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        userId: userId || this.userId,
        context: {
          conversationHistory: this.conversationContext.slice(-5), // Last 5 messages
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`FarmNex API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'FarmNex API returned error');
    }

    // Add response to conversation context
    this.conversationContext.push({
      type: 'bot',
      message: data.data.response,
      intent: data.data.intent,
      timestamp: data.data.timestamp
    });
    
    return {
      success: true,
      response: data.data.response,
      intent: data.data.intent,
      suggestions: data.data.suggestions || [],
      contextData: data.data.contextData || {},
      messageId: data.data.messageId,
      timestamp: data.data.timestamp
    };
  }

  /**
   * Send message to Google AI (Gemini) API with Sri Lankan context
   */
  async sendGoogleMessage(message, context) {
    const systemPrompt = context === 'sri_lankan_agriculture' 
      ? `You are a specialized AI assistant for Sri Lankan agriculture and FarmNex platform. Provide practical advice for farmers in Sri Lanka, considering local crops (rice, tea, coconut, rubber, spices), livestock (cattle, buffalo, goats, poultry), seasonal patterns (Yala, Maha seasons), climate zones (wet, dry, intermediate), and traditional farming practices. Focus on sustainable agriculture, organic methods, and solutions suitable for Sri Lankan conditions. Keep responses helpful and culturally appropriate.`
      : 'You are a helpful AI assistant specializing in smart farm management and agricultural advice.';

    const fullPrompt = `${systemPrompt}\n\nUser question: ${message}`;

    const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response. Please try again.',
      conversationId: null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send message to OpenAI API
   */
  async sendOpenAIMessage(message, context) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system', 
            content: 'You are a helpful assistant specializing in smart farm management and agricultural advice.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      response: data.choices?.[0]?.message?.content || 'No response received',
      conversationId: data.id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send message to custom API endpoint
   */
  async sendCustomMessage(message, context) {
    const response = await fetch(`${this.baseUrl}${this.apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        message,
        context,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      response: data.response || data.message || 'No response received',
      conversationId: data.conversationId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get Sri Lankan agricultural fallback response when API is unavailable
   * @param {string} message - Original user message
   * @returns {string} Context-aware fallback response
   */
  getSriLankanFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Sri Lankan crop keywords
    const sriLankanCrops = ['rice', 'tea', 'coconut', 'rubber', 'cinnamon', 'cardamom', 'pepper', 'banana', 'mango', 'papaya'];
    const mentionedCrops = sriLankanCrops.filter(crop => lowerMessage.includes(crop));
    
    if (mentionedCrops.length > 0) {
      const crop = mentionedCrops[0];
      const cropAdvice = {
        rice: 'Rice is the staple crop of Sri Lanka. For optimal yields, maintain proper water levels (2-3 cm), use certified seeds, and apply fertilizer in 3 splits during the growing season.',
        tea: 'Sri Lankan tea thrives at elevations of 1200-1800m. Regular pruning, proper drainage, and harvesting every 7-14 days are essential for quality.',
        coconut: 'Coconut palms prefer well-drained soil and benefit from organic manure. Control rhinoceros beetles and ensure proper spacing for healthy growth.',
        rubber: 'Rubber cultivation suits Sri Lanka\'s wet zone. Trees are ready for tapping after 6-7 years. Use proper tapping techniques to maximize latex yield.',
        cinnamon: 'Ceylon cinnamon requires well-drained soil and partial shade. Harvest bark from 2-3 year old shoots for the finest quality.',
        banana: 'Choose varieties like Kolikuttu or Seeni suited to Sri Lankan conditions. Provide support stakes and ensure good drainage.',
      };
      
      return cropAdvice[crop] || `${crop.charAt(0).toUpperCase() + crop.slice(1)} cultivation in Sri Lanka requires attention to local climate conditions, soil type, and seasonal patterns. Consider consulting local agricultural extension services for specific guidance.`;
    }
    
    // Livestock keywords
    const livestockKeywords = ['cattle', 'buffalo', 'goat', 'chicken', 'cow', 'animal'];
    if (livestockKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'Livestock management in Sri Lanka requires attention to housing, nutrition, and healthcare. Ensure adequate ventilation, clean water access, and regular veterinary care. Local feed sources include rice bran, coconut poonac, and green fodder.';
    }
    
    // Seasonal keywords
    const seasonalKeywords = ['season', 'yala', 'maha', 'planting', 'harvest'];
    if (seasonalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const currentMonth = new Date().getMonth() + 1;
      const season = (currentMonth >= 5 && currentMonth <= 8) ? 'Yala' : 
                     (currentMonth >= 10 || currentMonth <= 2) ? 'Maha' : 'Intermediate';
      return `Current season in Sri Lanka is ${season}. Plan your farming activities according to rainfall patterns and choose appropriate crops for the season.`;
    }
    
    return this.getFallbackResponse(message, 'sri_lankan_agriculture');
  }
  
  /**
   * Original fallback response method
   */
  getFallbackResponse(message, context) {
    const farmingKeywords = ['crop', 'plant', 'soil', 'water', 'irrigation', 'pest', 'harvest', 'organic', 'fertilizer', 'seed'];
    const weatherKeywords = ['weather', 'rain', 'sun', 'temperature', 'climate'];
    const managementKeywords = ['manage', 'plan', 'schedule', 'optimize', 'monitor'];

    const lowerMessage = message.toLowerCase();
    
    // Check for farming-related keywords
    if (farmingKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const farmingResponses = [
        'For optimal crop growth, ensure proper soil drainage and maintain consistent watering schedules.',
        'Consider implementing crop rotation to improve soil health and reduce pest problems naturally.',
        'Monitor your plants regularly for signs of pests or diseases, and use integrated pest management techniques.',
        'Organic farming practices include composting, natural fertilizers, and beneficial companion planting.',
        'Soil testing is crucial for understanding nutrient levels and pH balance for healthy crop development.'
      ];
      return farmingResponses[Math.floor(Math.random() * farmingResponses.length)];
    }

    // Check for weather-related keywords
    if (weatherKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'Weather monitoring is essential for farm management. Consider using local weather stations and forecasts to plan irrigation and harvesting activities.';
    }

    // Check for management keywords
    if (managementKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const managementResponses = [
        'Smart farm management involves using data-driven decisions for planting, irrigation, and harvesting.',
        'Technology like IoT sensors can help monitor soil moisture, temperature, and crop health in real-time.',
        'Planning your farm activities based on seasonal patterns and weather forecasts improves efficiency.',
        'Regular monitoring and record-keeping help identify trends and optimize farming operations.'
      ];
      return managementResponses[Math.floor(Math.random() * managementResponses.length)];
    }

    // Generic farming advice
    const genericResponses = [
      'I\'m here to help with your farming questions! Ask me about crop management, soil care, or agricultural best practices.',
      'Smart farming combines traditional knowledge with modern technology to optimize crop production and sustainability.',
      'Would you like to know more about organic farming, precision agriculture, or sustainable farming practices?',
      'I can provide guidance on crop planning, pest management, irrigation systems, and harvest optimization.',
      'Feel free to ask about specific crops, farming techniques, or agricultural challenges you\'re facing.'
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  /**
   * Alternative API configurations for different services
   */
  static getServiceConfig(serviceName) {
    const configs = {
      google: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        headers: (apiKey) => ({
          'Content-Type': 'application/json'
        }),
        payload: (message, context) => ({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant specializing in smart farm management and agricultural advice. Provide practical, actionable advice for farmers. Keep responses concise and focused on farming topics.\n\nUser question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          }
        })
      },
      
      openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }),
        payload: (message) => ({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system', 
              content: 'You are a helpful assistant specializing in smart farm management and agricultural advice.'
            },
            { role: 'user', content: message }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      },
      
      anthropic: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: (apiKey) => ({
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }),
        payload: (message) => ({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          messages: [{ role: 'user', content: message }]
        })
      },
      
      // Add other services as needed
      custom: {
        endpoint: '/api/chat',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }),
        payload: (message, context) => ({
          message,
          context,
          max_tokens: 150
        })
      }
    };

    return configs[serviceName] || configs.custom;
  }

  /**
   * Get default suggestions for Sri Lankan farmers
   */
  getDefaultSuggestions() {
    return [
      'What crops should I plant this season?',
      'How to care for cattle in Sri Lankan climate?',
      'Rice cultivation best practices',
      'Organic pest control methods',
      'Current market prices for vegetables',
      'Soil health improvement tips',
      'Tea plantation management',
      'Coconut farming techniques'
    ];
  }

  /**
   * Get suggestions from backend
   */
  async getSuggestions(intent = 'GENERAL') {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/suggestions/${intent}`);
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data.suggestions : this.getDefaultSuggestions();
      }
    } catch (error) {
      console.warn('Failed to fetch suggestions from backend:', error);
    }
    return this.getDefaultSuggestions();
  }

  /**
   * Get seasonal information from backend
   */
  async getSeasonalInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/seasonal-info`);
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : null;
      }
    } catch (error) {
      console.warn('Failed to fetch seasonal info:', error);
    }
    return null;
  }

  /**
   * Detect intent locally (backup for offline use)
   */
  async detectIntent(message) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : { intent: 'GENERAL', confidence: 0 };
      }
    } catch (error) {
      console.warn('Failed to detect intent from backend:', error);
    }
    
    // Local fallback intent detection
    return this.localIntentDetection(message);
  }

  /**
   * Local intent detection as fallback
   */
  localIntentDetection(message) {
    const lowerMessage = message.toLowerCase();
    
    if (['crop', 'plant', 'grow', 'harvest', 'rice', 'tea', 'coconut'].some(word => lowerMessage.includes(word))) {
      return { intent: 'CROP_MANAGEMENT', confidence: 1 };
    }
    if (['cattle', 'chicken', 'goat', 'animal', 'livestock'].some(word => lowerMessage.includes(word))) {
      return { intent: 'LIVESTOCK_CARE', confidence: 1 };
    }
    if (['pest', 'disease', 'insect', 'bug'].some(word => lowerMessage.includes(word))) {
      return { intent: 'PEST_CONTROL', confidence: 1 };
    }
    if (['soil', 'pH', 'fertility', 'compost'].some(word => lowerMessage.includes(word))) {
      return { intent: 'SOIL_HEALTH', confidence: 1 };
    }
    if (['weather', 'season', 'rain', 'climate'].some(word => lowerMessage.includes(word))) {
      return { intent: 'WEATHER_ADVICE', confidence: 1 };
    }
    if (['price', 'market', 'sell', 'cost'].some(word => lowerMessage.includes(word))) {
      return { intent: 'MARKET_PRICES', confidence: 1 };
    }
    if (['fertilizer', 'nutrition', 'NPK'].some(word => lowerMessage.includes(word))) {
      return { intent: 'FERTILIZER', confidence: 1 };
    }
    if (['training', 'learn', 'course', 'education'].some(word => lowerMessage.includes(word))) {
      return { intent: 'TRAINING', confidence: 1 };
    }
    
    return { intent: 'GENERAL', confidence: 0 };
  }

  /**
   * Set user ID for personalized responses
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Clear conversation context
   */
  clearContext() {
    this.conversationContext = [];
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.conversationContext;
  }
}

export default new ChatbotService();
