import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Icon } from "./ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "pa", label: "Punjabi" },
  { code: "ta", label: "Tamil" },
  { code: "bn", label: "Bengali" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "en", label: "English" },
];

const FAQ_CHIPS = [
  "How to buy stocks?",
  "What is a limit order?",
  "Why is my risk high?",
  "What is diversification?",
  "How to use simulator?",
];

const PLACEHOLDER_HINTS = [
  "Ask me about buying stocks...",
  "Try: \"What is a limit order?\"",
  "Ask about portfolio risk...",
  "Try: \"How to diversify?\"",
  "Ask about the simulator...",
];

const TOPICS = [
  {
    keywords: ["buy stock", "how to buy", "purchase stock", "buy share", "place buy", "buying"],
    response: `**Buying stocks on TradeX is simple!** 🎯

1. Go to the **Market** page to browse available stocks
2. Click **BUY** on any stock you're interested in
3. Enter the quantity you want to purchase
4. Check the total cost against your wallet balance
5. Confirm — and the stock is added to your portfolio!

📌 Your virtual wallet starts with ₹1,00,000. You can track all your holdings on the Dashboard.`,
  },
  {
    keywords: ["limit order", "limit", "price limit"],
    response: `**Limit orders let you buy/sell at a target price** 📊

• **Buy Limit** — set a price BELOW current market. The order executes when the price drops to your target.
• **Sell Limit** — set a price ABOVE current market. The order executes when the price rises to your target.

👉 Go to the **Orders** page to place one. The system checks prices every 5 seconds automatically!`,
  },
  {
    keywords: ["stop order", "stop loss", "stop"],
    response: `**Stop orders help protect your portfolio** 🛡️

• **Buy Stop** — triggers when price rises to your target (used for breakouts)
• **Sell Stop** — triggers when price drops to your target (used as stop-loss)

These are great for managing risk automatically. Check the **Orders** page to set one up!`,
  },
  {
    keywords: ["risk", "high risk", "risk score", "portfolio risk", "risk level"],
    response: `**Your risk score depends on 3 factors** 📈

1. **Concentration** — how much of your money is in a single stock
2. **Sector spread** — if too many holdings are in one sector (e.g., only IT stocks)
3. **Number of positions** — fewer stocks = higher risk

💡 **Tip:** Spread your investments across 4-5 different stocks from different sectors to lower your risk. Check the **Portfolio** page for your detailed risk breakdown!`,
  },
  {
    keywords: ["diversify", "diversification", "spread", "balance portfolio"],
    response: `**Diversification = don't put all eggs in one basket** 🧺

A diversified portfolio includes stocks from different sectors:
• 💻 **IT** — TCS, Infosys, Wipro
• 🏦 **Finance** — HDFC, ICICI, SBI
• ⛽ **Energy** — Reliance
• 🚗 **Auto** — Maruti Suzuki
• 🛒 **Consumer** — HUL, ITC, Titan

Try to own stocks from at least **3 different sectors** for a healthy balance!`,
  },
  {
    keywords: ["simulator", "simulate", "scenario", "what if"],
    response: `**The Simulator is your "what-if" playground** 🎮

Go to the **Simulator** page and pick a scenario:
• 📉 **Market Crash** — see how your portfolio handles a -35% drop
• 📈 **Bull Run** — see potential gains in a +25% rally
• ➡️ **Sideways** — minimal change scenario

Every holding gets the same percentage change — it's a simplified preview to help you understand potential outcomes.`,
  },
  {
    keywords: ["market", "stock price", "price", "nse", "live"],
    response: `**Track live prices on the Market page** 📊

TradeX shows prices for 15 major NSE stocks including:
• Reliance, TCS, Infosys, HDFC Bank, Wipro
• ICICI, Maruti Suzuki, Bajaj Finance, SBI
• Axis Bank, Kotak Mahindra, HUL, ITC, Titan, Adani

Prices update every 2 seconds with simulated fluctuations, and refresh from real data every 60 seconds via Yahoo Finance!`,
  },
  {
    keywords: ["portfolio", "my holdings", "my stocks", "pnl", "profit loss"],
    response: `**Your Portfolio page has all the details** 📋

You can see:
• **Current Value** — what your holdings are worth now
• **P&L** — profit or loss (both in ₹ and %)
• **Sector Allocation** — how your money is distributed
• **Win Rate** — what % of your trades were profitable

Visit the **Portfolio** page for the full picture with charts and risk metrics!`,
  },
  {
    keywords: ["order", "orders", "pending order", "cancel order"],
    response: `**Manage orders on the Orders page** 📑

• **Pending Orders** — shows orders waiting to execute. You can cancel them anytime.
• **Order History** — shows all completed trades.
• Orders auto-expire after 24 hours if not filled.

Head to the **Orders** page to track everything!`,
  },
  {
    keywords: ["wallet", "balance", "money", "funds", "cash"],
    response: `**Your virtual wallet starts with ₹1,00,000** 💰

• You can see your balance in the top navbar and on the Dashboard
• Each buy reduces your wallet, each sell adds to it
• No real money is involved — it's all virtual, so experiment freely!`,
  },
  {
    keywords: ["sell", "how to sell", "sell stock", "sell share"],
    response: `**Selling stocks on TradeX is straightforward** ✅

1. Go to your **Dashboard** and find the holding you want to sell
2. Click the **SELL** button next to it
3. Choose the quantity (you can sell some or all shares)
4. Confirm — and the money is added to your wallet!

📌 Your profit/loss is shown before you confirm the sale.`,
  },
  {
    keywords: ["transactions", "history", "trade history", "activity"],
    response: `**View all your past trades in History** 📜

The **History** page shows:
• Every buy and sell you've made
• Price and quantity for each trade
• Timestamps for when trades happened

Great for reviewing your trading activity and learning from past decisions!`,
  },
  {
    keywords: ["profile", "account", "username", "password", "settings"],
    response: `**Manage your account in Profile** 👤

Go to the **Profile** page to:
• See your account details
• Check your wallet balance
• Log out when needed

Keep your account secure — don't share your password!`,
  },
];

function matchTopic(input) {
  const lower = input.toLowerCase().trim();
  if (!lower) return null;
  for (const topic of TOPICS) {
    for (const kw of topic.keywords) {
      if (lower.includes(kw)) return topic.response;
    }
  }
  return null;
}

const OUT_OF_DOMAIN =
  "I'm TradeX Assistant 🤖 — I can only help with **trading and TradeX platform questions**. Try asking me about buying stocks, orders, risk, diversification, or the simulator!";

const WELCOME_MSG = (username) =>
  `Welcome, **@${username}** 👋\n\nAsk me about trading, orders, portfolio risk, or market scenarios.`;

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0s" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.15s" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.3s" }} />
    </span>
  );
}

function renderText(text) {
  return text
    .split(/\n{2,}/)
    .map((block, i) => {
      if (block.startsWith("**") && block.endsWith("**")) {
        return (
          <p key={i} className="font-bold text-sm mb-2">
            {block.replace(/\*\*/g, "")}
          </p>
        );
      }
      const lines = block.split("\n").map((line, j) => {
        const rendered = line
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        const iconMatch = rendered.match(/^([📍📌👉💡🧺📊📋📑💰✅📜👤🎯🛡️📈📉➡️🎮💻🏦⛽🚗🛒]) (.+)/);
        if (iconMatch) {
          return (
            <span key={j} className="block text-sm leading-relaxed">
              <span className="mr-1">{iconMatch[1]}</span>
              <span dangerouslySetInnerHTML={{ __html: iconMatch[2] }} />
            </span>
          );
        }
        return (
          <span key={j} className="block text-sm leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: rendered }} />
          </span>
        );
      });
      return <div key={i} className={i > 0 ? "mt-3" : ""}>{lines}</div>;
    });
}

async function translateText(text, targetLang) {
  if (targetLang === "en") return text;
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map((s) => s[0]).join("");
    }
    return text;
  } catch {
    return text;
  }
}

export default function TradeXAssistant({ dark, username }) {
  const { card, text, muted } = useTheme(dark);
  const [messages, setMessages] = useState([
    { role: "assistant", text: WELCOME_MSG(username || "Trader") },
  ]);
  const [input, setInput] = useState("");
  const [translatingIndex, setTranslatingIndex] = useState(null);
  const [translateLang, setTranslateLang] = useState({});
  const [thinking, setThinking] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 1) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_HINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleSend = async (text) => {
    const q = text.trim();
    if (!q || thinking) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const answer = matchTopic(q);
      const reply = answer || OUT_OF_DOMAIN;
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setThinking(false);
    }, 600 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleChip = (chip) => {
    handleSend(chip);
  };

  const handleTranslate = async (msgIndex) => {
    if (translateLang[msgIndex]) {
      setTranslateLang((prev) => {
        const next = { ...prev };
        delete next[msgIndex];
        return next;
      });
      return;
    }
    if (!showLangPicker) {
      setShowLangPicker(msgIndex);
      return;
    }
    if (showLangPicker !== msgIndex) {
      setShowLangPicker(msgIndex);
      return;
    }
  };

  const doTranslate = async (msgIndex, langCode) => {
    setTranslatingIndex(msgIndex);
    const msg = messages[msgIndex];
    const translated = await translateText(msg.text, langCode);
    setMessages((prev) => {
      const next = [...prev];
      next[msgIndex] = { ...next[msgIndex], translated, langCode };
      return next;
    });
    setTranslateLang((prev) => ({ ...prev, [msgIndex]: true }));
    setShowLangPicker(null);
    setTranslatingIndex(null);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", text: WELCOME_MSG(username || "Trader") }]);
    setTranslateLang({});
    setShowLangPicker(null);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ scale: 1.01 }}
      className={`rounded-2xl border flex flex-col transition-all duration-300 ${
        dark
          ? "bg-gradient-to-b from-violet-950/40 to-gray-900 border-violet-800/40 hover:shadow-lg hover:shadow-violet-900/20"
          : "bg-gradient-to-b from-violet-50 to-white border-violet-200 hover:shadow-lg hover:shadow-violet-500/20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            dark ? "bg-violet-900/60" : "bg-violet-100"
          }`}>
            <Icon name="brain" size={14} cls={dark ? "text-violet-400" : "text-violet-600"} />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold tracking-widest ${dark ? "text-violet-400" : "text-violet-600"}`}>
              TRADEX ASSISTANT
            </div>
            <div className={`text-[10px] ${muted}`}>Educational guide</div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className={`p-1.5 rounded-lg text-xs transition shrink-0 ${
            dark ? "hover:bg-gray-800 text-gray-500" : "hover:bg-gray-200 text-gray-400"
          }`}
          title="Clear chat"
        >
          <Icon name="refresh" size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 space-y-3 min-h-[200px] max-h-[260px] scrollbar-none">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                msg.role === "user"
                  ? dark
                    ? "bg-violet-900/50 text-violet-100"
                    : "bg-violet-100 text-violet-900"
                  : dark
                  ? "bg-gray-800/70 text-gray-200"
                  : "bg-white text-gray-800 border border-gray-100"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="space-y-1">
                  {msg.translated ? (
                    <div>
                      <div className="text-sm leading-relaxed whitespace-pre-line">{msg.translated}</div>
                      <div className={`text-[10px] mt-1.5 italic ${muted}`}>
                        Translated · {LANGUAGES.find((l) => l.code === msg.langCode)?.label || msg.langCode}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed">{renderText(msg.text)}</div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleTranslate(i)}
                      className={`text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded transition ${
                        dark ? "text-violet-400 hover:bg-violet-900/40" : "text-violet-600 hover:bg-violet-100"
                      }`}
                    >
                      <Icon name="info" size={10} />
                      {translateLang[i] ? "Original" : "Translate"}
                    </button>
                    {translatingIndex === i && (
                      <span className={`text-[10px] ${muted}`}>Translating...</span>
                    )}
                  </div>
                  {showLangPicker === i && !translateLang[i] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-violet-800/30"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => doTranslate(i, lang.code)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded transition ${
                            dark
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.text}</p>
              )}
            </div>
          </motion.div>
        ))}
        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className={`rounded-xl px-3.5 py-2.5 ${dark ? "bg-gray-800/70" : "bg-white border border-gray-100"}`}>
              <div className={`text-sm ${dark ? "text-gray-300" : "text-gray-500"}`}>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips */}
      {messages.length <= 2 && (
        <div className="px-4 sm:px-5 py-2">
          <div className="flex flex-wrap gap-1.5">
            {FAQ_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className={`text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full transition ${
                  dark
                    ? "bg-violet-900/30 text-violet-300 hover:bg-violet-900/50 border border-violet-800/40"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rotating hint */}
      {messages.length <= 2 && (
        <div className="px-4 sm:px-5 pb-0.5 flex justify-center">
          <span className={`text-[10px] italic ${muted} animate-pulse`}>
            {PLACEHOLDER_HINTS[placeholderIndex]}
          </span>
        </div>
      )}

      {/* Input */}
      <div className={`px-4 sm:px-5 pt-2 pb-4 sm:pb-5 border-t ${dark ? "border-violet-800/20" : "border-violet-200"}`}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_HINTS[placeholderIndex]} key={placeholderIndex}
            className={`flex-1 px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition ${
              dark
                ? "bg-gray-800/60 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
            }`}
            disabled={thinking}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || thinking}
            className={`p-2.5 rounded-xl transition shrink-0 ${
              dark
                ? "bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <Icon name="trending_up" size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
