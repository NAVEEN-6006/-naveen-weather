/**
 * Naveen Weather — app.js  (Production Upgrade)
 *
 * Features:
 *  - Live weather via OpenWeatherMap API
 *  - °C / °F unit toggle
 *  - Current location (Geolocation API)
 *  - Recent search history (localStorage)
 *  - Favourite cities (localStorage)
 *  - Dynamic weather themes
 *  - Skeleton loader + fade animations
 *  - Full error handling (network, 404, 401, timeout, rate limit)
 *  - Sunrise / Sunset, Visibility, Pressure, Wind Direction
 *  - Accessible ARIA live regions
 */

'use strict';

/* ── Configuration ──────────────────────────────────────────────── */
const CONFIG = {
  // NOTE: For Phase 6 (Spring Boot backend), this key moves server-side.
  // A backend proxy endpoint will replace this direct API call.
  API_KEY:  '6691a3d4db95cbea6b52ac849127da42',
  BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
  TIMEOUT_MS: 8000,        // Abort fetch after 8 seconds
  MAX_RECENT:  5,           // Max recent searches to store
  MAX_FAVS:    8,           // Max favourite cities
  STORAGE_KEYS: {
    RECENT:    'nw_recent',
    FAVS:      'nw_favs',
    UNIT:      'nw_unit',
  },
};

/* ── State ──────────────────────────────────────────────────────── */
const state = {
  unit:         'metric',   // 'metric' (°C) | 'imperial' (°F)
  lastData:     null,       // Last successful API response (for unit toggle re-render)
  isFetching:   false,      // Guard against duplicate requests
};

/* ── DOM References ─────────────────────────────────────────────── */
const el = {
  cityInput:       document.getElementById('cityInput'),
  searchBtn:       document.getElementById('searchBtn'),
  locationBtn:     document.getElementById('locationBtn'),
  btnCelsius:      document.getElementById('btnCelsius'),
  btnFahrenheit:   document.getElementById('btnFahrenheit'),

  weatherCard:     document.getElementById('weatherCard'),
  skeletonLoader:  document.getElementById('skeletonLoader'),
  weatherContent:  document.getElementById('weatherContent'),

  errorCard:       document.getElementById('errorCard'),
  errorIcon:       document.getElementById('errorIcon'),
  errorTitle:      document.getElementById('errorTitle'),
  errorMessage:    document.getElementById('errorMessage'),

  cityName:        document.getElementById('cityName'),
  weatherDate:     document.getElementById('weatherDate'),
  countryName:     document.getElementById('countryName'),
  favBtn:          document.getElementById('favBtn'),
  weatherIcon:     document.getElementById('weatherIcon'),
  temperature:     document.getElementById('temperature'),
  weatherDescription: document.getElementById('weatherDescription'),
  humidity:        document.getElementById('humidity'),
  windSpeed:       document.getElementById('windSpeed'),
  feelsLike:       document.getElementById('feelsLike'),
  visibility:      document.getElementById('visibility'),
  pressure:        document.getElementById('pressure'),
  windDirection:   document.getElementById('windDirection'),
  sunrise:         document.getElementById('sunrise'),
  sunset:          document.getElementById('sunset'),

  recentSection:   document.getElementById('recentSection'),
  recentList:      document.getElementById('recentList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),

  favSection:      document.getElementById('favSection'),
  favList:         document.getElementById('favList'),
};

/* ── Theme Map ──────────────────────────────────────────────────── */
const THEME_MAP = [
  { range: [200, 299], theme: 'theme-stormy'  },
  { range: [300, 399], theme: 'theme-rainy'   },
  { range: [500, 599], theme: 'theme-rainy'   },
  { range: [600, 699], theme: 'theme-snowy'   },
  { range: [700, 781], theme: 'theme-haze'    },
  { range: [800, 800], theme: 'theme-sunny'   },
  { range: [801, 804], theme: 'theme-cloudy'  },
];

const ALL_THEMES = THEME_MAP.map(t => t.theme).concat(['theme-night']);

/* ── Wind Direction Helper ──────────────────────────────────────── */
const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

function degreesToDirection(deg) {
  return WIND_DIRS[Math.round(deg / 22.5) % 16];
}

/* ── Time Formatter ─────────────────────────────────────────────── */
function formatTime(unixTimestamp, timezoneOffsetSec) {
  // Convert UTC unix timestamp to local city time
  const utcMs       = unixTimestamp * 1000;
  const offsetMs    = timezoneOffsetSec * 1000;
  const localDate   = new Date(utcMs + offsetMs);
  const hours       = localDate.getUTCHours();
  const minutes     = String(localDate.getUTCMinutes()).padStart(2, '0');
  const ampm        = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(unixTimestamp, timezoneOffsetSec) {
  const localDate = new Date((unixTimestamp + timezoneOffsetSec) * 1000);
  return localDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    timeZone: 'UTC',
  });
}

/* ── Temperature Converter ──────────────────────────────────────── */
function convertTemp(celsius) {
  if (state.unit === 'imperial') return Math.round((celsius * 9 / 5) + 32);
  return Math.round(celsius);
}

function unitSymbol() {
  return state.unit === 'imperial' ? '°F' : '°C';
}

/* ─────────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────────── */
function init() {
  // Restore saved unit preference
  const savedUnit = localStorage.getItem(CONFIG.STORAGE_KEYS.UNIT);
  if (savedUnit === 'imperial') setUnit('imperial', false);

  renderRecent();
  renderFavs();
  bindEvents();
}

/* ── Event Binding ──────────────────────────────────────────────── */
function bindEvents() {
  el.searchBtn.addEventListener('click', handleSearch);

  el.cityInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });

  el.locationBtn.addEventListener('click', handleLocation);

  el.btnCelsius.addEventListener('click',    () => setUnit('metric'));
  el.btnFahrenheit.addEventListener('click', () => setUnit('imperial'));

  el.clearHistoryBtn.addEventListener('click', clearHistory);

  el.favBtn.addEventListener('click', toggleFavourite);
}

/* ─────────────────────────────────────────────────────────────────
   SEARCH & FETCH
───────────────────────────────────────────────────────────────── */
function handleSearch() {
  const city = el.cityInput.value.trim();
  if (!city) {
    showError('empty', '');
    return;
  }
  fetchWeatherByCity(city);
}

function handleLocation() {
  if (!navigator.geolocation) {
    showError('location', '');
    return;
  }

  el.locationBtn.disabled = true;
  showSkeleton();

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      fetchWeatherByCoords(lat, lon);
      el.locationBtn.disabled = false;
    },
    err => {
      el.locationBtn.disabled = false;
      const msg = err.code === 1
        ? 'Location access denied. Please enable location permissions.'
        : 'Unable to retrieve your location. Try searching manually.';
      showError('location', msg);
    },
    { timeout: 10000 }
  );
}

async function fetchWeatherByCity(city) {
  const url = `${CONFIG.BASE_URL}?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric`;
  await fetchWeather(url, city);
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `${CONFIG.BASE_URL}?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=metric`;
  await fetchWeather(url, null);
}

async function fetchWeather(url, cityQuery) {
  // Guard: prevent duplicate requests
  if (state.isFetching) return;
  state.isFetching = true;

  showSkeleton();

  // AbortController lets us cancel the fetch if it takes too long
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      handleHttpError(response.status, cityQuery);
      return;
    }

    const data = await response.json();
    state.lastData = data;

    displayWeather(data);

    if (cityQuery) saveRecentSearch(data.name);
    el.cityInput.value = '';

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      showError('timeout', '');
    } else {
      showError('network', '');
    }
    console.error('[Naveen Weather]', err);

  } finally {
    state.isFetching = false;
  }
}

/* ── HTTP Error Handler ─────────────────────────────────────────── */
function handleHttpError(status, city) {
  switch (status) {
    case 404:
      showError('notfound', city || 'this location');
      break;
    case 401:
      showError('auth', '');
      break;
    case 429:
      showError('ratelimit', '');
      break;
    default:
      showError('server', String(status));
  }
}

/* ─────────────────────────────────────────────────────────────────
   DISPLAY
───────────────────────────────────────────────────────────────── */
function displayWeather(data) {
  const {
    name,
    sys:     { country, sunrise: sunriseUnix, sunset: sunsetUnix },
    main:    { temp, feels_like, humidity, pressure },
    weather: [{ description, icon, id: conditionId }],
    wind:    { speed, deg: windDeg = 0 },
    visibility: visibilityM = null,
    timezone,
    dt,
  } = data;

  // Populate text fields
  el.cityName.textContent          = name;
  el.countryName.textContent       = country;
  el.weatherDate.textContent       = formatDate(dt, timezone);
  el.temperature.textContent       = `${convertTemp(temp)}${unitSymbol()}`;
  el.weatherDescription.textContent = description;
  el.humidity.textContent          = `${humidity}%`;
  el.feelsLike.textContent         = `${convertTemp(feels_like)}${unitSymbol()}`;
  el.pressure.textContent          = `${pressure} hPa`;
  el.windDirection.textContent     = degreesToDirection(windDeg);
  el.sunrise.textContent           = formatTime(sunriseUnix, timezone);
  el.sunset.textContent            = formatTime(sunsetUnix, timezone);

  // Wind speed: API returns m/s. Convert based on unit.
  const windDisplay = state.unit === 'imperial'
    ? `${Math.round(speed * 2.237)} mph`
    : `${Math.round(speed * 3.6)} km/h`;
  el.windSpeed.textContent = windDisplay;

  // Visibility: API returns metres, show in km
  el.visibility.textContent = visibilityM !== null
    ? `${(visibilityM / 1000).toFixed(1)} km`
    : '--';

  // Weather icon
  el.weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  el.weatherIcon.alt = description;

  // Favourite button state
  updateFavBtn(name);

  // Apply dynamic background theme
  applyTheme(conditionId, icon);

  // Show content, hide skeleton
  hideSkeleton();
  hideError();
  el.weatherCard.classList.remove('hidden');
  el.weatherContent.classList.remove('hidden');
}

/* ── Unit Toggle ────────────────────────────────────────────────── */
function setUnit(unit, rerender = true) {
  if (state.unit === unit) return;
  state.unit = unit;

  localStorage.setItem(CONFIG.STORAGE_KEYS.UNIT, unit);

  el.btnCelsius.classList.toggle('active',    unit === 'metric');
  el.btnFahrenheit.classList.toggle('active', unit === 'imperial');
  el.btnCelsius.setAttribute('aria-pressed',    String(unit === 'metric'));
  el.btnFahrenheit.setAttribute('aria-pressed', String(unit === 'imperial'));

  // Re-render with same data if available
  if (rerender && state.lastData) displayWeather(state.lastData);
}

/* ── Theme Engine ───────────────────────────────────────────────── */
function applyTheme(conditionId, icon) {
  const isNight = icon.endsWith('n');

  let theme = 'theme-cloudy'; // default fallback

  if (isNight) {
    theme = 'theme-night';
  } else {
    const match = THEME_MAP.find(
      t => conditionId >= t.range[0] && conditionId <= t.range[1]
    );
    if (match) theme = match.theme;
  }

  document.body.classList.remove(...ALL_THEMES);
  document.body.classList.add(theme);
}

/* ─────────────────────────────────────────────────────────────────
   ERROR DISPLAY
───────────────────────────────────────────────────────────────── */
const ERROR_CONFIGS = {
  empty: {
    icon: '🔍',
    title: 'Enter a city name',
    message: 'Type a city name in the search box and press Search.',
  },
  notfound: {
    icon: '🗺️',
    title: 'City not found',
    message: (city) => `"${city}" could not be found. Check the spelling and try again.`,
  },
  auth: {
    icon: '🔑',
    title: 'API key error',
    message: 'The weather service key is invalid. Please check configuration.',
  },
  ratelimit: {
    icon: '⏱️',
    title: 'Too many requests',
    message: 'Request limit reached. Please wait a moment and try again.',
  },
  timeout: {
    icon: '⏳',
    title: 'Request timed out',
    message: 'The weather service took too long to respond. Check your connection.',
  },
  network: {
    icon: '📡',
    title: 'Network error',
    message: 'No internet connection detected. Please check your network.',
  },
  server: {
    icon: '🛠️',
    title: 'Server error',
    message: (code) => `The weather service returned an error (${code}). Try again shortly.`,
  },
  location: {
    icon: '📍',
    title: 'Location unavailable',
    message: (msg) => msg || 'Unable to access your location.',
  },
};

function showError(type, detail) {
  const cfg = ERROR_CONFIGS[type] || ERROR_CONFIGS.server;

  el.errorIcon.textContent  = cfg.icon;
  el.errorTitle.textContent = cfg.title;
  el.errorMessage.textContent = typeof cfg.message === 'function'
    ? cfg.message(detail)
    : cfg.message;

  el.errorCard.classList.remove('hidden');
  el.weatherCard.classList.add('hidden');
  el.searchBtn.disabled    = false;
  el.locationBtn.disabled  = false;
}

function hideError() {
  el.errorCard.classList.add('hidden');
}

/* ─────────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────────── */
function showSkeleton() {
  hideError();
  el.weatherCard.classList.remove('hidden');
  el.skeletonLoader.classList.remove('hidden');
  el.weatherContent.classList.add('hidden');
  el.searchBtn.disabled   = true;
  el.locationBtn.disabled = true;
}

function hideSkeleton() {
  el.skeletonLoader.classList.add('hidden');
  el.searchBtn.disabled   = false;
  el.locationBtn.disabled = false;
}

/* ─────────────────────────────────────────────────────────────────
   RECENT SEARCHES  (localStorage)
───────────────────────────────────────────────────────────────── */
function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT)) || [];
  } catch { return []; }
}

function saveRecentSearch(city) {
  let recent = getRecent().filter(c => c.toLowerCase() !== city.toLowerCase());
  recent.unshift(city);                        // add to front
  recent = recent.slice(0, CONFIG.MAX_RECENT); // keep max 5
  localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT, JSON.stringify(recent));
  renderRecent();
}

function clearHistory() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.RECENT);
  renderRecent();
}

function renderRecent() {
  const recent = getRecent();
  if (recent.length === 0) {
    el.recentSection.classList.add('hidden');
    return;
  }

  el.recentSection.classList.remove('hidden');
  el.recentList.innerHTML = '';

  recent.forEach(city => {
    const chip = document.createElement('button');
    chip.className   = 'recent-chip';
    chip.setAttribute('role', 'listitem');
    chip.setAttribute('aria-label', `Search ${city}`);
    chip.textContent = city;
    chip.addEventListener('click', () => fetchWeatherByCity(city));
    el.recentList.appendChild(chip);
  });
}

/* ─────────────────────────────────────────────────────────────────
   FAVOURITE CITIES  (localStorage)
───────────────────────────────────────────────────────────────── */
function getFavs() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVS)) || [];
  } catch { return []; }
}

function toggleFavourite() {
  if (!state.lastData) return;

  const city = state.lastData.name;
  let favs   = getFavs();
  const idx  = favs.findIndex(c => c.toLowerCase() === city.toLowerCase());

  if (idx === -1) {
    if (favs.length >= CONFIG.MAX_FAVS) {
      // Remove oldest favourite to make room
      favs.pop();
    }
    favs.unshift(city);
    el.favBtn.classList.add('is-favourite');
    el.favBtn.setAttribute('aria-label', `Remove ${city} from favourites`);
    el.favBtn.textContent = '★';
  } else {
    favs.splice(idx, 1);
    el.favBtn.classList.remove('is-favourite');
    el.favBtn.setAttribute('aria-label', `Add ${city} to favourites`);
    el.favBtn.textContent = '☆';
  }

  localStorage.setItem(CONFIG.STORAGE_KEYS.FAVS, JSON.stringify(favs));
  renderFavs();
}

function updateFavBtn(city) {
  const isFav = getFavs().some(c => c.toLowerCase() === city.toLowerCase());
  el.favBtn.classList.toggle('is-favourite', isFav);
  el.favBtn.textContent = isFav ? '★' : '☆';
  el.favBtn.setAttribute('aria-label',
    isFav ? `Remove ${city} from favourites` : `Add ${city} to favourites`
  );
}

function renderFavs() {
  const favs = getFavs();
  if (favs.length === 0) {
    el.favSection.classList.add('hidden');
    return;
  }

  el.favSection.classList.remove('hidden');
  el.favList.innerHTML = '';

  favs.forEach(city => {
    const chip = document.createElement('button');
    chip.className   = 'fav-chip';
    chip.setAttribute('role', 'listitem');
    chip.setAttribute('aria-label', `Search weather for ${city}`);
    chip.innerHTML   = `⭐ ${city}`;
    chip.addEventListener('click', () => fetchWeatherByCity(city));
    el.favList.appendChild(chip);
  });
}

/* ─────────────────────────────────────────────────────────────────
   START
───────────────────────────────────────────────────────────────── */
init();
