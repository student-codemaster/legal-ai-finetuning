import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { saveToken } from "../utils/auth";

export default function ModernLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    // Validation
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              {isLogin ? "Login Form" : "Create Account"}
            </h1>
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
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
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
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
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
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Email Address or Username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
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
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder-gray-500"
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
            <p>Secure & encrypted • Protected data</p>
          </div>
        </div>

        {/* Card Shadow Enhancement */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl -z-10 blur-2xl opacity-30 animate-pulse"></div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
