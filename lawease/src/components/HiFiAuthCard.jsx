import React, { useState } from "react";

export default function HiFiAuthCard({
  title = "Login Form",
  isLogin = true,
  onToggle,
  onSubmit,
  error,
  loading,
  fields,
  submitButtonText = "Login",
  bottomText = "Not a member?",
  bottomLinkText = "Signup now",
  onBottomLinkClick,
}) {
  const [formData, setFormData] = useState(
    fields ? fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}) : {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto" style={{ width: "400px" }}>
      {/* Card Container - High Fidelity Design */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{
          padding: "36px 32px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          width: "100%",
        }}
      >
        {/* Title */}
        <h1
          className="text-black text-center font-bold"
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            marginBottom: "24px",
            fontFamily: "Poppins, Inter, Roboto, sans-serif",
            lineHeight: "1.4",
          }}
        >
          {title}
        </h1>

        {/* Toggle Tabs - Pill-Shaped Segmented Control */}
        <div
          className="flex gap-2 mb-8 p-1 rounded-full"
          style={{
            backgroundColor: "#F5F5F5",
            padding: "4px",
          }}
        >
          {/* Login Tab */}
          <button
            onClick={() => onToggle?.(true)}
            className="flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-200 text-sm"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: "12px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              background: isLogin
                ? "linear-gradient(to right, #003D9E, #1EA1FF)"
                : "#FFFFFF",
              color: isLogin ? "#FFFFFF" : "#3A3A3A",
              border: isLogin ? "none" : "1.5px solid #D6D6D6",
              cursor: "pointer",
              boxShadow: isLogin ? "0 2px 8px rgba(30, 161, 255, 0.2)" : "none",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isLogin) {
                e.target.style.borderColor = "#1EA1FF";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLogin) {
                e.target.style.borderColor = "#D6D6D6";
              }
            }}
          >
            Login
          </button>

          {/* Signup Tab */}
          <button
            onClick={() => onToggle?.(false)}
            className="flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-200 text-sm"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: "12px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
              background: !isLogin
                ? "linear-gradient(to right, #003D9E, #1EA1FF)"
                : "#FFFFFF",
              color: !isLogin ? "#FFFFFF" : "#3A3A3A",
              border: !isLogin ? "none" : "1.5px solid #D6D6D6",
              cursor: "pointer",
              boxShadow: !isLogin ? "0 2px 8px rgba(30, 161, 255, 0.2)" : "none",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              if (isLogin) {
                e.target.style.borderColor = "#1EA1FF";
              }
            }}
            onMouseLeave={(e) => {
              if (isLogin) {
                e.target.style.borderColor = "#D6D6D6";
              }
            }}
          >
            Signup
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-3 rounded-lg"
              style={{
                backgroundColor: "#FEE5E5",
                border: "1px solid #FEC5C5",
                padding: "12px",
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

          {/* Input Fields */}
          <div className="space-y-4" style={{ marginBottom: "20px" }}>
            {fields && fields.map((field) => (
              <div key={field.name}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#3A3A3A",
                    marginBottom: "8px",
                    fontFamily: "Poppins, Inter, Roboto, sans-serif",
                  }}
                >
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={
                      field.type === "password" && !showPassword
                        ? "password"
                        : "text"
                    }
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    className="w-full transition-all duration-150"
                    style={{
                      height: "50px",
                      padding: "0 16px",
                      fontSize: "14px",
                      border:
                        focusedField === field.name
                          ? "1.6px solid #1EA1FF"
                          : "1.6px solid #E3E3E3",
                      borderRadius: "11px",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                      fontFamily: "Poppins, Inter, Roboto, sans-serif",
                      boxShadow:
                        focusedField === field.name
                          ? "0px 0px 6px rgba(30, 161, 255, 0.3)"
                          : "none",
                      color: "#3A3A3A",
                      marginBottom: "18px",
                    }}
                  />
                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
                      style={{
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
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Forgot Password Link (only for login) */}
          {isLogin && (
            <button
              type="button"
              className="text-sm font-medium mb-5 hover:underline transition"
              style={{
                fontSize: "13px",
                color: "#1E63FF",
                marginTop: "-8px",
                marginBottom: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
              }}
            >
              Forgot password?
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold text-white rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-95"
            style={{
              height: "50px",
              background: "linear-gradient(to right, #0047AB, #1EA1FF)",
              borderRadius: "13px",
              fontSize: "17px",
              fontWeight: 600,
              color: "#FFFFFF",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
              transform: loading ? "none" : "translateY(0)",
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
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              submitButtonText
            )}
          </button>

          {/* Bottom Text and Link */}
          <div
            className="text-center mt-6 flex items-center justify-center gap-1"
            style={{
              marginTop: "24px",
              fontSize: "14px",
              fontFamily: "Poppins, Inter, Roboto, sans-serif",
            }}
          >
            <span style={{ color: "#777777" }}>{bottomText}</span>
            <button
              type="button"
              onClick={onBottomLinkClick}
              className="font-medium transition-all duration-150"
              style={{
                color: "#1E63FF",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "Poppins, Inter, Roboto, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#0047AB";
                e.target.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#1E63FF";
                e.target.style.textDecoration = "none";
              }}
            >
              {bottomLinkText}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        input::placeholder {
          color: #b8b8b8;
          font-size: 14px;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        @supports (-webkit-appearance: none) {
          input[type="number"] {
            -moz-appearance: textfield;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          button {
            transition: all 200ms ease;
          }
        }
      `}</style>
    </div>
  );
}
