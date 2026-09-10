import React, { useEffect, useCallback } from "react";
import "./App.css";

import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

import AdminLogin from "./AdminLogin";
import VolunteerForm from "./VolunteerForm";
import AdminDashboard from "./AdminDashboard";
import AutomationDashboard from "./automation/AutomationDashboard";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// ===============================
// ADMIN AUTH
// ===============================

export const loginAdmin = () => {
  localStorage.setItem("isAdminLoggedIn", "true");
  localStorage.setItem("adminLoginTime", Date.now().toString());
};

export const logoutAdmin = () => {
  localStorage.removeItem("isAdminLoggedIn");
  localStorage.removeItem("adminLoginTime");
};

export const isSessionValid = () => {
  const isLoggedIn =
    localStorage.getItem("isAdminLoggedIn") === "true";

  const loginTime =
    localStorage.getItem("adminLoginTime");

  if (!isLoggedIn || !loginTime) {
    return false;
  }

  const timeElapsed =
    Date.now() - parseInt(loginTime, 10);

  return timeElapsed < FIFTEEN_MINUTES_MS;
};


// ===============================
// PROTECTED ADMIN ROUTE
// ===============================

function ProtectedAdminRoute({ children }) {
  if (!isSessionValid()) {
    logoutAdmin();

    return (
      <Navigate
        to="/admin-login"
        replace
      />
    );
  }

  return children;
}


// ===============================
// SESSION WATCHER
// ===============================

function SessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    logoutAdmin();

    alert(
      "Admin session expired (15 mins). Please log in again."
    );

    navigate("/admin-login");
  }, [navigate]);

  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("isAdminLoggedIn") === "true";

    if (!isLoggedIn) {
      return;
    }

    if (!isSessionValid()) {
      handleLogout();
      return;
    }

    const interval = setInterval(() => {
      if (!isSessionValid()) {
        handleLogout();
      }
    }, 30000);

    return () => clearInterval(interval);

  }, [location, handleLogout]);

  return null;
}


// ===============================
// APPLICATION
// ===============================

function App() {
  return (
    <Router>

      <SessionWatcher />

      <div className="app-container">

        {/* Navigation */}
     <nav className="main-navigation">

  <a
    href="https://veereshsalagar.github.io/aboutme/"
    className="nav-about"
  >
    ← About Me
  </a>

  <NavLink
    to="/"
    className={({ isActive }) =>
      isActive ? "nav-link active" : "nav-link"
    }
  >
    Home
  </NavLink>

  <NavLink
    to="/automation"
    className={({ isActive }) =>
      isActive ? "nav-link active" : "nav-link"
    }
  >
    Automation Dashboard
  </NavLink>

  <NavLink
    to="/admin"
    className={({ isActive }) =>
      isActive ? "nav-link active" : "nav-link"
    }
  >
    Admin Portal
  </NavLink>

</nav>

        <Routes>

          {/* Volunteer */}
          <Route
            path="/"
            element={<VolunteerForm />}
          />

          {/* Automation */}
          <Route
            path="/automation"
            element={<AutomationDashboard />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          {/* Admin Login */}
          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<VolunteerForm />}
          />

        </Routes>

      </div>

    </Router>
  );
}

export default App;