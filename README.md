<p align="center">
  <img src="assets/landing.png" width="100%" alt="TradeX Hero" />
</p>

<h1 align="center">TradeX</h1>
<p align="center">
  <b>Modern AI-Powered Virtual Stock Trading Simulator</b>
</p>


<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?logo=python" />
  <img src="https://img.shields.io/badge/Flask-3.1-000?logo=flask" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

<p align="center">
  <i>"People don't fear investing — they fear losing without experience."</i>
</p>
>>>>>>> ae43a30 (Final TradeX)

"People don’t fear investing — they fear losing without experience."
---

## Overview

TradeX is a **risk-free stock trading simulator** built for anyone who wants to learn investing without risking real money. Practice with ₹1,00,000 virtual currency, trade 15 NSE stocks with live market data, analyze your portfolio with real-time analytics, and level up your trading skills.

### Highlights

- 💰 **₹1,00,000 virtual wallet** — start trading instantly
- 📊 **15 NSE stocks** with live prices via yFinance
- ⚡ **Real-time price simulation** — 2-second polling, 60-second base refresh
- 📈 **Advanced orders** — Limit & Stop loss orders
- 🤖 **AI TradeX Assistant** — contextual help with 14 topics, 10-language translation support
- 📉 **Portfolio analytics** — P&L tracking, win rate, risk scoring, sector allocation
- 🎯 **Scenario simulator** — test crash (-35%) to super rally (+50%)
- 🌙 **Dark UI** — polished, responsive, production-ready design

---

## Screenshots

<<<<<<< HEAD
### Phase 1: Foundation - COMPLETED
- [x] Flask Backend Setup with app.py
- [x] React Frontend with Vite
- [x] REST API Architecture
- [x] Database Models (User, Transaction, Holding)
- [x] Authentication Routes and Service
- [x] Login Page
- [x] Dashboard Page
- [x] Market Data Display
- [x] Trading Simulator Interface
=======
<details>
<summary><b>Click to expand screenshots</b></summary>
<br />

<p align="center">
  <table>
    <tr>
      <td align="center"><img src="assets/landing.png" width="400" /><br/><b>Landing Page</b></td>
      <td align="center"><img src="assets/dashboard.png" width="400" /><br/><b>Dashboard</b></td>
    </tr>
    <tr>
      <td align="center"><img src="assets/explore.png" width="400" /><br/><b>Market</b></td>
      <td align="center"><img src="assets/dashboard.png" width="400" /><br/><b>Orders</b></td>
    </tr>
    <tr>
      <td align="center"><img src="assets/dashboard.png" width="400" /><br/><b>Portfolio</b></td>
      <td align="center"><img src="assets/explore.png" width="400" /><br/><b>Transaction History</b></td>
    </tr>
    <tr>
      <td align="center" colspan="2"><img src="assets/landing.png" width="400" /><br/><b>Simulator</b></td>
    </tr>
  </table>
</p>

</details>
>>>>>>> ae43a30 (Final TradeX)

## 🧠 Problem Statement

<<<<<<< HEAD
Many beginners want to invest but:
- Fear losing money  
- Lack real market experience  
- Don’t understand risk  

👉 TradeX solves this by providing a **risk-free simulation environment**.

---

## Technical Architecture

FRONTEND (React + Vite)
- Pages: Dashboard | Market | Simulator | Login | Settings
- State: React Context or Zustand
- Styling: Tailwind CSS
- Charts: Recharts

BACKEND (Flask)
Routes:
- /api/auth/* (Authentication)
- /api/trade/* (Trading operations)
- /api/market/* (Market data)
- /api/portfolio/* (Portfolio management)

Services:
- auth_service.py
- trade_service.py
- market_service.py
- ai_service.py (future)

DATABASE (MongoDb)
Models:
- User (id, username, email, password_hash)
- Transaction (id, user_id, symbol, type, quantity, price, timestamp)
- Holding (id, user_id, symbol, quantity, avg_cost)

---


<p align="center">
  <table>
    <tr>
      <td align="center">
        <img src="assets/dashboard.png" width="400"/><br/>
        <b>Dashboard</b>
      </td>
      <td align="center">
        <img src="assets/explore.png" width="400"/><br/>
        <b>Explore</b>
      </td>
    </tr>
  </table>
</p>




## Development Roadmap

### Immediate Next Steps
1. **Connect real stock data** - Replace mock data with live API
2. **Enhance trading engine** - Add limit/stop orders
3. **Build portfolio analytics** - Add risk metrics
4. **Improve charts** - Implement candlestick charts

### Future Enhancements
1. Multi-portfolio support
2. AI decision helper
3. Backtesting system
4. Social trading features
5. Mobile app
=======
## Features

| Feature | Description |
|---------|-------------|
| **Virtual Trading** | Buy and sell 15 NSE stocks with ₹1,00,000 paper money |
| **Live Market Data** | Real prices via yFinance with 60-second caching and 2-second simulated fluctuations |
| **Portfolio Analytics** | P&L, win rate, risk score, sector allocation with pie charts and progress bars |
| **Advanced Orders** | Limit (buy below / sell above) and Stop (buy breakout / stop-loss) orders with auto-execution |
| **AI Assistant** | 14-topic knowledge base + Google Translate integration for 10 Indian languages |
| **Scenario Simulator** | Stress-test your portfolio from -35% crash to +50% rally |
| **Interactive Charts** | Recharts-powered performance charts, sector pie charts, stock sparklines |
| **Transaction History** | Searchable, filterable, sortable trade log with buy/sell breakdown |
| **Authentication** | JWT-based register/login with protected routes |
| **Dark Mode** | Full dark/light theme with persistent preference |
| **Responsive** | Mobile-first layout with adaptive navigation (bottom tabs on mobile, sidebar on desktop) |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Recharts 3** | Charts & sparklines |
| **Framer Motion 12** | Animations & transitions |
| **React Router 7** | Client-side routing |

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.13** | Runtime |
| **Flask** | Web framework & REST API |
| **SQLAlchemy** | ORM for SQLite |
| **yFinance** | Yahoo Finance market data |
| **PyJWT** | Token authentication |
| **Flask-CORS** | Cross-origin support |

---

## Project Structure

```
TradeX/
├── frontend/                         # React + Vite SPA
│   └── src/
│       ├── App.jsx                   # Root component, routing, state
│       ├── main.jsx                  # Entry point
│       ├── index.css                 # Tailwind + custom animations
│       ├── constants.js              # Stock defs, scenarios, helpers
│       ├── components/
│       │   ├── Navbar.jsx            # Top navigation + mobile tabs
│       │   ├── Sidebar.jsx           # Desktop sidebar
│       │   ├── TradeXAssistant.jsx   # AI chat widget
│       │   └── ui.jsx                # Reusable: Icon, Modal, Sparkline, etc.
│       ├── hooks/
│       │   └── useTheme.js           # Dark/light theme classes
│       └── pages/
│           ├── Landing.jsx           # Hero + features + CTA
│           ├── Login.jsx             # Sign in form
│           ├── SignUp.jsx            # Registration form
│           ├── Dashboard.jsx         # Wallet, P&L, holdings, charts
│           ├── Market.jsx            # Stock grid with buy
│           ├── Portfolio.jsx         # Analytics, sector chart, risk
│           ├── Orders.jsx            # Limit/Stop order form + history
│           ├── Transactions.jsx      # Searchable trade log
│           ├── Simulator.jsx         # Market scenario tool
│           └── Profile.jsx           # User profile & logout
│
├── backend/                          # Flask REST API
│   ├── app.py                        # Server entry, all API routes
│   ├── database.py                   # SQLAlchemy init
│   ├── models.py                     # User, Holding, Transaction, PendingOrder
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   ├── config.py                     # App config (placeholder)
│   ├── services/
│   │   ├── market_service.py         # yFinance wrapper + caching
│   │   ├── auth_service.py           # (placeholder)
│   │   ├── trade_service.py          # (placeholder)
│   │   └── ai_service.py             # (placeholder)
│   ├── routes/
│   │   ├── auth_routes.py            # (placeholder)
│   │   ├── market_routes.py          # (placeholder)
│   │   └── trade_routes.py           # (placeholder)
│   ├── models/                       # (placeholder — models live in models.py)
│   ├── scripts/                      # One-time utilities
│   │   ├── verify.py                 # Full system health check
│   │   ├── trade.py                  # Automated buy/sell flow
│   │   ├── make_profit.py            # Sell profitable holdings
│   │   └── clean_all.py              # Database reset
│   ├── tests/                        # API integration tests
│   │   ├── test_order_scheduler.py   # Production-safety test suite
│   │   ├── test_trading.py           # Buy/sell flow tests
│   │   ├── test_api.py               # Full API integration test
│   │   └── test_yfinance.py          # Market data test
│   ├── debug/                        # Debug & inspection scripts
│   │   ├── check_db.py               # Raw SQLite inspection
│   │   ├── check_profile.py          # User profile dump
│   │   └── debug_winrate.py          # Win/loss analyzer
│   └── data/                         # Static data (legacy)
│
├── assets/                           # README screenshots
├── .gitignore
└── README.md
```
>>>>>>> ae43a30 (Final TradeX)

---

## Quick Start

### Prerequisites

- **Node.js** 18+ & npm
- **Python** 3.8+
- Git

### Backend Setup
<<<<<<< HEAD
1. Open a new terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```bash
   python app.py
   ```
=======

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API starts at `http://localhost:5000`. The SQLite database (`tradex.db`) is created automatically on first run.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. Open it in your browser, register an account, and start trading.

### Environment Variables

Create a `.env` file in `backend/` (copy from `.env.example`):

```env
SECRET_KEY=your_secret_key_here
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | No | hardcoded fallback | Flask secret key for sessions |

The app works without setting any environment variables — all defaults are pre-configured for local development.

---

## Available Stocks (15 NSE)

```
RELIANCE    Reliance Industries     TCS     Tata Consultancy Services
INFY        Infosys                 HDFC    HDFC Bank
WIPRO       Wipro                   ICICI   ICICI Bank
MARUTI      Maruti Suzuki           BAJFINANCE  Bajaj Finance
ADANI       Adani Enterprises       SBIN    State Bank of India
AXISBANK    Axis Bank               KOTAKBANK   Kotak Mahindra Bank
HINDUNILVR  Hindustan Unilever      ITC     ITC Ltd
TITAN       Titan Company
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/register` | No | Create account (₹1,00,000 wallet) |
| POST | `/api/login` | No | JWT login |
| POST | `/api/logout` | No | Clear session |
| GET | `/api/me` | Yes | Current user info |
| PUT | `/api/profile` | Yes | Update username/password |
| GET | `/api/stocks` | No | All stocks (cached) |
| GET | `/api/stocks/live` | No | Live simulated prices |
| GET | `/api/stock/price/<symbol>` | No | Single stock detail |
| POST | `/api/stock/price/fresh` | No | Fresh yFinance price for trading |
| GET | `/api/portfolio` | Yes | Holdings, wallet, P&L |
| POST | `/api/buy` | Yes | Execute buy (uses fresh price) |
| POST | `/api/sell` | Yes | Execute sell (uses fresh price) |
| GET | `/api/transactions` | Yes | Trade history |
| POST | `/api/orders/place` | Yes | Create limit/stop order |
| GET | `/api/orders/pending` | Yes | Active pending orders |
| POST | `/api/orders/cancel/<id>` | Yes | Cancel pending order |
| POST | `/api/orders/check` | Yes | Manually trigger scheduler |
| GET | `/api/portfolio/analytics` | Yes | Risk score, win rate, sectors |
| GET | `/api/portfolio/summary` | Yes | Aggregated portfolio snapshot |
| POST | `/api/simulator` | No | Scenario simulation |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Dashboard│  │  Market  │  │   Orders / History │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │             │                 │              │
│  ┌────▼─────────────▼─────────────────▼──────────┐   │
│  │           API Layer (fetch)                    │   │
│  │  Poll 2s → /api/stocks/live                   │   │
│  │  Refresh 60s → /api/stocks                    │   │
│  │  Trade → /api/buy | /api/sell                 │   │
│  └────────────────────┬─────────────────────────┘   │
└───────────────────────┼─────────────────────────────┘
                        │ HTTP
┌───────────────────────┼─────────────────────────────┐
│                  BACKEND (Flask)                     │
│  ┌────────────────────▼─────────────────────────┐   │
│  │              app.py (Routes)                  │   │
│  └────┬────────────────────────────────┬─────────┘   │
│       │                                │             │
│  ┌────▼────────┐              ┌────────▼───────┐    │
│  │ SQLite DB   │              │ market_service │    │
│  │ (SQLAlchemy)│              │  yFinance API  │    │
│  └─────────────┘              └────────┬───────┘    │
│                                        │             │
└────────────────────────────────────────┼─────────────┘
                                         │ HTTPS
                                ┌────────▼───────┐
                                │  Yahoo Finance  │
                                │  (NSE .NS)      │
                                └─────────────────┘
```

---

## Future Improvements

<details>
<summary><b>Planned enhancements</b></summary>
<br />

- **WebSocket live prices** — replace polling with real-time streams
- **Real broker integration** — connect to Zerodha/Angel One via API
- **AI portfolio advisor** — LLM-powered investment suggestions
- **Mobile application** — React Native or Flutter client
- **Multi-portfolio** — manage multiple trading strategies
- **Backtesting engine** — replay historical data
- **Watchlists** — save and monitor favorite stocks
- **Social trading** — follow top performers, copy trades
- **OAuth2 authentication** — Google/GitHub login
- **Docker deployment** — containerized setup for CI/CD
- **Candlestick charts** — technical analysis with OHLC data
- **Paper trading competitions** — leaderboards and challenges

</details>

---

## Deployment

| Layer | Platform | Notes |
|-------|----------|-------|
| **Frontend** | [Vercel](https://vercel.com) | `npm run build` → deploy `frontend/dist` |
| **Backend** | [Render](https://render.com) | Web service with Python runtime |
| **Database** | SQLite → PostgreSQL | For production, swap to PostgreSQL via SQLAlchemy |

---

## Author

**Anand Sahab**

- GitHub: [@Anandsahab](https://github.com/Anandsahab)
- LinkedIn: [Anand Sahab](https://linkedin.com/in/Anandsahab)

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <sub>Built with ❤️ by Team RiskZero</sub>
</p>
>>>>>>> ae43a30 (Final TradeX)
