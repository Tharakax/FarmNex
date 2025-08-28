// Quick test script to verify Google AI API configuration
require('dotenv').config();

const testGoogleAI = async () => {
  const apiKey = 'AIzaSyDl9lmtimjtTk9JPUlIwxk5VVquLBMg_UU';
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  const testMessage = 'What is crop rotation and why is it important?';
  const systemPrompt = 'You are a helpful AI assistant specializing in smart farm management and agricultural advice.';
  const fullPrompt = `${systemPrompt}\n\nUser question: ${testMessage}`;

  try {
    console.log('Testing Google AI API...');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
    console.log('Endpoint:', endpoint);
    console.log('Test message:', testMessage);
    console.log('---\n');

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
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

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      return;
    }

    const data = await response.json();
    console.log('API Response received successfully!');
    console.log('Full response data:', JSON.stringify(data, null, 2));
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiResponse) {
      console.log('\n--- AI Assistant Response ---');
      console.log(aiResponse);
    } else {
      console.log('No response text found in API response');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testGoogleAI();
