/**
 * useTheme — returns a frozen object of Tailwind class strings
 * derived from the current dark/light mode flag.
 *
 * Import this in any component instead of repeating ternary chains.
 */
export function useTheme(dark) {
  return {
    bg:     dark ? "bg-gray-950"                    : "bg-gray-50",
    card:   dark ? "bg-gray-900 border-gray-800"    : "bg-white border-gray-200",
    text:   dark ? "text-white"                     : "text-gray-900",
    muted:  dark ? "text-gray-400"                  : "text-gray-500",
    subtle: dark ? "text-gray-500"                  : "text-gray-400",
    input:  dark
      ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500",
    hover:  dark ? "hover:bg-gray-800"              : "hover:bg-gray-50",
    divider:dark ? "border-gray-800"                : "border-gray-200",
    tooltipStyle: {
      background:   dark ? "#0a0a0a" : "#fff",
      border:       `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`,
      borderRadius: 12,
      padding:      "10px 14px",
      fontSize:     13,
      color:        dark ? "#f3f4f6" : "#111827",
      boxShadow:    dark
        ? "0 8px 32px rgba(0,0,0,0.6)"
        : "0 4px 16px rgba(0,0,0,0.1)",
    },
    chartGrid:    dark ? "#1f2937" : "#e5e7eb",
    chartTick:    dark ? "#9ca3af" : "#6b7280",
    chartBg:      dark ? "#0f0f0f" : "#ffffff",
  };
}