import { useState } from "react";
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

const SCENARIO_DESC = {
  "Market Crash (-35%)":    "Broad market downturn — most stocks fall sharply",
  "Sector Correction (-20%)": "Targeted decline in specific sectors",
  "Mild Dip (-10%)":        "Minor pullback — temporary price drop",
  "Sideways (0%)":          "Minimal movement — prices stay flat",
  "Bull Run (+25%)":        "Strong market upswing — broad gains",
  "Super Rally (+50%)":     "Extreme growth — rapid price surge",
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

export default function Simulator({ holdings, stockMap, scenario, setScenario, dark }) {
  const { card, text, muted, subtle, tooltipStyle, chartTick } = useTheme(dark);
  const [showHelp, setShowHelp] = useState(false);

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
    <div className="space-y-4 sm:space-y-5">
      {/* ── Intro explanation ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 sm:p-5 ${dark ? "bg-blue-950/30 border-blue-800/40" : "bg-blue-50 border-blue-200"}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-blue-900/50" : "bg-blue-100"}`}>
            <Icon name="info" size={16} cls={dark ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold tracking-widest mb-1 ${dark ? "text-blue-400" : "text-blue-600"}`}>
              HOW THE SIMULATOR WORKS
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-700"}`}>
              Select a market scenario below to see how your current portfolio would be affected. The simulator applies a uniform percentage change to every holding — it's a useful way to understand potential outcomes, though real markets affect each stock differently.
            </p>
          </div>
        </div>
      </div>

      {/* ── Scenario picker ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`text-xs font-semibold tracking-widest ${muted}`}>SELECT A MARKET SCENARIO</div>
          <div className="relative">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-gray-800 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}
              aria-label="How percentages work"
            >
              <Icon name="info" size={16} />
            </button>
            {showHelp && (
              <div
                className={`absolute right-0 top-full mt-2 w-64 sm:w-72 p-3 rounded-xl border text-xs leading-relaxed shadow-xl z-10 ${
                  dark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-600"
                }`}
                style={{ animation: "fadeIn .2s ease" }}
              >
                <div className={`font-semibold mb-1 ${text}`}>How scenario percentages work</div>
                <p>
                  Each scenario applies a <strong>uniform percentage change</strong> to every holding in your portfolio. For example, a <strong>-35% crash</strong> means every stock's value drops by 35%. In reality, some stocks fall more or less than others — this is a simplified simulation to help you understand potential outcomes.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(SCENARIOS).map(([label, v]) => {
            const isCrash = v < 0;
            const active  = scenario === label;
            return (
              <button
                key={label}
                onClick={() => setScenario(label)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all text-left ${
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
                <div className={`${active ? "text-white" : text}`}>{label}</div>
                <div className={`mt-0.5 leading-tight ${active ? "text-white/70" : subtle}`}>
                  {SCENARIO_DESC[label]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Comparison explanation ──────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-1 ${muted}`}>
        <div className="flex-1 h-px bg-current opacity-20" />
        <span className="text-[10px] sm:text-xs font-semibold tracking-widest whitespace-nowrap">
          CURRENT VS SIMULATED VALUE
        </span>
        <div className="flex-1 h-px bg-current opacity-20" />
      </div>

      {/* ── Before / After summary cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded flex items-center justify-center ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <span className="text-[9px] font-bold">B</span>
            </div>
            <div className={`text-xs font-semibold tracking-widest ${muted}`}>CURRENT VALUE</div>
          </div>
          <div className={`text-2xl sm:text-4xl font-bold mb-1 ${text}`}>₹{Math.round(portfolioValue).toLocaleString()}</div>
          <div className={`text-xs sm:text-sm ${muted}`}>Your portfolio value right now</div>
        </div>

        <div
          className={`rounded-2xl border p-4 sm:p-6 relative overflow-hidden ${
            positive
              ? dark ? "bg-emerald-950/50 border-emerald-800/50" : "bg-emerald-50 border-emerald-200"
              : dark ? "bg-red-950/50 border-red-900/50"         : "bg-red-50 border-red-200"
          }`}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: `radial-gradient(circle at 80% 50%, ${positive ? "#10b981" : "#ef4444"}, transparent)` }}
          />
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold ${positive ? "bg-emerald-500" : "bg-red-500"}`}>A</div>
            <div className={`text-xs font-semibold tracking-widest ${positive ? dark ? "text-emerald-400" : "text-emerald-600" : dark ? "text-red-400" : "text-red-600"}`}>
              SIMULATED VALUE
            </div>
          </div>
          <div className={`text-2xl sm:text-4xl font-bold mb-1 ${positive ? "text-emerald-500" : "text-red-500"}`}>
            ₹{Math.round(afterValue).toLocaleString()}
          </div>
          <div className={`text-xs sm:text-sm font-semibold ${positive ? "text-emerald-500" : "text-red-500"}`}>
            {positive ? "+" : ""}₹{Math.round(change).toLocaleString()} ({positive ? "+" : ""}{pct}%)
          </div>
          <div className={`text-xs mt-1 ${positive ? "text-emerald-600/70" : "text-red-400/70"}`}>
            {holdings.length === 0
              ? "No holdings to simulate"
              : `If ${scenario.toLowerCase()} scenario plays out`}
          </div>
        </div>
      </div>

      {/* ── Negative holdings warning ────────────────────────────────────────── */}
      {holdings.length === 0 && (
        <div className={`rounded-2xl border p-6 text-center ${card}`}>
          <div className="text-3xl mb-3">📭</div>
          <div className={`text-base sm:text-lg font-semibold ${text}`}>No holdings to simulate</div>
          <div className={`text-xs sm:text-sm ${muted}`}>Buy some stocks first, then come back to test scenarios.</div>
        </div>
      )}

      {/* ── Position impact bar chart ─────────────────────────────────────── */}
      {holdings.length > 0 && (
        <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
          <div className="flex items-center justify-between mb-1">
            <div className={`text-xs font-semibold tracking-widest ${muted}`}>POSITION IMPACT BREAKDOWN</div>
            <div className={`text-[10px] ${muted}`}>Per-holding comparison</div>
          </div>
          <div className={`text-xs mb-5 ${muted}`}>
            How {scenario.toLowerCase()} affects each stock in your portfolio
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: chartTick, fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, name) => [
                  <span className={`font-bold ${name === "after" ? (positive ? "text-emerald-400" : "text-red-400") : ""}`}>₹{v.toLocaleString()}</span>,
                  name === "before" ? "Current Value" : "Simulated Value"
                ]}
                labelStyle={{ fontWeight: 600, color: dark ? "#e5e7eb" : "#374151", marginBottom: 4 }}
              />
              <Bar dataKey="before" name="before" radius={[4, 4, 0, 0]} fill={dark ? "#4b5563" : "#d1d5db"} />
              <Bar dataKey="after"  name="after"  radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={positive ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-5 sm:gap-8 mt-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm border ${dark ? "bg-gray-600 border-gray-500" : "bg-gray-300 border-gray-400"}`} />
              <span className="text-xs">
                <span className={`font-semibold ${text}`}>Before</span>
                <span className={`ml-1 ${muted}`}>— current</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border" style={{ background: positive ? "#10b981" : "#ef4444", borderColor: positive ? "#059669" : "#dc2626" }} />
              <span className="text-xs">
                <span className={`font-semibold ${text}`}>After</span>
                <span className={`ml-1 ${muted}`}>— simulated</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── AI protection tip ────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl border p-4 sm:p-6 ${
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
