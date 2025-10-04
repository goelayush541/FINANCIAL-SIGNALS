import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Backtesting from './pages/Backtesting';
import MarketData from './pages/MarketData';
import News from './pages/News';
import Portfolio from './pages/Portfolio';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout component for protected routes
const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main App component
function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes with layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/signals" element={
        <ProtectedRoute>
          <AppLayout>
            <Signals />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/backtesting" element={
        <ProtectedRoute>
          <AppLayout>
            <Backtesting />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/market-data" element={
        <ProtectedRoute>
          <AppLayout>
            <MarketData />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/news" element={
        <ProtectedRoute>
          <AppLayout>
            <News />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/portfolio" element={
        <ProtectedRoute>
          <AppLayout>
            <Portfolio />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Root App component
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;