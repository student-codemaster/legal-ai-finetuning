// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/docs`);
        setStatus("online");
      } catch (err) {
        setStatus("offline");
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000); // check every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-slate-900 text-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-wide">⚖️ AI Legal Simplifier</h1>

      {/* Connection Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`w-3 h-3 rounded-full ${
            status === "online"
              ? "bg-green-500 animate-pulse"
              : status === "offline"
              ? "bg-red-500"
              : "bg-yellow-400"
          }`}
          title={
            status === "online"
              ? "Backend Connected"
              : status === "offline"
              ? "Backend Offline"
              : "Checking..."
          }
        ></span>
        <span>
          {status === "online"
            ? "Backend Online"
            : status === "offline"
            ? "Backend Offline"
            : "Checking..."}
        </span>
      </div>
    </nav>
  );
}
