# RiskMind Frontend

React + TypeScript + Vite frontend for the RiskMind AI Trading Assistant.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Recharts** - Charts (planned)
- **Socket.IO Client** - Real-time updates (planned)
- **Lucide React** - Icons

## 🎨 Features

- ✅ Dashboard with portfolio overview
- ✅ Risk assessment visualization
- ✅ Trading decision alerts
- ✅ High urgency notifications
- 🔄 Portfolio management (coming soon)
- 🔄 Decision approval flow (coming soon)
- 🔄 AI chat interface (coming soon)
- 🔄 Real-time WebSocket updates (coming soon)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   └── RiskBadge/
│   │   └── layout/          # Layout components
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── MainLayout.tsx
│   ├── pages/               # Page components
│   │   └── Dashboard.tsx
│   ├── services/            # API services
│   │   ├── api.service.ts
│   │   ├── portfolio.service.ts
│   │   ├── risk.service.ts
│   │   └── decision.service.ts
│   ├── store/               # Zustand stores
│   │   ├── portfolioStore.ts
│   │   └── decisionStore.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── formatters.ts
│   ├── styles/              # Global styles
│   │   └── globals.css
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/
├── .env.example
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_ENABLE_CHAT=true
VITE_ENABLE_WEBSOCKET=false
```

## 🎯 Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Theming

The app uses TailwindCSS with custom colors:

- **Primary:** Blue shades for branding
- **Risk Levels:**
  - Low: Green (#10b981)
  - Medium: Yellow (#f59e0b)
  - High: Red (#ef4444)
  - Critical: Dark Red (#dc2626)

## 📱 Pages

### Dashboard
- Portfolio summary (Total P&L, Exposure, Risk Score)
- High urgency decision alerts
- Top 5 positions table
- Real-time updates

### Portfolio (Coming Soon)
- Complete position list
- Sector breakdown
- Performance charts

### Decisions (Coming Soon)
- Pending decisions
- Decision history
- Approval workflow

### Chat (Coming Soon)
- AI-powered stock analysis
- Symbol-specific queries
- Historical conversations

### Health (Coming Soon)
- Agent system status
- API health metrics
- Circuit breaker state

## 🧪 Testing Backend Integration

Make sure the backend is running on `http://localhost:5000`:

```bash
cd ../backend
npm run dev
```

The frontend will automatically fetch data from the backend API.

## 🚧 Development Notes

### Adding New Components

All components follow this structure:
```
ComponentName/
├── ComponentName.tsx
└── index.ts
```

### State Management

Use Zustand stores for global state. Example:

```typescript
import { usePortfolioStore } from '../store/portfolioStore';

const { positions, fetchPortfolio } = usePortfolioStore();
```

### API Services

All API calls go through service files:

```typescript
import { portfolioService } from '../services/portfolio.service';

const data = await portfolioService.getPortfolio();
```

## 📄 License

MIT
