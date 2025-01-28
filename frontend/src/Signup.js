import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // Reuse the same CSS file for styling consistency

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send the signup request
      const response = await axios.post("http://127.0.0.1:8000/signup/", {
        username,
        password       
      });

      if (response.data) {
        alert("Signup successful");
        // Redirect or notify user of successful signup
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Sign Up</button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Signup;
