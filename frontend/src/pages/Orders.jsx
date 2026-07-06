import { useState, useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme.js";
import { Icon } from "../components/ui.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys Ltd" },
  { symbol: "HDFC", name: "HDFC Bank" },
  { symbol: "WIPRO", name: "Wipro Ltd" },
  { symbol: "ICICI", name: "ICICI Bank" },
  { symbol: "MARUTI", name: "Maruti Suzuki" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance" },
  { symbol: "ADANI", name: "Adani Enterprises" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "AXISBANK", name: "Axis Bank" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
  { symbol: "ITC", name: "ITC Ltd" },
  { symbol: "TITAN", name: "Titan Company" },
];

export default function Orders({ dark, user, stockMap, wallet }) {
  const { bg, card, divider, muted, text, subtle } = useTheme(dark);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [executingOrderIds, setExecutingOrderIds] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [toasts, setToasts] = useState([]);
  const prevOrderStatuses = useRef({});
  const notifiedOrders = useRef(new Set());

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Form state
  const [orderType, setOrderType] = useState("LIMIT");
  const [side, setSide] = useState("BUY");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [quantity, setQuantity] = useState(1);
  const [targetPrice, setTargetPrice] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, [refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pendingOrders.length > 0) {
      pendingOrders.forEach((order) => {
        const prevStatus = prevOrderStatuses.current[order.id];
        const alreadyNotified = notifiedOrders.current.has(order.id);
        if (prevStatus && prevStatus !== order.status && !alreadyNotified) {
          if (order.status === "EXECUTED") {
            notifiedOrders.current.add(order.id);
            setExecutingOrderIds((prev) => new Set(prev).add(order.id));
            showToast(
              `Executed: ${order.side} ${order.quantity} ${order.symbol} @ ₹${(order.executedPrice || order.targetPrice)?.toFixed(2)}`,
              "success"
            );
            setTimeout(() => {
              setExecutingOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(order.id);
                return next;
              });
              setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
            }, 1500);
          } else if (order.status === "FAILED") {
            notifiedOrders.current.add(order.id);
            showToast(`Failed: ${order.side} ${order.quantity} ${order.symbol}`, "error");
          }
        }
        if (!prevStatus) {
          prevOrderStatuses.current[order.id] = order.status;
        }
      });
    }
  }, [pendingOrders]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/orders/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPendingOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }

    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrderHistory(data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }

    setLoading(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const price = parseFloat(targetPrice);
    if (!targetPrice || price <= 0) {
      showToast("Please enter a valid target price", "error");
      return;
    }

    if (quantity <= 0) {
      showToast("Please enter a valid quantity", "error");
      return;
    }

    if (orderType === "LIMIT") {
      if (side === "BUY" && price > currentPrice) {
        showToast(`Limit Buy should be below current price (₹${currentPrice.toFixed(2)})`, "error");
        return;
      }
      if (side === "SELL" && price < currentPrice) {
        showToast(`Limit Sell should be above current price (₹${currentPrice.toFixed(2)})`, "error");
        return;
      }
    }

    setPlacing(true);
    try {
      const res = await fetch(`${API_URL}/orders/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderType,
          side,
          symbol,
          quantity: parseInt(quantity),
          targetPrice: parseFloat(targetPrice),
        }),
      });

      const data = await res.json();

      if (data.error) {
        showToast(data.error, "error");
      } else {
        showToast(`${orderType} ${side} order placed successfully!`, "success");
        setTargetPrice("");
        setQuantity(1);
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      showToast("Failed to place order", "error");
    }
    setPlacing(false);
  };

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/orders/cancel/${orderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order cancelled", "success");
        setRefreshKey((k) => k + 1);
      } else {
        showToast(data.error || "Failed to cancel", "error");
      }
    } catch (err) {
      showToast("Failed to cancel order", "error");
    }
  };

  const currentPrice = stockMap?.[symbol]?.price || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${text} truncate`}>Advanced Orders</h1>
          <p className={`text-xs sm:text-sm ${muted} hidden sm:block`}>Place limit & stop orders for automatic execution</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {refreshing && (
            <span className={`text-xs ${muted} flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Updating...
            </span>
          )}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={refreshing}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              refreshing ? "opacity-50 cursor-not-allowed" : ""
            } ${dark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <span className="flex items-center gap-2">
              <Icon name="refresh" size={14} /> Refresh
            </span>
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 left-4 md:left-auto z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-in ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : dark
                ? "bg-gray-700 text-white"
                : "bg-gray-900 text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon name={toast.type === "success" ? "check" : toast.type === "error" ? "x" : "info"} size={16} />
              {toast.message}
            </span>
          </div>
        ))}
      </div>

      {/* Two-column layout: Order Form + Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ───── Order Form ───── */}
        <div className="lg:col-span-5">
          <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
            <h2 className={`text-base sm:text-lg font-bold mb-1 ${text}`}>Place New Order</h2>
            <p className={`text-xs sm:text-sm mb-5 ${muted}`}>Set an automatic order to execute when price targets are met</p>
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Order Type & Side */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 ${muted}`}>Order Type & Direction</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("LIMIT")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                      orderType === "LIMIT"
                        ? "bg-emerald-500 text-white"
                        : dark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    LIMIT
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("STOP")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                      orderType === "STOP"
                        ? "bg-emerald-500 text-white"
                        : dark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    STOP
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSide("BUY")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                      side === "BUY"
                        ? "bg-emerald-500 text-white"
                        : dark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("SELL")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                      side === "SELL"
                        ? "bg-red-500 text-white"
                        : dark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    SELL
                  </button>
                </div>
                <p className={`text-xs mt-1.5 ${subtle}`}>
                  <Icon name="info" size={10} cls="inline mr-1" />
                  {orderType === "LIMIT"
                    ? "Executes when price reaches your target — buy below market, sell above."
                    : "Triggers when price hits your target — buy on breakout, sell for protection."}
                </p>
              </div>

              {/* Symbol */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${muted}`}>Stock</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm appearance-none ${
                    dark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "16px 12px",
                  }}
                >
                  {STOCKS.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Price */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-2 ${muted}`}>Quantity & Price</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm ${
                        dark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      placeholder="Qty"
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`}>₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder={currentPrice.toFixed(2)}
                        className={`w-full pl-7 pr-4 py-3 rounded-xl border text-sm ${
                          dark
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                {targetPrice && orderType === "LIMIT" && (
                  <p className={`mt-1.5 text-xs flex items-center gap-1 ${
                    side === "BUY"
                      ? parseFloat(targetPrice) > currentPrice ? "text-amber-500" : "text-emerald-500"
                      : parseFloat(targetPrice) < currentPrice ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    <Icon name={side === "BUY" ? (parseFloat(targetPrice) > currentPrice ? "x" : "check") : (parseFloat(targetPrice) < currentPrice ? "x" : "check")} size={12} />
                    {side === "BUY"
                      ? parseFloat(targetPrice) > currentPrice
                        ? `Invalid: Limit Buy must be below ₹${currentPrice.toFixed(2)}`
                        : `Valid: Buys when price drops to ₹${parseFloat(targetPrice).toFixed(2)}`
                      : parseFloat(targetPrice) < currentPrice
                      ? `Invalid: Limit Sell must be above ₹${currentPrice.toFixed(2)}`
                      : `Valid: Sells when price rises to ₹${parseFloat(targetPrice).toFixed(2)}`}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div
                className={`p-4 rounded-xl text-sm space-y-2 ${
                  dark ? "bg-gray-800/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={muted}>Current Price</span>
                  <span className={`font-medium ${text}`}>₹{currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={muted}>Order Value</span>
                  <span className={`font-medium ${text}`}>
                    ₹{(quantity * parseFloat(targetPrice || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={muted}>Available Wallet</span>
                  <span className={`font-medium ${text}`}>₹{wallet?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={placing}
                className={`w-full py-3 rounded-xl font-semibold text-sm sm:text-base transition ${
                  side === "BUY"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                } disabled:opacity-50 disabled:shadow-none`}
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Placing Order...
                  </span>
                ) : (
                  `${orderType} ${side} ${quantity} ${symbol}`
                )}
              </button>
            </form>

            {/* Order Type Help */}
            <div className={`mt-5 p-4 rounded-xl text-xs leading-relaxed border-l-4 ${
              side === "BUY" ? "border-emerald-500/50" : "border-red-500/50"
            } ${dark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <p className={`font-medium mb-1 ${text}`}>
                <Icon name="info" size={12} cls="inline mr-1.5" />
                How {orderType} {side} works:
              </p>
              {orderType === "LIMIT" ? (
                side === "BUY" ? (
                  <p className={muted}>
                    Buy when price drops <span className="font-medium text-emerald-500">TO or BELOW</span> your target. 
                    Use to buy at a discount when the market dips.
                  </p>
                ) : (
                  <p className={muted}>
                    Sell when price rises <span className="font-medium text-emerald-500">TO or ABOVE</span> your target. 
                    Use to secure profits at your desired price.
                  </p>
                )
              ) : side === "BUY" ? (
                <p className={muted}>
                  Buy when price rises <span className="font-medium text-amber-500">TO or ABOVE</span> your target. 
                  Use to enter on a breakout momentum.
                </p>
              ) : (
                <p className={muted}>
                  Sell when price drops <span className="font-medium text-amber-500">TO or BELOW</span> your target. 
                  Use as stop-loss protection to limit downside.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ───── Pending Orders ───── */}
        <div className="lg:col-span-7">
          <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base sm:text-lg font-bold ${text}`}>
                Pending Orders
                {pendingOrders.length > 0 && (
                  <span className={`ml-2 text-sm font-normal ${muted}`}>
                    ({pendingOrders.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${muted} flex items-center gap-1.5`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live
                </span>
                <span className={`text-xs ${subtle} hidden sm:inline`}>Updates every 4s</span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${dark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                  <Icon name="orders" size={28} cls={muted} />
                </div>
                <h3 className={`text-base font-semibold mb-1.5 ${text}`}>No pending orders yet</h3>
                <p className={`text-sm text-center max-w-sm leading-relaxed ${muted}`}>
                  Place a Limit or Stop order using the form alongside. 
                  Pending orders appear here and execute automatically when market conditions match your target price.
                </p>
                <div className={`flex items-center gap-5 mt-5 text-xs ${subtle}`}>
                  <span className="flex items-center gap-1.5">
                    <Icon name="refresh" size={11} /> Checks every 4s
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="x" size={11} /> Cancel anytime
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="check" size={11} /> Auto-executes
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: card layout */}
                <div className="block lg:hidden space-y-3">
                  {pendingOrders.map((order) => {
                    const isExecuting = executingOrderIds.has(order.id);
                    return (
                      <div
                        key={order.id}
                        className={`rounded-xl border p-4 transition-all duration-300 ${
                          isExecuting ? "opacity-50 scale-[0.98]" : card
                        } ${!isExecuting && order.status === "PENDING" ? "border-amber-500/30" : ""} ${!isExecuting ? "animate-fade-in-up" : ""}`}
                        style={{ animationDelay: `${pendingOrders.indexOf(order) * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${text}`}>{order.symbol}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              order.side === "BUY"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : "bg-red-500/20 text-red-500"
                            }`}>
                              {order.side}
                            </span>
                            <span className={`text-xs ${muted}`}>{order.orderType}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            order.status === "PENDING"
                              ? "bg-amber-500/20 text-amber-500"
                              : order.status === "EXECUTED"
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-red-500/20 text-red-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              order.status === "PENDING" ? "bg-amber-500 animate-pulse"
                              : order.status === "EXECUTED" ? "bg-emerald-500" : "bg-red-500"
                            }`} />
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className={muted}>Target: </span>
                            <span className={`font-medium ${text}`}>₹{order.targetPrice?.toFixed(2)}</span>
                            <span className={`mx-2 ${muted}`}>·</span>
                            <span className={muted}>Qty: </span>
                            <span className={`font-medium ${text}`}>{order.quantity}</span>
                          </div>
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                dark
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                              }`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Desktop: table layout */}
                <div className="hidden lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-xs ${muted} border-b ${divider}`}>
                        <th className="text-left py-3 px-3 font-medium">Symbol</th>
                        <th className="text-left py-3 px-3 font-medium">Side</th>
                        <th className="text-left py-3 px-3 font-medium">Type</th>
                        <th className="text-right py-3 px-3 font-medium">Target Price</th>
                        <th className="text-right py-3 px-3 font-medium">Qty</th>
                        <th className="text-center py-3 px-3 font-medium">Status</th>
                        <th className="text-right py-3 px-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => {
                        const isExecuting = executingOrderIds.has(order.id);
                        return (
                          <tr
                            key={order.id}
                            className={`border-b ${divider} transition-all duration-200 ${
                              isExecuting ? "opacity-50 scale-[0.98]" : dark ? "hover:bg-gray-800/30" : "hover:bg-gray-50/80"
                            } ${!isExecuting && order.status === "PENDING" ? "animate-row-pulse" : ""}`}
                          >
                            <td className={`py-3.5 px-3 font-semibold ${text}`}>{order.symbol}</td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                  order.side === "BUY"
                                    ? "bg-emerald-500/20 text-emerald-500"
                                    : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                {order.side}
                              </span>
                            </td>
                            <td className={`py-3.5 px-3 ${text}`}>{order.orderType}</td>
                            <td className={`py-3.5 px-3 text-right font-medium ${text}`}>₹{order.targetPrice?.toFixed(2)}</td>
                            <td className={`py-3.5 px-3 text-right ${text}`}>{order.quantity}</td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                                  order.status === "PENDING"
                                    ? "bg-amber-500/20 text-amber-500"
                                    : order.status === "EXECUTED"
                                    ? "bg-emerald-500/20 text-emerald-500"
                                    : "bg-red-500/20 text-red-500"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    order.status === "PENDING"
                                      ? "bg-amber-500 animate-pulse"
                                      : order.status === "EXECUTED"
                                      ? "bg-emerald-500" : "bg-red-500"
                                  }`}
                                />
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              {order.status === "PENDING" && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition hover:scale-105 active:scale-95 ${
                                    dark
                                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                      : "bg-red-50 text-red-600 hover:bg-red-100"
                                  }`}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ───── Order History ───── */}
      <div className={`rounded-2xl border p-4 sm:p-6 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base sm:text-lg font-bold ${text}`}>Order History</h2>
          {orderHistory.length > 0 && (
            <span className={`text-xs ${subtle}`}>Last {Math.min(orderHistory.length, 20)} trades</span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : orderHistory.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-12 animate-fade-in-up`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${dark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
              <Icon name="list" size={28} cls={muted} />
            </div>
            <h3 className={`text-base font-semibold mb-1.5 ${text}`}>No order history</h3>
            <p className={`text-sm text-center max-w-sm leading-relaxed ${muted}`}>
              Completed and executed orders will appear here. Start trading to build your order history.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="block lg:hidden space-y-3">
              {orderHistory.slice(0, 20).map((txn, i) => (
                <div key={i} className={`rounded-xl border p-4 ${card} animate-fade-in-up`} style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        txn.type === "BUY"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-red-500/20 text-red-500"
                      }`}>
                        {txn.type}
                      </span>
                      <span className={`font-bold ${text}`}>{txn.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${txn.type === "BUY" ? "text-red-500" : "text-emerald-500"}`}>
                        {txn.type === "BUY" ? "-" : "+"}₹{txn.total?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className={muted}>
                      {txn.qty} shares @ ₹{txn.price?.toLocaleString()}
                    </span>
                    <span className={subtle}>
                      {new Date(txn.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs ${muted} border-b ${divider}`}>
                    <th className="text-left py-3 px-3 font-medium w-[60px]">Type</th>
                    <th className="text-left py-3 px-3 font-medium">Stock</th>
                    <th className="text-right py-3 px-3 font-medium w-[60px]">Qty</th>
                    <th className="text-right py-3 px-3 font-medium w-[100px]">Price</th>
                    <th className="text-right py-3 px-3 font-medium w-[110px]">Total</th>
                    <th className="text-right py-3 px-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.slice(0, 20).map((txn, i) => (
                    <tr
                      key={i}
                      className={`border-b ${divider} transition-colors duration-150 ${
                        dark ? "hover:bg-gray-800/30" : "hover:bg-gray-50/80"
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            txn.type === "BUY"
                              ? "bg-emerald-500/20 text-emerald-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className={`py-3.5 px-3 font-semibold ${text}`}>{txn.symbol}</td>
                      <td className={`py-3.5 px-3 text-right ${text}`}>{txn.qty}</td>
                      <td className={`py-3.5 px-3 text-right font-medium ${text}`}>₹{txn.price?.toFixed(2)}</td>
                      <td className={`py-3.5 px-3 text-right font-semibold ${txn.type === "BUY" ? "text-red-500" : "text-emerald-500"}`}>
                        {txn.type === "BUY" ? "-" : "+"}₹{txn.total?.toLocaleString()}
                      </td>
                      <td className={`py-3.5 px-3 text-right ${subtle} text-xs whitespace-nowrap`}>
                        {new Date(txn.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
