// Chatbot API Service
class ChatbotService {
  constructor() {
    this.apiKey = process.env.REACT_APP_API_KEY;
    this.apiEndpoint = process.env.REACT_APP_CHATBOT_API_ENDPOINT || '/api/chat';
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || '';
    this.apiService = process.env.REACT_APP_API_SERVICE || 'custom';
  }

  /**
   * Send a message to the AI chatbot service
   * @param {string} message - User's message
   * @param {string} context - Context for the conversation (e.g., 'smart_farm_management')
   * @returns {Promise<Object>} Response from the AI service
   */
  async sendMessage(message, context = 'smart_farm_management') {
    try {
      // Handle different API services
      if (this.apiService === 'google') {
        return await this.sendGoogleMessage(message, context);
      } else if (this.apiService === 'openai') {
        return await this.sendOpenAIMessage(message, context);
      } else {
        return await this.sendCustomMessage(message, context);
      }
    } catch (error) {
      console.error('Chatbot API Error:', error);
      
      // Return structured error response
      return {
        success: false,
        error: error.message,
        response: this.getFallbackResponse(message, context),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send message to Google AI (Gemini) API
   */
  async sendGoogleMessage(message, context) {
    const systemPrompt = context === 'smart_farm_management' 
      ? 'You are a helpful AI assistant specializing in smart farm management and agricultural advice. Provide practical, actionable advice for farmers. Keep responses concise and focused on farming topics like crop management, soil health, irrigation, pest control, and sustainable agriculture practices.'
      : 'You are a helpful AI assistant.';

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
   * Get a fallback response when API is unavailable
   * @param {string} message - Original user message
   * @param {string} context - Conversation context
   * @returns {string} Fallback response
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
}

export default new ChatbotService();
