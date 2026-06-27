/*
  Naveen Weather — app.js
  Phase 2: UI interaction only (no real API yet)

  Right now this file does TWO things:
  1. Listens for the search button click and Enter key press
  2. Shows a placeholder response (real API comes in Phase 3)
*/


// ── Grab DOM Elements ─────────────────────────────────────────────
// We get references to HTML elements ONCE at the top.
// This is more efficient than calling getElementById every time we need them.

const cityInput     = document.getElementById('cityInput');
const searchBtn     = document.getElementById('searchBtn');
const weatherCard   = document.getElementById('weatherCard');
const errorMessage  = document.getElementById('errorMessage');

// These are the elements inside the card we'll update with real data in Phase 3
const cityNameEl    = document.getElementById('cityName');
const countryNameEl = document.getElementById('countryName');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('weatherDescription');
const humidityEl    = document.getElementById('humidity');
const windSpeedEl   = document.getElementById('windSpeed');
const feelsLikeEl   = document.getElementById('feelsLike');
const weatherIconEl = document.getElementById('weatherIcon');


// ── Event Listeners ───────────────────────────────────────────────
// An event listener says: "When THIS event happens, run THIS function."

// 1. Click the search button
searchBtn.addEventListener('click', handleSearch);

// 2. Press Enter key while typing in the input box
// This is a UX improvement — users expect Enter to trigger search
cityInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
});


// ── Main Search Handler ────────────────────────────────────────────
/**
 * handleSearch()
 * Called when user clicks the search button or presses Enter.
 * Validates input, then triggers weather lookup.
 */
function handleSearch() {
  // .trim() removes leading/trailing whitespace
  // e.g. "  London  " becomes "London"
  const cityName = cityInput.value.trim();

  // Guard clause: if input is empty, do nothing
  if (cityName === '') {
    showError('Please enter a city name.');
    return; // Stop the function here — don't proceed
  }

  // Phase 3: Replace this placeholder with a real API call
  showPlaceholderData(cityName);
}


// ── UI Helper Functions ───────────────────────────────────────────
/**
 * showError(message)
 * Displays an error message and hides the weather card.
 * @param {string} message - The error text to display
 */
function showError(message) {
  errorMessage.textContent = message; // Set the error text
  errorMessage.classList.remove('hidden'); // Make it visible
  weatherCard.classList.add('hidden');    // Hide the weather card
}


/**
 * hideError()
 * Hides the error message.
 */
function hideError() {
  errorMessage.classList.add('hidden');
}


/**
 * showPlaceholderData(city)
 * TEMPORARY — Phase 2 only.
 * Simulates showing weather data without a real API.
 * This will be completely replaced in Phase 3.
 * @param {string} city - The city name the user typed
 */
function showPlaceholderData(city) {
  hideError(); // Clear any previous error

  // Update the card elements with placeholder values
  // In Phase 3, these values will come from the API response
  cityNameEl.textContent    = city;
  countryNameEl.textContent = '--';
  temperatureEl.textContent = '--°C';
  descriptionEl.textContent = 'Enter a city to see real data in Phase 3';
  humidityEl.textContent    = '--%';
  windSpeedEl.textContent   = '-- km/h';
  feelsLikeEl.textContent   = '--°C';

  // Show the weather card (remove the hidden class)
  weatherCard.classList.remove('hidden');

  // Clear the input after searching — good UX practice
  cityInput.value = '';
}
