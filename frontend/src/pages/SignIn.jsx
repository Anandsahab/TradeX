import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const API_URL = "/api";

export default function SignIn({ dark, onLogin }) {
  const { bg, card, text, muted, input } = useTheme(dark);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        onLogin(data.user);
        navigate('/');
      }
    } catch (err) {
      setError("Failed to connect. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            T
          </div>
          <h1 className={`text-2xl font-bold ${text}`}>Welcome Back</h1>
          <p className={`text-sm ${muted}`}>Sign in to continue trading</p>
        </div>

        <div className={`rounded-2xl border p-6 ${card}`}>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${text}`}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`}
                placeholder="Enter email"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${text}`}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-all disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className={`mt-6 text-center text-sm ${muted}`}>
            Don't have an account?{" "}
            <button onClick={() => navigate('/signup')} className="text-emerald-500 font-semibold hover:underline">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}