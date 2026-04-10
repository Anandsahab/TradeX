import React from "react";
import { Icon } from "./ui.jsx";
import { NAV_ITEMS } from "./Sidebar.jsx";
import { useTheme } from "../hooks/useTheme.js";

/**
 * Navbar — horizontal top navigation bar with search
 *
 * Props:
 *   page    string  — active page id
 *   setPage fn
 *   dark    bool
 *   setDark fn
 *   wallet  number
 */
export default function Navbar({ page, setPage, dark, setDark, wallet }) {
  const { text, muted, divider, subtle } = useTheme(dark);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const navItems = NAV_ITEMS.filter((n) => n.id !== "portfolio" && n.id !== "profile");
  const profileItems = [
    { id: "portfolio", label: "Portfolio", icon: "wallet" },
    { id: "transactions", label: "History", icon: "info" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPage("market");
    }
  };

  return (
    <>
      {/* ── Sticky top header ───────────────────────────────────────────── */}
      <div
        className={`sticky top-0 z-20 px-4 lg:px-6 py-3 border-b flex items-center justify-between gap-4 backdrop-blur-md ${
          dark
            ? "bg-gray-950/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div className={`hidden sm:block text-sm font-bold tracking-tight ${text}`}>TradeX</div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className={`relative flex items-center rounded-xl border ${
            dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
          }`}>
            <div className="pl-3">
              <Icon name="search" size={16} cls={muted} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TradeX"
              className={`w-full px-2 py-2 text-sm bg-transparent focus:outline-none ${text}`}
            />
          </div>
        </form>

        {/* Nav items & Wallet */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          {/* Nav links - desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  page === n.id
                    ? "bg-emerald-500/10 text-emerald-500"
                    : dark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`p-2 rounded-xl transition ${
                dark
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              <Icon name="user" size={18} />
            </button>
            {showProfileMenu && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border overflow-hidden ${
                dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                {profileItems.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setPage(n.id);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
                      page === n.id
                        ? "bg-emerald-500/10 text-emerald-500"
                        : dark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon name={n.icon} size={16} />
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wallet chip */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
              dark ? "bg-gray-800" : "bg-gray-100"
            } ${text}`}
          >
            <Icon name="wallet" size={14} cls="text-emerald-500" />
            <span className="hidden sm:inline">₹{Math.round(wallet).toLocaleString()}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-xl transition ${
              dark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            <Icon name={dark ? "sun" : "moon"} size={16} />
          </button>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 lg:hidden flex border-t ${
          dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition ${
              page === n.id
                ? "text-emerald-500"
                : dark
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            <Icon name={n.icon} size={20} />
            {n.label}
          </button>
        ))}
      </div>

      {/* ── Page subtitle ───────────────────────────────────────────── */}
      <div
        className={`hidden lg:block px-6 py-2 border-b text-xs ${muted}`}
      >
        {page === "dashboard" &&
          `Active positions · ${new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}`}
        {page === "portfolio" && "Risk metrics & performance"}
        {page === "transactions" && "Complete trading history"}
        {page === "profile" && "Edit your profile"}
        {page === "market"    && `${12} stocks · NSE & BSE (mock)`}
        {page === "simulator" && "Risk-free scenario testing"}
      </div>
    </>
  );
}