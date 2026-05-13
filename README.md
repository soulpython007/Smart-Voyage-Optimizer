# Smart Voyage Optimizer

**Real-time maritime intelligence & route optimization platform**

A premium, interactive dashboard for visualizing and optimizing global shipping routes. Features live vessel tracking, dynamic weather systems, ocean current visualization, and AI-powered multi-objective route optimization.

![Dashboard Preview](https://img.shields.io/badge/Platform-Maritime_Intelligence-1e40af?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-22c55e?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React_TypeScript_Vite-3b82f6?style=flat-square)
![Map](https://img.shields.io/badge/Map-Leaflet-60a5fa?style=flat-square)

---

## Features

### Live Vessel Tracking
- Real-time ship positions with smooth continuous animation
- Heading-based rotation with glow effects
- Fading wake trails showing recent path history
- Click-to-follow camera mode tracks vessels automatically
- Rich tooltips with speed, destination, ETA, and status indicators

### Route Optimization
- Multi-objective optimization (Eco, Fast, Safe, Custom)
- Visual route comparison with color-coded polylines
- Animated route drawing with progressive reveal
- Glowing selected route with pulsing effect
- Start/destination markers with port coordinates
- Detailed route panel with distance, ETA, fuel, and safety metrics

### Weather & Ocean Systems
- Dynamic storm zones with breathing opacity animation
- Severity-based color coding (calm, caution, severe)
- Pulsing outer rings around active storms
- Drifting storm positions with lifecycle changes
- Ocean current visualization with flowing particles
- Current direction arrows with speed-based sizing

### Premium Dashboard
- Dark maritime aesthetic with glassmorphism panels
- Neobrutalist design system with glowing accents
- Live UTC clock and weather severity indicators
- WebSocket connection status with sonar pulse
- Animated toast notifications for events
- Collapsible sidebar sections with smooth transitions
- Fully responsive (desktop ultrawide to mobile)

### Interactive Controls
- Fullscreen mode
- Ship follow/track mode
- Reset global view
- Weather and current layer toggles
- Route selection and comparison
- Custom weight tuning for optimization

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6 |
| **Styling** | TailwindCSS, Framer Motion, anime.js |
| **Mapping** | Leaflet, React-Leaflet |
| **State** | Zustand |
| **Data** | React Query, Socket.IO |
| **Backend** | Express, Socket.IO, A* Pathfinding |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (JWT) |
| **Deployment** | Vercel (frontend), Railway (backend), Docker |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account (optional, demo mode works offline)

### Installation

```bash
# Clone the repository
git clone https://github.com/soulpython007/Smart-Voyage-Optimizer.git
cd Smart-Voyage-Optimizer

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

```bash
# Frontend (smart-voyage/frontend/.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WS_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api
VITE_DEMO_MODE=true
```

Set `VITE_DEMO_MODE=true` to run without a backend — uses built-in mock data.

### Development

```bash
# Start frontend (port 3000)
cd frontend
npm run dev

# Start backend (port 4000) — optional, demo mode doesn't need it
cd backend
npm run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`. Deploy the `dist` folder to any static host.

---

## Architecture

```
frontend/                     # React + Vite SPA
├── src/
│   ├── components/
│   │   ├── map/             # Leaflet map layers (ships, routes, weather, currents)
│   │   ├── dashboard/       # Route config panel, stats cards
│   │   ├── layout/          # Navbar, dashboard layout
│   │   └── ui/              # Reusable UI primitives (glassmorphism design system)
│   ├── hooks/               # Custom React hooks (WebSocket, animation, clock)
│   ├── store/               # Zustand state management
│   ├── services/            # API client, WebSocket service, mock data
│   ├── types/               # TypeScript type definitions
│   └── pages/               # Dashboard page, auth pages

backend/                      # Express + Socket.IO server
├── src/
│   ├── simulators/          # Ship tracker, weather engine, ocean current engine
│   ├── algorithms/          # A* pathfinder, waypoint graph, cost engine
│   ├── services/            # Route optimizer, graph service
│   ├── websocket/           # Socket.IO server with real-time broadcasts
│   ├── routes/              # REST API endpoints
│   └── data/                # Port and ship data files
```

### Data Flow

```
Backend Simulators (every 5s)
  → Socket.IO broadcast
    → Frontend useWebSocket hook
      → Zustand store update
        → React re-render
          → Leaflet map layers animate
```

---

## Route Optimization

The optimization engine uses **A\*** search on a waypoint graph covering the Indian Ocean:

- **0.5° resolution grid** over the operational area
- **Dynamic cost function** evaluating fuel, time, and safety
- **Real-time constraints** from weather zones and ocean currents
- **Three default modes** plus fully customizable weights

```
Eco   → Minimizes fuel consumption (80% fuel / 15% time / 5% safety)
Fast  → Minimizes transit time (10% fuel / 80% time / 10% safety)
Safe  → Maximizes safety (20% fuel / 20% time / 60% safety)
Custom→ Manual weight tuning via sliders
```

---

## Deployment

### Vercel (Frontend)

```bash
cd frontend
npx vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

### Railway (Backend)

The backend includes a Dockerfile — deploy directly to Railway or any container platform.

```bash
cd backend
docker build -t smart-voyage-backend .
docker run -p 4000:4000 smart-voyage-backend
```

---

## License

This project is licensed under the MIT License.
