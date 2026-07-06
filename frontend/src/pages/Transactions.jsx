import { useState, useEffect, useMemo } from "react";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FILTER_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Buy", value: "BUY" },
  { label: "Sell", value: "SELL" },
];

function SummaryCard({ icon, label, value, valueCls, dark }) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3.5 transition hover:scale-[1.02] ${
      dark
        ? "bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-gray-900/30"
        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        dark ? "bg-gray-800" : "bg-gray-100"
      }`}>
        <Icon name={icon} size={18} cls={dark ? "text-violet-400" : "text-violet-600"} />
      </div>
      <div className="min-w-0">
        <div className={`text-[10px] font-semibold tracking-wider uppercase ${dark ? "text-gray-500" : "text-gray-400"}`}>
          {label}
        </div>
        <div className={`text-lg font-bold ${valueCls || (dark ? "text-white" : "text-gray-900")}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function Transactions({ dark }) {
  const { card, text, muted, divider } = useTheme(dark);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/transactions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch transactions:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (typeFilter !== "ALL") {
      list = list.filter(tx => tx.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toUpperCase();
      list = list.filter(tx => tx.symbol?.toUpperCase().includes(q));
    }

    list.sort((a, b) => {
      const da = new Date(a.timestamp).getTime();
      const db = new Date(b.timestamp).getTime();
      return sortNewest ? db - da : da - db;
    });

    return list;
  }, [transactions, typeFilter, search, sortNewest]);

  const summary = useMemo(() => {
    const total = transactions.length;
    const buys = transactions.filter(tx => tx.type === "BUY").length;
    const sells = transactions.filter(tx => tx.type === "SELL").length;
    const netPnl = transactions
      .filter(tx => tx.type === "SELL")
      .reduce((sum, tx) => sum + (tx.total || 0), 0)
      - transactions
        .filter(tx => tx.type === "BUY")
        .reduce((sum, tx) => sum + (tx.total || 0), 0);
    return { total, buys, sells, netPnl };
  }, [transactions]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${text} truncate`}>Transaction History</h2>
          <p className={`text-xs sm:text-sm ${muted}`}>Your complete trading activity</p>
        </div>
        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shrink-0 self-start sm:self-auto ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
          <span className={`text-xs sm:text-sm font-semibold ${muted}`}>{transactions.length} total trades</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          icon="list"
          label="Total Trades"
          value={summary.total}
          dark={dark}
        />
        <SummaryCard
          icon="trending_up"
          label="Buy Orders"
          value={summary.buys}
          valueCls="text-emerald-500"
          dark={dark}
        />
        <SummaryCard
          icon="trending_down"
          label="Sell Orders"
          value={summary.sells}
          valueCls="text-red-500"
          dark={dark}
        />
        <SummaryCard
          icon="account_balance"
          label="Net P&L"
          value={`${summary.netPnl >= 0 ? "+" : ""}₹${summary.netPnl.toLocaleString()}`}
          valueCls={summary.netPnl >= 0 ? "text-emerald-500" : "text-red-500"}
          dark={dark}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Icon name="market" size={14} cls={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by symbol..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition ${
              dark
                ? "bg-gray-800/60 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                typeFilter === opt.value
                  ? dark
                    ? "bg-violet-900/50 text-violet-300 border border-violet-800/40"
                    : "bg-violet-100 text-violet-700 border border-violet-200"
                  : dark
                    ? "bg-gray-800/60 text-gray-400 border border-gray-700 hover:bg-gray-800"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortNewest(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shrink-0 ${
            dark
              ? "bg-gray-800/60 text-gray-400 border border-gray-700 hover:bg-gray-800"
              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Icon name={sortNewest ? "chevron_down" : "chevron_up"} size={12} />
          {sortNewest ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className={`rounded-2xl border p-8 sm:p-12 text-center ${card}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            dark ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <Icon name="wallet" size={28} cls={dark ? "text-gray-500" : "text-gray-400"} />
          </div>
          <h3 className={`text-lg font-bold ${text} mb-1`}>No trades yet</h3>
          <p className={`text-sm ${muted} max-w-sm mx-auto mb-6`}>
            Your trading activity will appear here once you start buying and selling stocks.
          </p>
          <button
            onClick={() => window.location.hash = "#/market"}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              dark
                ? "bg-violet-600 hover:bg-violet-500 text-white"
                : "bg-violet-500 hover:bg-violet-600 text-white"
            }`}
          >
            <Icon name="market" size={14} />
            Browse Market
          </button>
        </div>
      ) : filtered.length === 0 ? (
        /* No results state */
        <div className={`rounded-2xl border p-8 sm:p-12 text-center ${card}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            dark ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <Icon name="market" size={22} cls={dark ? "text-gray-500" : "text-gray-400"} />
          </div>
          <h3 className={`text-base font-bold ${text} mb-1`}>No matching trades</h3>
          <p className={`text-sm ${muted}`}>Try adjusting your search or filters</p>
        </div>
      ) : (
        /* Transactions List */
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          {/* Desktop header */}
          <div className={`hidden sm:grid grid-cols-12 gap-3 px-6 py-3 border-b ${divider} text-[10px] font-semibold tracking-widest uppercase ${muted}`}>
            <div className="col-span-1" />
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Symbol</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-right">Date</div>
          </div>

          <div className={`divide-y ${dark ? "divide-gray-800/50" : "divide-gray-100"}`}>
            {filtered.map((tx, idx) => {
              const isBuy = tx.type === "BUY";
              return (
                <div
                  key={idx}
                  className={`group transition ${
                    dark
                      ? "hover:bg-gray-800/40"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Mobile card */}
                  <div className="sm:hidden p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isBuy
                            ? dark ? "bg-emerald-900/50" : "bg-emerald-100"
                            : dark ? "bg-red-900/50" : "bg-red-100"
                        }`}>
                          <Icon
                            name={isBuy ? "trending_up" : "trending_down"}
                            size={16}
                            cls={isBuy ? "text-emerald-500" : "text-red-500"}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold tracking-wider ${isBuy ? "text-emerald-500" : "text-red-500"}`}>
                              {tx.type}
                            </span>
                            <span className={`text-sm font-bold ${text}`}>{tx.symbol}</span>
                          </div>
                          <div className={`text-[10px] ${muted}`}>{formatDate(tx.timestamp)}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${isBuy ? "text-red-500" : "text-emerald-500"}`}>
                        {isBuy ? "-" : "+"}₹{tx.total.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className={muted}>Qty: </span>
                        <span className={`font-semibold ${text}`}>{tx.qty}</span>
                      </div>
                      <div>
                        <span className={muted}>Price: </span>
                        <span className={`font-semibold ${text}`}>₹{tx.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop row */}
                  <div className={`hidden sm:grid grid-cols-12 gap-3 items-center px-6 py-4 transition`}>
                    <div className="col-span-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition group-hover:scale-110 ${
                        isBuy
                          ? dark ? "bg-emerald-900/50" : "bg-emerald-100"
                          : dark ? "bg-red-900/50" : "bg-red-100"
                      }`}>
                        <Icon
                          name={isBuy ? "trending_up" : "trending_down"}
                          size={16}
                          cls={isBuy ? "text-emerald-500" : "text-red-500"}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs font-bold tracking-wider ${isBuy ? "text-emerald-500" : "text-red-500"}`}>
                        {tx.type}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-sm font-bold ${text}`}>{tx.symbol}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-semibold ${text}`}>{tx.qty}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-semibold ${text}`}>₹{tx.price.toLocaleString()}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-bold ${isBuy ? "text-red-500" : "text-emerald-500"}`}>
                        {isBuy ? "-" : "+"}₹{tx.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className={`text-[10px] ${muted} whitespace-nowrap`}>{formatDate(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
