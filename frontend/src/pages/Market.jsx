import { useState } from "react";
import { Icon, Sparkline } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

/**
 * Market — filterable grid of stocks with buy CTA.
 *
 * Props:
 *   holdings    array   — current holdings (to show "X owned" badge)
 *   sparklines  object  — symbol → price-history array
 *   stockMap   object  — symbol → stock data from API
 *   dark        bool
 *   onBuy       fn(stock) — opens the buy modal in the parent
 */
export default function Market({ holdings, sparklines, stockMap, dark, onBuy }) {
  const { card, text, muted } = useTheme(dark);
  const [filter, setFilter] = useState("All");

  const stocks = stockMap ? Object.values(stockMap).filter(s => s && s.symbol) : [];
  const sectors  = ["All", ...new Set(stocks.map((s) => s.sector).filter(Boolean))];
  const filtered = filter === "All" ? stocks : stocks.filter((s) => s.sector === filter);

  const ownedMap = Object.fromEntries((holdings || []).map((h) => [h.symbol, h]));

  const getSparkline = (symbol) => {
    if (sparklines && sparklines[symbol]) return sparklines[symbol];
    const stock = stockMap && stockMap[symbol];
    return stock?.sparkline || [];
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Header row: title + live badge ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${text} truncate`}>Market</h2>
          <p className={`text-xs sm:text-sm ${muted}`}>Live NSE stock prices</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider shrink-0 ${
          dark ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* ── Sector filter pills ──────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              filter === s
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                : dark
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Stock card grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((s) => {
          const owned    = ownedMap[s.symbol];
          const price = s.price || 0;
          const changePercent = s.changePercent ?? s.change ?? 0;
          const positive = changePercent >= 0;
          const arrow = positive ? "\u2191" : "\u2193";

          return (
            <div
              key={s.symbol}
              className={`group relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                positive
                  ? dark
                    ? "hover:border-emerald-700/80 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-0.5"
                    : "hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-0.5"
                  : dark
                    ? "hover:border-red-800/60 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-0.5"
                    : "hover:border-red-400 hover:shadow-xl hover:shadow-red-500/15 hover:-translate-y-0.5"
              } ${card}`}
            >
              {/* Top row: symbol + name + sparkline */}
              <div className="flex items-start justify-between mb-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold tracking-widest ${positive ? "text-emerald-500" : "text-red-500"}`}>
                      {s.symbol}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${dark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                      {s.sector}
                    </span>
                  </div>
                  <div className={`text-sm font-semibold ${text} truncate max-w-[140px] sm:max-w-[180px]`}>{s.name}</div>
                </div>
                <div className="shrink-0 -mr-1 -mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkline data={getSparkline(s.symbol)} positive={positive} />
                </div>
              </div>

              {/* Middle: price row */}
              <div className="flex items-baseline gap-2.5 mb-3.5">
                <span className={`text-xl sm:text-2xl font-bold ${text}`}>
                  ₹{price.toLocaleString()}
                </span>
                <span className={`flex items-center gap-1 text-sm font-bold ${
                  positive ? "text-emerald-500" : "text-red-500"
                }`}>
                  <span className="text-base leading-none">{arrow}</span>
                  <span>{positive ? "+" : ""}{changePercent.toFixed(2)}%</span>
                </span>
              </div>

              {/* Bottom: owned badge + buy button */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {owned ? (
                    <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                      dark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      <Icon name="wallet" size={10} />
                      <span className="font-semibold">{owned.qty} held</span>
                    </div>
                  ) : (
                    <div className={`text-[10px] italic ${muted} px-1 py-1`}>Not in portfolio</div>
                  )}
                </div>
                <button
                  onClick={() => onBuy(s)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold tracking-wide rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                >
                  BUY
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {stocks.length > 0 && filtered.length === 0 && (
        <div className={`rounded-2xl border p-8 text-center ${card}`}>
          <p className={`text-sm ${muted}`}>No stocks found in this sector</p>
        </div>
      )}
    </div>
  );
}
