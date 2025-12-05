import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HiFiAuthCard from "../components/HiFiAuthCard";
import { api } from "../utils/api";
import { saveToken } from "../utils/auth";

export default function UserSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signupFields = [
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a strong password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Re-enter your password",
    },
  ];

  // Validation helper
  const validateForm = (data) => {
    if (!data.email?.trim()) return "Email is required";
    if (!data.password?.trim()) return "Password is required";
    if (data.password.length < 6) return "Password must be at least 6 characters";
    if (!data.confirmPassword?.trim()) return "Please confirm your password";
    if (data.password !== data.confirmPassword) return "Passwords do not match";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return "Please enter a valid email";

    return null;
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    setError("");
    const validationError = validateForm(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      const response = await api.post("/register", payload);

      if (response.data?.token) {
        saveToken(response.data.token);
        if (response.data.user?.is_admin) {
          localStorage.setItem("is_admin", "true");
        }
        navigate("/user/dashboard");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Registration failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at center, #1EA1FF 0%, #003D9E 100%)",
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
          backgroundColor: "#0047AB",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      {/* Content Container */}
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
            ⚖️ LawEase
          </h2>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "14px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              letterSpacing: "0.3px",
            }}
          >
            Simplifying legal documents for everyone
          </p>
        </div>

        {/* Auth Card - Signup Only */}
        <HiFiAuthCard
          title="Create Account"
          isLogin={false}
          onToggle={() => navigate("/user/login")}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
          fields={signupFields}
          submitButtonText="Create Account"
          bottomText="Already have an account?"
          bottomLinkText="Sign in here"
          onBottomLinkClick={() => navigate("/user/login")}
        />

        {/* Admin Portal Link */}
        <div className="mt-8 text-center">
          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "13px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              marginBottom: "12px",
            }}
          >
            Admin?
          </p>
          <button
            onClick={() => navigate("/admin")}
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
            👨‍💼 Admin Portal
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
            Other Pages
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate("/")}
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
              🏠 Home
            </button>
            <button
              onClick={() => navigate("/user/login")}
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
              👤 Login
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
