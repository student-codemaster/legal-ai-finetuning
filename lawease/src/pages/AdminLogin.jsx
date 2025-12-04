import React, { useState } from "react";
import API from "../utils/api";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", { username, password });
      if (res.data.user.is_admin) {
        saveToken(res.data.access_token);
        navigate("/admin/dashboard");
      } else {
        alert("Access denied — not an admin!");
      }
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md text-white"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">
          Admin Login
        </h2>
        <input
          className="w-full mb-3 p-2 rounded-md bg-gray-900 border border-gray-600"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-6 p-2 rounded-md bg-gray-900 border border-gray-600"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 py-2 rounded-lg font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
