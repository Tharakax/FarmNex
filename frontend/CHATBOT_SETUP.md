# Smart Farm Management System - Chatbot Integration

## Overview

The chatbot widget has been successfully integrated into your Smart Farm Management System homepage. It appears as a floating button in the bottom-right corner and provides AI-powered assistance for farming-related questions.

## Features

✅ **Responsive Design**: Works seamlessly on desktop and mobile devices
✅ **Modern UI**: Matches your existing green color scheme and design language
✅ **Real-time Chat**: Interactive conversation interface with message history
✅ **Smart Fallbacks**: Intelligent responses even when API is unavailable
✅ **Agriculture Focus**: Specialized responses for farming and agricultural topics
✅ **Easy Integration**: Modular component design for easy customization

## Setup Instructions

### 1. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Add your API key to the `.env` file:
   ```bash
   REACT_APP_API_KEY=your-actual-api-key-here
   REACT_APP_CHATBOT_API_ENDPOINT=/api/chat
   ```

### 2. API Key Configuration

The chatbot supports various AI services. Update your `.env` file based on your chosen service:

**For OpenAI ChatGPT:**
```bash
REACT_APP_API_KEY=sk-your-openai-api-key
REACT_APP_CHATBOT_API_ENDPOINT=https://api.openai.com/v1/chat/completions
```

**For Azure OpenAI:**
```bash
REACT_APP_API_KEY=your-azure-key
REACT_APP_CHATBOT_API_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
```

**For Custom API:**
```bash
REACT_APP_API_KEY=your-custom-api-key
REACT_APP_CHATBOT_API_ENDPOINT=/api/chat
```

### 3. Backend API Setup (if using custom endpoint)

If you're using a custom `/api/chat` endpoint, ensure your backend can handle:

**Request Format:**
```json
{
  "message": "User's question here",
  "context": "smart_farm_management",
  "max_tokens": 150,
  "temperature": 0.7
}
```

**Response Format:**
```json
{
  "response": "AI assistant's response here",
  "conversationId": "optional-conversation-id",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Customization Options

#### Color Scheme
The chatbot automatically matches your site's green theme. To customize colors, edit the CSS classes in `ChatbotWidget.jsx`:
- `bg-green-600` - Primary green color
- `hover:bg-green-700` - Hover state
- `text-green-600` - Text accents

#### Message Responses
Customize fallback responses in `services/chatbotService.js`:
```javascript
getFallbackResponse(message, context) {
  // Add your custom responses here
}
```

#### UI Elements
Modify the widget appearance:
- Chat window size: Update `w-80 h-96` classes
- Position: Change `bottom-4 right-4` classes
- Animation: Modify transition and animation classes

## Files Created/Modified

### New Files:
- `frontend/src/components/ChatbotWidget.jsx` - Main chatbot component
- `frontend/src/services/chatbotService.js` - API communication service
- `frontend/.env.example` - Environment configuration template

### Modified Files:
- `frontend/src/pages/homePage.jsx` - Added chatbot widget integration

## Usage

1. **Starting the Application:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. **Using the Chatbot:**
   - Click the floating green chat button in the bottom-right corner
   - Type your farming or agricultural questions
   - Get AI-powered responses instantly
   - Chat history is maintained during the session

## Sample Questions to Test

- "How do I improve soil quality?"
- "What's the best irrigation schedule for tomatoes?"
- "How to manage pests organically?"
- "When should I harvest my crops?"
- "What are sustainable farming practices?"

## Troubleshooting

### Common Issues:

1. **Chatbot not appearing:**
   - Check that `<ChatbotWidget />` is included in your page component
   - Verify z-index values aren't being overridden

2. **API errors:**
   - Check your `.env` file for correct API key
   - Verify your API endpoint is accessible
   - Check browser console for error messages

3. **Styling issues:**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS styles

### Fallback Mode:
When the API is unavailable, the chatbot automatically provides relevant farming advice based on keyword detection in user messages.

## Next Steps

1. **API Integration**: Connect to your preferred AI service
2. **Backend Setup**: Implement `/api/chat` endpoint if using custom API
3. **Testing**: Test with various farming-related questions
4. **Customization**: Adjust colors and responses to match your needs

## Support

If you need help with setup or customization, the chatbot service is designed to be flexible and can be adapted to work with most AI APIs including OpenAI, Azure OpenAI, Anthropic Claude, and custom solutions.

The widget is fully responsive and will automatically adjust for mobile devices, providing an optimal user experience across all platforms.
