import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const result = login(email, password);
    if (result.success) {
      if (result.role === "student") navigate("/student");
      else if (result.role === "instructor") navigate("/instructor");
      else if (result.role === "employer") navigate("/employer");
      else if (result.role === "admin") navigate("/admin");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>GUC Portfolio</h1>
        <h2 style={styles.subtitle}>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p style={styles.link}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f2f5" },
  card: { backgroundColor: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" },
  title: { textAlign: "center", color: "#003366", marginBottom: "5px" },
  subtitle: { textAlign: "center", color: "#666", marginBottom: "20px", fontWeight: "normal" },
  input: { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", backgroundColor: "#003366", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  error: { color: "red", textAlign: "center", marginBottom: "10px" },
  link: { textAlign: "center", marginTop: "10px", fontSize: "14px" }
};

export default Login;