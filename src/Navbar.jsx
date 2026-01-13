import React from "react";
import { NavLink } from "react-router-dom";
import { FaCar } from "react-icons/fa";
import "./NavBar.css";

function Navbar({ serverUser, onLogout }) {
  const user = serverUser;
  const userRole = user?.role || null;

  const handleLogout = async () => {
    if (onLogout) {
      try {
        await onLogout();
      } catch (e) {
        console.error('onLogout error', e);
      }
    }
  };

  const isStaff = userRole === "admin" || userRole === "front_desk";

  return (
    <nav className="navbar">
      <div className="nav-container">
        {isStaff ? (
          <div className="nav-logo static-logo">
            <span className="logo-icon"><FaCar /></span>
            <span className="logo-text">Ali Autos</span>
          </div>
        ) : (
          <NavLink to="/" className="nav-logo">
            <span className="logo-icon"><FaCar /></span>
            <span className="logo-text">Ali Autos</span>
          </NavLink>
        )}

        {/* Show full menu only for regular users and logged-out users */}
        {(!user || userRole === "user") && (
          <ul className="nav-menu">
            <li><NavLink to="/" className="nav-link">Home</NavLink></li>
            <li><NavLink to="/cars" className="nav-link">Shop Cars</NavLink></li>
            {user && userRole === "user" && <li><NavLink to="/my-visits" className="nav-link">My Visits</NavLink></li>}
            <li><NavLink to="/contact" className="nav-link">Contact</NavLink></li>
          </ul>
        )}

        {/* Show staff-only menu for admin/front_desk */}
        {user && (userRole === "admin" || userRole === "front_desk") && (
          <ul className="nav-menu">
            {userRole === "admin" && <li><NavLink to="/admin" className="nav-link">Dashboard</NavLink></li>}
            {userRole === "front_desk" && <li><NavLink to="/front-desk" className="nav-link">Visits</NavLink></li>}
          </ul>
        )}
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              {userRole && <span className="user-role">({userRole})</span>}
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <NavLink to="/auth" className="nav-link">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
