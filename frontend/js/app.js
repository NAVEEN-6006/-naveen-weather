/*
  Naveen Weather — app.js
  Phase 4: Loading Spinner + Dynamic Weather Themes + UI Polish

  What's new in Phase 4:
  - showLoading() now shows a real CSS spinner inside the card
  - After data loads, spinner is hidden and content is revealed
  - applyWeatherTheme() reads the weather condition and swaps a CSS class
    on <body> to change the entire page gradient dynamically
*/


// ── API Configuration ─────────────────────────────────────────────
const API_KEY  = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const UNITS    = 'metric';


// ── DOM Element References ────────────────────────────────────────
const cityInput        = document.getElementById('cityInput');
const searchBtn        = document.getElementById('searchBtn');
const weatherCard      = document.getElementById('weatherCard');
const errorMessage     = document.getElementById('errorMessage');
const loadingSpinner   = document.getElementById('loadingSpinner');
const weatherContent   = document.getElementById('weatherContent');

// Weather data display elements
const cityNameEl       = document.getElementById('cityName');
const countryNameEl    = document.getElementById('countryName');
const temperatureEl    = document.getElementById('temperature');
const descriptionEl    = document.getElementById('weatherDescription');
const humidityEl       = document.getElementById('humidity');
const windSpeedEl      = document.getElementById('windSpeed');
const feelsLikeEl      = document.getElementById('feelsLike');
const weatherIconEl    = document.getElementById('weatherIcon');


// ── Theme Map ─────────────────────────────────────────────────────
/*
  OpenWeatherMap returns a numeric "id" for weather conditions.
  Reference: https://openweathermap.org/weather-conditions
  
  We map ranges of condition IDs to our CSS theme class names.
  
  ID ranges:
  2xx → Thunderstorm
  3xx → Drizzle
  5xx → Rain
  6xx → Snow
  7xx → Atmosphere (mist, fog, haze, smoke)
  800 → Clear sky
  80x → Clouds
*/
const WEATHER_THEMES = {
  thunderstorm: 'theme-stormy',  // 200–232
  drizzle:      'theme-rainy',   // 300–321
  rain:         'theme-rainy',   // 500–531
  snow:         'theme-snowy',   // 600–622
  atmosphere:   'theme-cloudy',  // 700–781 (mist, haze, fog, smoke)
  clear:        'theme-sunny',   // 800
  clouds:       'theme-cloudy',  // 801–804
  night:        'theme-night',   // any condition at night (icon ends in 'n')
};

// All theme class names — used to remove the previous theme before adding new one
const ALL_THEME_CLASSES = Object.values(WEATHER_THEMES);


// ── Event Listeners ───────────────────────────────────────────────
searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
});


// ── Main Handler ──────────────────────────────────────────────────
function handleSearch() {
  const cityName = cityInput.value.trim();

  if (cityName === '') {
    showError('Please enter a city name.');
    return;
  }

  fetchWeather(cityName);
}


// ── API Fetch ─────────────────────────────────────────────────────
async function fetchWeather(city) {
  showLoading(); // Show spinner, disable button

  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        showError(`City "${city}" not found. Check the spelling and try again.`);
      } else if (response.status === 401) {
        showError('Invalid API key. Please check your configuration.');
      } else {
        showError(`Something went wrong. Status: ${response.status}`);
      }
      return;
    }

    const data = await response.json();
    displayWeather(data);

  } catch (error) {
    console.error('Network error:', error);
    showError('Network error. Please check your internet connection.');
  } finally {
    /*
      "finally" runs whether the try succeeded OR the catch ran.
      We always want to re-enable the search button after the request completes.
      Without finally, a failed request would leave the button permanently disabled.
    */
    searchBtn.disabled = false;
  }
}


// ── Display Weather ───────────────────────────────────────────────
/**
 * displayWeather(data)
 * Populates the card with real weather data and applies the theme.
 */
function displayWeather(data) {
  const {
    name,
    sys:     { country },
    main:    { temp, feels_like, humidity },
    weather: [{ description, icon, id: conditionId }],
    /*
      "id: conditionId" — we rename "id" to "conditionId" to be more descriptive.
      The weather condition ID (e.g., 800 = clear sky) determines the theme.
    */
    wind:    { speed }
  } = data;

  // Update card text content
  cityNameEl.textContent    = name;
  countryNameEl.textContent = country;
  temperatureEl.textContent = `${Math.round(temp)}°C`;
  descriptionEl.textContent = description;
  humidityEl.textContent    = `${humidity}%`;
  feelsLikeEl.textContent   = `${Math.round(feels_like)}°C`;

  const windKmh             = Math.round(speed * 3.6);
  windSpeedEl.textContent   = `${windKmh} km/h`;

  // Update weather icon
  weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIconEl.alt = description;

  // Apply dynamic theme based on weather condition
  applyWeatherTheme(conditionId, icon);

  // Transition: hide spinner, show content
  hideError();
  loadingSpinner.classList.add('hidden');
  weatherContent.classList.remove('hidden');

  cityInput.value = '';
}


// ── Theme Engine ──────────────────────────────────────────────────
/**
 * applyWeatherTheme(conditionId, icon)
 *
 * Reads the weather condition ID and the icon code,
 * determines the right theme, then swaps the class on <body>.
 *
 * @param {number} conditionId - OpenWeatherMap condition ID (e.g. 800)
 * @param {string} icon        - Icon code like "01d" or "01n"
 */
function applyWeatherTheme(conditionId, icon) {
  // Check if it's nighttime — icon codes ending in 'n' = night
  const isNight = icon.endsWith('n');

  let themeName;

  if (isNight) {
    themeName = WEATHER_THEMES.night;
  } else if (conditionId >= 200 && conditionId < 300) {
    themeName = WEATHER_THEMES.thunderstorm;
  } else if (conditionId >= 300 && conditionId < 400) {
    themeName = WEATHER_THEMES.drizzle;
  } else if (conditionId >= 500 && conditionId < 600) {
    themeName = WEATHER_THEMES.rain;
  } else if (conditionId >= 600 && conditionId < 700) {
    themeName = WEATHER_THEMES.snow;
  } else if (conditionId >= 700 && conditionId < 800) {
    themeName = WEATHER_THEMES.atmosphere;
  } else if (conditionId === 800) {
    themeName = WEATHER_THEMES.clear;
  } else {
    themeName = WEATHER_THEMES.clouds; // 801–804
  }

  // Remove ALL existing theme classes from body first
  // Then add only the new one
  // This prevents themes from stacking on top of each other
  document.body.classList.remove(...ALL_THEME_CLASSES);
  /*
    Spread operator (...) expands the array into individual arguments.
    classList.remove('theme-sunny', 'theme-rainy', 'theme-cloudy', ...)
    is the same as classList.remove(...ALL_THEME_CLASSES)
  */
  document.body.classList.add(themeName);
}


// ── UI State Helpers ──────────────────────────────────────────────

/**
 * showLoading()
 * Prepares the UI for a pending API request:
 * - Shows the weather card with spinner
 * - Hides weather content
 * - Disables the search button to prevent spam clicks
 */
function showLoading() {
  hideError();

  // Show card shell with spinner visible, content hidden
  weatherCard.classList.remove('hidden');
  loadingSpinner.classList.remove('hidden');
  weatherContent.classList.add('hidden');

  // Disable the search button while request is in flight
  searchBtn.disabled = true;
  /*
    Why disable the button? If the user clicks 5 times quickly,
    5 API requests fire in parallel. The results arrive out of order
    and the UI flickers. Disabling prevents this "race condition."
  */
}

/**
 * showError(message)
 * Displays an error message and fully hides the weather card.
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  weatherCard.classList.add('hidden');
  searchBtn.disabled = false;
}

/**
 * hideError()
 * Hides the error message banner.
 */
function hideError() {
  errorMessage.classList.add('hidden');
}
