import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { users } from "../data/mockData";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP, 3 = new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Step 1 - check email and send OTP
  const handleSendOtp = () => {
    setError("");
    if (!email) { setError("Please enter your email"); return; }
    const user = users.find(u => u.email === email);
    if (!user) { setError("No account found with this email"); return; }

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep(2);
    setSuccess(`OTP sent! (For demo purposes, your OTP is: ${code})`);
  };

  // Step 2 - verify OTP
  const handleVerifyOtp = () => {
    setError("");
    if (!otp) { setError("Please enter the OTP"); return; }
    if (otp !== generatedOtp) { setError("Incorrect OTP. Please try again."); return; }
    setSuccess("");
    setStep(3);
  };

  // Step 3 - reset password
  const handleResetPassword = () => {
    setError("");
    if (!newPassword || !confirmPassword) { setError("Please fill in all fields"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    // Update the user's password in mock data
    const user = users.find(u => u.email === email);
    if (user) user.password = newPassword;

    setSuccess("✅ Password reset successfully! Redirecting to login...");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>GUC Portfolio</h1>
        <h2 style={styles.subtitle}>Reset Password</h2>

        {/* Progress Steps */}
        <div style={styles.steps}>
          {["Email", "OTP", "New Password"].map((label, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, backgroundColor: step > i ? "#003366" : step === i + 1 ? "#003366" : "#ddd", color: step >= i + 1 ? "white" : "#999" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "12px", color: step === i + 1 ? "#003366" : "#999" }}>{label}</span>
              {i < 2 && <div style={{ ...styles.stepLine, backgroundColor: step > i + 1 ? "#003366" : "#ddd" }} />}
            </div>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        {/* Step 1 - Enter Email */}
        {step === 1 && (
          <>
            <p style={styles.desc}>Enter your registered email address and we'll send you an OTP to reset your password.</p>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button style={styles.button} onClick={handleSendOtp}>Send OTP</button>
          </>
        )}

        {/* Step 2 - Enter OTP */}
        {step === 2 && (
          <>
            <p style={styles.desc}>Enter the 6-digit OTP sent to <b>{email}</b></p>
            <input
              style={{ ...styles.input, textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
            <button style={styles.button} onClick={handleVerifyOtp}>Verify OTP</button>
            <button style={styles.resendBtn} onClick={handleSendOtp}>Resend OTP</button>
          </>
        )}

        {/* Step 3 - New Password */}
        {step === 3 && (
          <>
            <p style={styles.desc}>Enter your new password below.</p>
            <input
              style={styles.input}
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button style={styles.button} onClick={handleResetPassword}>Reset Password</button>
          </>
        )}

        <p style={styles.link}>
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f2f5" },
  card: { backgroundColor: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "420px" },
  title: { textAlign: "center", color: "#003366", marginBottom: "5px" },
  subtitle: { textAlign: "center", color: "#666", marginBottom: "20px", fontWeight: "normal" },
  steps: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "25px", gap: "0" },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", position: "relative" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" },
  stepLine: { width: "60px", height: "2px", position: "absolute", top: "16px", left: "32px" },
  desc: { color: "#666", fontSize: "14px", marginBottom: "20px", textAlign: "center" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", backgroundColor: "#003366", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginBottom: "10px" },
  resendBtn: { width: "100%", padding: "10px", backgroundColor: "white", color: "#003366", border: "1px solid #003366", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
  error: { color: "red", textAlign: "center", marginBottom: "10px", fontSize: "14px" },
  success: { color: "green", textAlign: "center", marginBottom: "10px", fontSize: "14px", backgroundColor: "#f0fff0", padding: "10px", borderRadius: "8px" },
  link: { textAlign: "center", marginTop: "15px", fontSize: "14px" },
};

export default ForgotPassword;