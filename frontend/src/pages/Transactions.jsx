import { useState, useEffect } from "react";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const API_URL = "/api";

export default function Transactions({ dark }) {
  const { card, text, muted, divider } = useTheme(dark);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/transactions`, { credentials: 'include' })
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

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>Transaction History</h2>
          <p className={`text-sm ${muted}`}>Your complete trading activity</p>
        </div>
        <div className={`px-4 py-2 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
          <span className={`text-sm font-semibold ${muted}`}>{transactions.length} transactions</span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center ${card}`}>
          <Icon name="wallet" size={48} cls={`${muted} mb-4`} />
          <p className={`text-lg font-semibold ${text}`}>No transactions yet</p>
          <p className={`text-sm ${muted}`}>Start trading to see your transaction history here</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${card}`}>
          <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
            <span className={`text-xs font-semibold tracking-widest ${muted}`}>ALL TRANSACTIONS</span>
          </div>
          <div className={`divide-y ${dark ? "divide-gray-800/50" : "divide-gray-100"}`}>
            {[...transactions].reverse().map((tx, idx) => {
              const isBuy = tx.type === "BUY";
              return (
                <div key={idx} className={`flex items-center gap-4 px-6 py-4 transition`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isBuy 
                      ? dark ? "bg-emerald-900/50" : "bg-emerald-100"
                      : dark ? "bg-red-900/50" : "bg-red-100"
                  }`}>
                    <Icon 
                      name={isBuy ? "trending_up" : "trending_down"} 
                      size={18} 
                      cls={isBuy ? "text-emerald-500" : "text-red-500"} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${text}`}>{tx.type}</span>
                      <span className={`text-sm font-semibold ${isBuy ? "text-emerald-500" : "text-red-500"}`}>{tx.symbol}</span>
                    </div>
                    <div className={`text-xs ${muted}`}>
                      {tx.qty} shares @ ₹{tx.price.toLocaleString()} · {formatDate(tx.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isBuy ? "text-red-500" : "text-emerald-500"}`}>
                      {isBuy ? "-" : "+"}₹{tx.total.toLocaleString()}
                    </div>
                    <div className={`text-xs ${muted}`}>
                      Total
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