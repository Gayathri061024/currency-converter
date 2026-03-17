# Currency Converter Pro

A multi-feature currency converter web app built with vanilla HTML, CSS, and JavaScript.

## Features

- **Convert** — Live exchange rates via free API with fallback data
- **Compare** — Convert one currency into many at once
- **Chart** — Historical rate trend with 7D / 1M / 3M views (Chart.js)
- **Favorites** — Star and save currency pairs (persisted via localStorage)
- **History** — Auto-logs every conversion you make

## Tech Stack

- Vanilla HTML / CSS / JavaScript (no framework)
- [Chart.js](https://www.chartjs.org/) for rate trend chart
- [exchangerate-api.com](https://www.exchangerate-api.com/) for live rates (free tier)
- `localStorage` for favorites and history persistence

## Execution Steps

### Option 1 — Open directly in browser (easiest)
1. Download or clone this repo
2. Double-click `index.html` to open in your browser
3. Done — no server needed!

### Option 2 — Run with VS Code Live Server
1. Install [VS Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

### Option 3 — Run with Python (any OS)
```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

### Option 4 — Deploy to GitHub Pages (free hosting)
1. Push this folder to a GitHub repo
2. Go to repo **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your app will be live at `https://yourusername.github.io/repo-name`

## Project Structure

```
currency-converter/
├── index.html   — App markup and tab structure
├── style.css    — All styles (light theme, responsive)
├── app.js       — All logic (fetch, convert, chart, favs, history)
└── README.md    — This file
```

## API Note

The app uses `https://api.exchangerate-api.com/v4/latest/USD` (free, no API key needed).
If the API is unavailable, it automatically falls back to hardcoded rates.

## Resume Description

> **Currency Converter Pro** — Built a multi-tab web app with live exchange rates (REST API), Chart.js rate trend visualization, multi-currency comparison, favorites management with localStorage persistence, and conversion history log — using vanilla HTML, CSS, and JavaScript.
