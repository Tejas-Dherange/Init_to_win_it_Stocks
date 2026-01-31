# RiskMind Backend

Production-grade AI trading assistant backend with multi-agent system orchestrated by LangGraph.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- PostgreSQL (NeonDB recommended)
- Redis >= 6.x
- Groq API key

### Installation

```bash
# Install dependencies
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

## 📦 Project Structure

```
backend/
├── data/                      # Sample CSV data files
│   ├── stock_ticks.csv       # Stock market data
│   ├── portfolio.csv         # User portfolio positions
│   ├── news_sentiment.csv    # News headlines with sentiment
│   └── technical_indicators.csv
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
│
├── src/
│   ├── agents/               # Multi-agent system
│   │   ├── base/            # Base agent classes
│   │   ├── market/          # Market data agent
│   │   ├── risk/            # Risk assessment agent
│   │   ├── decision/        # Decision making agent
│   │   ├── audit/           # Audit logging agent
│   │   └── master/          # Master orchestrator
│   │
│   ├── langgraph/           # LangGraph workflow
│   │   ├── graphs/          # Workflow definitions
│   │   ├── nodes/           # Agent nodes
│   │   └── state/           # State management
│   │
│   ├── services/
│   │   ├── database/        # Database repositories
│   │   ├── cache/           # Redis caching
│   │   ├── queue/           # BullMQ workers
│   │   ├── llm/             # Groq LLM service
│   │   ├── data-sources/    # CSV data loaders
│   │   └── websocket/       # Socket.IO events
│   │
│   ├── api/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, etc.
│   │   └── dto/             # Data transfer objects
│   │
│   ├── config/              # Configuration files
│   ├── utils/               # Helper functions
│   ├── types/               # TypeScript definitions
│   └── server.ts            # Express server
│
└── tests/                   # Test files
```

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

**Critical variables:**
- `DATABASE_URL`: NeonDB PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `GROQ_API_KEY`: Groq API key for LLM features
- `JWT_SECRET`: Secret for JWT token signing

## 📊 Sample Data

The system uses CSV files for development/demo purposes:

- **stock_ticks.csv**: 25 major Indian stocks (RELIANCE, TCS, INFY, etc.)
- **portfolio.csv**: Sample user portfolio with 10 positions
- **news_sentiment.csv**: 20 news headlines with sentiment scores
- **technical_indicators.csv**: RSI, MACD, Bollinger Bands, etc.

## 🤖 Agent System

### 1. MarketAgent
- Validates incoming stock data
- Normalizes symbol names
- Enriches with missing fields
- Calculates derived metrics

### 2. RiskAgent
- Calculates VaR (Value at Risk)
- Computes 30-day volatility
- Sentiment-adjusted risk scoring
- Portfolio-level risk aggregation

### 3. DecisionAgent
- Rule-based decision triggers
- LLM-powered rationale generation
- Opportunity finding
- PnL calculation

### 4. AuditAgent
- Logs all decisions
- Stores LLM traces
- Compliance reporting

### 5. MasterAgent
- Orchestrates workflow
- Health monitoring
- Retry logic & circuit breaker

## 🔄 Workflow

```
User/System → Ingest Tick → MarketAgent → RiskAgent → DecisionAgent → User Confirmation → AuditAgent
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ingest/tick` | Ingest stock data |
| GET | `/api/v1/portfolio` | Get user portfolio |
| GET | `/api/v1/risk/:symbol` | Get risk analysis |
| GET | `/api/v1/opportunities` | Get alternative stocks |
| GET | `/api/v1/decisions` | List decisions |
| POST | `/api/v1/decisions/confirm` | Confirm decision |
| POST | `/api/v1/chat/:symbol` | Chat with AI |
| GET | `/api/v1/health` | Health check |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 Development Notes

### CSV Data Loading
The system automatically loads sample data from CSV files in the `data/` directory. This is for development purposes only. In production, integrate with live data APIs (NSE, Yahoo Finance, etc.).

### LLM Integration
- Uses Groq API with `mixtral-8x7b-32768` model
- Rationale generation for high-urgency decisions
- Optional LangSmith tracing for observability

### Real-time Updates
- Socket.IO for push notifications
- Events: `decision_ready`, `portfolio_update`, `risk_alert`, `chat_message`

### Error Handling
- Global error handler middleware
- Retry logic with exponential backoff
- Circuit breaker for system protection

## 🔒 Security

- JWT authentication on protected routes
- Rate limiting (100 req/15min)
- Input validation with Zod
- SQL injection protection via Prisma

## 📚 Further Documentation

- [Agent System Documentation](./docs/agents.md) (TODO)
- [API Reference](./docs/api.md) (TODO)
- [Database Schema](./docs/database.md) (TODO)

## 🤝 Contributing

This is a production-grade system. Follow coding standards:
- TypeScript strict mode
- No `any` types
- Comprehensive error handling
- Unit tests for all agents

## 📄 License

MIT
