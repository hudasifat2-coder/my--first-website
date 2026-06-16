// OpenWeatherMap API endpoint
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = 'c8e7b8d92897a36d13c4c4fb8dfa7089'; // Free tier API key (limited requests)

// Get DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const suggestionsDiv = document.getElementById('suggestions');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast-section');
const errorMessage = document.getElementById('error-message');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    searchBtn.addEventListener('click', () => searchWeather());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
    locationBtn.addEventListener('click', getUserLocation);
    searchInput.addEventListener('input', handleSearchInput);
});

// Search weather by city name
async function searchWeather() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    try {
        // Get coordinates from city name
        const coordsResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
        );
        const coordsData = await coordsResponse.json();
        
        if (!coordsData.length) {
            showError('City not found. Please try another name.');
            hideLoading();
            return;
        }
        
        const { lat, lon, name, country } = coordsData[0];
        await fetchWeatherData(lat, lon, name, country);
        suggestionsDiv.classList.remove('show');
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
    hideLoading();
}

// Get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Get city name from coordinates
                    const reverseGeoResponse = await fetch(
                        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
                    );
                    const reverseGeoData = await reverseGeoResponse.json();
                    
                    const cityData = reverseGeoData[0] || {};
                    const name = cityData.name || 'Your Location';
                    const country = cityData.country || '';
                    
                    await fetchWeatherData(latitude, longitude, name, country);
                } catch (error) {
                    console.error('Error getting location:', error);
                    showError('Failed to get your location. Please try again.');
                }
                hideLoading();
            },
            (error) => {
                hideLoading();
                showError('Unable to access your location. Please enable location services.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
}

// Fetch weather data using coordinates
async function fetchWeatherData(lat, lon, name, country) {
    try {
        // Fetch current weather and forecast
        const weatherResponse = await fetch(
            `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();
        
        const forecastResponse = await fetch(
            `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        // Display weather data
        displayCurrentWeather(weatherData, name, country);
        displayForecast(forecastData);
        
        // Hide empty state
        emptyState.classList.add('hidden');
        hideError();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
}

// Display current weather
function displayCurrentWeather(data, cityName, country) {
    const weather = data.weather[0];
    const main = data.main;
    const wind = data.wind;
    const clouds = data.clouds;
    const sys = data.sys;
    const visibility = data.visibility / 1000; // Convert to km
    
    // Update location info
    document.getElementById('city-name').textContent = `${cityName}, ${country}`;
    document.getElementById('location-coords').textContent = 
        `${data.coord.lat.toFixed(2)}°N, ${data.coord.lon.toFixed(2)}°E`;
    
    // Update date
    const now = new Date();
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Update temperature
    document.getElementById('main-temp').textContent = Math.round(main.temp);
    document.getElementById('feels-like').textContent = `Feels like: ${Math.round(main.feels_like)}°C`;
    
    // Update weather description
    document.getElementById('weather-desc').textContent = 
        weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
    
    // Update weather details
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${wind.speed.toFixed(1)} m/s`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${visibility.toFixed(1)} km`;
    document.getElementById('wind-direction').textContent = `${wind.deg || 0}°`;
    document.getElementById('uv-index').textContent = (clouds.all / 10).toFixed(1);
    
    // Update sun times
    const sunriseTime = new Date(sys.sunrise * 1000);
    const sunsetTime = new Date(sys.sunset * 1000);
    document.getElementById('sunrise-time').textContent = sunriseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset-time').textContent = sunsetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Update weather icon
    const iconEmoji = getWeatherIcon(weather.main, weather.description);
    document.getElementById('weather-icon-large').textContent = iconEmoji;
    
    // Show current weather
    currentWeatherDiv.classList.remove('hidden');
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastCards = document.getElementById('forecast-cards');
    forecastCards.innerHTML = '';
    
    // Get one forecast per day (every 24 hours, starting from index 7 which is ~24 hours from now)
    const dailyForecasts = [];
    for (let i = 7; i < data.list.length; i += 8) {
        if (dailyForecasts.length < 5) {
            dailyForecasts.push(data.list[i]);
        }
    }
    
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const weather = forecast.weather[0];
        const main = forecast.main;
        const wind = forecast.wind;
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">
                ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div class="forecast-icon">${getWeatherIcon(weather.main, weather.description)}</div>
            <div class="forecast-temp">
                ${Math.round(main.temp_max)}°C / ${Math.round(main.temp_min)}°C
            </div>
            <div class="forecast-desc">
                ${weather.main}
            </div>
            <div class="forecast-details">
                <div>💧 ${main.humidity}%</div>
                <div>💨 ${wind.speed.toFixed(1)}m/s</div>
            </div>
        `;
        forecastCards.appendChild(card);
    });
    
    forecastSection.classList.remove('hidden');
}

// Get weather emoji based on weather condition
function getWeatherIcon(weatherMain, weatherDesc) {
    const main = weatherMain.toLowerCase();
    const desc = weatherDesc.toLowerCase();
    
    if (main.includes('clear') || main.includes('sunny')) return '☀️';
    if (main.includes('cloud')) {
        if (desc.includes('few')) return '🌤️';
        if (desc.includes('scattered')) return '⛅';
        return '☁️';
    }
    if (main.includes('rain') || main.includes('drizzle')) return '🌧️';
    if (main.includes('thunderstorm')) return '⛈️';
    if (main.includes('snow')) return '❄️';
    if (main.includes('mist') || main.includes('fog')) return '🌫️';
    if (main.includes('wind')) return '💨';
    
    return '🌤️';
}

// Handle search input with suggestions (basic implementation)
async function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.length > 0) {
            suggestionsDiv.innerHTML = '';
            data.forEach(location => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = `${location.name}, ${location.country}`;
                item.addEventListener('click', async () => {
                    searchInput.value = location.name;
                    await fetchWeatherData(location.lat, location.lon, location.name, location.country);
                    suggestionsDiv.classList.remove('show');
                });
                suggestionsDiv.appendChild(item);
            });
            suggestionsDiv.classList.add('show');
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

// Show/hide loading state
function showLoading() {
    loadingState.classList.remove('hidden');
    currentWeatherDiv.classList.add('hidden');
    forecastSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

// Show/hide error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    currentWeatherDiv.classList.add('hidden');
    forecastSection.classList.add('hidden');
    loadingState.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}
