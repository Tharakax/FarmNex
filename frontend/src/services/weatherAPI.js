class WeatherAPI {
  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    this.defaultCoords = {
      lat: 6.9271,
      lon: 79.8612,
      city: 'Colombo'
    };
  }

  async getCurrentWeather(lat = this.defaultCoords.lat, lon = this.defaultCoords.lon) {
    try {
      if (this.apiKey === 'demo_key') {
        return this.getMockCurrentWeather();
      }

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatCurrentWeather(data);
    } catch (error) {
      console.warn('Weather API error, using mock data:', error);
      return this.getMockCurrentWeather();
    }
  }

 
  async getForecast(lat = this.defaultCoords.lat, lon = this.defaultCoords.lon) {
    try {
      if (this.apiKey === 'demo_key') {
        return this.getMockForecast();
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatForecast(data);
    } catch (error) {
      console.warn('Forecast API error, using mock data:', error);
      return this.getMockForecast();
    }
  }

  async getWeatherAlerts(lat = this.defaultCoords.lat, lon = this.defaultCoords.lon) {
    // This would typically use a different API endpoint
    return this.getMockAlerts();
  }

  // Format current weather data
  formatCurrentWeather(data) {
    return {
      success: true,
      data: {
        location: {
          city: data.name,
          country: data.sys.country,
          coords: {
            lat: data.coord.lat,
            lon: data.coord.lon
          }
        },
        current: {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          visibility: data.visibility / 1000, // Convert to km
          uvIndex: 5, // Would need separate API call for UV index
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          cloudCover: data.clouds.all,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000)
        },
        lastUpdated: new Date()
      }
    };
  }

  // Format forecast data
  formatForecast(data) {
    const dailyForecast = {};
    
    // Group by day
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyForecast[dateKey]) {
        dailyForecast[dateKey] = {
          date: dateKey,
          temps: [],
          conditions: [],
          humidity: [],
          windSpeed: [],
          precipitation: []
        };
      }
      
      dailyForecast[dateKey].temps.push(item.main.temp);
      dailyForecast[dateKey].conditions.push(item.weather[0]);
      dailyForecast[dateKey].humidity.push(item.main.humidity);
      dailyForecast[dateKey].windSpeed.push(item.wind.speed);
      dailyForecast[dateKey].precipitation.push(item.rain?.['3h'] || 0);
    });

    // Format daily summaries
    const forecast = Object.values(dailyForecast).slice(0, 5).map(day => ({
      date: day.date,
      dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
      tempMax: Math.round(Math.max(...day.temps)),
      tempMin: Math.round(Math.min(...day.temps)),
      condition: day.conditions[0].main,
      description: day.conditions[0].description,
      icon: day.conditions[0].icon,
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length),
      precipitation: day.precipitation.reduce((a, b) => a + b),
      precipitationChance: Math.min(day.precipitation.length * 20, 100) // Mock calculation
    }));

    return {
      success: true,
      data: {
        location: {
          city: data.city.name,
          country: data.city.country
        },
        forecast,
        lastUpdated: new Date()
      }
    };
  }

  // Mock current weather data for demo
  getMockCurrentWeather() {
    const conditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d' },
      { main: 'Clouds', description: 'few clouds', icon: '02d' },
      { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
      { main: 'Rain', description: 'light rain', icon: '10d' }
    ];
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      success: true,
      data: {
        location: {
          city: 'Colombo',
          country: 'LK',
          coords: this.defaultCoords
        },
        current: {
          temperature: Math.round(25 + Math.random() * 10), // 25-35°C
          feelsLike: Math.round(27 + Math.random() * 10),
          humidity: Math.round(60 + Math.random() * 30), // 60-90%
          pressure: Math.round(1010 + Math.random() * 20),
          visibility: Math.round(5 + Math.random() * 10), // 5-15 km
          uvIndex: Math.round(3 + Math.random() * 8), // 3-11
          windSpeed: Math.round(2 + Math.random() * 8), // 2-10 m/s
          windDirection: Math.round(Math.random() * 360),
          cloudCover: Math.round(Math.random() * 100),
          condition: condition.main,
          description: condition.description,
          icon: condition.icon,
          sunrise: new Date(Date.now() - (Date.now() % 86400000) + 6 * 3600000), // 6:00 AM
          sunset: new Date(Date.now() - (Date.now() % 86400000) + 18 * 3600000)   // 6:00 PM
        },
        lastUpdated: new Date()
      }
    };
  }

  // Mock forecast data
  getMockForecast() {
    const conditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d' },
      { main: 'Clouds', description: 'few clouds', icon: '02d' },
      { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
      { main: 'Rain', description: 'light rain', icon: '10d' },
      { main: 'Rain', description: 'moderate rain', icon: '10d' }
    ];

    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        tempMax: Math.round(28 + Math.random() * 8), // 28-36°C
        tempMin: Math.round(22 + Math.random() * 6), // 22-28°C
        condition: condition.main,
        description: condition.description,
        icon: condition.icon,
        humidity: Math.round(65 + Math.random() * 25), // 65-90%
        windSpeed: Math.round(3 + Math.random() * 7), // 3-10 m/s
        precipitation: Math.random() * 10, // 0-10mm
        precipitationChance: Math.round(Math.random() * 100) // 0-100%
      });
    }

    return {
      success: true,
      data: {
        location: {
          city: 'Colombo',
          country: 'LK'
        },
        forecast,
        lastUpdated: new Date()
      }
    };
  }

  // Mock weather alerts
  getMockAlerts() {
    const possibleAlerts = [
      {
        id: 1,
        type: 'heat',
        severity: 'moderate',
        title: 'Heat Advisory',
        description: 'High temperatures expected. Ensure adequate irrigation for crops.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recommendations: [
          'Increase watering frequency',
          'Provide shade for sensitive plants',
          'Monitor livestock for heat stress'
        ]
      },
      {
        id: 2,
        type: 'rain',
        severity: 'high',
        title: 'Heavy Rain Warning',
        description: 'Heavy rainfall expected in the next 24-48 hours.',
        startTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        recommendations: [
          'Ensure proper drainage in fields',
          'Protect sensitive crops',
          'Delay pesticide applications'
        ]
      }
    ];

    // Return random alerts (0-2)
    const numAlerts = Math.floor(Math.random() * 3);
    const alerts = possibleAlerts.slice(0, numAlerts);

    return {
      success: true,
      data: {
        alerts,
        lastUpdated: new Date()
      }
    };
  }

  // Get agricultural recommendations based on weather
  getAgriculturalInsights(currentWeather, forecast) {
    const insights = [];
    
    if (!currentWeather || !forecast) return insights;

    const temp = currentWeather.temperature;
    const humidity = currentWeather.humidity;
    const precipitation = forecast.reduce((sum, day) => sum + day.precipitation, 0);

    // Temperature-based insights
    if (temp > 35) {
      insights.push({
        type: 'warning',
        category: 'irrigation',
        title: 'High Temperature Alert',
        message: 'Increase irrigation frequency. Consider shade cloth for sensitive crops.',
        icon: '🌡️'
      });
    } else if (temp < 15) {
      insights.push({
        type: 'info',
        category: 'protection',
        title: 'Cool Weather',
        message: 'Protect cold-sensitive plants. Consider row covers.',
        icon: '❄️'
      });
    }

    // Humidity-based insights
    if (humidity > 85) {
      insights.push({
        type: 'warning',
        category: 'disease',
        title: 'High Humidity',
        message: 'Monitor for fungal diseases. Ensure good air circulation.',
        icon: '💧'
      });
    }

    // Precipitation-based insights
    if (precipitation > 20) {
      insights.push({
        type: 'info',
        category: 'irrigation',
        title: 'Sufficient Rainfall Expected',
        message: 'Reduce irrigation schedule. Check drainage systems.',
        icon: '🌧️'
      });
    } else if (precipitation < 5) {
      insights.push({
        type: 'warning',
        category: 'irrigation',
        title: 'Low Rainfall Expected',
        message: 'Plan additional irrigation. Check soil moisture levels.',
        icon: '☀️'
      });
    }

    // Wind-based insights
    if (currentWeather.windSpeed > 15) {
      insights.push({
        type: 'warning',
        category: 'protection',
        title: 'Strong Winds',
        message: 'Secure greenhouse structures. Support tall crops.',
        icon: '💨'
      });
    }

    return insights;
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode, size = '4x') {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  // Get weather condition emoji
  getWeatherEmoji(condition, icon) {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': icon?.includes('n') ? '☁️' : '⛅',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '😶‍🌫️'
    };
    
    return emojiMap[condition] || '🌤️';
  }

  // Convert wind direction degrees to compass direction
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

export const weatherAPI = new WeatherAPI();
export default weatherAPI;