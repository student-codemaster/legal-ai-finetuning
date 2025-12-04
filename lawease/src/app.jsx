// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user/dashboard" element={
          <ProtectedRoute><UserDashboard/></ProtectedRoute>
        }/>
        <Route path="/user/profile" element={
          <ProtectedRoute><UserProfile/></ProtectedRoute>
        }/>
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboard/></AdminRoute>
        }/>
      </Routes>
    </Router>
  );
}
