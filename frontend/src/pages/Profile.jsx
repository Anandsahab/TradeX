import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const MENU_ITEMS = [
  { icon: "list", title: "All Orders", key: "orders" },
  { icon: "account_balance", title: "Bank Details", key: "bank" },
  { icon: "support_agent", title: "Customer Support (24x7)", key: "support" },
  { icon: "assessment", title: "Reports", key: "reports" },
];

export default function Profile({ user, onLogout, dark, wallet = 0 }) {
  const navigate = useNavigate();
  const { text, muted, card, bg } = useTheme(dark);

  const handleMenuClick = (key) => {};

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`min-h-screen ${bg} p-4 sm:p-6`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-xl font-bold ${text}`}>Profile</h2>
          <button
            onClick={() => handleMenuClick("settings")}
            className={`p-2 rounded-xl transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            <Icon name="settings" size={20} cls="text-gray-400" />
          </button>
        </div>

        {/* User Info Card */}
        <div className={`rounded-2xl p-5 border ${card}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20 shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-lg font-bold ${text} truncate`}>
                {user?.username || "User"}
              </div>
              <div className={`text-sm truncate ${muted}`}>
                {user?.email || "user@example.com"}
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0">
              Active
            </div>
          </div>
        </div>

        {/* Account Summary Card */}
        <div
          onClick={() => handleMenuClick("wallet")}
          className={`rounded-2xl p-5 border cursor-pointer transition-colors group ${card}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Icon name="wallet" size={24} cls="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-2xl font-bold ${text}`}>
                {formatCurrency(wallet)}
              </div>
              <div className={`text-sm ${muted}`}>Stocks, F&O balance</div>
            </div>
            <Icon
              name="chevron_right"
              size={24}
              cls="text-gray-500 group-hover:text-gray-400 transition-colors shrink-0"
            />
          </div>
        </div>

        {/* Menu Options */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={`w-full flex items-center gap-4 p-4 transition-colors ${
                index !== MENU_ITEMS.length - 1
                  ? `border-b ${dark ? "border-gray-700/50" : "border-gray-200"}`
                  : ""
              } ${dark ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <Icon name={item.icon} size={20} cls="text-gray-400" />
              </div>
              <span className={`flex-1 text-left font-medium ${text}`}>
                {item.title}
              </span>
              <Icon
                name="chevron_right"
                size={20}
                cls="text-gray-500 shrink-0"
              />
            </button>
          ))}
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border font-medium transition-all group ${
            dark
              ? "bg-gray-800/50 border-gray-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
              : "bg-white border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          }`}
        >
          <Icon name="logout" size={20} cls="text-red-400 group-hover:text-red-300" />
          <span className="text-red-400 group-hover:text-red-300">Logout</span>
        </button>

        {/* App Version */}
        <div className={`text-center text-xs py-2 ${muted}`}>
          TradeX v1.0.0 &bull; Virtual Trading
        </div>
      </div>
    </div>
  );
}
