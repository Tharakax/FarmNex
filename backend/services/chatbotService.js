import Product from '../models/product.js';
import FarmSupply from '../models/farmSupply.js';
import TrainingMaterial from '../models/TrainingMaterial.js';
import SoilReading from '../models/soilReading.js';
import WeatherService from './weatherService.js';

class ChatbotService {
  constructor() {
    this.weatherService = new WeatherService();
    
    this.sriLankanCrops = [
      'rice', 'tea', 'coconut', 'rubber', 'cinnamon', 'cardamom', 'pepper',
      'banana', 'mango', 'papaya', 'pineapple', 'avocado', 'jackfruit',
      'tomato', 'carrot', 'cabbage', 'beans', 'okra', 'eggplant', 'onion',
      'potato', 'sweet potato', 'cassava', 'yam', 'sugar cane', 'maize',
      'groundnut', 'sesame', 'ginger', 'turmeric', 'chili'
    ];

    this.sriLankanLivestock = [
      'cattle', 'buffalo', 'goat', 'sheep', 'pig', 'chicken', 'duck', 
      'goose', 'rabbit', 'fish', 'prawn', 'crab'
    ];

    this.seasonalInfo = {
      'Yala': { months: 'May-August', crops: ['rice', 'maize', 'groundnut', 'beans'] },
      'Maha': { months: 'October-February', crops: ['rice', 'sugar cane', 'sweet potato'] },
      'Intermediate': { months: 'March-April, September', crops: ['vegetables', 'fruits'] }
    };

    this.districts = [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Mullaitivu', 'Vavuniya', 'Puttalam', 'Kurunegala', 'Anuradhapura',
      'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
      'Ampara', 'Batticaloa', 'Trincomalee'
    ];

    this.intents = {
      CROP_MANAGEMENT: ['crop', 'plant', 'grow', 'cultivation', 'harvest', 'planting'],
      LIVESTOCK_CARE: ['animal', 'cattle', 'chicken', 'goat', 'feed', 'breeding', 'disease', 'livestock', 'buffalo', 'sheep', 'pig', 'duck', 'fish', 'products'],
      PEST_CONTROL: ['pest', 'insect', 'disease', 'fungus', 'bug', 'damage', 'protection'],
      SOIL_HEALTH: ['soil', 'fertility', 'pH', 'nutrient', 'compost', 'organic matter'],
      WEATHER_ADVICE: ['weather', 'rain', 'season', 'drought', 'flood', 'climate', 'yala', 'maha', 'monsoon', 'seasonal', 'farming season'],
      IRRIGATION: ['water', 'irrigation', 'sprinkler', 'drip', 'watering'],
      EQUIPMENT: ['tool', 'machine', 'tractor', 'equipment', 'implement'],
      MARKET_PRICES: ['price', 'market', 'sell', 'cost', 'profit', 'economy'],
      FERTILIZER: ['fertilizer', 'nutrition', 'NPK', 'organic', 'chemical'],
      TRAINING: ['learn', 'training', 'course', 'education', 'guide', 'tutorial']
    };
  }

  // Detect intent from user message
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    let maxScore = 0;
    let detectedIntent = 'GENERAL';

    for (const [intent, keywords] of Object.entries(this.intents)) {
      const score = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    return { intent: detectedIntent, confidence: maxScore };
  }

  // Generate context-aware response based on intent and available data
  async generateResponse(message, userId = null) {
    try {
      const { intent } = this.detectIntent(message);
      const lowerMessage = message.toLowerCase();

      // Check for Sri Lankan crops/livestock mentions
      const mentionedCrops = this.sriLankanCrops.filter(crop => 
        lowerMessage.includes(crop.toLowerCase())
      );
      const mentionedLivestock = this.sriLankanLivestock.filter(animal => 
        lowerMessage.includes(animal.toLowerCase())
      );

      let response = '';
      let contextData = {};

      switch (intent) {
        case 'CROP_MANAGEMENT':
          response = await this.handleCropManagement(message, mentionedCrops);
          break;
        case 'LIVESTOCK_CARE':
          response = await this.handleLivestockCare(message, mentionedLivestock);
          break;
        case 'PEST_CONTROL':
          response = await this.handlePestControl(message, mentionedCrops);
          break;
        case 'SOIL_HEALTH':
          response = await this.handleSoilHealth(message, userId);
          contextData = await this.getLatestSoilData(userId);
          break;
        case 'WEATHER_ADVICE':
          response = await this.handleWeatherAdvice(message);
          break;
        case 'IRRIGATION':
          response = await this.handleIrrigation(message, contextData);
          break;
        case 'EQUIPMENT':
          response = await this.handleEquipment(message);
          contextData = await this.getAvailableEquipment();
          break;
        case 'MARKET_PRICES':
          response = await this.handleMarketPrices(message);
          contextData = await this.getCurrentPrices();
          break;
        case 'FERTILIZER':
          response = await this.handleFertilizerAdvice(message);
          contextData = await this.getAvailableFertilizers();
          break;
        case 'TRAINING':
          response = await this.handleTrainingRequest(message);
          contextData = await this.getRelevantTraining(message);
          break;
        default:
          response = await this.handleGeneralQuery(message, mentionedCrops, mentionedLivestock);
      }

      return {
        response,
        intent,
        contextData,
        suggestions: this.generateSuggestions(intent, mentionedCrops, mentionedLivestock)
      };

    } catch (error) {
      console.error('Chatbot service error:', error);
      return {
        response: this.getFallbackResponse(message),
        intent: 'ERROR',
        contextData: {},
        suggestions: []
      };
    }
  }

  // Handle crop management queries
  async handleCropManagement(message, mentionedCrops) {
    const lowerMessage = message.toLowerCase();
    
    if (mentionedCrops.length > 0) {
      const crop = mentionedCrops[0];
      
      if (lowerMessage.includes('plant') || lowerMessage.includes('grow')) {
        return this.getCropGrowingAdvice(crop);
      } else if (lowerMessage.includes('harvest')) {
        return this.getCropHarvestAdvice(crop);
      } else if (lowerMessage.includes('disease') || lowerMessage.includes('problem')) {
        return this.getCropDiseaseAdvice(crop);
      }
    }

    // Check current season and suggest crops
    const currentSeason = this.getCurrentSeason();
    const seasonalCrops = this.seasonalInfo[currentSeason]?.crops || [];
    
    return `For crop management in Sri Lanka, consider the current ${currentSeason} season (${this.seasonalInfo[currentSeason]?.months}). 
    Recommended crops: ${seasonalCrops.join(', ')}. 
    ${mentionedCrops.length > 0 ? `For ${mentionedCrops[0]}, ensure proper soil preparation and follow traditional Sri Lankan farming practices.` : ''}`;
  }

  // Handle livestock care queries
  async handleLivestockCare(message, mentionedLivestock) {
    const lowerMessage = message.toLowerCase();
    
    // Check if asking about livestock products
    if (lowerMessage.includes('product') || lowerMessage.includes('produce')) {
      return this.getLivestockProductsInfo();
    }
    
    if (mentionedLivestock.length > 0) {
      const animal = mentionedLivestock[0];
      
      if (lowerMessage.includes('feed') || lowerMessage.includes('nutrition')) {
        return this.getAnimalFeedingAdvice(animal);
      } else if (lowerMessage.includes('disease') || lowerMessage.includes('health')) {
        return this.getAnimalHealthAdvice(animal);
      } else if (lowerMessage.includes('breeding')) {
        return this.getBreedingAdvice(animal);
      } else if (lowerMessage.includes('care') || lowerMessage.includes('manage')) {
        return this.getAnimalCareAdvice(animal);
      }
    }

    // General livestock advice when no specific animal is mentioned
    if (lowerMessage.includes('care') || lowerMessage.includes('manage')) {
      return this.getGeneralLivestockCare();
    }

    return `For livestock management in Sri Lanka, focus on proper housing, nutrition, and healthcare. Common animals include cattle, buffalo, goats, and poultry. 
    Ensure adequate ventilation, clean water, and regular veterinary care. Consider local feed sources like rice bran, coconut poonac, and green fodder.`;
  }

  // Handle pest control queries
  async handlePestControl(message, mentionedCrops) {
    if (mentionedCrops.length > 0) {
      return this.getCropPestControl(mentionedCrops[0]);
    }

    return `For pest control in Sri Lankan agriculture, use Integrated Pest Management (IPM) approaches:
    1. Biological control using natural predators
    2. Neem-based organic pesticides
    3. Crop rotation and intercropping
    4. Pheromone traps for specific pests
    5. Proper field sanitation and debris removal`;
  }

  // Handle soil health queries with real data
  async handleSoilHealth(message, userId) {
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('pH')) {
      response = `Soil pH is crucial for Sri Lankan agriculture. Most crops prefer pH 6.0-7.5. 
      For acidic soils (common in hill country), add lime. For alkaline soils, add organic matter.`;
    } else if (lowerMessage.includes('fertility')) {
      response = `Improve soil fertility with:
      1. Compost from coconut husks and rice straw
      2. Green manure crops like Gliricidia
      3. Vermicomposting with earthworms
      4. Biochar from rice hulls`;
    } else if (lowerMessage.includes('moisture')) {
      response = `Soil moisture management in Sri Lanka:
      - Dry zone: Focus on water conservation and mulching
      - Wet zone: Ensure proper drainage during monsoons
      - Intermediate zone: Balance irrigation and drainage`;
    }

    return response || `Sri Lankan soils vary by region. Red-yellow podzolic soils in hills need organic matter. 
    Alluvial soils in lowlands are fertile for rice. Test your soil regularly and adjust management accordingly.`;
  }

  // Handle irrigation queries
  async handleIrrigation(message, contextData) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('drip')) {
      return 'Drip irrigation is excellent for Sri Lankan conditions. Benefits: water conservation (30-50% savings), reduced weed growth, precise nutrient delivery. Suitable for vegetables, fruits, and tea cultivation.';
    } else if (lowerMessage.includes('sprinkler')) {
      return 'Sprinkler irrigation works well for large-scale crops like rice and vegetables. Consider wind patterns and water pressure. Best used during early morning or evening to reduce evaporation.';
    } else if (lowerMessage.includes('schedule')) {
      return 'Irrigation scheduling in Sri Lanka depends on season: Dry season (May-Sept) - daily irrigation for vegetables, every 2-3 days for field crops. Wet season - reduce frequency, focus on drainage.';
    }
    
    return 'Smart irrigation for Sri Lankan agriculture: Use soil moisture sensors, consider rainfall patterns, match irrigation method to crop type. Drip for precision, sprinkler for coverage, furrow for rice fields.';
  }

  // Handle weather advice with enhanced weather service
  async handleWeatherAdvice(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific season questions
    if (lowerMessage.includes('yala')) {
      return this.getYalaSeasonInfo();
    }
    if (lowerMessage.includes('maha')) {
      return this.getMahaSeasonInfo();
    }
    
    // Check if specific district is mentioned
    const mentionedDistrict = this.districts.find(district => 
      lowerMessage.includes(district.toLowerCase())
    );
    
    if (mentionedDistrict) {
      const districtInfo = this.weatherService.getDistrictRecommendations(mentionedDistrict);
      const forecast = await this.weatherService.getWeatherForecast(mentionedDistrict);
      
      return `Weather advice for ${mentionedDistrict}:
      
Climate Zone: ${districtInfo.climateZone.toUpperCase()}
Current Season: ${forecast.season.toUpperCase()}
Conditions: ${forecast.forecast.conditions}
      
Recommended crops: ${districtInfo.recommendedCrops.join(', ')}
      
${districtInfo.seasonalAdvice.advice}
      
Challenges to watch: ${districtInfo.challenges.join(', ')}`;
    }
    
    // Check for specific crop weather advice
    const mentionedCrops = this.sriLankanCrops.filter(crop => 
      lowerMessage.includes(crop.toLowerCase())
    );
    
    if (mentionedCrops.length > 0) {
      const cropWeatherAdvice = this.weatherService.getCropSpecificWeatherAdvice(mentionedCrops[0]);
      return `Weather advice for ${mentionedCrops[0]} cultivation:
      
Season: ${cropWeatherAdvice.season.toUpperCase()} (${cropWeatherAdvice.seasonInfo.period})
      
${cropWeatherAdvice.advice}
      
Additional tips:
${cropWeatherAdvice.additionalTips.map(tip => `• ${tip}`).join('\n')}`;
    }
    
    // General seasonal weather advice
    const seasonalAdvice = this.weatherService.getSeasonalAdvice();
    
    return `Current Season: ${seasonalAdvice.season.toUpperCase()} (${seasonalAdvice.seasonInfo.period})
    
Activity Focus: ${seasonalAdvice.monthlyActivity}
Advice: ${seasonalAdvice.advice}
    
Recommended Crops: ${seasonalAdvice.recommendedCrops.join(', ')}
    
Key Activities:
${seasonalAdvice.keyActivities.map(activity => `• ${activity}`).join('\n')}
    
Monsoon: ${seasonalAdvice.seasonInfo.monsoon}
Characteristics: ${seasonalAdvice.seasonInfo.characteristics}`;
  }

  // Handle equipment queries
  async handleEquipment(message) {
    return `Agricultural equipment suitable for Sri Lankan farms:
    
    Small-scale: Hand tools, power tillers, brush cutters
    Medium-scale: Two-wheel tractors, rice transplanters, threshers
    Large-scale: Four-wheel tractors, combine harvesters, disc plows
    
    Consider equipment rental services for expensive machinery. Maintain tools properly in humid conditions.`;
  }

  // Handle market prices
  async handleMarketPrices(message) {
    try {
      // Get current product prices from database
      const products = await Product.find().limit(5).sort({ createdAt: -1 });
      
      let priceInfo = 'Current market prices in FarmNex:\n\n';
      products.forEach(product => {
        priceInfo += `• ${product.name}: LKR ${product.price}/${product.unit}\n`;
      });
      
      priceInfo += '\nPrices may vary by location and season. Check local Pola markets for current rates.';
      return priceInfo;
    } catch (error) {
      return 'For current market prices, check local Pola markets or agricultural marketing centers. Prices vary by region and season in Sri Lanka.';
    }
  }

  // Handle fertilizer advice
  async handleFertilizerAdvice(message) {
    try {
      const fertilizers = await FarmSupply.find({ category: 'fertilizers' }).limit(3);
      let response = 'Fertilizer recommendations for Sri Lankan agriculture:\n\n';
      
      if (fertilizers.length > 0) {
        response += 'Available fertilizers in our inventory:\n';
        fertilizers.forEach(fert => {
          response += `• ${fert.name}: LKR ${fert.price}/${fert.unit}\n`;
        });
        response += '\n';
      }
      
      response += `Organic options:
      • Compost from kitchen waste and crop residues
      • Vermicompost from earthworm farming
      • Green manure from Gliricidia and other nitrogen-fixing plants
      • Biochar from rice hulls and coconut shells`;
      
      return response;
    } catch (error) {
      return 'Use balanced fertilization: NPK ratios depend on crop and soil test results. Consider organic alternatives like compost and green manure.';
    }
  }

  // Handle training requests
  async handleTrainingRequest(message) {
    try {
      const trainings = await TrainingMaterial.find({ 
        status: 'published' 
      }).limit(3).sort({ views: -1 });
      
      let response = 'Available training materials:\n\n';
      trainings.forEach(training => {
        response += `📚 ${training.title} (${training.type})\n`;
        response += `Category: ${training.category} | Level: ${training.difficulty}\n\n`;
      });
      
      response += 'Access more training materials through the FarmNex training section.';
      return response;
    } catch (error) {
      return 'We offer comprehensive agricultural training covering crop management, livestock care, and sustainable farming practices. Check our training section for more details.';
    }
  }

  // Handle general queries
  async handleGeneralQuery(message, mentionedCrops, mentionedLivestock) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm your FarmNex assistant specializing in Sri Lankan agriculture. I can help you with:
      • Crop management and livestock care
      • Seasonal farming advice
      • Pest control and soil health
      • Equipment and market information
      • Training resources
      
      What would you like to know about farming today?`;
    }
    
    if (mentionedCrops.length > 0 || mentionedLivestock.length > 0) {
      const items = [...mentionedCrops, ...mentionedLivestock];
      return `I can provide specific advice about ${items.join(', ')}. These are well-suited for Sri Lankan conditions. 
      What specific information do you need about ${items[0]}?`;
    }
    
    return this.getFallbackResponse(message);
  }

  // Get crop-specific growing advice
  getCropGrowingAdvice(crop) {
    const advice = {
      rice: 'Rice cultivation in Sri Lanka: Use certified seeds, prepare fields properly, maintain 2-3 cm water depth, apply fertilizer in splits.',
      tea: 'Tea cultivation: Plant at 1200-1800m altitude, ensure good drainage, prune regularly, harvest every 7-14 days.',
      coconut: 'Coconut: Plant dwarf varieties for quicker returns, ensure good drainage, apply organic manure, control rhinoceros beetles.',
      rubber: 'Rubber: Plant in wet zone areas, tap after 6-7 years, follow proper tapping techniques, process latex quickly.',
      rice: 'Rice: Prepare fields well, use certified seeds, maintain proper water levels, apply fertilizer in 3 splits.',
      banana: 'Banana: Choose suitable varieties like Kolikuttu or Seeni, ensure good drainage, support with stakes.',
      tomato: 'Tomato: Plant during dry season, use drip irrigation, stake plants, control blight diseases.',
      default: `For ${crop} cultivation in Sri Lanka, ensure proper soil preparation, select adapted varieties, follow recommended spacing, and practice integrated pest management.`
    };
    
    return advice[crop.toLowerCase()] || advice.default;
  }

  // Get crop harvest advice
  getCropHarvestAdvice(crop) {
    const advice = {
      rice: 'Rice harvest in Sri Lanka: Harvest when 80-85% of grains are golden yellow. Cut in early morning when moisture is higher. Dry to 14% moisture content before storage.',
      tea: 'Tea harvest: Pluck two leaves and a bud every 7-14 days. Best quality comes from morning plucking. Avoid plucking during rain or when leaves are wet.',
      coconut: 'Coconut harvest: Mature nuts fall naturally or harvest at 11-12 months. Fresh coconuts can be harvested at 6-7 months for tender coconut water.',
      banana: 'Banana harvest: Harvest when fruits are 75% mature (still green but plump). Cut the whole bunch and ripen off the plant to prevent splitting.',
      tomato: 'Tomato harvest: Pick when fruits show first color change (breaker stage) for better shelf life, or when fully red for immediate use.',
      default: `For ${crop} harvest, timing is crucial. Harvest at the right maturity stage, use proper tools, handle carefully to minimize damage, and store appropriately for the Sri Lankan climate.`
    };
    
    return advice[crop.toLowerCase()] || advice.default;
  }

  // Get crop disease advice
  getCropDiseaseAdvice(crop) {
    const advice = {
      rice: 'Common rice diseases in Sri Lanka: Blast, sheath blight, bacterial leaf blight. Use resistant varieties, proper spacing, avoid excess nitrogen. Apply fungicides if severe.',
      tea: 'Tea diseases: Blister blight, root rot, stem canker. Ensure good drainage, prune infected parts, use copper-based fungicides. Maintain proper shade levels.',
      tomato: 'Tomato diseases: Early blight, late blight, bacterial wilt. Use drip irrigation, avoid overhead watering, rotate crops, apply preventive fungicides.',
      coconut: 'Coconut diseases: Lethal yellowing, bud rot, leaf spot. Remove infected palms, improve drainage, use resistant varieties, maintain sanitation.',
      banana: 'Banana diseases: Panama disease, black sigatoka, bunchy top. Use tissue culture plants, avoid waterlogged conditions, remove infected plants.',
      default: `For ${crop} disease management in Sri Lanka: Practice crop rotation, use resistant varieties, maintain field sanitation, apply integrated disease management, and consult agricultural extension officers for severe cases.`
    };
    
    return advice[crop.toLowerCase()] || advice.default;
  }

  // Get crop pest control advice
  getCropPestControl(crop) {
    const advice = {
      rice: 'Rice pests in Sri Lanka: Brown planthopper, stem borer, rice bug. Use light traps, neem applications, maintain proper water levels. Avoid continuous flooding.',
      tea: 'Tea pests: Tea mosquito bug, thrips, scale insects. Use yellow sticky traps, neem oil spray, encourage natural predators, maintain proper pruning.',
      coconut: 'Coconut pests: Rhinoceros beetle, red palm weevil, coconut mite. Use pheromone traps, remove breeding sites, apply neem cake around palms.',
      tomato: 'Tomato pests: Whitefly, fruit borer, leaf miner. Use yellow sticky traps, BT sprays for borers, neem oil for whiteflies, remove infected fruits.',
      banana: 'Banana pests: Nematodes, aphids, thrips. Use tissue culture plants, soil solarization, neem applications, maintain clean cultivation.',
      default: `For ${crop} pest control in Sri Lanka: Use Integrated Pest Management (IPM), encourage beneficial insects, use organic pesticides like neem, practice crop rotation, and maintain field hygiene.`
    };
    
    return advice[crop.toLowerCase()] || advice.default;
  }

  // Get animal feeding advice
  getAnimalFeedingAdvice(animal) {
    const advice = {
      cattle: 'Cattle feeding: Provide good quality grass, rice straw, concentrates. Ensure 30-40 liters water daily.',
      buffalo: 'Buffalo feeding: Similar to cattle but can consume more roughage. Good for rice straw and water plants.',
      goat: 'Goat feeding: Browse on bushes and trees, supplement with concentrates. Provide 3-5 liters water daily.',
      chicken: 'Chicken feeding: Balanced layer/broiler feed, green vegetables, clean water. Avoid feeding onions or chocolate.',
      default: `For ${animal} in Sri Lanka, provide balanced nutrition with locally available feeds, ensure clean water, and adjust feeding based on climate.`
    };
    
    return advice[animal.toLowerCase()] || advice.default;
  }

  // Get animal health advice
  getAnimalHealthAdvice(animal) {
    const advice = {
      cattle: 'Cattle health in Sri Lanka: Vaccinate against FMD, hemorrhagic septicemia. Watch for tick-borne diseases. Provide shade, clean water, deworming every 3-4 months.',
      buffalo: 'Buffalo health: Similar to cattle but more resistant to diseases. Ensure wallowing facilities to prevent heat stress. Vaccinate regularly and control parasites.',
      goat: 'Goat health: Common issues - pneumonia, diarrhea, parasites. Provide dry housing, regular deworming, vaccinations. Watch for signs of pregnancy toxemia in does.',
      chicken: 'Chicken health: Vaccinate against Newcastle disease, fowl pox. Provide proper ventilation, avoid overcrowding. Watch for respiratory issues and egg drop syndrome.',
      sheep: 'Sheep health: Prevent foot rot in wet conditions, regular shearing, deworming. Watch for pregnancy toxemia and ensure adequate nutrition during breeding.',
      default: `For ${animal} health in Sri Lankan conditions: Maintain proper housing with good ventilation, provide clean water, follow vaccination schedules, regular health checks, and consult veterinarians for serious issues.`
    };
    
    return advice[animal.toLowerCase()] || advice.default;
  }

  // Get breeding advice
  getBreedingAdvice(animal) {
    const advice = {
      cattle: 'Cattle breeding in Sri Lanka: Use AI with improved breeds like Holstein, Jersey crosses. Heat detection is crucial - breed 12-18 hours after heat signs. Maintain breeding records.',
      buffalo: 'Buffalo breeding: Natural service common. Breeding season typically October-February. Gestation 310-320 days. Select good breeding bulls with proven genetics.',
      goat: 'Goat breeding: Breeding age 8-10 months for does. Gestation period 150 days. Can breed twice a year. Select healthy breeding bucks with good conformation.',
      chicken: 'Chicken breeding: Layer breeds start laying at 18-20 weeks. Broiler production cycle 6-7 weeks. Maintain proper male:female ratios (1:8-10 for layers).',
      sheep: 'Sheep breeding: Breeding age 8-12 months for ewes. Gestation 147-150 days. Can breed seasonally. Select rams with good body condition and fertility.',
      default: `For ${animal} breeding in Sri Lanka: Select quality breeding stock, maintain proper nutrition during breeding season, keep accurate records, and ensure proper housing and healthcare.`
    };
    
    return advice[animal.toLowerCase()] || advice.default;
  }

  // Get livestock products information
  getLivestockProductsInfo() {
    return `🐄 **Livestock Products Available in Sri Lanka:**

**Dairy Products:**
• Fresh milk from cattle and buffalo
• Yogurt (curd) - traditional Sri Lankan favorite
• Cheese - both local and imported varieties
• Butter and ghee for cooking

**Meat Products:**
• Beef and buffalo meat
• Chicken and other poultry
• Goat and mutton
• Pork (in certain regions)
• Fresh and dried fish

**Other Products:**
• Fresh eggs from chickens and ducks
• Honey from beekeeping
• Leather and hides
• Organic fertilizer (manure)

**Value-Added Products:**
• Processed meats and sausages
• Pickled fish and dried fish varieties
• Traditional dairy products like "kiri peni"

These products support both local consumption and export markets. Would you like specific information about any particular livestock product or farming practices?`;
  }

  // Get specific animal care advice
  getAnimalCareAdvice(animal) {
    const advice = {
      cattle: `🐄 **Cattle Care in Sri Lanka:**
• **Housing**: Provide well-ventilated shelter, 4-6 sq meters per animal
• **Feeding**: Good quality grass, rice straw, concentrates (2-3% of body weight)
• **Water**: 30-40 liters daily, more in hot weather
• **Health**: Regular vaccinations (FMD, HS), deworming every 3 months
• **Grooming**: Daily brushing, hoof trimming every 6 months
• **Heat stress**: Provide shade, fans, wallowing areas`,
      buffalo: `🐃 **Buffalo Care in Sri Lanka:**
• **Housing**: Open shelter with wallowing pond access
• **Feeding**: Can consume more roughage than cattle, rice straw suitable
• **Water**: 50-60 liters daily, wallowing for heat regulation
• **Health**: More disease resistant, but same vaccination schedule
• **Work**: If used for farming, proper rest periods essential
• **Breeding**: Natural service common, AI available`,
      goat: `🐐 **Goat Care in Sri Lanka:**
• **Housing**: Raised platforms, good drainage, 1.5-2 sq meters each
• **Feeding**: Browse feeding preferred, supplement with concentrates
• **Water**: 3-5 liters daily, increase during lactation
• **Health**: Vaccinate against PPR, regular deworming
• **Breeding**: Can kid twice yearly, proper nutrition during pregnancy
• **Management**: Separate bucks from does except during breeding`,
      chicken: `🐔 **Chicken Care in Sri Lanka:**
• **Housing**: 4 birds per sq meter, good ventilation crucial
• **Feeding**: Layer/broiler feed, supplement with greens, grit
• **Water**: Clean water always available, 200-300ml per bird daily
• **Health**: Vaccinate against Newcastle, fowl pox, regular health checks
• **Eggs**: Provide nesting boxes, collect eggs frequently
• **Temperature**: Maintain 18-24°C, use fans in hot weather`,
      default: `For ${animal} care in Sri Lanka: Provide appropriate housing with good ventilation, balanced nutrition, clean water, regular health monitoring, and protection from extreme weather. Consult local veterinarians for specific guidance.`
    };
    
    return advice[animal.toLowerCase()] || advice.default;
  }

  // Get general livestock care advice
  getGeneralLivestockCare() {
    return `🏡 **General Livestock Management in Sri Lanka:**

**Essential Care Principles:**
• **Proper Housing**: Well-ventilated, dry, comfortable shelters
• **Balanced Nutrition**: Quality feed suited to each species
• **Clean Water**: Always available, fresh and clean
• **Health Management**: Regular vaccinations, deworming, health checks
• **Climate Adaptation**: Heat stress prevention, shade, cooling systems

**Common Sri Lankan Livestock:**
• **Cattle & Buffalo**: Dairy and draught purposes
• **Goats & Sheep**: Meat production, small-scale farming
• **Poultry**: Eggs and meat, easy to manage
• **Fish**: Pond culture, very profitable

**Local Resources:**
• Feed: Rice bran, coconut poonac, grass, kitchen waste
• Veterinary Services: Government and private vets available
• Training: Agricultural extension officers provide guidance

What specific animal would you like detailed care information about?`;
  }

  // Get Yala season information
  getYalaSeasonInfo() {
    return `🌾 **Yala Season in Sri Lanka**

**Period**: May to August (Southwest Monsoon)
**Duration**: About 3-4 months
**Characteristics**: Lesser rainfed season, drier conditions

**🌧️ Weather Pattern:**
• Southwest monsoon brings moderate rainfall
• Drier than Maha season
• Requires more irrigation support
• Temperatures: 25-32°C

**🌱 Suitable Crops:**
**Main crops**: Rice (short-term varieties), maize, groundnut
**Vegetables**: Tomato, chili, okra, beans, cucumber
**Other crops**: Sesame, cowpea, green gram

**🚜 Key Activities:**
• Land preparation: April-May
• Planting: May-June
• Harvesting: August-September
• Focus on drought-resistant varieties
• Efficient water management crucial

**💡 Farming Tips:**
• Use short-duration crop varieties (3-3.5 months)
• Implement water-saving techniques
• Choose drought-tolerant varieties
• Plan irrigation schedules carefully
• Monitor pest control (higher pest pressure in dry conditions)

Yala season is ideal for farmers in irrigated areas and those with access to supplementary water sources!`;
  }

  // Get Maha season information
  getMahaSeasonInfo() {
    return `🌾 **Maha Season in Sri Lanka**

**Period**: October to February/March (Northeast Monsoon)
**Duration**: About 5-6 months
**Characteristics**: Major rainfed season with abundant rainfall

**🌧️ Weather Pattern:**
• Northeast monsoon brings heavy rainfall
• Main agricultural season
• Natural irrigation from monsoon rains
• Temperatures: 22-28°C
• Higher humidity levels

**🌱 Suitable Crops:**
**Main crops**: Rice (long-term varieties), sugar cane
**Vegetables**: Cabbage, carrot, leeks, radish, lettuce
**Root crops**: Sweet potato, cassava, yam
**Other crops**: Maize, finger millet

**🚜 Key Activities:**
• Land preparation: September-October
• Planting: October-November
• Growing period: November-January
• Harvesting: February-March
• Post-harvest: March-April

**💡 Farming Tips:**
• Use long-duration crop varieties (4-6 months)
• Focus on proper drainage systems
• Prepare for excess water management
• Choose flood-resistant varieties where applicable
• Monitor for fungal diseases (high humidity)
• Take advantage of natural rainfall

Maha season is the primary cultivation season in Sri Lanka, especially suitable for rainfed agriculture!`;
  }

  // Get current season based on month (enhanced with weather service)
  getCurrentSeason() {
    return this.weatherService.getCurrentSeason();
  }

  // Get latest soil data for user
  async getLatestSoilData(userId) {
    try {
      if (!userId) return null;
      return await SoilReading.findOne().sort({ createdAt: -1 });
    } catch (error) {
      return null;
    }
  }

  // Get available equipment
  async getAvailableEquipment() {
    try {
      return await FarmSupply.find({ 
        category: { $in: ['tools', 'machinery', 'equipment'] },
        quantity: { $gt: 0 }
      }).limit(5);
    } catch (error) {
      return [];
    }
  }

  // Get current prices
  async getCurrentPrices() {
    try {
      return await Product.find().select('name price unit category').limit(10);
    } catch (error) {
      return [];
    }
  }

  // Get available fertilizers
  async getAvailableFertilizers() {
    try {
      return await FarmSupply.find({ 
        category: 'fertilizers',
        quantity: { $gt: 0 }
      }).limit(5);
    } catch (error) {
      return [];
    }
  }

  // Get relevant training materials
  async getRelevantTraining(message) {
    try {
      const keywords = message.toLowerCase().split(' ');
      return await TrainingMaterial.find({
        $or: [
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { tags: { $in: keywords } }
        ],
        status: 'published'
      }).limit(5);
    } catch (error) {
      return [];
    }
  }

  // Generate contextual suggestions
  generateSuggestions(intent, mentionedCrops, mentionedLivestock) {
    const baseSuggestions = [
      'What crops are suitable for this season?',
      'How can I improve my soil health?',
      'Show me available training materials',
      'What are current market prices?'
    ];

    const intentSuggestions = {
      CROP_MANAGEMENT: [
        'Best planting time for rice',
        'Organic pest control methods',
        'Irrigation scheduling tips'
      ],
      LIVESTOCK_CARE: [
        'Cattle feeding guidelines',
        'Chicken disease prevention',
        'Goat breeding advice'
      ],
      SOIL_HEALTH: [
        'Soil pH testing methods',
        'Composting techniques',
        'Organic fertilizer options'
      ]
    };

    return [...baseSuggestions, ...(intentSuggestions[intent] || [])];
  }

  // Fallback response for unrecognized queries
  getFallbackResponse(message) {
    const responses = [
      "I'm here to help with your farming questions in Sri Lanka! Ask me about crops, livestock, soil management, or seasonal advice.",
      "As your FarmNex assistant, I can provide guidance on agricultural practices suited for Sri Lankan conditions. What specific farming topic interests you?",
      "I specialize in Sri Lankan agriculture including rice, tea, coconut, vegetables, and livestock. How can I assist your farming activities?",
      "Let me help you with farming advice for Sri Lankan conditions. Try asking about specific crops, animals, or farming practices.",
      "I'm knowledgeable about sustainable farming practices in Sri Lanka. Ask me about organic farming, crop rotation, or integrated pest management."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default ChatbotService;