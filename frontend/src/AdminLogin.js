import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "./App";

function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevents page reload on Enter key submit

    if (password === "salaga@784") {
      localStorage.setItem("isAdmin", "true");
      loginAdmin();
navigate("/admin");
    } else {
      alert("Wrong Password");
    }
  };

  return (
    <div className="card">
      <h1>Admin Login</h1>
      
      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;