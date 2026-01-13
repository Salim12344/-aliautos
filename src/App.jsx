import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { auth } from './storage';
import Navbar from "./Navbar.jsx";
import HomePage from "./HomePage.jsx";
import CarsPage from "./CarsPage.jsx";
import ViewDetails from "./ViewDetails.jsx";
import ScheduleVisit from "./ScheduleVisit.jsx";
import MyVisits from "./MyVisits.jsx";
import Contact from "./Contact.jsx";
import Auth from "./Auth.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import FrontDeskPage from "./FrontDeskPage.jsx";
import "./App.css";

// Protected route component with role checking
function ProtectedRoute({ children, user, requiredRole = null }) {
  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Rehydrate user from localStorage on mount
  useEffect(() => {
    const currentUser = auth.verifyToken() || auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const onAuthTokenChanged = () => {
      const currentUser = auth.verifyToken() || auth.getCurrentUser();
      setUser(currentUser);
    };

    const onStorage = (ev) => {
      if (ev.key?.startsWith('aliAutos_')) {
        onAuthTokenChanged();
      }
    };

    window.addEventListener('auth_token_changed', onAuthTokenChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth_token_changed', onAuthTokenChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Redirect based on user role
  useEffect(() => {
    if (!user) return;
    try {
      const role = user.role || 'user';
      const publicPaths = ['/', '/auth'];
      if (publicPaths.includes(location.pathname)) {
        if (role === 'admin') navigate('/admin');
        else if (role === 'front_desk') navigate('/front-desk');
      }
    } catch (e) {
      // ignore
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = async () => {
    auth.logout();
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <Navbar serverUser={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<ViewDetails />} />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute user={user}>
                <ScheduleVisit />
              </ProtectedRoute>
            }
          />
          <Route path="/my-visits" element={<MyVisits />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/front-desk"
            element={
              <ProtectedRoute user={user} requiredRole="front_desk">
                <FrontDeskPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
