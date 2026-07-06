import { useState } from "react";
import { LineChart, Line, Area, ResponsiveContainer } from "recharts";

// ─── ICON ─────────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  dashboard:    "M3 9l9-7 9 7v11a2 2 001-2 2H5a2 2 001-2-2z M9 22V12h6v10",
  market:       "M3 3h18v18H3z M3 9h18 M9 3v18",
  simulator:    "M22 12h-4l-3 9L9 3l-3 9H2",
  wallet:       "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5 M16 12a4 4 0 000-8",
  brain:        "M9.5 2A6.5 6.5 0 0116 8.5c0 3.59-2.91 6.5-6.5 6.5S3 12.09 3 8.5 5.91 2 9.5 2z M9.5 15v7 M6.5 18h6",
  user:         "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  trending_up:  "M23 6l-9.5 9.5-5-5L1 18",
  trending_down:"M23 18l-9.5-9.5-5 5L1 6",
  alert:        "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  sun:          "M12 2v2 M12 20v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M2 12h2 M20 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 6a6 6 0 010 12",
  moon:         "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  close:        "M18 6L6 18 M6 6l12 12",
  check:        "M20 6L9 17l-5-5",
  info:         "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01",
  settings:     "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
  chevron_right: "M9 18l6-6-6-6",
  chevron_left:  "M15 18l-6-6 6-6",
  chevron_down:  "M6 9l6 6 6-6",
  chevron_up:    "M18 15l-6-6-6 6",
  logout:       "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  list:         "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  account_balance: "M4 10v7h3v-7H4z M10 10v7h3v-7h-3z M2 10h3v7H2V10z M16 10v7h3v-7h-3z M12 2v2 M12 12v2 M12 22v2",
  support_agent: "M12 2a10 10 0 100 20 10 10 0 000-20z M12 18a6 6 0 110-12 6 6 0 010 12z M12 14a2 2 0 100-4 2 2 0 000 4z M21 15v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2",
  assessment:   "M4 4h7v7H4V4z M13 4h7v7h-7V4z M4 13h7v7H4v-7z M13 13h7v7h-7v-7z M9 9h1 M9 14h1 M14 9h1 M14 14h1",
  orders:       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2 M7 12h10 M7 16h10",
  refresh:      "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
};

export const Icon = ({ name, size = 18, cls = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cls}
  >
    {ICON_PATHS[name]?.split(" M").map((d, i) => (
      <path key={i} d={i === 0 ? d : "M" + d} />
    ))}
  </svg>
);

// ─── CIRCULAR PROGRESS ───────────────────────────────────────────────────────
export const CircularProgress = ({ value, size = 120, color }) => {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const progress = circ - (value / 100) * circ;
  const gradId = `cg-${color.replace("#", "")}`;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7"
          className="text-gray-200 dark:text-gray-700" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={progress}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{value}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">/ 100</span>
      </div>
    </div>
  );
};

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
export const Sparkline = ({ data, positive, area = true }) => {
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <ResponsiveContainer width={80} height={40}>
      <LineChart data={data.slice(-15)}>
        {area && (
          <defs>
            <linearGradient id={`spark-grad-${positive ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
        {area && (
          <Area type="monotone" dataKey="price" fill={`url(#spark-grad-${positive ? "up" : "dn"})`} stroke="none" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

// ─── BUY MODAL ────────────────────────────────────────────────────────────────
export const BuyModal = ({ stock, wallet, onClose, onBuy, dark }) => {
  const [qty, setQty] = useState(1);
  const total    = +(stock.price * qty).toFixed(2);
  const canAfford = total <= wallet;

  const card  = dark ? "bg-gray-900 border-gray-700"  : "bg-white border-gray-200";
  const text  = dark ? "text-white"                    : "text-gray-900";
  const muted = dark ? "text-gray-400"                 : "text-gray-500";
  const btnBg = dark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const inputCls = dark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-300 text-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl border ${card}`}
        style={{ animation: "modalIn .25s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-widest text-emerald-500 mb-1">{stock.sector}</div>
            <h3 className={`text-lg sm:text-xl font-bold ${text} truncate`}>{stock.name}</h3>
            <span className={`text-sm ${muted}`}>{stock.symbol}</span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition shrink-0 ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Price / wallet row */}
        <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
          <div className={`flex justify-between text-xs sm:text-sm mb-1 ${muted}`}>
            <span>Current Price</span><span>Available Wallet</span>
          </div>
          <div className="flex justify-between">
            <span className={`text-lg sm:text-2xl font-bold ${text}`}>₹{stock.price.toLocaleString()}</span>
            <span className="text-lg sm:text-2xl font-bold text-emerald-500">₹{wallet.toLocaleString()}</span>
          </div>
        </div>

        {/* Quantity picker */}
        <div className="mb-4 sm:mb-5">
          <label className={`block text-xs sm:text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>Quantity</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-lg transition ${btnBg} shrink-0`}>−</button>
            <input
              type="number" min="1" value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className={`flex-1 text-center text-lg sm:text-xl font-bold rounded-xl border py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputCls}`}
            />
            <button onClick={() => setQty(qty + 1)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-lg transition ${btnBg} shrink-0`}>+</button>
          </div>
        </div>

        {/* Total cost */}
        <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex justify-between items-center ${
          canAfford
            ? "bg-emerald-500/10 border border-emerald-500/30"
            : "bg-red-500/10 border border-red-500/30"
        }`}>
          <span className={`text-xs sm:text-sm font-medium ${canAfford ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {canAfford ? "Total Cost" : "⚠ Insufficient funds"}
          </span>
          <span className={`text-lg sm:text-xl font-bold ${canAfford ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            ₹{total.toLocaleString()}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => canAfford && onBuy(stock, qty)}
          disabled={!canAfford}
          className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
            canAfford
              ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canAfford
            ? `BUY ${qty} SHARE${qty > 1 ? "S" : ""} OF ${stock.symbol}`
            : "NOT ENOUGH BALANCE"}
        </button>
      </div>
    </div>
  );
};

// ─── SELL MODAL ────────────────────────────────────────────────────────────────
export const SellModal = ({ stock, holding, wallet, onClose, onSell, dark }) => {
  const [qty, setQty] = useState(1);
  const total = +(stock.price * qty).toFixed(2);
  const canSell = qty <= holding.qty;

  const card  = dark ? "bg-gray-900 border-gray-700"  : "bg-white border-gray-200";
  const text  = dark ? "text-white"                    : "text-gray-900";
  const muted = dark ? "text-gray-400"                 : "text-gray-500";
  const btnBg = dark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const inputCls = dark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-300 text-gray-900";

  const pnl = (stock.price - holding.avgPrice) * qty;
  const pnlPercent = ((stock.price - holding.avgPrice) / holding.avgPrice * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl border ${card}`}
        style={{ animation: "modalIn .25s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-widest text-red-500 mb-1">{stock.sector}</div>
            <h3 className={`text-lg sm:text-xl font-bold ${text} truncate`}>{stock.name}</h3>
            <span className={`text-sm ${muted}`}>{stock.symbol}</span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition shrink-0 ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
          <div className={`flex justify-between text-xs sm:text-sm mb-1 ${muted}`}>
            <span>Current Price</span><span>Your Holdings</span>
          </div>
          <div className="flex justify-between">
            <span className={`text-lg sm:text-2xl font-bold ${text}`}>₹{stock.price.toLocaleString()}</span>
            <span className="text-lg sm:text-2xl font-bold text-blue-500">{holding.qty} shares</span>
          </div>
        </div>

        <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 ${pnl >= 0 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <div className={`flex justify-between text-xs sm:text-sm ${pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            <span>Unrealized P&L</span>
            <span className="font-bold">{pnl >= 0 ? "+" : ""}₹{Math.round(pnl).toLocaleString()} ({pnlPercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="mb-4 sm:mb-5">
          <label className={`block text-xs sm:text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>Quantity to Sell</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-lg transition ${btnBg} shrink-0`}>−</button>
            <input
              type="number" min="1" max={holding.qty} value={qty}
              onChange={(e) => setQty(Math.min(holding.qty, Math.max(1, parseInt(e.target.value) || 1)))}
              className={`flex-1 text-center text-lg sm:text-xl font-bold rounded-xl border py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${inputCls}`}
            />
            <button onClick={() => setQty(Math.min(holding.qty, qty + 1))}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-lg transition ${btnBg} shrink-0`}>+</button>
          </div>
          <div className="flex gap-2 mt-2">
            {[1, Math.floor(holding.qty/2), holding.qty].map(q => (
              <button key={q} onClick={() => setQty(q)} className={`text-xs px-2 py-1 rounded ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}>
                {q}{q === holding.qty ? ' (All)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex justify-between items-center ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
          <span className={`text-xs sm:text-sm font-medium ${muted}`}>Total Proceeds</span>
          <span className={`text-lg sm:text-xl font-bold ${text}`}>₹{total.toLocaleString()}</span>
        </div>

        <button
          onClick={() => canSell && onSell(stock, qty)}
          disabled={!canSell}
          className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
            canSell
              ? "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canSell
            ? `SELL ${qty} SHARE${qty > 1 ? "S" : ""} OF ${stock.symbol}`
            : "INVALID QUANTITY"}
        </button>
      </div>
    </div>
  );
};