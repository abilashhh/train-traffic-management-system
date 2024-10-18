import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherWidget = ({ station }) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!station) return;

      // Extract the first word from the station name
      const city = station.split(' ')[0];

      try {
        const API_KEY = '17007a1b5017e13f03491cc252a2941e'; 
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        setWeather(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Weather data unavailable');
        setWeather(null);
      }
    };

    fetchWeather();
  }, [station]);

  if (error) {
    return <div className="weather-widget error">{error}</div>;
  }

  if (!weather) {
    return <div className="weather-widget loading">Loading weather...</div>;
  }

  return (
    <div className="weather-widget">
      <span>{weather.main.temp.toFixed(1)}°C</span>
      <span>{weather.weather[0].description}</span>
    </div>
  );
};

export default WeatherWidget;