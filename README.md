# RiskMindAI - Agentic AI Trading System

> Full-stack application that processes live/simulated Indian stock tick data, analyzes risk using autonomous agents, and makes explainable trading decisions using rule-based logic + LLM reasoning.

![RiskMind Architecture](https://img.shields.io/badge/Stack-Full--Stack-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

---

## 🚀 Features

- **Autonomous Agents**: Market, Risk, Decision, Audit , Master (LangGraph)
- **Real-time Dashboard**: WebSocket updates with live portfolio/risk metrics
- **Hybrid Decision Engine**: Rule-based + LLM (Groq API) + RAG fallback
- **Full Auditability**: Complete decision trail with LangSmith tracing
- **Guardrails**: Stop-loss, position limits, margin checks, cooldowns
- **Production-Ready**: Docker Compose, PostgreSQL, Redis, BullMQ

---

## 📋 Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Groq API Key** from [console.groq.com](https://console.groq.com) (required)
- **LangSmith API Key** (optional, for tracing)

---

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
cd d:\Hackron\Init_to_win_it_Stocks
```

### 2. Configure Environment

```bash
# Copy environment templates
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# Edit .env and add your Groq API key
# GROQ_API_KEY=gsk_your_key_here
```

###3. Start with Docker

```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:4000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### 4. Initialize Database

```bash
# In a new terminal, run migrations
docker exec riskmind-backend npm run prisma:migrate

# Seed initial data
docker exec riskmind-backend npm run prisma:seed
```

### 5. Open Dashboard

Navigate to `http://localhost:5173` and start submitting ticks via the TickSimulator!

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │◄────►│  Socket.IO   │◄────►│   Redis     │
│  Dashboard  │      │   WebSocket  │      │  Pub/Sub    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Express    │
                    │   REST API   │
                    └──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   BullMQ     │    │  PostgreSQL  │    │   Groq API   │
│   Workers    │    │   +Prisma    │    │   (LLM)      │
└──────────────┘    └──────────────┘    └──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│          LangGraph Agent Pipeline               │
│  Market → Risk → Decision → Audit → Master       │
└─────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
riskmind/
├── apps/backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── agents/        # 6 LangGraph agents
│   │   ├── services/      # Prisma, Redis, Groq, Socket.IO
│   │   ├── controllers/   # API handlers
│   │   ├── routes/        # REST endpoints
│   │   ├── queue/         # BullMQ workers
│   │   └── types/         # TypeScript definitions
│   ├── prisma/           # Database schema + seed
│   └── Dockerfile
├── frontend/              # React + Zustand + TailwindCSS
│   ├── src/
│   │   ├── components/    # Dashboard, ActionFeed, RiskPanel, etc.
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API + WebSocket
│   │   └── pages/         # Main dashboard page
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🔌 API Endpoints

| Method | Route                 | Description                       |
|--------|-----------------------|-----------------------------------|
| POST   | `/api/tick`           | Submit single tick                |
| POST   | `/api/control/load`   | Bulk load ticks from array        |
| GET    | `/api/portfolio`      | Get current portfolio state       |
| GET    | `/api/actions`        | Get last 20 decisions             |
| GET    | `/api/audit/:tickId`  | Get full audit for tick           |
| GET    | `/api/explain/:id`    | Get LLM rationale for decision    |

---

## 🤖 Agent Flow

1. **MarketAgent**: Accepts tick → stores in DB → pushes to queue
2. **RiskAgent**: Calculates volatility, VaR, exposure from rolling window
3. **PortfolioAgent**: Tracks positions, PnL, cash
4. **PolicyAgent**: Applies rules (stop-loss, take-profit, etc.) → LLM fallback if urgency ≥ 8
5. **ExecutionAgent**: Applies decision with guardrails (max 50% adjustment, cooldown)
6. **AuditAgent**: Stores full snapshot → publishes via Redis Pub/Sub → WebSocket

---

## 🎯 Decision Rules

| Rule              | Trigger                 | Action       | Urgency |
|-------------------|-------------------------|--------------|---------|
| Stop Loss         | PnL < -5%               | Exit         | 9       |
| Take Profit       | PnL > 8%                | Reduce 50%   | 7       |
| Overexposure      | Exposure > 35%          | Reallocate   | 8       |
| High Volatility   | σ > 2.5× avg            | Reduce 25%   | 6       |
| Margin Risk       | Margin > 90%            | Exit         | 10      |

**LLM Fallback**: When urgency ≥ 8, PolicyAgent consults Groq API (Mixtral-8x7b) for complex scenarios.

---

## 🧪 Testing

### Manual Test via Dashboard

1. Open `http://localhost:5173`
2. Use **TickSimulator** component
3. Submit test ticks for RELIANCE, TCS, etc.
4. Observe real-time updates in:
   - **ActionFeed** (decisions)
   - **PortfolioView** (positions/PnL)
   - **RiskPanel** (volatility/VaR)

### API Test with curl

```bash
# Submit a tick
curl -X POST http://localhost:4000/api/tick \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE","price":2450.50,"volume":1000000}'

# Get portfolio
curl http://localhost:4000/api/portfolio

# Get recent decisions
curl http://localhost:4000/api/actions
```

---

## 🔧 Development

### Run Backend Locally (without Docker)

```bash
cd apps/backend

# Install dependencies
npm install

# Setup database (requires PostgreSQL running)
npx prisma migrate dev
npx prisma generate
npm run prisma:seed

# Start dev server
npm run dev
```

### Run Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 📊 Environment Variables

### Root `.env` (for Docker Compose)

```bash
GROQ_API_KEY=gsk_your_groq_key
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
```

### Backend `.env` (for local development)

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/riskmind"
REDIS_HOST=localhost
REDIS_PORT=6379
GROQ_API_KEY=gsk_your_groq_key
LANGCHAIN_TRACING_V2=false
CORS_ORIGIN=http://localhost:5173
```

---

## 🐛 Troubleshooting

### Port Conflicts

If ports 4000, 5173, 5432, or 6379 are in use:
```bash
# Stop conflicting services or edit docker-compose.yml
```

### Database Connection Issues

```bash
# Restart postgres container
docker-compose restart postgres

# Check logs
docker logs riskmind-postgres
```

### WebSocket Not Connecting

- Ensure backend is running on port 4000
- Check CORS settings in backend `.env`
- Verify `VITE_WS_URL` in frontend

---

## 📝 Tech Stack

**Backend**:
- Node.js 20 + Express + TypeScript
- Prisma ORM + PostgreSQL
- Redis + BullMQ
- Socket.IO
- LangChain + Groq API

**Frontend**:
- React 19 + TypeScript
- Zustand (state management)
- TailwindCSS
- Socket.IO Client
- Recharts
- Axios

**DevOps**:
- Docker + Docker Compose
- Multi-stage builds

---

## 📜 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 👨‍💻 Author

Built with ❤️ using LangGraph + Groq AI

---

## 🙏 Acknowledgments

- [LangChain](https://langchain.com) for agent framework
- [Groq](https://groq.com) for lightning-fast LLM inference
- [Prisma](https://prisma.io) for type-safe database access
