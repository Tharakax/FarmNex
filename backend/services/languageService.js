// Multilingual support service for Sri Lankan agricultural chatbot
class LanguageService {
  constructor() {
    this.supportedLanguages = ['en', 'si', 'ta'];
    this.defaultLanguage = 'en';
    
    // Basic agricultural terms translations
    this.translations = {
      // Greetings and common phrases
      hello: {
        en: 'Hello!',
        si: 'ආයුබෝවන්!',
        ta: 'வணக்கம்!'
      },
      welcome: {
        en: 'Welcome to FarmNex',
        si: 'FarmNex වෙතට සාදරයෙන් පිළිගනිමු',
        ta: 'FarmNex க்கு வரவேற்கிறோம்'
      },
      help: {
        en: 'How can I help you?',
        si: 'මම ඔබට කොහොමද උදව් කරන්නේ?',
        ta: 'நான் உங்களுக்கு எப்படி உதவ முடியும்?'
      },
      
      // Agricultural terms
      farming: {
        en: 'farming',
        si: 'ගොවිතැන',
        ta: 'விவசாயம்'
      },
      crop: {
        en: 'crop',
        si: 'බෝගය',
        ta: 'பயிர்'
      },
      livestock: {
        en: 'livestock',
        si: 'පශු සම්පත',
        ta: 'கால்நடை'
      },
      
      // Crops
      rice: {
        en: 'rice',
        si: 'බත්',
        ta: 'அரிசி'
      },
      tea: {
        en: 'tea',
        si: 'තේ',
        ta: 'தேயிலை'
      },
      coconut: {
        en: 'coconut',
        si: 'පොල්',
        ta: 'தென்னை'
      },
      
      // Animals
      cattle: {
        en: 'cattle',
        si: 'ගවයන්',
        ta: 'கால்நடை'
      },
      chicken: {
        en: 'chicken',
        si: 'කුකුළන්',
        ta: 'கோழி'
      },
      goat: {
        en: 'goat',
        si: 'එළුවන්',
        ta: 'ஆடு'
      },
      
      // Seasons
      yala_season: {
        en: 'Yala season',
        si: 'යල කන්නය',
        ta: 'யாலா பருவம்'
      },
      maha_season: {
        en: 'Maha season',
        si: 'මහ කන්නය',
        ta: 'மகா பருவம்'
      },
      
      // Actions
      planting: {
        en: 'planting',
        si: 'වගා කිරීම',
        ta: 'நடவு'
      },
      harvesting: {
        en: 'harvesting',
        si: 'අස්වනු නෙලීම',
        ta: 'அறுவடை'
      },
      irrigation: {
        en: 'irrigation',
        si: 'වාරිමාර්ග',
        ta: 'நீர்ப்பாசனம்'
      },
      
      // Weather and climate
      weather: {
        en: 'weather',
        si: 'කාලගුණය',
        ta: 'வானிலை'
      },
      rain: {
        en: 'rain',
        si: 'වැස්ස',
        ta: 'மழை'
      },
      drought: {
        en: 'drought',
        si: 'නියඟය',
        ta: 'வறட்சி'
      },
      
      // Common responses
      advice_start: {
        en: 'Here is my advice:',
        si: 'මගේ උපදේශය මෙන්න:',
        ta: 'எனது ஆலோசனை இதோ:'
      },
      season_current: {
        en: 'Current season is',
        si: 'වර්තමාන කන්නය',
        ta: 'தற்போதைய பருவம்'
      },
      recommended_crops: {
        en: 'Recommended crops:',
        si: 'නිර්දේශිත බෝග:',
        ta: 'பரிந்துரைக்கப்படும் பயிர்கள்:'
      },
      
      // Error messages
      not_understand: {
        en: 'I didn\'t understand that. Can you please rephrase?',
        si: 'මට ඒක තේරුණේ නැහැ. කරුණාකර වෙනත් වචන වලින් කියන්න?',
        ta: 'எனக்கு அது புரியவில்லை. தயவுசெய்து வேறு வார்த்தைகளில் சொல்ல முடியுமா?'
      },
      technical_error: {
        en: 'I\'m experiencing technical difficulties. Please try again.',
        si: 'මට තාක්ෂණික ගැටලුවක් තියෙනවා. කරුණාකර නැවත උත්සාහ කරන්න.',
        ta: 'எனக்கு தொழில்நுட்ப சிக்கல்கள் உள்ளன. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
      }
    };

    // Language detection patterns
    this.languagePatterns = {
      si: [
        'ආයුබෝවන්', 'කොහොමද', 'ගොවිතැන', 'බෝගය', 'කන්නය', 
        'වගා', 'පශු', 'ගවයන්', 'කුකුළන්', 'තේ', 'පොල්', 'බත්'
      ],
      ta: [
        'வணக்கம்', 'எப்படி', 'விவசாயம்', 'பயிர்', 'பருவம்',
        'நடவு', 'கால்நடை', 'கோழி', 'ஆடு', 'தேயிலை', 'தென்னை', 'அரிசி'
      ]
    };

    // Common agricultural advice templates
    this.responseTemplates = {
      crop_advice: {
        en: 'For {crop} cultivation in Sri Lanka: {advice}',
        si: 'ශ්‍රී ලංකාවේ {crop} වගාව සඳහා: {advice}',
        ta: 'இலங்கையில் {crop} சாகுபடிக்காக: {advice}'
      },
      seasonal_advice: {
        en: 'During {season} season: {advice}',
        si: '{season} කාලයේදී: {advice}',
        ta: '{season} காலத்தில்: {advice}'
      },
      weather_advice: {
        en: 'Weather advice: {advice}',
        si: 'කාලගුණික උපදේශය: {advice}',
        ta: 'வானிலை ஆலோசனை: {advice}'
      }
    };
  }

  // Detect language from message
  detectLanguage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for Sinhala patterns
    if (this.languagePatterns.si.some(pattern => lowerMessage.includes(pattern.toLowerCase()))) {
      return 'si';
    }
    
    // Check for Tamil patterns
    if (this.languagePatterns.ta.some(pattern => lowerMessage.includes(pattern.toLowerCase()))) {
      return 'ta';
    }
    
    // Check for Sinhala Unicode characters
    if (/[\u0D80-\u0DFF]/.test(message)) {
      return 'si';
    }
    
    // Check for Tamil Unicode characters
    if (/[\u0B80-\u0BFF]/.test(message)) {
      return 'ta';
    }
    
    // Default to English
    return 'en';
  }

  // Translate a term or phrase
  translate(key, targetLanguage = 'en') {
    if (!this.translations[key]) {
      return key; // Return original if no translation found
    }
    
    return this.translations[key][targetLanguage] || this.translations[key][this.defaultLanguage] || key;
  }

  // Get localized greeting based on language
  getGreeting(language = 'en') {
    const greetings = {
      en: 'Hello! I\'m your FarmNex assistant specializing in Sri Lankan agriculture.',
      si: 'ආයුබෝවන්! මම ඔබේ FarmNex සහායකයා, ශ්‍රී ලාංකික ගොවිතැන ගැන විශේෂඥයෙක්.',
      ta: 'வணக்கம்! நான் உங்கள் FarmNex உதவியாளர், இலங்கை விவசாயத்தில் நிபுணர்.'
    };
    
    return greetings[language] || greetings[this.defaultLanguage];
  }

  // Format response using templates
  formatResponse(template, data, language = 'en') {
    if (!this.responseTemplates[template]) {
      return data.advice || 'No advice available';
    }
    
    let responseTemplate = this.responseTemplates[template][language] || 
                          this.responseTemplates[template][this.defaultLanguage];
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      responseTemplate = responseTemplate.replace(`{${key}}`, data[key]);
    });
    
    return responseTemplate;
  }

  // Translate crop names
  translateCrop(cropName, targetLanguage = 'en') {
    const cropTranslations = {
      rice: { en: 'rice', si: 'බත්', ta: 'அரிசி' },
      tea: { en: 'tea', si: 'තේ', ta: 'தேयிலை' },
      coconut: { en: 'coconut', si: 'පොල්', ta: 'தென்নை' },
      rubber: { en: 'rubber', si: 'රබර්', ta: 'ரப்பர்' },
      banana: { en: 'banana', si: 'කෙසෙල්', ta: 'வாழை' },
      tomato: { en: 'tomato', si: 'තක්කාලි', ta: 'தக்காளி' },
      onion: { en: 'onion', si: 'ළූණු', ta: 'வெங்காயம்' },
      chili: { en: 'chili', si: 'මිරිස්', ta: 'மிளகாய்' }
    };
    
    const crop = cropTranslations[cropName.toLowerCase()];
    return crop ? (crop[targetLanguage] || crop[this.defaultLanguage]) : cropName;
  }

  // Translate animal names
  translateAnimal(animalName, targetLanguage = 'en') {
    const animalTranslations = {
      cattle: { en: 'cattle', si: 'ගවයන්', ta: 'கால்நடை' },
      buffalo: { en: 'buffalo', si: 'මී හරක්', ta: 'எருமை' },
      goat: { en: 'goat', si: 'එළුවන්', ta: 'ஆடு' },
      chicken: { en: 'chicken', si: 'කුකුළන්', ta: 'கோழி' },
      pig: { en: 'pig', si: 'ඌරන්', ta: 'பன்றி' },
      sheep: { en: 'sheep', si: 'බැටළුවන්', ta: 'செம்மறி' }
    };
    
    const animal = animalTranslations[animalName.toLowerCase()];
    return animal ? (animal[targetLanguage] || animal[this.defaultLanguage]) : animalName;
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages.map(lang => ({
      code: lang,
      name: this.getLanguageName(lang),
      native: this.getLanguageNativeName(lang)
    }));
  }

  // Get language name
  getLanguageName(code) {
    const names = {
      en: 'English',
      si: 'Sinhala',
      ta: 'Tamil'
    };
    return names[code] || code;
  }

  // Get native language name
  getLanguageNativeName(code) {
    const nativeNames = {
      en: 'English',
      si: 'සිංහල',
      ta: 'தமிழ்'
    };
    return nativeNames[code] || code;
  }

  // Basic text processing for different languages
  processText(text, language) {
    // Simple text processing - in a full implementation, 
    // this would handle more complex language-specific processing
    switch (language) {
      case 'si':
        // Sinhala text processing
        return text.trim();
      case 'ta':
        // Tamil text processing
        return text.trim();
      default:
        // English text processing
        return text.trim().toLowerCase();
    }
  }

  // Create multilingual response
  createMultilingualResponse(englishResponse, detectedLanguage = 'en') {
    if (detectedLanguage === 'en') {
      return englishResponse;
    }

    // For non-English languages, provide a basic translated prefix
    const prefix = this.translate('advice_start', detectedLanguage);
    return `${prefix}\n\n${englishResponse}`;
  }

  // Validate language code
  isValidLanguage(languageCode) {
    return this.supportedLanguages.includes(languageCode);
  }
}

export default LanguageService;