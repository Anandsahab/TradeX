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
      background:   dark ? "#111827" : "#fff",
      border:       `1px solid ${dark ? "#374151" : "#e5e7eb"}`,
      borderRadius: 10,
      fontSize:     12,
    },
  };
}