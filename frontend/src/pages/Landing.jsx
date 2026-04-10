import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Icon } from "../components/ui.jsx";

const FEATURES = [
  {
    icon: "trending_up",
    title: "Virtual Trading",
    desc: "Practice with ₹1,00,000 virtual money. No risk, all learning.",
  },
  {
    icon: "alert",
    title: "Risk Analysis",
    desc: "Get AI-powered risk scores and portfolio health insights.",
  },
  {
    icon: "brain",
    title: "AI Insights",
    desc: "Smart recommendations based on your trading patterns.",
  },
  {
    icon: "wallet",
    title: "Portfolio Tracking",
    desc: "Track performance, P&L, and sector allocation in real-time.",
  },
];

const STEPS = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds" },
  { num: "02", title: "Get Virtual Money", desc: "₹1,00,000 credited" },
  { num: "03", title: "Start Trading", desc: "Begin your journey" },
];

const SAMPLE_STOCKS = [
  { symbol: "RELIANCE", price: 2847.6, change: 1.24, isUp: true },
  { symbol: "TCS", price: 3912.4, change: -0.87, isUp: false },
  { symbol: "HDFC", price: 1654.3, change: 0.91, isUp: true },
  { symbol: "INFY", price: 1678.9, change: 0.43, isUp: true },
];

const CHART_DATA = Array.from({ length: 20 }, (_, i) => ({
  value: 1500 + Math.random() * 500 + i * 50,
}));

function RollingText({ words, dark }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className="inline-block overflow-hidden h-8 align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-emerald-400"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FloatingCard({ dark, delay = 0, children }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -15, 0],
        opacity: 1,
      }}
      transition={{
        y: {
          duration: 3 + delay * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.5, delay },
      }}
      className={`absolute rounded-2xl border p-4 shadow-xl ${
        dark
          ? "bg-gray-900/80 border-gray-700 backdrop-blur-md"
          : "bg-white/80 border-gray-200 backdrop-blur-md"
      }`}
    >
      {children}
    </motion.div>
  );
}

export default function Landing({ user, onLoginClick }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleExplore = () => {
    if (user) {
      navigate("/?page=market");
    } else {
      navigate("/login");
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/95 backdrop-blur-md border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="text-lg font-bold tracking-tight">TradeX</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView()}
              className="text-gray-400 hover:text-white transition"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView()}
              className="text-gray-400 hover:text-white transition"
            >
              How It Works
            </button>
            <button
              onClick={() => document.getElementById("market")?.scrollIntoView()}
              className="text-gray-400 hover:text-white transition"
            >
              Market
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold transition"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 lg:px-8 min-h-[90vh] flex items-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full relative">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Virtual Trading Platform</span>
            </motion.div>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4">
              <span className="block">Invest Smarter.</span>
              <span className="block text-emerald-400">Practice Risk-Free.</span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-lg">
              Simulate stock trading with virtual money. Build confidence, learn strategies, and track your portfolio without risking real capital.
            </p>

            {/* Rolling text */}
            <div className="text-xl font-semibold text-gray-300 mb-8 h-8">
              <RollingText words={["Learn", "Invest", "Simulate", "Grow"]} dark={true} />
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold transition shadow-lg shadow-emerald-500/20"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExplore}
                className="px-8 py-3.5 rounded-xl border border-gray-700 hover:border-gray-600 font-semibold transition"
              >
                Explore Market
              </motion.button>
            </div>
          </motion.div>

          {/* Right - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block h-[400px]"
          >
            {/* Main Chart Card */}
            <FloatingCard dark delay={0}>
              <div className="w-64">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">RELIANCE</span>
                  <span className="text-xs text-emerald-400">+1.24%</span>
                </div>
                <div className="text-2xl font-bold mb-2">₹2,847.60</div>
                <ResponsiveContainer width={200} height={60}>
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#heroGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FloatingCard>

            {/* Small Portfolio Card */}
            <FloatingCard dark delay={0.5} style={{ top: 60, right: -20 }}>
              <div className="w-40">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="wallet" size={14} cls="text-emerald-400" />
                  <span className="text-xs text-gray-400">Portfolio</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">₹1,24,580</div>
                <div className="text-xs text-emerald-400">+24.58%</div>
              </div>
            </FloatingCard>

            {/* Small Stock Card */}
            <FloatingCard dark delay={1} style={{ bottom: 40, left: -20 }}>
              <div className="w-40">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="trending_up" size={14} cls="text-emerald-400" />
                  <span className="text-xs text-gray-400">TCS</span>
                </div>
                <div className="text-lg font-bold">₹3,912.40</div>
                <div className="text-xs text-red-400">-0.87%</div>
              </div>
            </FloatingCard>

            {/* Small AI Card */}
            <FloatingCard dark delay={1.5} style={{ top: 20, left: 40 }}>
              <div className="w-40">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="brain" size={14} cls="text-violet-400" />
                  <span className="text-xs text-gray-400">AI Score</span>
                </div>
                <div className="text-lg font-bold text-violet-400">72/100</div>
                <div className="text-xs text-gray-400">Moderate Risk</div>
              </div>
            </FloatingCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Trade Smart
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A complete virtual trading platform with real-time insights and AI-powered recommendations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition">
                  <Icon name={feature.icon} size={24} cls="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Preview Section */}
      <section id="market" className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">NIFTY 50</h3>
                  <p className="text-sm text-gray-400">Index Performance</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">+0.87%</div>
                  <div className="text-xs text-gray-400">Today</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#marketGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Stock Cards */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Top Movers</h3>
              <div className="space-y-3">
                {SAMPLE_STOCKS.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/30"
                  >
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">₹{stock.price.toLocaleString()}</div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        stock.isUp ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {stock.isUp ? "+" : ""}
                      {stock.change}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Start trading in three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center p-6"
              >
                <div className="text-6xl font-bold text-emerald-500/20 mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-emerald-900/50 to-gray-900 border border-emerald-500/30"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of traders practicing risk-free. Create your free account today.
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStarted}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold transition"
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span className="font-semibold">TradeX</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>© 2024 TradeX. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}