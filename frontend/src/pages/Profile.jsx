import { useState, useEffect } from "react";
import { Icon } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

const API_URL = "/api";

export default function Profile({ user, onLogout, onUpdate, dark, onLogin, onRegister }) {
  const { card, text, muted, input, divider } = useTheme(dark);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({ 
    username: user?.username || "", 
    email: "",
    currentPassword: "", 
    newPassword: "" 
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.username !== "Demo") {
      setFormData(prev => ({ ...prev, username: user.username, email: user.email }));
    }
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    
    const endpoint = authMode === "login" ? "/api/login" : "/api/register";
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authMode === "login" 
          ? { email: formData.email, password: formData.currentPassword }
          : { username: formData.username, email: formData.email, password: formData.currentPassword }
        ),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: authMode === "login" ? "Signed in successfully!" : "Account created!" });
        onLogin(data.user);
        setShowAuthModal(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection failed. Please try again." });
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    
    const updateData = {};
    if (activeTab === "profile" && formData.username !== user?.username) {
      updateData.username = formData.username;
    }
    if (activeTab === "security" && formData.currentPassword && formData.newPassword) {
      updateData.password = formData.newPassword;
    }
    
    if (Object.keys(updateData).length === 0) {
      setMessage({ type: "error", text: "No changes to save" });
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: activeTab === "profile" ? "Profile updated!" : "Password updated!" });
        onUpdate(data.user);
        setFormData({ ...formData, currentPassword: "", newPassword: "" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update" });
    }
    setLoading(false);
  };

  const isDemoUser = user?.username === "Demo";

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${text}`}>Profile & Account</h2>
        <p className={`text-sm ${muted}`}>Manage your profile and authentication</p>
      </div>

      {/* Flash Card Container */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {/* User Info Header */}
        <div className={`p-6 border-b ${divider}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className={`text-lg font-bold ${text}`}>{user?.username}</div>
              <div className={`text-sm ${muted}`}>{user?.email}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isDemoUser 
                ? "bg-amber-500/20 text-amber-500" 
                : "bg-emerald-500/20 text-emerald-500"
            }`}>
              {isDemoUser ? "Demo Account" : "Registered"}
            </div>
          </div>
        </div>

        {/* Quick Actions for Demo User */}
        {isDemoUser ? (
          <div className="p-6">
            <div className={`text-sm mb-4 ${muted}`}>
              Create an account to save your progress and access all features.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all hover:border-emerald-500 hover:bg-emerald-500/10 ${dark ? "border-gray-700" : "border-gray-200"}`}
              >
                <Icon name="trending_up" size={24} cls="text-emerald-500 mb-2" />
                <div className={`font-semibold ${text}`}>Sign In</div>
                <div className={`text-xs ${muted}`}>Access existing account</div>
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all hover:border-blue-500 hover:bg-blue-500/10 ${dark ? "border-gray-700" : "border-gray-200"}`}
              >
                <Icon name="brain" size={24} cls="text-blue-500 mb-2" />
                <div className={`font-semibold ${text}`}>Sign Up</div>
                <div className={`text-xs ${muted}`}>Create new account</div>
              </button>
            </div>
          </div>
        ) : (
          /* Tabs for registered users */
          <div className="p-6">
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {["profile", "security", "preferences"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-emerald-500 text-white"
                      : dark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "profile" && (
              <div>
                {message.text && (
                  <div className={`mb-4 p-3 rounded-xl text-sm ${
                    message.type === "error" 
                      ? "bg-red-500/10 border border-red-500/30 text-red-500"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${text}`}>Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${text}`}>Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className={`w-full px-4 py-3 rounded-xl border text-sm opacity-50 ${input}`}
                    />
                    <p className={`text-xs mt-1 ${muted}`}>Email cannot be changed</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-all disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h3 className={`text-lg font-bold mb-4 ${text}`}>Change Password</h3>
                {message.text && (
                  <div className={`mb-4 p-3 rounded-xl text-sm ${
                    message.type === "error" ? "bg-red-500/10 border border-red-500/30 text-red-500" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                  }`}>
                    {message.text}
                  </div>
                )}
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${text}`}>Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${text}`}>New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <button type="submit" disabled={loading || !formData.currentPassword || !formData.newPassword} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-all disabled:opacity-50">
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "preferences" && (
              <div>
                <h3 className={`text-lg font-bold mb-4 ${text}`}>Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <div className={`text-sm font-medium ${text}`}>Dark Mode</div>
                      <div className={`text-xs ${muted}`}>Use dark theme</div>
                    </div>
                    <button
                      onClick={() => {}}
                      className={`w-12 h-6 rounded-full ${dark ? "bg-emerald-500" : "bg-gray-300"} relative transition-colors`}
                    >
                      <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${dark ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <div className={`text-sm font-medium ${text}`}>Notifications</div>
                      <div className={`text-xs ${muted}`}>Trade alerts and updates</div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-emerald-500 relative">
                      <div className="absolute w-5 h-5 rounded-full bg-white top-0.5 left-6" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className={`text-sm font-medium ${text}`}>Virtual Trading</div>
                      <div className={`text-xs ${muted}`}>Practice mode always on</div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-emerald-500 relative">
                      <div className="absolute w-5 h-5 rounded-full bg-white top-0.5 left-6" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout Section */}
        {!isDemoUser && (
          <div className={`p-6 border-t ${divider}`}>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-400 text-white transition-all"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAuthModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border ${card}`} style={{ animation: "modalIn .25s cubic-bezier(.34,1.56,.64,1) both" }}>
            <button onClick={() => setShowAuthModal(false)} className={`absolute top-4 right-4 p-2 rounded-xl ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
              <Icon name="close" size={16} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                T
              </div>
              <h3 className={`text-xl font-bold ${text}`}>{authMode === "login" ? "Sign In" : "Create Account"}</h3>
              <p className={`text-sm ${muted}`}>{authMode === "login" ? "Welcome back!" : "Join TradeSimIO"}</p>
            </div>

            {message.text && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === "error" ? "bg-red-500/10 border border-red-500/30 text-red-500" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${text}`}>Username</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`} required />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${text}`}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${text}`}>Password</label>
                <input type="password" value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} className={`w-full px-4 py-3 rounded-xl border text-sm ${input}`} minLength={6} required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-all disabled:opacity-50">
                {loading ? "Please wait..." : (authMode === "login" ? "Sign In" : "Create Account")}
              </button>
            </form>

            <div className={`mt-4 text-center text-sm ${muted}`}>
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="text-emerald-500 font-semibold hover:underline">
                {authMode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}