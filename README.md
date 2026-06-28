# 🌤️ Naveen Weather

A production-quality, responsive weather website that shows real-time weather data for any city in the world. Features dynamic themes that change with the weather condition — sunny, rainy, stormy, snowy, and more.

## 🚀 Live Demo
> [https://naveen-weather.vercel.app](https://naveen-weather.vercel.app) ← Update this after deployment

## ✨ Features
- 🔍 Search weather by city name
- 🌡️ Real-time temperature, humidity, wind speed, feels-like
- 🎨 Dynamic background theme changes with weather (sun, rain, storm, snow, night)
- ⏳ Loading spinner while fetching data
- 📱 Fully responsive — works on mobile, tablet, desktop
- ⚠️ Friendly error messages for invalid cities or network issues

## 🛠️ Tech Stack

| Layer           | Technology                          |
|-----------------|-------------------------------------|
| Frontend        | HTML5, CSS3, Vanilla JavaScript     |
| API             | [OpenWeatherMap API](https://openweathermap.org/api) |
| Deployment      | [Vercel](https://vercel.com)        |
| Version Control | Git + GitHub                        |
| Backend (later) | Java Spring Boot on Render          |

## 📁 Project Structure

```
naveen-weather/
├── frontend/
│   ├── index.html        → Main webpage (structure)
│   ├── css/
│   │   └── style.css     → All styles, themes, animations
│   ├── js/
│   │   └── app.js        → Weather API logic, DOM updates
│   └── assets/
│       └── icons/        → Custom icons (future use)
├── .gitignore            → Files Git should not track
└── README.md             → This file
```

## 🔧 Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/naveen-weather.git
   cd naveen-weather
   ```

2. Get a free API key from [openweathermap.org](https://openweathermap.org/api)

3. Open `frontend/js/app.js` and replace:
   ```js
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```
   with your actual key.

4. Open `frontend/index.html` in your browser.

## 🌍 Deployment (Vercel)

This project is deployed via Vercel with automatic GitHub integration.

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set root directory to `frontend/`
4. Every `git push` triggers an automatic redeploy

## 🔐 API Key Security Note

> ⚠️ For this learning phase, the API key is in frontend JS (visible in browser DevTools).
> In the backend phase (Java Spring Boot), the key will be secured server-side.
> Never commit a real API key to a public repository.

## 👨‍💻 Developer

Built by **Naveen** — learning production-quality web development step by step.

## 📄 License

MIT License — free to use and learn from.
