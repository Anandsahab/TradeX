import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Icon, CircularProgress } from "../components/ui.jsx";
import TradeXAssistant from "../components/TradeXAssistant.jsx";
import { useTheme } from "../hooks/useTheme.js";

const USER_DATA = {
  "1": {
    username: "Demo",
    holdings: [
      { symbol: "RELIANCE", qty: 25, avgPrice: 2450 },
      { symbol: "HDFC", qty: 40, avgPrice: 1650 },
      { symbol: "TCS", qty: 15, avgPrice: 3200 },
      { symbol: "INFY", qty: 30, avgPrice: 1420 },
    ],
  },
  "2": {
    username: "Alex",
    holdings: [
      { symbol: "HDFC", qty: 50, avgPrice: 1500 },
      { symbol: "INFY", qty: 20, avgPrice: 1300 },
      { symbol: "SBIN", qty: 100, avgPrice: 450 },
    ],
  },
};

function AnimatedNumber({ value, prefix = "₹", duration = 1.5 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = 0;
    const end = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{displayValue.toLocaleString()}</span>;
}

export default function Dashboard({ holdings, stockMap, wallet, dark, onSell, user }) {
  const { card, text, muted, divider, hover, tooltipStyle, chartTick } = useTheme(dark);
  const [chartMode, setChartMode] = useState("line");
  const [currentUserId, setCurrentUserId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("demoUserId") || "1";
    }
    return "1";
  });

  const switchUser = () => {
    const newId = currentUserId === "1" ? "2" : "1";
    localStorage.setItem("demoUserId", newId);
    setCurrentUserId(newId);
    window.location.reload();
  };

  const portfolioValue = holdings.reduce(
    (sum, h) => sum + (stockMap[h.symbol]?.price ?? 0) * h.qty,
    0
  );
  const totalInvested = holdings.reduce((sum, h) => sum + h.avgPrice * h.qty, 0);
  const totalPnL = portfolioValue - totalInvested;
  const pnlPct = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

  const riskScore = Math.min(
    100,
    Math.round(
      holdings.reduce((max, h) => {
        const val = (stockMap[h.symbol]?.price ?? 0) * h.qty;
        return Math.max(max, (val / Math.max(portfolioValue, 1)) * 100);
      }, 0) * 0.5 +
      (holdings.filter((h) => stockMap[h.symbol]?.sector === "IT").length /
        Math.max(holdings.length, 1)) * 100 * 0.3 +
      20
    )
  );

  const lossProbability = Math.min(85, Math.round(10 + riskScore * 0.75));
  const riskColor = riskScore < 35 ? "#10b981" : riskScore < 65 ? "#f59e0b" : "#ef4444";
  const riskLabel = riskScore < 35 ? "LOW RISK" : riskScore < 65 ? "MODERATE" : "HIGH RISK";

  const generateCandleData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let baseValue = 85000;
    return days.map((day) => {
      const open = baseValue;
      const change = (Math.random() - 0.45) * 6000;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 2000;
      const low = Math.min(open, close) - Math.random() * 1500;
      baseValue = close;
      return {
        name: day,
        open: Math.round(open),
        close: Math.round(close),
        high: Math.round(high),
        low: Math.round(low),
        value: Math.round(close),
        isGreen: close >= open,
      };
    });
  };

  const candleData = generateCandleData();
  const chartData = [
    { name: "Mon", value: 91200 },
    { name: "Tue", value: 93400 },
    { name: "Wed", value: 90100 },
    { name: "Thu", value: 95600 },
    { name: "Fri", value: 94300 },
    { name: "Sat", value: +portfolioValue.toFixed(0) },
  ];

  const isProfit = totalPnL >= 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative"
    >
      {/* Background gradient */}
      <div
        className={`fixed inset-0 pointer-events-none -z-10 ${dark
          ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950"
          : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white"
          }`}
      />

      {/* Switch User button */}
      <motion.button
        variants={itemVariants}
        onClick={switchUser}
        className={`self-start mb-2 sm:mb-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${dark
          ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
          : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
          }`}
      >
        Switch User ({USER_DATA[currentUserId]?.username || "Demo"})
      </motion.button>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className={`rounded-2xl border p-6 relative overflow-hidden transition-all duration-300 ${dark
            ? "bg-gradient-to-br from-emerald-900/60 to-gray-900 border-emerald-800/50 hover:shadow-lg hover:shadow-emerald-900/20"
            : "bg-gradient-to-br from-emerald-50 to-white border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/20"
            }`}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #10b981, transparent)", transform: "translate(30%,-30%)" }}
          />
          <div className={`text-xs font-semibold tracking-widest mb-1 ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
            VIRTUAL WALLET
          </div>
          <div className={`text-4xl font-bold mb-1 ${text}`}>
            <AnimatedNumber value={Math.round(wallet)} />
          </div>
          <div className={`text-sm ${muted}`}>Available to invest</div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex-1 h-1.5 rounded-full ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (wallet / 100000) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className={`text-xs ${muted}`}>{((wallet / 100000) * 100).toFixed(0)}%</span>
          </div>
        </motion.div>

        {/* Portfolio value */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className={`rounded-2xl border p-6 transition-all duration-300 ${card
            }`}
        >
          <div className={`text-xs font-semibold tracking-widest mb-1 ${muted}`}>PORTFOLIO VALUE</div>
          <div className={`text-4xl font-bold mb-1 ${text}`}>
            <AnimatedNumber value={Math.round(portfolioValue)} />
          </div>
          <motion.div
            className={`flex items-center gap-1.5 text-sm ${isProfit ? "text-emerald-500" : "text-red-500"
              }`}
            initial={false}
            animate={isProfit ? { boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)" } : {}}
          >
            <Icon name={isProfit ? "trending_up" : "trending_down"} size={16} />
            <span className="font-semibold">
              {isProfit ? "+" : "-"}₹{Math.abs(Math.round(totalPnL)).toLocaleString()}
            </span>
            <span className="opacity-70">({isProfit ? "+" : "-"}{pnlPct}%)</span>
          </motion.div>
        </motion.div>

        {/* Risk score */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className={`rounded-2xl border p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-5 transition-all duration-300 ${card}`}
        >
          <CircularProgress value={riskScore} size={80} color={riskColor} />
          <div className="text-center sm:text-left">
            <div className={`text-xs font-semibold tracking-widest mb-1 ${muted}`}>RISK SCORE</div>
            <div className="text-base sm:text-lg font-bold" style={{ color: riskColor }}>
              {riskLabel}
            </div>
            <div className={`text-xs mt-1 ${muted}`}>Loss Probability</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                <motion.div
                  className="h-full rounded-full transition-all duration-1000"
                  initial={{ width: 0 }}
                  animate={{ width: `${lossProbability}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ background: `linear-gradient(90deg, #f59e0b, ${riskColor})` }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: riskColor }}>
                {lossProbability}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart + AI advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className={`lg:col-span-2 rounded-2xl border p-6 transition-all duration-300 ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`text-xs font-semibold tracking-widest ${muted}`}>
              PORTFOLIO PERFORMANCE — THIS WEEK
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setChartMode("line")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${chartMode === "line"
                  ? "bg-emerald-500 text-white"
                  : dark
                    ? "bg-gray-800 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartMode("candle")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${chartMode === "candle"
                  ? "bg-emerald-500 text-white"
                  : dark
                    ? "bg-gray-800 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                Candle
              </button>
            </div>
          </div>
          <div className={`text-xs ${muted} mb-3`}>Simulated real-time portfolio performance</div>
          <AnimatePresence mode="wait">
            {chartMode === "line" ? (
              <motion.div
                key="line"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: chartTick, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v) => [<span className="font-bold text-emerald-400">₹{v.toLocaleString()}</span>, "Portfolio Value"]}
                      labelStyle={{ fontWeight: 600, color: dark ? "#e5e7eb" : "#374151", marginBottom: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="url(#pg)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#10b981", stroke: "#10b981" }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div
                key="candle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={candleData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: chartTick, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v, name, props) => [
                        <span className="font-bold" style={{ color: props.payload.isGreen ? "#10b981" : "#ef4444" }}>₹{v.toLocaleString()}</span>,
                        "Close Price"
                      ]}
                      labelStyle={{ fontWeight: 600, color: dark ? "#e5e7eb" : "#374151", marginBottom: 4 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500}>
                      {candleData.map((entry, index) => (
                        <Cell key={index} fill={entry.isGreen ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* TradeX Assistant */}
        <TradeXAssistant dark={dark} username={user?.username || "Trader"} />
      </div>

      {/* Holdings list */}
      <motion.div
        variants={itemVariants}
        className={`rounded-2xl border ${card}`}
      >
        <div className={`px-4 sm:px-6 py-4 border-b ${divider} flex items-center justify-between`}>
          <span className={`text-xs font-semibold tracking-widest ${muted}`}>YOUR HOLDINGS</span>
          <span className={`text-xs ${muted}`}>{holdings.length} positions</span>
        </div>
        {holdings.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
            <div className="text-3xl sm:text-4xl mb-3">🚀</div>
            <div className={`text-base sm:text-lg font-semibold ${text}`}>No investments yet</div>
            <div className={`text-xs sm:text-sm ${muted}`}>Start trading to build your portfolio</div>
          </div>
        ) : (
          <div className={`divide-y ${dark ? "divide-gray-800/50" : "divide-gray-100"}`}>
            {holdings.map((h) => {
              const s = stockMap[h.symbol];
              if (!s) return null;
              const curr = s.price * h.qty;
              const cost = h.avgPrice * h.qty;
              const pnl = curr - cost;
              const pnlP = ((pnl / cost) * 100).toFixed(2);
              const isHoldingProfit = pnl >= 0;

              return (
                <motion.div
                  key={h.symbol}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-3.5 transition ${hover}`}
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${dark ? "bg-gray-800" : "bg-gray-100"
                      } ${text}`}
                  >
                    {h.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs sm:text-sm font-semibold ${text}`}>{h.symbol}</div>
                    <div className={`text-xs ${muted}`}>
                      {h.qty} shares · avg ₹{h.avgPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs sm:text-sm font-bold ${text}`}>
                      ₹{Math.round(curr).toLocaleString()}
                    </div>
                    <motion.div
                      className={`text-xs font-semibold ${isHoldingProfit ? "text-emerald-500" : "text-red-500"
                        }`}
                      initial={false}
                      animate={
                        isHoldingProfit
                          ? { boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" }
                          : {}
                      }
                    >
                      {isHoldingProfit ? "+" : ""}₹{Math.round(pnl).toLocaleString()} (
                      {isHoldingProfit ? "+" : ""}
                      {pnlP}%)
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSell && onSell(h)}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition shrink-0"
                  >
                    SELL
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}