import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const API_URL = "/api";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Portfolio({ dark }) {
  const { card, text, muted, divider, tooltipStyle } = useTheme(dark);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/portfolio/analytics`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const sectorData = analytics?.sectorAllocation 
    ? Object.entries(analytics.sectorAllocation).map(([name, value]) => ({ name, value }))
    : [];

  const riskColor = analytics?.riskLevel === "LOW" ? "#10b981" : analytics?.riskLevel === "MODERATE" ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${text}`}>Portfolio Analytics</h2>
        <p className={`text-sm ${muted}`}>Risk metrics and performance insights</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-2 ${muted}`}>PORTFOLIO VALUE</div>
          <div className={`text-2xl font-bold ${text}`}>₹{analytics?.portfolioValue?.toLocaleString() || 0}</div>
        </div>
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-2 ${muted}`}>TOTAL P&L</div>
          <div className={`text-2xl font-bold ${analytics?.totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {analytics?.totalPnl >= 0 ? "+" : ""}₹{analytics?.totalPnl?.toLocaleString() || 0}
          </div>
          <div className={`text-xs ${analytics?.pnlPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {analytics?.pnlPercent >= 0 ? "+" : ""}{analytics?.pnlPercent || 0}%
          </div>
        </div>
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-2 ${muted}`}>WIN RATE</div>
          <div className={`text-2xl font-bold ${text}`}>{analytics?.winRate || 0}%</div>
        </div>
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-2 ${muted}`}>RISK SCORE</div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold`} style={{ color: riskColor }}>{analytics?.riskScore || 0}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full`} style={{ background: `${riskColor}20`, color: riskColor }}>
              {analytics?.riskLevel || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation Pie */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-4 ${muted}`}>SECTOR ALLOCATION</div>
          {sectorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-64 flex items-center justify-center ${muted}`}>No holdings data</div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {sectorData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[index % COLORS.length] }} />
                <span className={`text-xs ${muted}`}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-4 ${muted}`}>RISK METRICS</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${muted}`}>Concentration Risk</span>
                <span className={`text-sm font-semibold ${text}`}>{Math.min(100, analytics?.riskScore || 0)}%</span>
              </div>
              <div className={`h-2 rounded-full ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, analytics?.riskScore || 0)}%`,
                    background: riskColor
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${muted}`}>Diversification</span>
                <span className={`text-sm font-semibold ${text}`}>{sectorData.length} sectors</span>
              </div>
              <div className={`h-2 rounded-full ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(100, sectorData.length * 15)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${muted}`}>Cash Position</span>
                <span className={`text-sm font-semibold ${text}`}>{((analytics?.cashBalance || 0) / (analytics?.portfolioValue || 1) * 100).toFixed(1)}%</span>
              </div>
              <div className={`h-2 rounded-full ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                <div 
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(100, ((analytics?.cashBalance || 0) / (analytics?.portfolioValue || 1) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="info" size={14} cls="text-blue-500" />
              <span className={`text-xs font-semibold ${text}`}>RISK ASSESSMENT</span>
            </div>
            <p className={`text-sm ${muted}`}>
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`rounded-xl border p-4 ${card}`}>
          <div className={`text-xs ${muted} mb-1`}>Total Invested</div>
          <div className={`text-lg font-bold ${text}`}>₹{analytics?.totalInvested?.toLocaleString() || 0}</div>
        </div>
        <div className={`rounded-xl border p-4 ${card}`}>
          <div className={`text-xs ${muted} mb-1`}>Cash Balance</div>
          <div className={`text-lg font-bold text-emerald-500`}>₹{analytics?.cashBalance?.toLocaleString() || 0}</div>
        </div>
        <div className={`rounded-xl border p-4 ${card}`}>
          <div className={`text-xs ${muted} mb-1`}>Total Trades</div>
          <div className={`text-lg font-bold ${text}`}>{analytics?.totalTransactions || 0}</div>
        </div>
        <div className={`rounded-xl border p-4 ${card}`}>
          <div className={`text-xs ${muted} mb-1`}>Positions</div>
          <div className={`text-lg font-bold ${text}`}>{analytics?.totalTransactions || 0}</div>
        </div>
      </div>
    </div>
  );
}