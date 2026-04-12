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
  const { text, muted, card } = useTheme(dark);

  const handleMenuClick = (key) => {
    console.log("Menu clicked:", key);
  };

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
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <button
            onClick={() => handleMenuClick("settings")}
            className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Icon name="settings" size={20} cls="text-gray-400" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-white truncate">
                {user?.username || "User"}
              </div>
              <div className="text-sm text-gray-400 truncate">
                {user?.email || "user@example.com"}
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Active
            </div>
          </div>
        </div>

        {/* Account Summary Card */}
        <div
          onClick={() => handleMenuClick("wallet")}
          className="bg-slate-800 rounded-2xl p-5 border border-slate-700 cursor-pointer hover:bg-slate-750 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Icon name="wallet" size={24} cls="text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(wallet)}
              </div>
              <div className="text-sm text-gray-400">Stocks, F&O balance</div>
            </div>
            <Icon
              name="chevron_right"
              size={24}
              cls="text-gray-500 group-hover:text-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-slate-700 transition-colors ${
                index !== MENU_ITEMS.length - 1
                  ? "border-b border-slate-700"
                  : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center">
                <Icon name={item.icon} size={20} cls="text-gray-300" />
              </div>
              <span className="flex-1 text-left text-white font-medium">
                {item.title}
              </span>
              <Icon
                name="chevron_right"
                size={20}
                cls="text-gray-500"
              />
            </button>
          ))}
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
        >
          <Icon name="logout" size={20} cls="text-red-400 group-hover:text-red-300" />
          <span className="text-red-400 group-hover:text-red-300">Logout</span>
        </button>

        {/* App Version */}
        <div className="text-center text-xs text-gray-600 py-2">
          TradeX v1.0.0 • Virtual Trading
        </div>
      </div>
    </div>
  );
}