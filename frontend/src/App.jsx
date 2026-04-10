import { useState, useEffect } from "react";

import { INITIAL_HOLDINGS, buildStockMap, buildSparklines } from "./constants.js";

import Navbar from "./components/Navbar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Market from "./pages/Market.jsx";
import Simulator from "./pages/Simulator.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";

import { BuyModal, SellModal, Icon } from "./components/ui.jsx";

import { useTheme } from "./hooks/useTheme.js";

const STOCK_MAP = buildStockMap();
const SPARKLINES = buildSparklines();

const API_URL = "/api";

export default function TradeX() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [wallet, setWallet] = useState(100_000);
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [buyTarget, setBuyTarget] = useState(null);
  const [sellTarget, setSellTarget] = useState(null);
  const [scenario, setScenario] = useState("Market Crash (-35%)");
  const [notification, setNotification] = useState(null);
  const [stockMap, setStockMap] = useState(STOCK_MAP);
  const [sparklines, setSparklines] = useState(SPARKLINES);

  const [user, setUser] = useState({ id: "1", username: "Demo", email: "demo@tradesim.io" });

  const { bg } = useTheme(dark);

  useEffect(() => {
    fetch(`${API_URL}/stocks`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.stockMap) {
          setStockMap(data.stockMap);
          setSparklines(data.sparklines);
        }
      })
      .catch((err) => console.log("Using local stock data"));

    fetch(`${API_URL}/portfolio`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.wallet !== undefined) {
          setWallet(data.wallet);
          setHoldings(data.holdings || []);
        }
      })
      .catch((err) => console.log("Using local portfolio data"));
  }, []);

  const portfolioValue = holdings.reduce(
    (sum, h) => sum + (stockMap[h.symbol]?.price ?? 0) * h.qty,
    0
  );

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (stock, qty) => {
    fetch(`${API_URL}/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: stock.symbol, qty }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notify(data.error, "error");
        } else {
          setWallet(data.wallet);
          fetch(`${API_URL}/portfolio`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setHoldings(data.holdings));
          notify(`Bought ${qty} share${qty > 1 ? "s" : ""} of ${stock.symbol}`);
        }
      })
      .catch((err) => notify("Failed to complete purchase", "error"));
    setBuyTarget(null);
  };

  const handleSell = (stock, qty) => {
    fetch(`${API_URL}/sell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: stock.symbol, qty }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notify(data.error, "error");
        } else {
          setWallet(data.wallet);
          fetch(`${API_URL}/portfolio`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setHoldings(data.holdings));
          notify(`Sold ${qty} share${qty > 1 ? "s" : ""} of ${stock.symbol}`);
        }
      })
      .catch((err) => notify("Failed to complete sale", "error"));
    setSellTarget(null);
  };

  const handleLogout = () => {
    setUser(null);
    notify("Signed out");
  };

  return (
    <div
      className={`min-h-screen ${bg} font-sans transition-colors duration-300`}
      style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes modalIn { from { opacity:0; transform:scale(0.9) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .scrollbar-none::-webkit-scrollbar { display:none; }
        .scrollbar-none { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {notification && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
          style={{
            animation: "slideDown .3s ease both",
            background: notification.type === "success" ? "#10b981" : "#ef4444",
          }}
        >
          <Icon name="check" size={16} cls="text-white" />
          <span className="text-sm font-semibold text-white">{notification.msg}</span>
        </div>
      )}

      {buyTarget && (
        <BuyModal
          stock={buyTarget}
          wallet={wallet}
          onClose={() => setBuyTarget(null)}
          onBuy={handleBuy}
          dark={dark}
        />
      )}

      {sellTarget && (
        <SellModal
          stock={stockMap[sellTarget.symbol]}
          holding={sellTarget}
          wallet={wallet}
          onClose={() => setSellTarget(null)}
          onSell={handleSell}
          dark={dark}
        />
      )}

      <Navbar page={page} setPage={setPage} dark={dark} setDark={setDark} wallet={wallet} />

      <div className="pb-20 lg:pb-0 p-5 lg:p-6" style={{ animation: "fadeIn .3s ease" }}>
        {page === "dashboard" && (
          <Dashboard
            holdings={holdings}
            stockMap={stockMap}
            wallet={wallet}
            dark={dark}
            onSell={(holding) => setSellTarget(holding)}
            user={user}
          />
        )}
        {page === "market" && (
          <Market
            holdings={holdings}
            sparklines={sparklines}
            dark={dark}
            onBuy={(stock) => setBuyTarget(stock)}
          />
        )}
        {page === "simulator" && (
          <Simulator
            holdings={holdings}
            stockMap={stockMap}
            scenario={scenario}
            setScenario={setScenario}
            dark={dark}
          />
        )}
        {page === "portfolio" && <Portfolio dark={dark} />}
        {page === "transactions" && <Transactions dark={dark} />}
        {page === "profile" && (
          <Profile
            user={user}
            onLogout={handleLogout}
            onUpdate={setUser}
            onLogin={setUser}
            onRegister={() => {}}
            dark={dark}
          />
        )}
      </div>
    </div>
  );
}