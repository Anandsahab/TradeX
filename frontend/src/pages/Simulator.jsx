import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Icon } from "../components/ui.jsx";
import { SCENARIOS } from "../constants.js";
import { useTheme } from "../hooks/useTheme.js";

const SCENARIO_EMOJI = (v) => {
  if (v < -0.2) return "💥";
  if (v < 0)    return "📉";
  if (v === 0)  return "➡️";
  if (v < 0.3)  return "📈";
  return "🚀";
};

const AI_TIP = (mult) => {
  if (mult < -0.2)
    return "In a major market crash, your IT-heavy portfolio faces 35%+ drawdown. Consider allocating 20–30% to gold ETFs or FDs as a crash buffer. Stop-loss orders at -15% per position can limit individual losses.";
  if (mult < 0)
    return "A mild correction is manageable. Avoid panic-selling. Consider averaging down on quality stocks like HDFC and Reliance if they dip 10–15% below their current prices.";
  if (mult === 0)
    return "Sideways markets reward patience. Use this time to rebalance — reduce IT overweight and add 2 defensive picks (pharma/FMCG) to improve your risk-adjusted returns.";
  if (mult < 0.4)
    return "A bull run benefits your current portfolio. Consider increasing exposure to high-beta stocks like ZOMATO and PAYTM for additional upside. Set profit-booking targets at +20% from your average cost.";
  return "A super rally could see your portfolio gain significantly. However, markets that rally 50% often correct sharply after. Book partial profits (30–40%) at the peak to lock in gains.";
};

/**
 * Simulator — lets users pick a market scenario and preview how their
 *             portfolio would be affected.
 *
 * Props:
 *   holdings    array   — [{ symbol, qty, avgPrice }]
 *   stockMap    object  — symbol → stock
 *   scenario    string  — active scenario key
 *   setScenario fn
 *   dark        bool
 */
export default function Simulator({ holdings, stockMap, scenario, setScenario, dark }) {
  const { card, text, muted, tooltipStyle } = useTheme(dark);

  const portfolioValue = holdings.reduce(
    (sum, h) => sum + (stockMap[h.symbol]?.price ?? 0) * h.qty,
    0
  );

  const mult       = SCENARIOS[scenario];
  const afterValue = portfolioValue * (1 + mult);
  const change     = afterValue - portfolioValue;
  const positive   = change >= 0;
  const pct        = (mult * 100).toFixed(0);

  const barData = holdings.map((h) => {
    const s      = stockMap[h.symbol];
    const before = s ? s.price * h.qty : 0;
    const after  = before * (1 + mult);
    return { name: h.symbol, before: Math.round(before), after: Math.round(after) };
  });

  return (
    <div className="space-y-5">
      {/* ── Scenario picker ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className={`text-xs font-semibold tracking-widest mb-4 ${muted}`}>SELECT SCENARIO</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(SCENARIOS).map(([label, v]) => {
            const isCrash = v < 0;
            const active  = scenario === label;
            return (
              <button
                key={label}
                onClick={() => setScenario(label)}
                className={`py-3 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left ${
                  active
                    ? isCrash
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : dark
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <div className="text-base mb-0.5">{SCENARIO_EMOJI(v)}</div>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Before / After summary cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-2 ${muted}`}>CURRENT PORTFOLIO</div>
          <div className={`text-4xl font-bold mb-1 ${text}`}>₹{Math.round(portfolioValue).toLocaleString()}</div>
          <div className={`text-sm ${muted}`}>Real value right now</div>
        </div>

        <div
          className={`rounded-2xl border p-6 relative overflow-hidden ${
            positive
              ? dark ? "bg-emerald-950/50 border-emerald-800/50" : "bg-emerald-50 border-emerald-200"
              : dark ? "bg-red-950/50 border-red-900/50"         : "bg-red-50 border-red-200"
          }`}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: `radial-gradient(circle at 80% 50%, ${positive ? "#10b981" : "#ef4444"}, transparent)` }}
          />
          <div className={`text-xs font-semibold tracking-widest mb-2 ${positive ? dark ? "text-emerald-400" : "text-emerald-600" : dark ? "text-red-400" : "text-red-600"}`}>
            AFTER — {scenario.toUpperCase()}
          </div>
          <div className={`text-4xl font-bold mb-1 ${positive ? "text-emerald-500" : "text-red-500"}`}>
            ₹{Math.round(afterValue).toLocaleString()}
          </div>
          <div className={`text-sm font-semibold ${positive ? "text-emerald-500" : "text-red-500"}`}>
            {positive ? "+" : ""}₹{Math.round(change).toLocaleString()} ({positive ? "+" : ""}{pct}%)
          </div>
        </div>
      </div>

      {/* ── Position impact bar chart ─────────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className={`text-xs font-semibold tracking-widest mb-5 ${muted}`}>POSITION IMPACT BREAKDOWN</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barGap={4}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: dark ? "#6b7280" : "#9ca3af" }}
              axisLine={false} tickLine={false}
            />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${v.toLocaleString()}`, ""]} />
            <Bar dataKey="before" name="Before" radius={[4, 4, 0, 0]} fill={dark ? "#374151" : "#d1d5db"} />
            <Bar dataKey="after"  name="After"  radius={[4, 4, 0, 0]}>
              {barData.map((_, i) => (
                <Cell key={i} fill={positive ? "#10b981" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${dark ? "bg-gray-600" : "bg-gray-300"}`} />
            <span className={`text-xs ${muted}`}>Before</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: positive ? "#10b981" : "#ef4444" }} />
            <span className={`text-xs ${muted}`}>After scenario</span>
          </div>
        </div>
      </div>

      {/* ── AI protection tip ────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl border p-6 ${
          dark ? "bg-violet-950/30 border-violet-800/40" : "bg-violet-50 border-violet-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon name="info" size={16} cls={dark ? "text-violet-400" : "text-violet-600"} />
          <span className={`text-xs font-bold tracking-widest ${dark ? "text-violet-400" : "text-violet-600"}`}>
            AI PROTECTION TIP
          </span>
        </div>
        <p className={`text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-700"}`}>
          {AI_TIP(mult)}
        </p>
      </div>
    </div>
  );
}