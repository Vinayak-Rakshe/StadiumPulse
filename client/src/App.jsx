import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SkipToContent from './components/SkipToContent';

// Pages
import FanHome from './pages/FanHome';
import AccessibilityConcierge from './pages/AccessibilityConcierge';
import OrganizerDashboard from './pages/OrganizerDashboard';
import VolunteerCopilot from './pages/VolunteerCopilot';
import Login from './pages/Login';

// Protected Route wrapper to block unauthorized roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-dark flex flex-col items-center justify-center text-white" aria-label="Loading Session">
        <div className="w-10 h-10 border-4 border-fifa-green border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Loading Session...</p>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    // If not authenticated or authorized, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-stadium-dark flex flex-col font-sans">
          {/* Accessibility skip button */}
          <SkipToContent />

          {/* Nav Header */}
          <Navbar />

          {/* Main content body */}
          <Routes>
            <Route path="/" element={<FanHome />} />
            <Route path="/accessibility" element={<AccessibilityConcierge />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Operations Dashboard */}
            <Route 
              path="/organizer" 
              element={
                <ProtectedRoute allowedRoles={['Organizer', 'Staff']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected Volunteer Copilot Chat */}
            <Route 
              path="/volunteer" 
              element={
                <ProtectedRoute allowedRoles={['Volunteer', 'Staff', 'Organizer']}>
                  <VolunteerCopilot />
                </ProtectedRoute>
              } 
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Sustainability footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
