import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignUp({ setUser, dark }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/");
      }
    } catch (err) {
      setError("Failed to signup. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md rounded-2xl border p-5 sm:p-8 ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl mx-auto mb-4">
            T
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
            Create Account
          </h1>
          <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Start your trading journey with TradeX
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm ${
                dark
                  ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                  : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition`}
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm ${
                dark
                  ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                  : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm ${
                dark
                  ? "bg-gray-800 border-gray-700 text-white focus:border-emerald-500"
                  : "bg-white border-gray-200 text-gray-900 focus:border-emerald-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition`}
              placeholder="At least 6 characters"
            />
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold transition ${
              loading
                ? "bg-emerald-500/50 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600"
            } text-white`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </motion.button>
        </form>

        <div className={`mt-6 text-center text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-emerald-500 hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
}