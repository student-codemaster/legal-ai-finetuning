import React, { useState } from "react";

export default function AuthCard({
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
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8">
          <h1 className="text-4xl font-bold text-white text-center">{title}</h1>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-3 p-6 bg-gray-50 border-b">
          <button
            onClick={() => onToggle?.(true)}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
              isLogin
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => onToggle?.(false)}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${
              !isLogin
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            Signup
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition placeholder-gray-400 text-gray-700 font-medium"
                  />
                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition font-lg"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Forgot Password Link (only show for login form) */}
          {isLogin && (
            <div className="text-right mt-3 mb-6">
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 text-sm font-medium transition"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              submitButtonText
            )}
          </button>

          {/* Bottom Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">{bottomText} </span>
            <button
              type="button"
              onClick={onBottomLinkClick}
              className="text-blue-500 hover:text-blue-700 font-semibold text-sm transition"
            >
              {bottomLinkText}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t">
          <p>🔐 Secure & encrypted • Your data is protected</p>
        </div>
      </div>
    </div>
  );
}
