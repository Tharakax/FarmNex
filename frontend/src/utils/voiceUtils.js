// Voice utilities for Sri Lankan agricultural chatbot
export class VoiceUtils {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isSupported = this.checkSupport();
    
    // Sri Lankan English and other language support
    this.supportedLanguages = [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'si-LK', name: 'Sinhala (Sri Lanka)' },
      { code: 'ta-LK', name: 'Tamil (Sri Lanka)' }
    ];
    
    this.currentLanguage = 'en-US';
    this.setupSpeechRecognition();
  }

  checkSupport() {
    return {
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      speechSynthesis: 'speechSynthesis' in window
    };
  }

  setupSpeechRecognition() {
    if (!this.isSupported.speechRecognition) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;
    this.recognition.maxAlternatives = 1;
  }

  // Start listening for voice input
  startListening(onResult, onError, onEnd) {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      let finalTranscript = '';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (onResult) {
          onResult(finalTranscript || interimTranscript, event.results[event.results.length - 1].isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        const error = new Error(`Speech recognition error: ${event.error}`);
        if (onError) onError(error);
        reject(error);
      };

      this.recognition.onend = () => {
        if (onEnd) onEnd();
        resolve(finalTranscript);
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Text-to-speech with Sri Lankan context
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Default options
      utterance.lang = options.lang || this.currentLanguage;
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Try to find a voice that matches the language
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(utterance.lang.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Get available voices
  getAvailableVoices() {
    if (!this.isSupported.speechSynthesis) return [];
    return this.synth.getVoices();
  }

  // Set language for recognition and synthesis
  setLanguage(languageCode) {
    this.currentLanguage = languageCode;
    if (this.recognition) {
      this.recognition.lang = languageCode;
    }
  }

  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Check if a specific feature is supported
  isFeatureSupported(feature) {
    return this.isSupported[feature] || false;
  }

  // Format text for better speech synthesis (Sri Lankan context)
  formatForSpeech(text) {
    // Replace common agricultural abbreviations and terms
    const replacements = {
      'NPK': 'N P K',
      'pH': 'P H',
      'LKR': 'Sri Lankan Rupees',
      'kg': 'kilograms',
      'lb': 'pounds',
      'ha': 'hectares',
      'cm': 'centimeters',
      'mm': 'millimeters',
      'Rs': 'Rupees',
      '°C': 'degrees Celsius',
      '°F': 'degrees Fahrenheit',
      '%': 'percent',
      'Yala': 'Yala season',
      'Maha': 'Maha season',
      'Sri Lanka': 'Shree Lanka'
    };

    let formattedText = text;
    Object.entries(replacements).forEach(([abbrev, full]) => {
      const regex = new RegExp(`\\b${abbrev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, full);
    });

    return formattedText;
  }

  // Agricultural terms pronunciation helper
  getAgriculturalPronunciation(term) {
    const pronunciations = {
      'Kolikuttu': 'Koli-kuttu',
      'Seeni': 'Seeni',
      'Gliricidia': 'Gli-ri-ci-dia',
      'poonac': 'poo-nac',
      'Anuradhapura': 'Anu-radha-pura',
      'Polonnaruwa': 'Polon-na-ruwa',
      'Nuwara Eliya': 'Nuwara Eliya',
      'Hambantota': 'Hamban-tota',
      'Batticaloa': 'Batti-caloa',
      'Trincomalee': 'Trinco-malee'
    };

    return pronunciations[term] || term;
  }
}

// Create singleton instance
const voiceUtils = new VoiceUtils();
export default voiceUtils;