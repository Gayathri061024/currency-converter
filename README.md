<div align="center">

# 💱 Currency Converter Pro

### A modern, multi-feature currency converter with live exchange rates

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-009688?style=for-the-badge&logo=fastapi&logoColor=white)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**[🚀 Live Demo](https://yourusername.github.io/currency-converter)** • **[📂 View Code](https://github.com/yourusername/currency-converter)**

</div>

---

## 📌 Overview

**Currency Converter Pro** is a fully client-side web application that allows users to convert between 20 global currencies using live exchange rates fetched from a public REST API. Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies except Chart.js for data visualization.

This project demonstrates real-world frontend skills including API integration, DOM manipulation, persistent client-side storage, interactive charting, and clean UI design — all without relying on a JavaScript framework.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💹 **Live Conversion** | Real-time rates from `exchangerate-api.com` with graceful fallback |
| 🔄 **Swap Currencies** | Instantly reverse the conversion with animated swap button |
| 📊 **Rate Chart** | Interactive Chart.js trend graph with 7D / 1M / 3M views |
| 🌍 **Multi-Currency Compare** | Convert one base amount into multiple currencies simultaneously |
| ⭐ **Favorites** | Star and save frequently used currency pairs |
| 🕓 **Conversion History** | Auto-logs every conversion with timestamp and rate used |
| 💾 **Persistent Storage** | Favorites and history saved via `localStorage` across sessions |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile browsers |

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic markup and app structure |
| **CSS3** | Custom styling, animations, responsive layout |
| **Vanilla JavaScript (ES6+)** | App logic, API calls, DOM manipulation, state management |
| **Chart.js v4** | Interactive rate trend visualization |
| **ExchangeRate API** | Free REST API for live currency rates |
| **localStorage** | Client-side persistence for favorites and history |

---

## 🚀 Getting Started

### Option 1 — Open directly (no setup needed)
```bash
# Just download and double-click index.html in your browser
```

### Option 2 — Local development server
```bash
# Using Python
python -m http.server 8080
# Then open http://localhost:8080

# Using Node.js (npx)
npx serve .
```

### Option 3 — VS Code
1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

---

## 📁 Project Structure

```
currency-converter/
├── index.html      # App markup, tab structure, semantic HTML
├── style.css       # All styles — layout, components, animations
├── app.js          # All logic — API, chart, favorites, history
└── README.md       # Project documentation
```

---

## 🔌 API Reference

This project uses the free tier of [ExchangeRate-API](https://www.exchangerate-api.com/):

```
GET https://api.exchangerate-api.com/v4/latest/USD
```

- No API key required
- Returns rates for 160+ currencies relative to USD
- If the API is unreachable, the app automatically falls back to hardcoded reference rates — no broken UI

---

## 💡 Key Implementation Highlights

- **Error handling** — API failures silently fall back to offline rates; users see a brief notice
- **Rate calculation** — all conversions computed as `(rate[to] / rate[from]) × amount` using USD as the base pivot
- **Chart data** — simulated historical trend using mean-reverting random walk anchored to the current live rate
- **localStorage schema** — favorites stored as `[{key, from, to}]`, history as `[{from, to, amount, result, rate, time}]`
- **No framework** — pure ES6+ with event delegation, no virtual DOM or build step needed

---

## 🌐 Deployment

Deployed via **GitHub Pages** — zero cost, zero configuration:

1. Push to `main` branch
2. Go to **Settings → Pages → Source: main / root**
3. Live at `https://yourusername.github.io/currency-converter`

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

Made with focus and vanilla JS — no framework needed.

</div>
