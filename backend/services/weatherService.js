// Weather and seasonal advice service for Sri Lankan agriculture
class WeatherService {
  constructor() {
    this.climateZones = {
      wet: {
        description: 'High rainfall area (>2500mm annually)',
        districts: ['Colombo', 'Gampaha', 'Kalutara', 'Ratnapura', 'Kegalle'],
        mainCrops: ['rice', 'tea', 'rubber', 'coconut', 'spices'],
        challenges: ['excess water', 'fungal diseases', 'landslides']
      },
      dry: {
        description: 'Low rainfall area (<1750mm annually)',
        districts: ['Anuradhapura', 'Polonnaruwa', 'Hambantota', 'Monaragala'],
        mainCrops: ['rice', 'maize', 'groundnut', 'sesame', 'chili'],
        challenges: ['drought', 'irrigation needs', 'heat stress']
      },
      intermediate: {
        description: 'Moderate rainfall area (1750-2500mm annually)',
        districts: ['Kandy', 'Matale', 'Kurunegala', 'Badulla'],
        mainCrops: ['rice', 'vegetables', 'fruits', 'spices'],
        challenges: ['variable weather', 'seasonal planning']
      }
    };

    this.seasons = {
      yala: {
        period: 'May to August',
        monsoon: 'Southwest Monsoon',
        characteristics: 'Hot and wet in wet zone, dry in dry zone',
        activities: ['land preparation', 'planting short season crops', 'pest management'],
        crops: ['rice (short varieties)', 'maize', 'groundnut', 'green gram']
      },
      maha: {
        period: 'October to February',
        monsoon: 'Northeast Monsoon',
        characteristics: 'Main growing season, moderate temperatures',
        activities: ['major planting season', 'irrigation planning', 'harvest preparation'],
        crops: ['rice (long varieties)', 'sugarcane', 'sweet potato', 'vegetables']
      },
      intermediate: {
        period: 'March-April & September',
        monsoon: 'Inter-monsoonal periods',
        characteristics: 'Transitional weather, variable conditions',
        activities: ['soil preparation', 'equipment maintenance', 'planning'],
        crops: ['vegetables', 'fruits', 'nursery preparation']
      }
    };

    this.monthlyAdvice = {
      1: { season: 'maha', activity: 'harvesting', advice: 'Harvest maha crops, prepare for next season' },
      2: { season: 'maha', activity: 'harvesting', advice: 'Complete maha harvest, post-harvest processing' },
      3: { season: 'intermediate', activity: 'preparation', advice: 'Land preparation, vegetable cultivation' },
      4: { season: 'intermediate', activity: 'preparation', advice: 'Pre-yala activities, equipment check' },
      5: { season: 'yala', activity: 'planting', advice: 'Begin yala cultivation, water management crucial' },
      6: { season: 'yala', activity: 'growing', advice: 'Crop maintenance, pest control, irrigation' },
      7: { season: 'yala', activity: 'growing', advice: 'Continue crop care, disease monitoring' },
      8: { season: 'yala', activity: 'harvesting', advice: 'Yala harvest begins, storage preparation' },
      9: { season: 'intermediate', activity: 'preparation', advice: 'Post-yala activities, maha preparation' },
      10: { season: 'maha', activity: 'planting', advice: 'Main maha planting season begins' },
      11: { season: 'maha', activity: 'growing', advice: 'Crop establishment, fertilizer application' },
      12: { season: 'maha', activity: 'growing', advice: 'Crop development, water management' }
    };
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    return this.monthlyAdvice[month].season;
  }

  getSeasonalAdvice(month = null) {
    const targetMonth = month || new Date().getMonth() + 1;
    const monthData = this.monthlyAdvice[targetMonth];
    const seasonData = this.seasons[monthData.season];
    
    return {
      currentMonth: targetMonth,
      season: monthData.season,
      seasonInfo: seasonData,
      monthlyActivity: monthData.activity,
      advice: monthData.advice,
      recommendedCrops: seasonData.crops,
      keyActivities: seasonData.activities
    };
  }

  getClimateZoneAdvice(zone) {
    const zoneData = this.climateZones[zone.toLowerCase()];
    if (!zoneData) {
      return 'Invalid climate zone. Use: wet, dry, or intermediate.';
    }
    
    return {
      zone: zone.toLowerCase(),
      ...zoneData,
      currentSeason: this.getCurrentSeason(),
      seasonalAdvice: this.getSeasonalAdvice()
    };
  }

  getWeatherBasedAdvice(conditions) {
    const advice = [];
    
    if (conditions.rainfall === 'high') {
      advice.push('Ensure proper drainage to prevent waterlogging');
      advice.push('Monitor for fungal diseases in crops');
      advice.push('Delay fertilizer application until rain subsides');
    } else if (conditions.rainfall === 'low') {
      advice.push('Implement water conservation measures');
      advice.push('Consider drought-resistant crop varieties');
      advice.push('Schedule irrigation carefully');
    }
    
    if (conditions.temperature === 'high') {
      advice.push('Provide shade for livestock');
      advice.push('Increase watering frequency for crops');
      advice.push('Harvest early morning or late evening');
    }
    
    if (conditions.humidity === 'high') {
      advice.push('Improve air circulation around crops');
      advice.push('Apply preventive fungicide treatments');
      advice.push('Monitor stored produce for spoilage');
    }
    
    return advice;
  }

  getCropSpecificWeatherAdvice(crop, season = null) {
    const currentSeason = season || this.getCurrentSeason();
    const seasonData = this.seasons[currentSeason];
    
    const cropAdvice = {
      rice: {
        yala: 'Choose short-duration varieties (3-3.5 months). Ensure adequate water supply.',
        maha: 'Plant long-duration varieties (4-4.5 months). Utilize natural rainfall.',
        intermediate: 'Focus on land preparation and nursery management.'
      },
      tea: {
        yala: 'Reduce plucking frequency during dry periods. Maintain shade trees.',
        maha: 'Optimal plucking season. Watch for fungal diseases in wet areas.',
        intermediate: 'Pruning season. Apply fertilizers and maintain bushes.'
      },
      coconut: {
        yala: 'Ensure adequate water supply for young palms. Control pests.',
        maha: 'Main growing period. Apply organic manure.',
        intermediate: 'Harvest mature nuts. Prepare for next season.'
      },
      vegetables: {
        yala: 'Choose heat-resistant varieties. Use protective structures.',
        maha: 'Optimal growing season for most vegetables.',
        intermediate: 'Plan crop rotations and soil improvements.'
      }
    };
    
    const advice = cropAdvice[crop.toLowerCase()]?.[currentSeason] || 
      `For ${crop} in ${currentSeason} season: Follow general seasonal guidelines and monitor weather conditions closely.`;
    
    return {
      crop: crop,
      season: currentSeason,
      advice: advice,
      seasonInfo: seasonData,
      additionalTips: this.getGeneralSeasonalTips(currentSeason)
    };
  }

  getGeneralSeasonalTips(season) {
    const tips = {
      yala: [
        'Water management is critical',
        'Monitor pest populations closely',
        'Use heat-resistant varieties',
        'Harvest early morning to avoid heat'
      ],
      maha: [
        'Take advantage of natural rainfall',
        'Ensure proper drainage',
        'Watch for fungal diseases',
        'Plan for peak growing season'
      ],
      intermediate: [
        'Focus on soil preparation',
        'Maintain equipment',
        'Plan crop rotations',
        'Prepare for upcoming seasons'
      ]
    };
    
    return tips[season] || [];
  }

  getDistrictRecommendations(district) {
    let climateZone = 'intermediate'; // default
    
    // Determine climate zone based on district
    for (const [zone, data] of Object.entries(this.climateZones)) {
      if (data.districts.includes(district)) {
        climateZone = zone;
        break;
      }
    }
    
    const zoneData = this.climateZones[climateZone];
    const seasonalAdvice = this.getSeasonalAdvice();
    
    return {
      district: district,
      climateZone: climateZone,
      zoneInfo: zoneData,
      seasonalAdvice: seasonalAdvice,
      recommendedCrops: zoneData.mainCrops,
      challenges: zoneData.challenges
    };
  }

  // Placeholder for future weather API integration
  async getWeatherForecast(district) {
    // This would integrate with a weather API like OpenWeatherMap
    // For now, return mock data based on current season
    const currentSeason = this.getCurrentSeason();
    const month = new Date().getMonth() + 1;
    
    // Mock weather data based on season and Sri Lankan climate patterns
    const mockWeather = {
      yala: {
        temperature: '28-32°C',
        rainfall: 'Moderate to low',
        humidity: '70-80%',
        conditions: 'Hot and humid with afternoon showers'
      },
      maha: {
        temperature: '24-28°C',
        rainfall: 'High',
        humidity: '80-90%',
        conditions: 'Cooler with regular rainfall'
      },
      intermediate: {
        temperature: '26-30°C',
        rainfall: 'Variable',
        humidity: '75-85%',
        conditions: 'Variable conditions, prepare for changes'
      }
    };
    
    return {
      district: district,
      season: currentSeason,
      forecast: mockWeather[currentSeason],
      advice: `Weather conditions typical for ${currentSeason} season in ${district}. Plan agricultural activities accordingly.`,
      lastUpdated: new Date().toISOString()
    };
  }
}

export default WeatherService;