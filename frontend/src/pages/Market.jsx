import { useState } from "react";
import { STOCKS } from "../constants.js";
import { Icon, Sparkline } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

/**
 * Market — filterable grid of stocks with buy CTA.
 *
 * Props:
 *   holdings    array   — current holdings (to show "X owned" badge)
 *   sparklines  object  — symbol → price-history array
 *   dark        bool
 *   onBuy       fn(stock) — opens the buy modal in the parent
 */
export default function Market({ holdings, sparklines, dark, onBuy }) {
  const { card, text, muted } = useTheme(dark);
  const [filter, setFilter] = useState("All");

  const sectors  = ["All", ...new Set(STOCKS.map((s) => s.sector))];
  const filtered = filter === "All" ? STOCKS : STOCKS.filter((s) => s.sector === filter);

  // Build a quick lookup for ownership
  const ownedMap = Object.fromEntries(holdings.map((h) => [h.symbol, h]));

  return (
    <div className="space-y-5">
      {/* ── Sector filter pills ──────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              filter === s
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : dark
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Stock card grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s) => {
          const owned    = ownedMap[s.symbol];
          const positive = s.change >= 0;

          return (
            <div
              key={s.symbol}
              className={`rounded-2xl border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl ${card} ${
                positive
                  ? dark ? "hover:border-emerald-800/60" : "hover:border-emerald-300"
                  : dark ? "hover:border-red-900/60"     : "hover:border-red-200"
              }`}
            >
              {/* Top row: info + sparkline */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className={`text-xs font-bold tracking-widest mb-0.5 ${positive ? "text-emerald-500" : "text-red-500"}`}>
                    {s.symbol}
                  </div>
                  <div className={`text-sm font-semibold ${text}`}>{s.name}</div>
                  <div className={`text-xs mt-0.5 ${muted}`}>{s.sector}</div>
                </div>
                <Sparkline data={sparklines[s.symbol]} positive={positive} />
              </div>

              {/* Bottom row: price + buy button */}
              <div className="flex items-end justify-between">
                <div>
                  <div className={`text-xl font-bold ${text}`}>₹{s.price.toLocaleString()}</div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-500" : "text-red-500"}`}>
                    <Icon name={positive ? "trending_up" : "trending_down"} size={12} />
                    {positive ? "+" : ""}{s.change}%
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {owned && (
                    <div className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                      {owned.qty} owned
                    </div>
                  )}
                  <button
                    onClick={() => onBuy(s)}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold tracking-wide rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                  >
                    BUY
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}