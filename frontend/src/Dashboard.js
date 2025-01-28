import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Import the context
import "./Dashboard.css";

const Dashboard = () => {
  const { authState, logout } = useAuth(); // Access auth state and logout function
  const navigate = useNavigate();
  const [isSidebarVisible, setSidebarVisible] = useState(true); // State to toggle sidebar visibility

  const handleLogout = () => {
    logout(); // Clear the context state and log out
    navigate("/"); // Redirect to login page
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible); // Toggle sidebar visibility
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">YourLogo</div>
        <div className="welcome">
          <span>Welcome, {authState.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="hamburger-icon" onClick={toggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </header>
      <div className="dashboard-body">
        <aside className={`dashboard-sidebar ${isSidebarVisible ? 'visible' : ''}`}>
          <nav>
            <ul>
              <li><a href="/search">Search</a></li>
              
            </ul>
          </nav>
        </aside>
        <main className="dashboard-content">
          <h2>Dashboard Content</h2>
          <p>Welcome to your personalized dashboard!</p>
          {/* Main content goes here */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
