/*
  Naveen Weather — app.js
  Phase 3: Live Weather API Integration

  Flow:
  1. User types a city and presses Search / Enter
  2. We call fetchWeather(city)
  3. fetchWeather() makes an HTTP GET request to OpenWeatherMap API
  4. We receive JSON data and pass it to displayWeather()
  5. displayWeather() updates the card elements with real data
  6. If anything goes wrong (bad city, no internet), we show an error
*/


// ── API Configuration ─────────────────────────────────────────────
/*
  IMPORTANT: In a production app, API keys are NEVER hardcoded in frontend JS.
  Anyone can open browser DevTools and steal your key.
  
  For Phase 3 (frontend-only learning), we put it here.
  In Phase 6 (Spring Boot backend), the key will live on the server side — safe.
  
  Replace the value below with YOUR key from openweathermap.org
*/
const API_KEY  = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const UNITS    = 'metric'; // "metric" = Celsius. "imperial" = Fahrenheit


// ── Grab DOM Elements ─────────────────────────────────────────────
// Grabbed once at the top — efficient and clean.

const cityInput     = document.getElementById('cityInput');
const searchBtn     = document.getElementById('searchBtn');
const weatherCard   = document.getElementById('weatherCard');
const errorMessage  = document.getElementById('errorMessage');
const cityNameEl    = document.getElementById('cityName');
const countryNameEl = document.getElementById('countryName');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('weatherDescription');
const humidityEl    = document.getElementById('humidity');
const windSpeedEl   = document.getElementById('windSpeed');
const feelsLikeEl   = document.getElementById('feelsLike');
const weatherIconEl = document.getElementById('weatherIcon');


// ── Event Listeners ───────────────────────────────────────────────

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
});


// ── Main Search Handler ────────────────────────────────────────────
/**
 * handleSearch()
 * Validates input then triggers the API fetch.
 */
function handleSearch() {
  const cityName = cityInput.value.trim();

  if (cityName === '') {
    showError('Please enter a city name.');
    return;
  }

  fetchWeather(cityName);
}


// ── API Fetch Function ─────────────────────────────────────────────
/**
 * fetchWeather(city)
 *
 * Makes an HTTP GET request to OpenWeatherMap API.
 * Uses the modern "fetch" API which returns a Promise.
 *
 * What is a Promise?
 * A Promise is JavaScript's way of handling async operations.
 * "I promise to give you the weather data... eventually."
 * While waiting, the browser doesn't freeze — it keeps running.
 *
 * async/await is the clean way to work with Promises.
 * "await" means: pause HERE and wait for the result before continuing.
 *
 * @param {string} city - The city name to look up
 */
async function fetchWeather(city) {
  // Show loading state while we wait for the API response
  showLoading();

  // Build the full API URL dynamically
  // encodeURIComponent handles cities with spaces: "New York" → "New%20York"
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;
  /*
    Template literals (backticks) let us embed variables inside strings.
    ${variable} is replaced with the actual value.
    This is cleaner than "BASE_URL + '?q=' + city + ..."
  */

  try {
    /*
      try/catch is error handling.
      "try" the code that might fail.
      "catch" runs if anything inside "try" throws an error.
      This prevents the whole app from crashing on a network error.
    */

    // Step 1: Make the HTTP request
    const response = await fetch(url);
    /*
      fetch() returns a Response object — not the data yet.
      It tells us: did the server reply? What was the status code?
      await makes JavaScript wait here until the server responds.
    */

    // Step 2: Check if the server returned an error status
    if (!response.ok) {
      /*
        response.ok is true for status codes 200-299 (success).
        For status 404 (city not found) or 401 (bad API key), it's false.
        
        HTTP Status codes you'll see often:
        200 → OK (success)
        401 → Unauthorized (wrong API key)
        404 → Not Found (city doesn't exist)
        500 → Server Error (OpenWeather's problem, not ours)
      */
      if (response.status === 404) {
        showError(`City "${city}" not found. Check the spelling and try again.`);
      } else if (response.status === 401) {
        showError('Invalid API key. Please check your configuration.');
      } else {
        showError(`Something went wrong. Server responded with status ${response.status}.`);
      }
      return; // Stop here — don't try to read data from a failed response
    }

    // Step 3: Parse the response body as JSON
    const data = await response.json();
    /*
      response.json() reads the response body and converts it from
      raw text into a JavaScript object we can work with.
      Also async — we await it too.
    */

    // Step 4: Display the data on the page
    displayWeather(data);

  } catch (error) {
    /*
      This catch block handles NETWORK errors — things like:
      - No internet connection
      - DNS lookup failure
      - Request timed out
      
      These are different from HTTP errors (handled above with !response.ok).
    */
    console.error('Network error:', error);
    showError('Network error. Please check your internet connection.');
  }
}


// ── Display Weather Data ──────────────────────────────────────────
/**
 * displayWeather(data)
 *
 * Takes the raw JSON from OpenWeatherMap and updates the UI.
 *
 * Example of the data object structure we receive:
 * {
 *   name: "Chennai",
 *   sys: { country: "IN" },
 *   main: { temp: 35, feels_like: 38, humidity: 78 },
 *   weather: [{ description: "haze", icon: "50d" }],
 *   wind: { speed: 5.2 }
 * }
 *
 * @param {Object} data - The parsed JSON response from the API
 */
function displayWeather(data) {
  // Destructure the data object for cleaner access
  // Instead of data.main.temp, we can write just temp
  const {
    name,                                    // City name: "Chennai"
    sys: { country },                        // Country code: "IN"
    main: { temp, feels_like, humidity },    // Temperature data
    weather: [{ description, icon }],        // Weather condition (array, we take first)
    wind: { speed }                          // Wind speed in m/s
  } = data;

  // Update each element in the card
  cityNameEl.textContent    = name;
  countryNameEl.textContent = country;
  temperatureEl.textContent = `${Math.round(temp)}°C`;
  /*
    Math.round() rounds 18.67 → 19. API gives decimals, we show whole numbers.
  */
  descriptionEl.textContent = description; // "haze", "clear sky", "light rain"
  humidityEl.textContent    = `${humidity}%`;
  feelsLikeEl.textContent   = `${Math.round(feels_like)}°C`;

  // Wind: API returns m/s, we convert to km/h (multiply by 3.6)
  const windKmh = Math.round(speed * 3.6);
  windSpeedEl.textContent   = `${windKmh} km/h`;

  // Build the icon URL from the icon code
  // OpenWeatherMap icon codes look like "04d" (04 = cloud type, d = daytime)
  // @2x gives us the double-resolution (retina) version
  weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIconEl.alt = description; // Update alt text for accessibility

  // Show the card, clear any error
  hideError();
  weatherCard.classList.remove('hidden');

  // Clear the search input
  cityInput.value = '';
}


// ── UI State Helper Functions ─────────────────────────────────────

/**
 * showLoading()
 * Updates the UI to a loading/searching state.
 * Prevents showing stale data while the new request is in flight.
 */
function showLoading() {
  hideError();
  weatherCard.classList.remove('hidden');

  // Reset card content to loading placeholders
  cityNameEl.textContent    = 'Searching...';
  countryNameEl.textContent = '';
  temperatureEl.textContent = '--°C';
  descriptionEl.textContent = 'Fetching weather data';
  humidityEl.textContent    = '--%';
  windSpeedEl.textContent   = '-- km/h';
  feelsLikeEl.textContent   = '--°C';
  weatherIconEl.src         = '';
}

/**
 * showError(message)
 * Displays an error message and hides the weather card.
 * @param {string} message - Error text to display
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  weatherCard.classList.add('hidden');
}

/**
 * hideError()
 * Hides the error message banner.
 */
function hideError() {
  errorMessage.classList.add('hidden');
}
