// ─── STOCKS DATA ────────────────────────────────────────────────────────────
export const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy",       price: 2847.6, change:  1.24, vol: 18, owned: 5 },
  { symbol: "TCS",      name: "Tata Consultancy",    sector: "IT",           price: 3912.4, change: -0.87, vol: 14, owned: 3 },
  { symbol: "INFY",     name: "Infosys Ltd",          sector: "IT",           price: 1678.9, change:  0.43, vol: 16, owned: 0 },
  { symbol: "HDFC",     name: "HDFC Bank",            sector: "Finance",      price: 1654.3, change:  0.91, vol: 11, owned: 8 },
  { symbol: "ZOMATO",   name: "Zomato Ltd",           sector: "Consumer",     price:  214.7, change:  3.12, vol: 28, owned: 0 },
  { symbol: "WIPRO",    name: "Wipro Ltd",            sector: "IT",           price:  467.2, change: -1.53, vol: 20, owned: 4 },
  { symbol: "ICICI",    name: "ICICI Bank",           sector: "Finance",      price: 1089.4, change:  0.72, vol: 12, owned: 0 },
  { symbol: "MARUTI",   name: "Maruti Suzuki",        sector: "Auto",         price: 9876.5, change: -0.34, vol: 15, owned: 0 },
  { symbol: "PAYTM",    name: "One97 Communications", sector: "Fintech",      price:  678.3, change:  2.45, vol: 32, owned: 2 },
  { symbol: "NYKAA",    name: "FSN E-Commerce",       sector: "Consumer",     price:  187.4, change: -2.11, vol: 26, owned: 0 },
  { symbol: "BAJFINANCE",name: "Bajaj Finance",       sector: "Finance",      price: 7234.5, change:  1.08, vol: 17, owned: 0 },
  { symbol: "ADANI",    name: "Adani Enterprises",    sector: "Conglomerate", price: 2567.8, change: -0.67, vol: 22, owned: 1 },
];

// ─── SCENARIOS ───────────────────────────────────────────────────────────────
export const SCENARIOS = {
  "Market Crash (-35%)":    -0.35,
  "Sector Correction (-20%)": -0.20,
  "Mild Dip (-10%)":        -0.10,
  "Sideways (0%)":           0,
  "Bull Run (+25%)":         0.25,
  "Super Rally (+50%)":      0.50,
};

// ─── INITIAL HOLDINGS ────────────────────────────────────────────────────────
export const INITIAL_HOLDINGS = [
  { symbol: "RELIANCE", qty: 5, avgPrice: 2780 },
  { symbol: "TCS",      qty: 3, avgPrice: 3950 },
  { symbol: "HDFC",     qty: 8, avgPrice: 1620 },
  { symbol: "WIPRO",    qty: 4, avgPrice:  480 },
  { symbol: "PAYTM",    qty: 2, avgPrice:  650 },
  { symbol: "ADANI",    qty: 1, avgPrice: 2600 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export const generatePriceData = (base, days = 30) =>
  Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    price: +(base * (0.92 + Math.random() * 0.16)).toFixed(2),
  }));

export const buildStockMap = () =>
  Object.fromEntries(STOCKS.map((s) => [s.symbol, s]));

export const buildSparklines = () =>
  Object.fromEntries(STOCKS.map((s) => [s.symbol, generatePriceData(s.price)]));