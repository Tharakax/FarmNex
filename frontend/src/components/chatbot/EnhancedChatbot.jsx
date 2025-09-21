import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, Bot, User, Loader, 
  Leaf, Lightbulb, MapPin, Calendar, Mic, MicOff,
  Volume2, VolumeX, RefreshCw, MoreVertical
} from 'lucide-react';
import chatbotService from '../../services/chatbot/chatbotService';

const EnhancedChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'ආයුබෝවන්! Hello! I\'m your intelligent FarmNex assistant specializing in Sri Lankan agriculture. I can help you with crop management, livestock care, seasonal advice, market prices, and more. How can I assist your farming activities today?',
      timestamp: new Date(),
      intent: 'GREETING',
      suggestions: [
        'What crops should I plant this season?',
        'How to care for cattle in Sri Lankan climate?',
        'Current market prices',
        'Rice cultivation tips'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentIntent, setCurrentIntent] = useState('GENERAL');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [seasonalInfo, setSeasonalInfo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synth = useRef(window.speechSynthesis);

  // Initialize seasonal info
  useEffect(() => {
    loadSeasonalInfo();
    loadSuggestions();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSeasonalInfo = async () => {
    try {
      const info = await chatbotService.getSeasonalInfo();
      setSeasonalInfo(info);
    } catch (error) {
      console.warn('Failed to load seasonal info:', error);
    }
  };

  const loadSuggestions = async (intent = 'GENERAL') => {
    try {
      const newSuggestions = await chatbotService.getSuggestions(intent);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.warn('Failed to load suggestions:', error);
      setSuggestions(chatbotService.getDefaultSuggestions());
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowMenu(false);
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (synth.current && !isSpeaking) {
      // Cancel any ongoing speech
      synth.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synth.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synth.current) {
      synth.current.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use the enhanced FarmNex chatbot service
      const response = await chatbotService.sendMessage(textToSend);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.response,
        timestamp: new Date(),
        intent: response.intent,
        suggestions: response.suggestions || [],
        contextData: response.contextData
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update current intent and suggestions
      if (response.intent) {
        setCurrentIntent(response.intent);
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
        } else {
          loadSuggestions(response.intent);
        }
      }

      // Auto-speak response for accessibility
      if (isSpeaking) {
        speakText(response.response);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I apologize, but I\'m experiencing technical difficulties. As a Sri Lankan agricultural assistant, I can still help you with basic farming advice. Try asking about rice cultivation, tea growing, or livestock care.',
        timestamp: new Date(),
        intent: 'ERROR',
        suggestions: [
          'Rice growing tips',
          'Tea cultivation advice',
          'Cattle care in Sri Lanka',
          'Seasonal farming calendar'
        ]
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setSuggestions(fallbackMessage.suggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      text: 'Conversation cleared! How can I help you with your farming activities today?',
      timestamp: new Date(),
      suggestions: chatbotService.getDefaultSuggestions()
    }]);
    chatbotService.clearContext();
    setSuggestions(chatbotService.getDefaultSuggestions());
    setCurrentIntent('GENERAL');
    setShowMenu(false);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSeasonBadge = () => {
    if (!seasonalInfo) return null;
    
    return (
      <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
        <Calendar className="h-3 w-3" />
        <span>{seasonalInfo.currentSeason} Season</span>
      </div>
    );
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl z-50 flex flex-col border border-gray-200 animate-in slide-in-from-bottom-2 duration-300 md:right-4 md:left-auto md:w-96 max-md:right-2 max-md:left-2 max-md:w-auto max-md:h-[80vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">FarmNex AI Assistant</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <p className="text-xs text-green-100">Sri Lankan Agriculture Expert</p>
                  {getSeasonBadge()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Menu"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={clearConversation}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Conversation</span>
              </button>
              <button
                onClick={isSpeaking ? stopSpeaking : () => speakText('Speech test')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isSpeaking ? 'Stop Speaking' : 'Test Speech'}</span>
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50/30 to-white">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-sm p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-sm shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {message.type === 'bot' && (
                        <div className="flex-shrink-0 mt-1">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      {message.type === 'user' && (
                        <div className="flex-shrink-0 mt-1">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.text}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${
                            message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                            {message.intent && message.intent !== 'GENERAL' && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                {message.intent.replace('_', ' ').toLowerCase()}
                              </span>
                            )}
                          </p>
                          {message.type === 'bot' && (
                            <button
                              onClick={() => speakText(message.text)}
                              className="text-green-600 hover:text-green-800 p-1 rounded"
                              title="Read aloud"
                            >
                              <Volume2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="inline-flex items-center text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors border border-green-200"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-2xl rounded-bl-sm shadow-md">
                  <div className="flex items-center space-x-3">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 text-green-600 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking about your question...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Bar */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex-shrink-0 text-xs bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors border border-gray-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about farming, crops, livestock, or seasonal advice..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none max-h-20"
                  disabled={isLoading}
                  rows={1}
                  style={{ minHeight: '44px' }}
                />
              </div>
              
              {/* Voice input button */}
              {recognitionRef.current && (
                <button
                  onClick={toggleVoiceRecognition}
                  className={`p-3 rounded-xl transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                title="Send message"
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                🇱🇰 Powered by FarmNex AI - Sri Lankan Agriculture Expert
              </p>
              {seasonalInfo && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Sri Lanka</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center group ${
          isOpen ? 'rotate-180' : ''
        }`}
        aria-label="Open FarmNex AI Assistant"
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <>
            <div className="relative">
              <MessageCircle className="h-7 w-7" />
              {/* Sri Lankan flag colors accent */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-600 rounded-full"></div>
            </div>
            
            {/* Notification pulse */}
            <div className="absolute inset-0 rounded-full bg-green-600 animate-ping opacity-20"></div>
          </>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            FarmNex AI Assistant
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-gray-900 border-y-4 border-y-transparent"></div>
          </div>
        )}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={toggleChat}></div>
      )}
    </>
  );
};

export default EnhancedChatbot;