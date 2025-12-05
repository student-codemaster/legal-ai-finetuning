import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { saveToken } from "../utils/auth";

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email,
        password: password,
      };

      const response = await api.post("/login", payload);

      if (response.data?.user && !response.data.user.is_admin) {
        setError("Admin access required");
        setLoading(false);
        return;
      }

      if (response.data?.token) {
        saveToken(response.data.token);
        localStorage.setItem("is_admin", "true");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* Gradient Background - Cyan to Purple */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at center, #00D4FF 0%, #7C3AED 100%)",
        }}
      />

      {/* Vignette Effect */}
      <div
        className="absolute inset-0 z-1"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)",
        }}
      />

      {/* Animated Background Elements */}
      <div
        className="absolute top-20 left-10 rounded-full opacity-20 mix-blend-multiply filter blur-3xl animate-pulse"
        style={{
          width: "300px",
          height: "300px",
          backgroundColor: "#00D4FF",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-20 right-10 rounded-full opacity-20 mix-blend-multiply filter blur-3xl animate-pulse"
        style={{
          width: "400px",
          height: "400px",
          backgroundColor: "#7C3AED",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        {/* Admin Badge and Title */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <span style={{ fontSize: "28px" }}>👨‍💼</span>
          </div>
          <h2
            className="text-white font-bold"
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              marginBottom: "8px",
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            Admin Portal
          </h2>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "14px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            Secure Administrative Access
          </p>
        </div>

        {/* Admin Auth Card */}
        <div className="w-full max-w-md mx-auto" style={{ width: "400px" }}>
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Cyan Header */}
            <div
              className="px-8 py-6 text-center font-bold"
              style={{
                background: "linear-gradient(to right, #00B4D8, #0096C7)",
                color: "#FFFFFF",
                fontSize: "26px",
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Admin Login
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Error Message */}
              {error && (
                <div
                  className="mb-6 p-3 rounded-lg"
                  style={{
                    backgroundColor: "#FEE5E5",
                    border: "1px solid #FEC5C5",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "#C33333",
                      fontSize: "13px",
                      fontFamily: "Poppins, Inter, Roboto, sans-serif",
                    }}
                  >
                    ⚠️ {error}
                  </p>
                </div>
              )}

              {/* Email Input */}
              <div className="mb-5">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#3A3A3A",
                    fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  }}
                >
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="admin@example.com"
                  style={{
                    height: "50px",
                    width: "100%",
                    padding: "0 16px",
                    fontSize: "14px",
                    border:
                      focusedField === "email"
                        ? "1.6px solid #00D4FF"
                        : "1.6px solid #E3E3E3",
                    borderRadius: "11px",
                    backgroundColor: "#FFFFFF",
                    outline: "none",
                    fontFamily: "Poppins, Inter, Roboto, sans-serif",
                    boxShadow:
                      focusedField === "email"
                        ? "0px 0px 6px rgba(0, 212, 255, 0.3)"
                        : "none",
                    color: "#3A3A3A",
                    transition: "all 150ms ease",
                  }}
                />
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#3A3A3A",
                    fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter password"
                    style={{
                      height: "50px",
                      width: "100%",
                      padding: "0 16px",
                      fontSize: "14px",
                      border:
                        focusedField === "password"
                          ? "1.6px solid #00D4FF"
                          : "1.6px solid #E3E3E3",
                      borderRadius: "11px",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                      fontFamily: "Poppins, Inter, Roboto, sans-serif",
                      boxShadow:
                        focusedField === "password"
                          ? "0px 0px 6px rgba(0, 212, 255, 0.3)"
                          : "none",
                      color: "#3A3A3A",
                      transition: "all 150ms ease",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Box */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{
                  backgroundColor: "#E0F7FF",
                  border: "1.5px solid #00B4D8",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#0096C7",
                    marginBottom: "8px",
                    fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  }}
                >
                  📋 Demo Admin Credentials:
                </p>
                <div style={{ fontSize: "12px", color: "#0096C7" }}>
                  <p>
                    <span style={{ fontWeight: 600 }}>Email:</span> admin
                  </p>
                  <p>
                    <span style={{ fontWeight: 600 }}>Password:</span> admin123
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "50px",
                  background: "linear-gradient(to right, #00B4D8, #0096C7)",
                  borderRadius: "13px",
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.22)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.18)";
                  }
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span style={{ animation: "spin 1s linear infinite" }}>⏳</span> Verifying...
                  </span>
                ) : (
                  "🔓 Access Portal"
                )}
              </button>

              {/* Back to User Link */}
              <div
                className="text-center mt-6"
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins, Inter, Roboto, sans-serif",
                }}
              >
                <span style={{ color: "#777777" }}>Not an admin? </span>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  style={{
                    color: "#00B4D8",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#0096C7";
                    e.target.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#00B4D8";
                    e.target.style.textDecoration = "none";
                  }}
                >
                  User login
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="mt-8 text-center space-y-3">
          <p
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            Quick Access
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/user/login")}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.25)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              👤 User Login
            </button>
            <button
              onClick={() => navigate("/user/signup")}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.25)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              📝 User Signup
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        input::placeholder {
          color: #b8b8b8;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
