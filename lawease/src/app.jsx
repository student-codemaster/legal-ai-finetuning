// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserAuthPage from "./pages/UserAuthPage";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminAuthPage from "./pages/AdminAuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserAuthPage />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/dashboard" element={
          <ProtectedRoute><UserDashboard/></ProtectedRoute>
        }/>
        <Route path="/user/profile" element={
          <ProtectedRoute><UserProfile/></ProtectedRoute>
        }/>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminAuthPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboard/></AdminRoute>
        }/>
      </Routes>
    </Router>
  );
}
