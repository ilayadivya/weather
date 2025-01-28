import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css';

const Search = ({ username }) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null); // For hourly forecast
  const [fiveDayForecast, setFiveDayForecast] = useState(null); // For 5-day forecast
  const [severeAlerts, setSevereAlerts] = useState(null); // For severe weather alerts
  const [suggestions, setSuggestions] = useState([]);
  const [bgImage, setBgImage] = useState(''); // To hold the background image URL
  const [watchlist, setWatchlist] = useState([]); // Watchlist for saved locations

  const defaultLocation = 'New York'; // Default location

  useEffect(() => {
    // Fetch weather for the default location on initial load
    if (!location) {
      setLocation(defaultLocation);
    }
  }, [location]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const getCoordinates = async (locationName) => {
    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: locationName,
          key: '783ef1789b794f6983891d7d702d8953',
        },
      });

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        return { lat, lon: lng };
      } else {
        throw new Error('Location not found.');
      }
    } catch (err) {
      setError('Unable to get coordinates. Please try again.');
      console.error(err);
    }
  };

  const fetchBackgroundImage = async (weatherCondition) => {
    try {
      const query = weatherCondition.includes('sunny') || weatherCondition.includes('clear') 
                    ? 'sunny' 
                    : weatherCondition.includes('rain') || weatherCondition.includes('shower') 
                    ? 'rain' 
                    : weatherCondition.includes('cloudy') 
                    ? 'cloudy' 
                    : 'default';

      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: {
          query: query,
          client_id: 'bWg-vgpaHLpuzLLdCPmC85Nq_zUvdzc5W-h6Hz7iB6U', // Your Unsplash Access Key
          orientation: 'landscape',
        },
      });

      if (response.data.length > 0) {
        const imageUrl = response.data[0].urls.regular;  // Get the image URL
        setBgImage(imageUrl);
      }
    } catch (err) {
      console.error('Error fetching background image:', err);
    }
  };

  const handleLocationChange = async (e) => {
    const locationInput = e.target.value;
    setLocation(locationInput);

    if (locationInput.length > 2) {
      try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
          params: {
            q: locationInput,
            key: '783ef1789b794f6983891d7d702d8953',
          },
        });

        setSuggestions(response.data.results);
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!location) {
      setError('Please enter a location.');
      return;
    }

    try {
      setError('');
      const { lat, lon } = await getCoordinates(location);
      
      // Current weather
      const currentWeatherResponse = await axios.get('https://weatherbit-v1-mashape.p.rapidapi.com/current', {
        params: {
          lat,
          lon,
          units: 'imperial',
          lang: 'en',
        },
        headers: {
          'x-rapidapi-key': '28ace1a05cmsh9d80f1855b6310bp1d6d02jsnf39d0a9e481a',
          'x-rapidapi-host': 'weatherbit-v1-mashape.p.rapidapi.com',
        },
      });

      setWeatherData(currentWeatherResponse.data);

      // Fetch background image based on weather condition
      const weatherCondition = currentWeatherResponse.data.data[0].weather.description.toLowerCase();
      await fetchBackgroundImage(weatherCondition);

      // 1-hour or minutely updates
      const hourlyResponse = await axios.get('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/hourly', {
        params: {
          lat,
          lon,
          units: 'imperial',
          lang: 'en',
        },
        headers: {
          'x-rapidapi-key': '28ace1a05cmsh9d80f1855b6310bp1d6d02jsnf39d0a9e481a',
          'x-rapidapi-host': 'weatherbit-v1-mashape.p.rapidapi.com',
        },
      });

      setHourlyForecast(hourlyResponse.data);

      // 5-day forecast with hourly breakdown
      const fiveDayResponse = await axios.get('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/daily', {
        params: {
          lat,
          lon,
          units: 'imperial',
          lang: 'en',
        },
        headers: {
          'x-rapidapi-key': '28ace1a05cmsh9d80f1855b6310bp1d6d02jsnf39d0a9e481a',
          'x-rapidapi-host': 'weatherbit-v1-mashape.p.rapidapi.com',
        },
      });

      setFiveDayForecast(fiveDayResponse.data);

      // Severe weather alerts (if available)
      const alertResponse = await axios.get('https://weatherbit-v1-mashape.p.rapidapi.com/alerts', {
        params: {
          lat,
          lon,
        },
        headers: {
          'x-rapidapi-key': '28ace1a05cmsh9d80f1855b6310bp1d6d02jsnf39d0a9e481a',
          'x-rapidapi-host': 'weatherbit-v1-mashape.p.rapidapi.com',
        },
      });

      setSevereAlerts(alertResponse.data);
      
      setSuggestions([]);
    } catch (err) {
      setError('Unable to fetch weather data. Please try again.');
      console.error(err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion.formatted);
    setSuggestions([]);
  };

  const addToWatchlist = (location) => {
    if (!watchlist.includes(location)) {
      setWatchlist([...watchlist, location]);
    }
  };

  return (
    <div className="dashboard" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <header className="dashboard-header">
        <div className="logo">YourLogo</div>
        <div className="welcome">
          <span>Welcome, {username}</span>
          <button onClick={() => console.log("Logging out...")}>Logout</button>
        </div>
        <div className="menu-icon" onClick={toggleSidebar}>
          <span>☰</span>
        </div>
      </header>
      <div className="dashboard-main">
        {showSidebar && (
          <aside className="dashboard-sidebar">
            <nav>
              <ul>
                <li><a href="#search">Search</a></li>
                
              </ul>
            </nav>
          </aside>
        )}
        <main className="dashboard-content">
          <div className="search-container">
            <h2>Weather Search</h2>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter Location"
                  value={location}
                  onChange={handleLocationChange}
                />
                <button type="submit">Search</button>
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                        {suggestion.formatted}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
            {error && <div className="error-message">{error}</div>}
            
            {/* Current Weather */}
            {weatherData && (
              <div className="current-weather">
                <h3>Current Weather</h3>
                <p>{weatherData.data[0].weather.description}</p>
                <p>Temperature: {weatherData.data[0].temp}°F</p>
                <p>Humidity: {weatherData.data[0].rh}%</p>
                <p>Wind: {weatherData.data[0].wind_spd} mph</p>
              </div>
            )}

            {/* Hourly Forecast */}
            {hourlyForecast && (
              <div className="hourly-forecast">
                <h3>Hourly Forecast</h3>
                <ul>
                  {hourlyForecast.data.slice(0, 12).map((forecast, index) => (
                    <li key={index}>
                      {forecast.timestamp_local} - Temp: {forecast.temp}°F - {forecast.weather.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5-Day Forecast */}
            {fiveDayForecast && (
              <div className="five-day-forecast">
                <h3>5-Day Forecast</h3>
                <ul>
                  {fiveDayForecast.data.slice(0, 5).map((day, index) => (
                    <li key={index}>
                      {new Date(day.valid_date).toLocaleDateString()} - High: {day.temp.max}°F - Low: {day.temp.min}°F
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Severe Weather Alerts */}
            {severeAlerts && severeAlerts.alerts.length > 0 && (
              <div className="severe-alerts">
                <h3>Severe Weather Alerts</h3>
                <ul>
                  {severeAlerts.alerts.map((alert, index) => (
                    <li key={index}>{alert.event}: {alert.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Watchlist Button */}
            <button onClick={() => addToWatchlist(location)}>Add to Watchlist</button>

            {/* Watchlist */}
            {watchlist.length > 0 && (
              <div className="watchlist">
                <h3>Watchlist</h3>
                <ul>
                  {watchlist.map((location, index) => (
                    <li key={index}>{location}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Search;
