import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";  // Import AuthProvider
import Login from "./Login";
import Dashboard from "./Dashboard";
import Signup from "./Signup";
import Search from "./Search";
import WatchlistPage from './WatchlistPage';
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

