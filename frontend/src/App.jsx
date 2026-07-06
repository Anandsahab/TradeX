import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { INITIAL_HOLDINGS, buildStockMap, buildSparklines } from "./constants.js";

import Navbar from "./components/Navbar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Market from "./pages/Market.jsx";
import Simulator from "./pages/Simulator.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Transactions from "./pages/Transactions.jsx";
import Orders from "./pages/Orders.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Landing from "./pages/Landing.jsx";

import { BuyModal, SellModal, Icon } from "./components/ui.jsx";

import { useTheme } from "./hooks/useTheme.js";

const STOCK_MAP = buildStockMap();
const SPARKLINES = buildSparklines();

const API_URL = "/api";

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function ProtectedRoute({ children, user }) {
  if (!isAuthenticated() && !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AuthRoute({ children, user }) {
  if (isAuthenticated() || user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

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

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { bg } = useTheme(dark);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));

      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated() && !user) return;

    const token = localStorage.getItem("token");

    fetch(`${API_URL}/stocks`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.stockMap) {
          setStockMap(data.stockMap);
          setSparklines(data.sparklines);
        }
      })
      .catch(() => {});

    fetch(`${API_URL}/portfolio`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error === "Unauthorized") {
          notify("Please login to view portfolio", "error");
          return;
        }
        if (data.wallet !== undefined) {
          setWallet(data.wallet);
          setHoldings(data.holdings || []);
        }
      })
      .catch(() => {});
  }, [user]);

  // Real-time price updates (simulated fluctuations every 2 seconds)
  useEffect(() => {
    if (!isAuthenticated() && !user) return;

    const livePriceInterval = setInterval(() => {
      fetch(`${API_URL}/stocks/live`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.prices) {
            setStockMap((prev) => {
              const updated = { ...prev };
              Object.keys(data.prices).forEach((symbol) => {
                if (updated[symbol]) {
                  updated[symbol] = {
                    ...updated[symbol],
                    price: data.prices[symbol].price,
                    change: data.prices[symbol].change,
                    changePercent: data.prices[symbol].changePercent,
                  };
                }
              });
              return updated;
            });
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearInterval(livePriceInterval);
  }, [user]);

  // Fetch fresh base prices from yfinance every 60 seconds
  useEffect(() => {
    if (!isAuthenticated() && !user) return;

    const refreshPrices = () => {
      fetch(`${API_URL}/stocks?fresh=true`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.stockMap) {
            setStockMap(data.stockMap);
            setSparklines(data.sparklines);
          }
        })
        .catch(() => {});
    };

    refreshPrices();
    const refreshInterval = setInterval(refreshPrices, 60000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  const portfolioValue = holdings.reduce(
    (sum, h) => sum + (stockMap[h.symbol]?.price ?? 0) * h.qty,
    0
  );

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (stock, qty) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Login required to perform this action", "error");
      return;
    }

    fetch(`${API_URL}/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ symbol: stock.symbol, qty }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notify(data.error, "error");
        } else {
          setWallet(data.wallet);
          fetch(`${API_URL}/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => setHoldings(data.holdings || []));
          notify(`Bought ${qty} share${qty > 1 ? "s" : ""} of ${stock.symbol}`);
        }
      })
      .catch((err) => notify("Failed to complete purchase", "error"));
    setBuyTarget(null);
  };

  const handleSell = (stock, qty) => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Login required to perform this action", "error");
      return;
    }

    fetch(`${API_URL}/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ symbol: stock.symbol, qty }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notify(data.error, "error");
        } else {
          setWallet(data.wallet);
          fetch(`${API_URL}/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => setHoldings(data.holdings || []));
          notify(`Sold ${qty} share${qty > 1 ? "s" : ""} of ${stock.symbol}`);
        }
      })
      .catch((err) => notify("Failed to complete sale", "error"));
    setSellTarget(null);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    notify("Signed out");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="animate-pulse text-emerald-500 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen ${bg} font-sans transition-colors duration-300 overflow-x-hidden`}
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
            className="fixed top-4 right-4 left-4 md:left-auto md:right-5 md:top-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              animation: "slideDown .3s ease both",
              background: notification.type === "success" ? "#10b981" : "#ef4444",
            }}
          >
            <Icon name="check" size={16} cls="text-white shrink-0" />
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

        <Routes>
          <Route
            path="/"
            element={<Landing user={user} onLoginClick={() => notify("Please login to continue", "error")} />}
          />
          <Route
            path="/login"
            element={
              <AuthRoute user={user}>
                <Login setUser={setUser} dark={dark} />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute user={user}>
                <SignUp setUser={setUser} dark={dark} />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute user={user}>
                <Navbar
                  page={page}
                  setPage={setPage}
                  dark={dark}
                  setDark={setDark}
                  wallet={wallet}
                  user={user}
                  onLogout={handleLogout}
                />

                <div className="pb-20 lg:pb-0 p-4 sm:p-5 lg:p-6 max-w-full overflow-x-hidden" style={{ animation: "fadeIn .3s ease" }}>
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
                      stockMap={stockMap}
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
                  {page === "portfolio" && <Portfolio dark={dark} user={user} />}
                  {page === "transactions" && <Transactions dark={dark} user={user} />}
                  {page === "orders" && (
                    <Orders
                      dark={dark}
                      user={user}
                      stockMap={stockMap}
                      wallet={wallet}
                    />
                  )}
                  {page === "profile" && (
                    <Profile
                      user={user}
                      onLogout={handleLogout}
                      wallet={wallet}
                    />
                  )}
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}