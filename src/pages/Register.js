import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { users } from "../data/mockData";

function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    companyName: "", companyEmail: "", taxCertificate: "", taxCertificateBase64: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, taxCertificate: file.name, taxCertificateBase64: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = () => {
    setError("");

    if (role === "student") {
      if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
        setError("Please fill in all fields"); return;
      }
      if (!form.email.endsWith("@student.guc.edu.eg")) {
        setError("Students must use their GUC email (@student.guc.edu.eg)"); return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match"); return;
      }
      if (users.find(u => u.email === form.email)) {
        setError("Email already registered"); return;
      }
      users.push({
        id: Date.now(), role: "student",
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        major: "", skills: [], linkedin: "", profilePic: null
      });
    }

    if (role === "instructor") {
      if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
        setError("Please fill in all fields"); return;
      }
      if (!form.email.endsWith("@guc.edu.eg") || form.email.endsWith("@student.guc.edu.eg")) {
        setError("Course instructors must use their GUC staff email (@guc.edu.eg)"); return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match"); return;
      }
      if (users.find(u => u.email === form.email)) {
        setError("Email already registered"); return;
      }
      users.push({
        id: Date.now(), role: "instructor",
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        bio: "", researchInterests: "", education: "",
        profilePic: null, courses: []
      });
    }

    if (role === "employer") {
      if (!form.companyName || !form.companyEmail || !form.password || !form.confirmPassword) {
        setError("Please fill in all fields"); return;
      }
      if (!form.taxCertificateBase64) {
        setError("Please upload your tax certificate PDF"); return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match"); return;
      }
      if (users.find(u => u.email === form.companyEmail)) {
        setError("Email already registered"); return;
      }

      const newEmployer = {
        id: Date.now(), role: "employer",
        companyName: form.companyName, email: form.companyEmail,
        password: form.password, bio: "", address: "",
        profilePic: null, verified: false,
        taxCertificate: form.taxCertificate,
        taxCertificateBase64: form.taxCertificateBase64,
      };

      users.push(newEmployer);

      // Save to localStorage so admin can access it
      const existing = JSON.parse(localStorage.getItem("pendingEmployers") || "[]");
      existing.push(newEmployer);
      localStorage.setItem("pendingEmployers", JSON.stringify(existing));
      // Notify admin
      const adminNotifs = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      adminNotifs.push({ id: Date.now(), message: `New employer "${form.companyName}" registered and is awaiting approval`, read: false, time: "Just now" });
      localStorage.setItem("adminNotifications", JSON.stringify(adminNotifs));
    }

    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>GUC Portfolio</h1>
        <h2 style={styles.subtitle}>Create Account</h2>

        {/* Role Selector */}
        <div style={styles.roleRow}>
          <button
            style={{ ...styles.roleBtn, ...(role === "student" ? styles.roleActive : {}) }}
            onClick={() => { setRole("student"); setError(""); }}>
            🎓 Student
          </button>
          <button
            style={{ ...styles.roleBtn, ...(role === "instructor" ? styles.roleActive : {}) }}
            onClick={() => { setRole("instructor"); setError(""); }}>
            👨‍🏫 Instructor
          </button>
          <button
            style={{ ...styles.roleBtn, ...(role === "employer" ? styles.roleActive : {}) }}
            onClick={() => { setRole("employer"); setError(""); }}>
            🏢 Employer
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>✅ Account created! Redirecting to login...</p>}

        {/* Student Form */}
        {role === "student" && (
          <>
            <input style={styles.input} name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
            <input style={styles.input} name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
            <input style={styles.input} name="email" type="email" placeholder="GUC Student Email (@student.guc.edu.eg)" value={form.email} onChange={handleChange} />
            <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <input style={styles.input} name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
          </>
        )}

        {/* Instructor Form */}
        {role === "instructor" && (
          <>
            <input style={styles.input} name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
            <input style={styles.input} name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
            <input style={styles.input} name="email" type="email" placeholder="GUC Staff Email (@guc.edu.eg)" value={form.email} onChange={handleChange} />
            <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <input style={styles.input} name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
            <p style={styles.note}>ℹ️ You will be automatically linked to the Bachelor Project course.</p>
          </>
        )}

        {/* Employer Form */}
        {role === "employer" && (
          <>
            <input style={styles.input} name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} />
            <input style={styles.input} name="companyEmail" type="email" placeholder="Company Email" value={form.companyEmail} onChange={handleChange} />
            <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <input style={styles.input} name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px" }}>
              Tax Certificate (PDF) *
            </label>
            <input
              type="file"
              accept=".pdf"
              style={{ ...styles.input, padding: "8px" }}
              onChange={handleFileUpload}
            />
            {form.taxCertificate && (
              <p style={{ color: "#28a745", fontSize: "13px", marginBottom: "10px" }}>
                ✅ Uploaded: {form.taxCertificate}
              </p>
            )}
            <p style={styles.note}>⚠️ Your account will be reviewed by an admin before you can access the platform.</p>
          </>
        )}

        <button style={styles.button} onClick={handleRegister}>Register</button>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
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
  roleRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  roleBtn: { flex: 1, padding: "10px", borderRadius: "8px", border: "2px solid #ddd", backgroundColor: "white", cursor: "pointer", fontSize: "13px" },
  roleActive: { borderColor: "#003366", backgroundColor: "#003366", color: "white" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box" },
  button: { width: "100%", padding: "12px", backgroundColor: "#003366", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" },
  error: { color: "red", textAlign: "center", marginBottom: "10px", fontSize: "14px" },
  success: { color: "green", textAlign: "center", marginBottom: "10px", fontSize: "14px" },
  note: { color: "#888", fontSize: "13px", marginBottom: "12px" },
  link: { textAlign: "center", marginTop: "15px", fontSize: "14px" },
};

export default Register;