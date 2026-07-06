import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const getSeverityLabel = (score) => {
  if (score <= 33) return { label: "LOW", color: "#10b981", bg: "bg-emerald-500/15 text-emerald-500" };
  if (score <= 66) return { label: "MODERATE", color: "#f59e0b", bg: "bg-amber-500/15 text-amber-500" };
  return { label: "HIGH", color: "#ef4444", bg: "bg-red-500/15 text-red-500" };
};

export default function Portfolio({ dark, stockMap }) {
  const { card, text, muted, subtle, tooltipStyle } = useTheme(dark);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setRefreshing(true);
    try {
      const [summaryRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/portfolio/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/portfolio/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      
      const summaryData = await summaryRes.json();
      const analyticsData = await analyticsRes.json();
      
      setSummary(summaryData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totalValue = summary?.currentValue || 0;
  const invested = summary?.totalInvested || 0;
  const pnl = summary?.profitLoss || 0;
  const pnlPercent = summary?.pnlPercent || 0;

  const sectorData = analytics?.sectorAllocation 
    ? Object.entries(analytics.sectorAllocation).map(([name, value]) => ({ name, value }))
    : [];

  const riskColor = analytics?.riskLevel === "LOW" ? "#10b981" : analytics?.riskLevel === "MODERATE" ? "#f59e0b" : "#ef4444";

  const dominantSector = useMemo(() => {
    if (sectorData.length === 0) return null;
    return sectorData.reduce((max, s) => s.value > max.value ? s : max, sectorData[0]);
  }, [sectorData]);

  const insight = useMemo(() => {
    if (dominantSector && dominantSector.value > 50) {
      return {
        text: `Your portfolio is heavily concentrated in the ${dominantSector.name} sector.`,
        type: "warning",
        icon: "alert"
      };
    }
    if (sectorData.length > 0 && sectorData.length <= 2) {
      return {
        text: "Your portfolio lacks diversification. Spreading investments across more sectors can reduce risk.",
        type: "warning",
        icon: "alert"
      };
    }
    if (pnl > 0) {
      return {
        text: `Your portfolio is up ${pnlPercent.toFixed(1)}% — you're on the right track! Consider reviewing allocation regularly.`,
        type: "success",
        icon: "check"
      };
    }
    return {
      text: "Consistent investing and sector diversification are key to long-term portfolio growth.",
      type: "info",
      icon: "info"
    };
  }, [dominantSector, sectorData, pnl, pnlPercent]);

  const cashPercent = ((analytics?.cashBalance || 0) / (analytics?.portfolioValue || 1) * 100);
  const totalPortfolioValue = totalValue + (summary?.cashBalance || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const cardHover = `transition-all duration-200 hover:-translate-y-0.5 ${dark ? 'hover:shadow-xl hover:shadow-black/20' : 'hover:shadow-lg hover:shadow-black/5'}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${text} truncate`}>Portfolio Dashboard</h2>
          <p className={`text-xs sm:text-sm ${muted} hidden sm:block`}>Performance overview with real-time updates</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {refreshing && (
            <span className={`text-xs ${muted} flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Updating...
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={refreshing}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              refreshing ? "opacity-50 cursor-not-allowed" : ""
            } ${dark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Icon name="refresh" size={14} /> Refresh
            </span>
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className={`rounded-2xl border p-5 ${card} ${cardHover}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${muted}`}>Current Value</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <Icon name="wallet" size={16} cls="text-emerald-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${text}`}>₹{totalValue.toLocaleString()}</div>
        </div>

        <div className={`rounded-2xl border p-5 ${card} ${cardHover}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${muted}`}>Invested Amount</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <Icon name="trending_up" size={16} cls="text-blue-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${text}`}>₹{invested.toLocaleString()}</div>
        </div>

        <div className={`rounded-2xl border p-5 ${card} ${cardHover} ${
          pnl >= 0
            ? dark ? 'shadow-emerald-500/5' : ''
            : dark ? 'shadow-red-500/5' : ''
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${muted}`}>Profit / Loss</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              pnl >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'
            }`}>
              <Icon
                name={pnl >= 0 ? "trending_up" : "trending_down"}
                size={16}
                cls={pnl >= 0 ? "text-emerald-500" : "text-red-500"}
              />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-lg font-bold ${pnlPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
            </span>
            <span className={`flex items-center gap-1 text-xs ${muted}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${pnl >= 0 ? 'bg-emerald-500 animate-pulse-soft' : 'bg-red-500 animate-pulse-soft'}`} />
              {pnl >= 0 ? "Gain" : "Loss"}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`rounded-xl border p-4 ${card} ${cardHover}`}>
          <div className={`text-xs ${muted} mb-1.5`}>Cash Balance</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-emerald-500 ${dark ? 'shadow-sm shadow-emerald-500/50' : ''}`} />
            <span className="text-lg font-bold text-emerald-500">₹{summary?.cashBalance?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${card} ${cardHover}`}>
          <div className={`text-xs ${muted} mb-1.5`}>Total Portfolio</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dark ? 'bg-gray-600' : 'bg-gray-400'}`} />
            <span className={`text-lg font-bold ${text}`}>₹{totalPortfolioValue.toLocaleString()}</span>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${card} ${cardHover}`}>
          <div className={`text-xs ${muted} mb-1.5`}>Win Rate</div>
          <div className="flex items-center gap-2">
            <Icon name="assessment" size={14} cls={muted} />
            <span className={`text-lg font-bold ${text}`}>{analytics?.winRate || 0}%</span>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${card} ${cardHover}`}>
          <div className={`text-xs ${muted} mb-1.5`}>Risk Level</div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full`} style={{ background: riskColor, boxShadow: dark ? `0 0 6px ${riskColor}66` : 'none' }} />
            <span className={`text-lg font-bold`} style={{ color: riskColor }}>
              {analytics?.riskLevel || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sector Allocation */}
        <div className={`rounded-2xl border p-4 sm:p-6 ${card} ${cardHover}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${muted}`}>Sector Allocation</div>
              {sectorData.length > 0 && (
                <p className={`text-xs ${subtle} mt-0.5`}>{sectorData.length} sectors across portfolio</p>
              )}
            </div>
          </div>
          {sectorData.length > 0 ? (
            <>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="transition-opacity duration-200 hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        ...tooltipStyle,
                        borderRadius: 12,
                        border: dark ? '1px solid #1f2937' : '1px solid #e5e7eb',
                      }}
                      formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                      labelStyle={{ display: 'none' }}
                    />
                    {sectorData.length > 0 && (
                      <>
                        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
                          fill={dark ? "#e5e7eb" : "#111827"}
                          fontSize="20" fontWeight="700">
                          {sectorData.length}
                        </text>
                        <text x="50%" y="48%" dy="20" textAnchor="middle" dominantBaseline="middle"
                          fill={dark ? "#9ca3af" : "#6b7280"}
                          fontSize="11">
                          sectors
                        </text>
                      </>
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-4 justify-center">
                {sectorData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[index % COLORS.length] }} />
                    <span className={`text-xs font-medium ${text}`}>{entry.name}</span>
                    <span className={`text-xs font-semibold ${muted}`}>{entry.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              {dominantSector && (
                <div className={`mt-4 p-3 rounded-xl text-xs leading-relaxed ${
                  dark ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <Icon name="info" size={11} cls="inline mr-1.5 text-amber-500" />
                  <span className={muted}>
                    Dominant sector: <span className={`font-semibold ${text}`}>{dominantSector.name}</span> at {dominantSector.value.toFixed(1)}% allocation
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={`h-[280px] flex items-center justify-center ${muted}`}>No holdings data</div>
          )}
        </div>

        {/* Risk Metrics */}
        <div className={`rounded-2xl border p-4 sm:p-6 ${card} ${cardHover}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${muted}`}>Risk Metrics</div>
              <p className={`text-xs ${subtle} mt-0.5`}>Portfolio health overview</p>
            </div>
            {analytics?.riskLevel && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                analytics.riskLevel === "LOW" ? "bg-emerald-500/15 text-emerald-500" :
                analytics.riskLevel === "MODERATE" ? "bg-amber-500/15 text-amber-500" :
                "bg-red-500/15 text-red-500"
              }`}>
                {analytics.riskLevel}
              </span>
            )}
          </div>

          <div className="space-y-5">
            {/* Concentration Risk */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm ${text}`}>Concentration Risk</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${text}`}>{Math.min(100, analytics?.riskScore || 0)}%</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityLabel(analytics?.riskScore || 0).bg}`}>
                    {getSeverityLabel(analytics?.riskScore || 0).label}
                  </span>
                </div>
              </div>
              <div className={`h-2.5 rounded-full ${dark ? "bg-gray-700/60" : "bg-gray-200"} overflow-hidden`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, analytics?.riskScore || 0)}%`,
                    background: riskColor,
                    boxShadow: dark ? `0 0 8px ${riskColor}44` : 'none',
                  }}
                />
              </div>
              <p className={`text-xs mt-1.5 ${subtle}`}>
                {analytics?.riskLevel === "LOW"
                  ? "Well-diversified across sectors"
                  : analytics?.riskLevel === "MODERATE"
                  ? "Moderate concentration — consider reviewing top holdings"
                  : "Highly concentrated — adding positions reduces risk"
                }
              </p>
            </div>

            {/* Diversification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm ${text}`}>Diversification</span>
                <span className={`text-sm font-semibold ${text}`}>{sectorData.length} sectors</span>
              </div>
              <div className={`h-2.5 rounded-full ${dark ? "bg-gray-700/60" : "bg-gray-200"} overflow-hidden`}>
                <div
                  className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                  style={{
                    width: `${Math.min(100, sectorData.length * 15)}%`,
                    boxShadow: dark ? '0 0 8px #10b98144' : 'none',
                  }}
                />
              </div>
              <p className={`text-xs mt-1.5 ${subtle}`}>
                {sectorData.length >= 4
                  ? "Good spread across multiple sectors"
                  : sectorData.length >= 2
                  ? "Consider adding more sectors for better diversification"
                  : "Portfolio is concentrated in one sector"
                }
              </p>
            </div>

            {/* Cash Position */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm ${text}`}>Cash Position</span>
                <span className={`text-sm font-semibold ${text}`}>{cashPercent.toFixed(1)}%</span>
              </div>
              <div className={`h-2.5 rounded-full ${dark ? "bg-gray-700/60" : "bg-gray-200"} overflow-hidden`}>
                <div
                  className="h-full rounded-full transition-all duration-500 bg-blue-500"
                  style={{
                    width: `${Math.min(100, cashPercent)}%`,
                    boxShadow: dark ? '0 0 8px #3b82f644' : 'none',
                  }}
                />
              </div>
              <p className={`text-xs mt-1.5 ${subtle}`}>
                {cashPercent > 30
                  ? "High cash position — consider deploying into opportunities"
                  : cashPercent > 10
                  ? "Healthy cash reserve for new trades"
                  : "Mostly invested in the market"
                }
              </p>
            </div>
          </div>

          <div className={`mt-5 p-4 rounded-xl ${dark ? "bg-gray-800/60" : "bg-gray-50"} border-l-4`} style={{ borderLeftColor: riskColor }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="info" size={13} cls="text-blue-500" />
              <span className={`text-xs font-semibold ${text}`}>RISK ASSESSMENT</span>
            </div>
            <p className={`text-sm leading-relaxed ${muted}`}>
              {analytics?.riskLevel === "LOW" 
                ? "Your portfolio has good diversification across sectors. Consider exploring more growth opportunities."
                : analytics?.riskLevel === "MODERATE"
                ? "Your portfolio shows moderate concentration. Review your holdings to improve diversification."
                : "Your portfolio is highly concentrated. Consider adding more positions to reduce risk."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Insight Card */}
      <div className={`rounded-2xl border p-5 ${card} ${cardHover} relative overflow-hidden`}>
        <div className={`absolute inset-y-0 left-0 w-1 ${
          insight.type === "warning" ? "bg-amber-500" : insight.type === "success" ? "bg-emerald-500" : "bg-blue-500"
        }`} />
        <div className="flex items-start gap-4 pl-2">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            insight.type === "warning"
              ? "bg-amber-500/15 text-amber-500"
              : insight.type === "success"
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-blue-500/15 text-blue-500"
          }`}>
            <Icon name={insight.icon} size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold tracking-[0.08em] uppercase ${
                insight.type === "warning" ? "text-amber-500" : insight.type === "success" ? "text-emerald-500" : "text-blue-500"
              }`}>
                Portfolio Insight
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                insight.type === "warning"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : insight.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}>
                {insight.type === "warning" ? "Action" : insight.type === "success" ? "Update" : "Tip"}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${text}`}>{insight.text}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div>
        <div className={`text-xs font-semibold tracking-[0.08em] uppercase ${muted} mb-3`}>Portfolio Details</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className={`rounded-xl border p-3.5 sm:p-4 ${card} ${cardHover}`}>
            <div className={`text-xs ${muted} mb-1`}>Total Invested</div>
            <div className={`text-sm sm:text-lg font-bold ${text}`}>₹{analytics?.totalInvested?.toLocaleString() || 0}</div>
          </div>
          <div className={`rounded-xl border p-3.5 sm:p-4 ${card} ${cardHover}`}>
            <div className={`text-xs ${muted} mb-1`}>Cash Balance</div>
            <div className={`text-sm sm:text-lg font-bold text-emerald-500`}>₹{analytics?.cashBalance?.toLocaleString() || 0}</div>
          </div>
          <div className={`rounded-xl border p-3.5 sm:p-4 ${card} ${cardHover}`}>
            <div className={`text-xs ${muted} mb-1`}>Total Trades</div>
            <div className={`text-sm sm:text-lg font-bold ${text}`}>{analytics?.totalTransactions || 0}</div>
          </div>
          <div className={`rounded-xl border p-3.5 sm:p-4 ${card} ${cardHover}`}>
            <div className={`text-xs ${muted} mb-1`}>Positions</div>
            <div className={`text-sm sm:text-lg font-bold ${text}`}>{analytics?.totalTransactions || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
