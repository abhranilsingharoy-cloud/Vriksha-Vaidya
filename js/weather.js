// ── FILE: js/weather.js ─────────────────────────────
import { CONFIG } from './config.js';

export class WeatherService {
  constructor() {
    this.cacheKey = 'weather-cache';
  }

  async getSpreadRisk(diseaseEntry) {
    if (diseaseEntry.isHealthy) return null;

    try {
      const position = await this.getPosition();
      const weather = await this.fetchWeather(position.coords.latitude, position.coords.longitude);
      
      if (!weather) return null;

      const temp = weather.main.temp;
      const humidity = weather.main.humidity;
      
      // Calculate risk based on conditions
      // This is a simplified agronomic model
      let risk = 'Low';
      if (humidity > 70 && temp >= 15 && temp <= 30) {
        risk = 'High';
      } else if (humidity > 50 || (temp >= 15 && temp <= 30)) {
        risk = 'Medium';
      }
      
      // Adjust based on baseline disease risk
      if (diseaseEntry.spreadRisk === 'High' && risk !== 'Low') risk = 'High';

      return {
        risk: risk,
        humidity: humidity,
        temp: Math.round(temp),
        conditions: weather.weather[0].main,
        message: this.formatMessage(risk, humidity, temp, diseaseEntry.disease)
      };

    } catch (err) {
      console.warn('Weather service unavailable:', err.message);
      return this.handleDenied();
    }
  }

  getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 60000
      });
    });
  }

  async fetchWeather(lat, lon) {
    // Check cache
    const cached = localStorage.getItem(this.cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CONFIG.WEATHER_CACHE_TTL) {
        return data.weather;
      }
    }

    // In a real app with a real API key:
    // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.WEATHER_API_KEY}`;
    // const res = await fetch(url);
    // const json = await res.json();
    
    // Mock response for this frontend-only demo
    const mockWeather = {
      main: {
        temp: 24 + Math.random() * 5 - 2,
        humidity: 65 + Math.random() * 20 - 10
      },
      weather: [{ main: 'Partly Cloudy' }]
    };
    
    localStorage.setItem(this.cacheKey, JSON.stringify({
      timestamp: Date.now(),
      weather: mockWeather
    }));

    return mockWeather;
  }

  handleDenied() {
    return null; // Graceful degradation
  }

  formatMessage(risk, humidity, temp, diseaseName) {
    if (risk === 'High') {
      return `Warning: Current local conditions (${temp}°C, ${humidity}% humidity) are highly favourable for the rapid spread of ${diseaseName}. Immediate preventative action recommended.`;
    } else if (risk === 'Medium') {
      return `Notice: Moderate risk of spread. Continue monitoring plants closely. Conditions are somewhat favourable for ${diseaseName}.`;
    } else {
      return `Good news: Current weather conditions are not optimal for the spread of ${diseaseName}.`;
    }
  }
}
