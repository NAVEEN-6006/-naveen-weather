# 🌤️ Naveen Weather

A production-quality, fully responsive weather website delivering real-time weather data for any city worldwide. Built with clean vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

## 🚀 Live Demo

**[https://naveen-weather.vercel.app](https://naveen-weather.vercel.app)**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 City Search | Search weather for any city by name |
| 📍 Current Location | Auto-detect location via browser Geolocation API |
| 🌡️ Unit Toggle | Switch between °C and °F instantly |
| ⭐ Favourites | Save and quickly access favourite cities |
| 🕐 Recent Searches | Last 5 searches saved locally |
| 🎨 Dynamic Themes | Background changes with weather — sunny, rainy, stormy, snowy, night |
| 🌅 Sunrise & Sunset | Accurate local times for the searched city |
| 💨 Wind Speed & Direction | Speed in km/h or mph + compass direction |
| 👁️ Visibility | Visibility in km |
| 🔽 Pressure | Atmospheric pressure in hPa |
| ⏳ Skeleton Loader | Smooth loading state before data arrives |
| ⚠️ Error Cards | Beautiful, specific error messages for every failure type |
| 📱 Fully Responsive | Tested from 320px to 4K |
| ♿ Accessible | ARIA labels, keyboard nav, reduced motion support |

---

## 🛠️ Tech Stack

| Layer           | Technology                            |
|-----------------|---------------------------------------|
| Frontend        | HTML5, CSS3, Vanilla JavaScript (ES6+)|
| API             | [OpenWeatherMap API](https://openweathermap.org/api) |
| Storage         | Browser localStorage                  |
| Deployment      | [Vercel](https://vercel.com)          |
| Version Control | Git + GitHub                          |
| Backend (Phase 6+) | Java Spring Boot on Render         |

---

## 📁 Folder Structure

```
naveen-weather/
├── frontend/
│   ├── index.html          → Main page (semantic HTML5)
│   ├── 404.html            → Custom 404 error page
│   ├── robots.txt          → Search engine crawler rules
│   ├── sitemap.xml         → Site map for Google indexing
│   ├── css/
│   │   └── style.css       → All styles, themes, animations, responsive design
│   ├── js/
│   │   └── app.js          → All logic — API, state, UI, localStorage
│   └── assets/
│       └── icons/          → Reserved for custom icons
├── .gitignore              → Files excluded from Git
├── vercel.json             → Vercel deployment + security headers
└── README.md               → This file
```

---

## 🔧 Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/naveen-weather.git
cd naveen-weather

# 2. Open in browser — no build step needed
open frontend/index.html
```

The app uses a live API key already configured in `app.js`.

---

## ⚙️ Configuration

The API key and settings are in `frontend/js/app.js` inside the `CONFIG` object:

```js
const CONFIG = {
  API_KEY:    'your_key_here',   // ← Replace for your own deployment
  TIMEOUT_MS: 8000,             // Fetch timeout in milliseconds
  MAX_RECENT: 5,                // Number of recent searches to save
  MAX_FAVS:   8,                // Number of favourite cities allowed
};
```

> **Security note:** For the backend phase (Spring Boot), the API key will move to a server-side proxy. Never commit real API keys to public repositories.

---

## 🌍 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend/`
4. Click **Deploy** — done in ~30 seconds

Every `git push` to `main` triggers an automatic redeploy.

---

## 📸 Screenshots

> *(Add screenshots after deployment)*

| Desktop | Mobile |
|---|---|
| ![Desktop](assets/screenshot-desktop.png) | ![Mobile](assets/screenshot-mobile.png) |

---

## 🔮 Future Improvements

- [ ] 5-day hourly forecast
- [ ] Weather map overlay
- [ ] Push notifications for weather alerts
- [ ] Spring Boot backend — secure API proxy
- [ ] PWA (installable on mobile)
- [ ] Multiple language support

---

## 👨‍💻 Developer

Built by **Naveen** — learning production-quality full-stack development step by step.

---

## 📄 License

MIT License — free to use, learn from, and build upon.
