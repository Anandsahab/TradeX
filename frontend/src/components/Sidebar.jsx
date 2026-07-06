import { Icon } from "./ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "portfolio", label: "Portfolio", icon: "wallet" },
  { id: "transactions", label: "History", icon: "info" },
  { id: "market",    label: "Market",    icon: "market"    },
  { id: "orders",     label: "Orders",    icon: "orders"    },
  { id: "simulator", label: "Simulator", icon: "simulator" },
  { id: "profile",   label: "Profile",   icon: "brain" },
];

/**
 * Sidebar — visible on lg+ screens only.
 *
 * Props:
 *   page          string   — active page id
 *   setPage       fn       — navigate to page
 *   dark          bool
 *   setDark       fn
 *   totalValue    number   — wallet + portfolioValue
 */
export default function Sidebar({ page, setPage, dark, setDark, totalValue }) {
  const { text, muted, subtle, divider } = useTheme(dark);

  return (
    <div
      className={`fixed left-0 top-0 h-full w-[220px] border-r z-30 flex-col hidden lg:flex ${
        dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0" shapeRendering="geometricPrecision">
            <defs>
              <linearGradient id="sideLogoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#6d28d9"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="#0c0c10" stroke="url(#sideLogoGrad)" strokeWidth="0.8"/>
            <rect x="5" y="7" width="13" height="4" rx="2" fill="#f3f4f6"/>
            <rect x="9.5" y="10.5" width="4" height="15" rx="2" fill="#f3f4f6"/>
            <g transform="translate(20, 16)">
              <rect x="-2" y="-9.5" width="4" height="19" rx="2" fill="#7c3aed" transform="rotate(38)"/>
              <rect x="-2" y="-9.5" width="4" height="19" rx="2" fill="#a78bfa" transform="rotate(-38)"/>
            </g>
          </svg>
          <div>
            <div className={`text-sm font-bold tracking-tight ${text}`}>TradeX</div>
            <div className={`text-xs ${subtle}`}>by Team RiskZero</div>
          </div>
        </div>
      </div>

      {/* Virtual mode badge */}
      <div
        className={`mx-4 mb-4 px-3 py-2 rounded-xl text-center ${
          dark
            ? "bg-amber-900/30 border border-amber-800/50"
            : "bg-amber-50 border border-amber-200"
        }`}
      >
        <div className={`text-xs font-bold tracking-widest ${dark ? "text-amber-400" : "text-amber-600"}`}>
          VIRTUAL MODE
        </div>
        <div className={`text-xs mt-0.5 ${dark ? "text-amber-500/70" : "text-amber-500"}`}>
          No real money at risk
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === n.id
                ? "bg-emerald-500/10 text-emerald-500"
                : dark
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <Icon name={n.icon} size={17} />
            {n.label}
          </button>
        ))}
      </nav>

      {/* Bottom: total value */}
      <div className={`p-4 border-t ${divider}`}>
        <div className={`text-xs mb-3 ${muted}`}>Total value</div>
        <div className={`text-lg font-bold ${text}`}>₹{Math.round(totalValue).toLocaleString()}</div>
      </div>
    </div>
  );
}