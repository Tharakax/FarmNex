import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import chatbotService from '../../services/chatbot/chatbotService';

const TestChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      const response = await chatbotService.sendMessage(message);
      console.log('Chatbot response:', response);
      setMessage('');
    } catch (error) {
      console.error('Chatbot error:', error);
    }
  };

  return (
    <>
      {/* Simple Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl z-50 border">
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3>FarmNex Test Chat</h3>
            <button onClick={toggleChat}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            <p className="text-gray-600 text-sm">
              Test chatbot - check console for responses
            </p>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Test message..."
                className="flex-1 border rounded px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={sendMessage}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg z-40 flex items-center justify-center"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
};

export default TestChatbot;