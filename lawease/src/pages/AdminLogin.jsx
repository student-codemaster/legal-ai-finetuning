import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { saveToken } from "../utils/auth";

export default function AdminLogin() {
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

      {/* Content Container - Relative to background */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        {/* Logo and Title Section */}
        <div className="mb-8 text-center">
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
            ⚖️ LawEase Admin
          </h2>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "14px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            Administrative portal access
          </p>
        </div>

        {/* Login Card */}
        <div
          className="w-full max-w-md rounded-3xl p-8 flex flex-col gap-6 relative z-20 shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1.6px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <h3
            style={{
              color: "rgba(255, 255, 255, 0.95)",
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            Admin Login
          </h3>

          {/* Error Message */}
          {error && (
            <div
              className="p-4 rounded-lg text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                color: "#FCA5A5",
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  display: "block",
                  letterSpacing: "0.3px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="admin@example.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: focusedField === "email" 
                    ? "1.6px solid rgba(30, 161, 255, 0.6)"
                    : "1.6px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  outline: "none",
                  transition: "all 300ms ease",
                  boxShadow: focusedField === "email"
                    ? "0 0 20px rgba(30, 161, 255, 0.2)"
                    : "none",
                }}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  display: "block",
                  letterSpacing: "0.3px",
                }}
              >
                Password
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    paddingRight: "40px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: focusedField === "password"
                      ? "1.6px solid rgba(30, 161, 255, 0.6)"
                      : "1.6px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontFamily: "Poppins, Inter, Roboto, sans-serif",
                    outline: "none",
                    transition: "all 300ms ease",
                    boxShadow: focusedField === "password"
                      ? "0 0 20px rgba(30, 161, 255, 0.2)"
                      : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.6)",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "4px 8px",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                marginTop: "20px",
                background: "linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 300ms ease",
                opacity: loading ? 0.7 : 1,
                transform: loading ? "scale(0.98)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 10px 30px rgba(0, 212, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {loading ? "Logging in..." : "Login Now"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(255, 255, 255, 0.1)",
              margin: "20px 0",
            }}
          />

          {/* Demo Credentials */}
          <div
            style={{
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "12px",
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                marginBottom: "8px",
              }}
            >
              Demo Admin Credentials
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "monospace",
                marginBottom: "4px",
              }}
            >
              Email: admin
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              Password: admin123
            </p>
          </div>
        </div>

        {/* User Portal Link */}
        <div className="mt-8 text-center">
          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "13px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              marginBottom: "12px",
            }}
          >
            Regular User?
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              border: "1.5px solid rgba(255, 255, 255, 0.4)",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "all 300ms ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.6)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 20px rgba(255, 255, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            👥 User Portal
          </button>
        </div>

        {/* Quick Access Section */}
        <div
          className="mt-6 text-center space-y-3"
          style={{
            maxWidth: "320px",
          }}
        >
          <p
            style={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "11px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Other Admin Options
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate("/admin/signup")}
              className="px-5 py-2.5 rounded-full font-medium transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                border: "1.4px solid rgba(255, 255, 255, 0.25)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.22)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.12)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.25)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              📝 Admin Signup
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="px-5 py-2.5 rounded-full font-medium transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                border: "1.4px solid rgba(255, 255, 255, 0.25)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.22)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.12)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.25)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              🏠 Main Admin
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
