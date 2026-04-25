# MedStick — Hospital Command UI

This is the **hospital/command-center UI** for the MedStick system — a real-time dashboard for monitoring field health workers and coordinating medical response in low-connectivity environments.

> **Note:** This folder contains only the hospital-side web interface (React + TypeScript). The core MedStick system — including the offline-capable worker app, on-device AI models, and sync infrastructure — lives in the root project directory (`/MedStick`). Due to time constraints during the hackathon, this UI demonstrates what the hospital or regional health center would see when coordinating field workers.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Stack

- **Vite** — dev server + bundler
- **React 18** — UI
- **TypeScript** — types
- **react-leaflet** — interactive Yemen map
- **OpenStreetMap** tiles (no API key needed)
- Google Fonts: Inter, Noto Naskh Arabic, JetBrains Mono

## Project layout

```
src/
  App.tsx               root layout, selected-worker state
  index.css             all CSS variables and component styles
  data/
    mock.ts             workers + ticker mock data
  components/
    Sidebar.tsx         left nav
    Topbar.tsx          header bar
    StatsBar.tsx        animated stats counters
    WorkerList.tsx      searchable worker list
    MapView.tsx         Leaflet map + sync/gap strip
    ProtocolPanel.tsx   right protocol + escalation panel (Arabic toggle)
    Ticker.tsx          scrolling case log
```

## Features

- Click any worker in the list → map flies to their location and opens their popup
- Search bar filters workers by name or location
- "عرض الملخص بالعربية" button toggles the weekly summary between English and Arabic
- Animated count-up on the stats bar on page load
- Offline worker marker pulses red on the map
