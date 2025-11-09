import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/protected/ProtectedRoute'
import Header from './components/common/Header'
import './App.css'

// Lazy load components
const Login = React.lazy(() => import('./components/auth/Login'))
const Signup = React.lazy(() => import('./components/auth/Signup'))
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <React.Suspense fallback={
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Legal Simplifier...</p>
              </div>
            }>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App