import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { saveToken } from "../utils/auth";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminShowPassword, setAdminShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [adminForm, setAdminForm] = useState({
    username: "",
    password: "",
  });

  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
    setError("");
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm({ ...signupForm, [name]: value });
    setError("");
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm({ ...adminForm, [name]: value });
    setAdminError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/login", {
        username: loginForm.username,
        password: loginForm.password,
      });

      if (res.data && res.data.access_token) {
        saveToken(res.data.access_token);
        if (res.data.user?.is_admin) {
          localStorage.setItem("is_admin", "true");
        }
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !signupForm.fullName ||
      !signupForm.email ||
      !signupForm.username ||
      !signupForm.password ||
      !signupForm.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/register", {
        full_name: signupForm.fullName,
        email: signupForm.email,
        username: signupForm.username,
        password: signupForm.password,
      });

      if (res.data && res.data.access_token) {
        saveToken(res.data.access_token);
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminForm.username || !adminForm.password) {
      setAdminError("Please fill in all fields");
      return;
    }

    setAdminLoading(true);
    try {
      const res = await API.post("/login", {
        username: adminForm.username,
        password: adminForm.password,
      });

      if (res.data && res.data.access_token) {
        if (!res.data.user?.is_admin) {
          setAdminError("Admin access required. This account does not have admin privileges.");
          setAdminLoading(false);
          return;
        }

        saveToken(res.data.access_token);
        localStorage.setItem("is_admin", "true");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setAdminError(err.response?.data?.detail || "Admin login failed");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            ⚖️ LawEase
          </h1>
          <p className="text-xl text-gray-600">Simplifying Legal Documents with AI</p>
        </div>

        {/* Main Container - User Login & Admin Portal Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* USER LOGIN SECTION */}
          <div className="relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8">
                <h2 className="text-3xl font-bold text-white text-center">
                  Login Form
                </h2>
              </div>

              {/* Toggle Buttons */}
              <div className="flex gap-4 p-6 bg-gray-50 border-b">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    isLogin
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    !isLogin
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  Signup
                </button>
              </div>

              {/* Form Container */}
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="p-8">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
                  </div>
                )}

                {/* Login Form */}
                {isLogin ? (
                  <div className="space-y-5">
                    {/* Email/Username Input */}
                    <div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Email Address or Username"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium transition"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span> Logging in...
                        </span>
                      ) : (
                        "Login"
                      )}
                    </button>

                    {/* Signup Link */}
                    <div className="text-center mt-4">
                      <span className="text-gray-600">Not a member? </span>
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="text-blue-500 hover:text-blue-700 font-semibold transition"
                      >
                        Signup now
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Signup Form */
                  <div className="space-y-4">
                    {/* Full Name Input */}
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={signupForm.fullName}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                    </div>

                    {/* Username Input */}
                    <div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={signupForm.username}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password (min 6 characters)"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={signupForm.confirmPassword}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                    </div>

                    {/* Signup Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span> Creating account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                      <span className="text-gray-600">Already a member? </span>
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="text-blue-500 hover:text-blue-700 font-semibold transition"
                      >
                        Login now
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500 border-t">
                <p>🔐 Secure & encrypted • Your data is protected</p>
              </div>
            </div>
          </div>

          {/* ADMIN PORTAL SECTION */}
          <div className="relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Header - Cyan Theme for Admin */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl">👨‍💼</span>
                  <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
                </div>
                <p className="text-cyan-100 text-center text-sm">Administrative Access</p>
              </div>

              {/* Form Container */}
              <form onSubmit={handleAdminLogin} className="p-8">
                {/* Error Message */}
                {adminError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">⚠️ {adminError}</p>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter admin username"
                      value={adminForm.username}
                      onChange={handleAdminChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔐 Password
                    </label>
                    <div className="relative">
                      <input
                        type={adminShowPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter admin password"
                        value={adminForm.password}
                        onChange={handleAdminChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition placeholder-gray-500 text-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setAdminShowPassword(!adminShowPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-500 transition"
                      >
                        {adminShowPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-cyan-600 hover:text-cyan-800 text-sm font-medium transition"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Demo Credentials Info */}
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-4">
                    <p className="text-cyan-900 text-xs font-semibold mb-2">Demo Credentials:</p>
                    <p className="text-cyan-800 text-xs">👤 Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
                    <p className="text-cyan-800 text-xs">🔐 Password: <code className="bg-white px-2 py-1 rounded">admin123</code></p>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {adminLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Verifying...
                      </span>
                    ) : (
                      "🔓 Access Admin Portal"
                    )}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500 border-t">
                <p>🔒 Admin-only access • Encrypted connection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <span className="text-4xl mb-3 block">📄</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Documents</h3>
            <p className="text-gray-600 text-sm">Upload legal documents in any format</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <span className="text-4xl mb-3 block">✨</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI Simplification</h3>
            <p className="text-gray-600 text-sm">Get instant summaries and simplified text</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <span className="text-4xl mb-3 block">🌐</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Multi-Language</h3>
            <p className="text-gray-600 text-sm">Support for English, Hindi, Tamil & Kannada</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <p>© 2025 LawEase. All rights reserved. | <a href="#" className="text-blue-500 hover:text-blue-700">Privacy</a> • <a href="#" className="text-blue-500 hover:text-blue-700">Terms</a></p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
