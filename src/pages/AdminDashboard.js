import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { users, courses as initialCourses, projects as allProjects, internships } from "../data/mockData";

function AdminDashboard() {
  const { currentUser, logout, addUser } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");

  // Users state
  const [allUsers, setAllUsers] = useState(users);

  // Courses state
  const [courses, setCourses] = useState(initialCourses);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({ name: "", code: "" });

  // Employer approval state
  const [employers, setEmployers] = useState(() => {
    const fromStorage = JSON.parse(localStorage.getItem("pendingEmployers") || "[]");
    const base = users.filter(u => u.role === "employer");
    const merged = [...base];
    fromStorage.forEach(e => { if (!merged.find(u => u.email === e.email)) merged.push(e); });
    return merged;
  });

  // Flagged projects state
  const [flaggedProjects, setFlaggedProjects] = useState([
    { projectId: 2, projectTitle: "Network Simulator", reason: "Suspected plagiarism", flaggedBy: "Omar Salem", flaggedAt: "2024-04-15", appeal: "This is my original work, I can provide proof.", appealSent: true, active: false },
  ]);

  // Link requests state
  const [linkRequests, setLinkRequests] = useState([
    { id: 1, instructorName: "Omar Salem", instructorEmail: "omar.salem@guc.edu.eg", courseId: 1, courseName: "Software Engineering", type: "link", status: "pending" },
    { id: 2, instructorName: "Mona Tarek", instructorEmail: "mona.tarek@guc.edu.eg", courseId: 4, courseName: "Database Systems", type: "link", status: "pending" },
    { id: 3, instructorName: "Omar Salem", instructorEmail: "omar.salem@guc.edu.eg", courseId: 2, courseName: "Computer Networks", type: "unlink", status: "pending" },
  ]);

  // Account state
  const [accountStatuses, setAccountStatuses] = useState({});
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const [selectedViewProject, setSelectedViewProject] = useState(null);
  const [showFlagModal, setShowFlagModal] = useState(null);
  const [flagReason, setFlagReason] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const fromStorage = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
    const base = [
      { id: 1, message: "New employer TechCorp applied to join the platform", read: false, time: "1 hour ago" },
      { id: 2, message: "Omar Salem requested to link to Software Engineering", read: false, time: "2 hours ago" },
      { id: 3, message: "Student Shaza Ahmed sent an appeal for flagged project", read: true, time: "1 day ago" },
    ];
    return [...base, ...fromStorage];
  });

  const handleLogout = () => { logout(); navigate("/login"); };

  // Course handlers
  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.code) { alert("Please fill all fields"); return; }
    setCourses([...courses, { id: Date.now(), ...newCourse }]);
    setNewCourse({ name: "", code: "" });
    setShowAddCourse(false);
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm("Delete this course?")) setCourses(courses.filter(c => c.id !== id));
  };

  const handleSaveEditCourse = () => {
    setCourses(courses.map(c => c.id === editingCourse.id ? editingCourse : c));
    setEditingCourse(null);
  };

  // Employer handlers
  const handleEmployerAction = (employerId, action) => {
    setEmployers(prev =>
      prev.map(e =>
        e.id === employerId
          ? { ...e, verified: action === "accept", rejected: action === "reject" }
          : e
      )
    );
  };

  // Account handlers
  const handleToggleAccount = (userId) => {
    setAccountStatuses(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleAddAdmin = () => {
    if (!newAdmin.username || !newAdmin.password) { alert("Please fill all fields"); return; }
    const newAdminUser = {
      id: Date.now(),
      role: "admin",
      firstName: newAdmin.username,
      lastName: "",
      email: newAdmin.username,
      password: newAdmin.password,
    };
    setAllUsers([...allUsers, newAdminUser]);
    addUser(newAdminUser);
    alert(`Admin account created!\nEmail: ${newAdmin.username}\nPassword: ${newAdmin.password}`);
    setNewAdmin({ username: "", password: "" });
    setShowAddAdmin(false);
  };

  // Flag handlers
  const handleProjectAction = (projectId, action) => {
    setFlaggedProjects(flaggedProjects.map(p => p.projectId === projectId ? { ...p, active: action === "activate" } : p));
  };

  const handleAdminFlag = (projectId) => {
    if (!flagReason.trim()) { alert("Please enter a reason"); return; }
    const project = publicProjects.find(p => p.id === projectId);
    setFlaggedProjects([...flaggedProjects, {
      projectId, projectTitle: project?.title || `Project #${projectId}`,
      reason: flagReason, flaggedBy: "Admin",
      flaggedAt: new Date().toISOString().split("T")[0],
      appeal: "", appealSent: false, active: false
    }]);
    // Notify student via localStorage
    const studentNotifs = JSON.parse(localStorage.getItem(`studentNotifications_${projectId}`) || "[]");
    studentNotifs.push({ id: Date.now(), message: `Your project "${project?.title}" has been flagged by Admin - Reason: ${flagReason}`, read: false, time: "Just now", type: "flag" });
    localStorage.setItem(`studentNotifications_${projectId}`, JSON.stringify(studentNotifs));
    setFlagReason("");
    setShowFlagModal(null);
    alert("Project flagged!");
  };

  // Link request handlers
  const handleLinkRequest = (id, action) => {
    setLinkRequests(linkRequests.map(r => r.id === id ? { ...r, status: action } : r));
  };

  // Notification handlers
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const toggleRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mock portfolios
  const allPortfolios = [
    { id: 1, name: "Shaza Ahmed", email: "shaza.ahmed@student.guc.edu.eg", major: "Computer Science", skills: ["React", "Python"], projects: 5 },
    { id: 2, name: "Ahmed Hassan", email: "ahmed.hassan@student.guc.edu.eg", major: "Engineering", skills: ["Java", "C++"], projects: 3 },
    { id: 3, name: "Sara Khaled", email: "sara.khaled@student.guc.edu.eg", major: "Computer Science", skills: ["Python", "ML"], projects: 7 },
  ];

  // Mock instructors
  const allInstructors = [
    { id: 4, name: "Omar Salem", email: "omar.salem@guc.edu.eg", courses: ["Software Engineering", "Bachelor Project"], bio: "Professor in CS", researchInterests: "AI, ML", education: "PhD MIT" },
    { id: 5, name: "Mona Tarek", email: "mona.tarek@guc.edu.eg", courses: ["Computer Networks", "Bachelor Project"], bio: "Associate Professor in Networks", researchInterests: "Networks, Security", education: "PhD Cairo University" },
  ];

  // Filtered data
  const publicProjects = allProjects.filter(p => p.visibility === "public");
  const filteredProjects = publicProjects
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => filterCourse ? p.courseId === parseInt(filterCourse) : true)
    .filter(p => filterInstructor ? (() => {
      const instMap = { 4: [1, 3], 5: [2, 3] };
      return (instMap[parseInt(filterInstructor)] || []).includes(p.courseId);
    })() : true)
    .sort((a, b) => sortBy === "date" ? new Date(b.createdAt) - new Date(a.createdAt) : b.rating - a.rating);

  const filteredPortfolios = allPortfolios
    .filter(p => p.name.toLowerCase().includes(portfolioSearch.toLowerCase()) || p.email.toLowerCase().includes(portfolioSearch.toLowerCase()))
    .filter(p => filterMajor ? p.major === filterMajor : true)
    .filter(p => filterSkill ? p.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())) : true)
    .sort((a, b) => b.projects - a.projects);

  const filteredInstructors = allInstructors.filter(inst =>
    inst.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    inst.courses.some(c => c.toLowerCase().includes(instructorSearch.toLowerCase()))
  );

  // Statistics
  const stats = {
    totalStudents: allUsers.filter(u => u.role === "student").length,
    totalInstructors: allUsers.filter(u => u.role === "instructor").length,
    totalEmployers: allUsers.filter(u => u.role === "employer").length,
    totalProjects: allProjects.length,
    totalCourses: courses.length,
    totalInternships: internships.length,
  };

  const navItems = [
    { key: "home", label: "🏠 Home" },
    { key: "users", label: "👥 Manage Users" },
    { key: "employers", label: "🏢 Employer Requests" },
    { key: "courses", label: "📚 Manage Courses" },
    { key: "link-requests", label: "🔗 Link Requests" },
    { key: "flagged", label: "🚩 Flagged Projects" },
    { key: "search-projects", label: "🔍 Search Projects" },
    { key: "search-portfolios", label: "🎓 Search Portfolios" },
    { key: "search-instructors", label: "👨‍🏫 Search Instructors" },
    { key: "statistics", label: "📊 Statistics" },
    { key: "notifications", label: `🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>GUC Portfolio</h2>
        <p style={styles.roleTag}>Administrator</p>
        <nav>
          {navItems.map(item => (
            <div key={item.key}
              style={{ ...styles.navItem, ...(activePage === item.key ? styles.activeNav : {}) }}
              onClick={() => setActivePage(item.key)}>
              {item.label}
            </div>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* HOME */}
        {activePage === "home" && (
          <div>
            <h1>Welcome, {currentUser?.firstName}! 👋</h1>
            <p style={styles.subtitle}>Admin Dashboard</p>
            <div style={styles.statsGrid}>
              {[
                { label: "Students", value: stats.totalStudents, color: "#003366" },
                { label: "Instructors", value: stats.totalInstructors, color: "#1a4a7a" },
                { label: "Employers", value: stats.totalEmployers, color: "#17a2b8" },
                { label: "Projects", value: stats.totalProjects, color: "#28a745" },
                { label: "Courses", value: stats.totalCourses, color: "#ffc107" },
                { label: "Internships", value: stats.totalInternships, color: "#dc3545" },
              ].map((s, i) => (
                <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ color: "#666" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={styles.grid}>
              {navItems.slice(1).map(card => (
                <div key={card.key} style={styles.card} onClick={() => setActivePage(card.key)}>
                  <div style={styles.cardIcon}>{card.label.split(" ")[0]}</div>
                  <div style={styles.cardLabel}>{card.label.substring(card.label.indexOf(" ") + 1)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MANAGE USERS - Req 52, 53, 54 */}
        {activePage === "users" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>Manage Users</h1>
              <button style={styles.saveBtn} onClick={() => setShowAddAdmin(true)}>+ Add Admin</button>
            </div>
            {["student", "instructor", "employer", "admin"].map(role => (
              <div key={role} style={styles.sectionCard}>
                <h2 style={{ textTransform: "capitalize" }}>{role}s</h2>
                {allUsers.filter(u => u.role === role).map(u => (
                  <div key={u.id} style={styles.userRow}>
                    <div>
                      <b>{u.firstName || u.companyName} {u.lastName || ""}</b>
                      <span style={{ color: "#888", marginLeft: "10px", fontSize: "13px" }}>{u.email}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ ...styles.badge, backgroundColor: accountStatuses[u.id] === false ? "#dc3545" : "#28a745" }}>
                        {accountStatuses[u.id] === false ? "Deactivated" : "Active"}
                      </span>
                      {u.role !== "admin" && (
                        <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "5px 12px", backgroundColor: accountStatuses[u.id] === false ? "#28a745" : "#dc3545" }}
                          onClick={() => handleToggleAccount(u.id)}>
                          {accountStatuses[u.id] === false ? "Activate" : "Deactivate"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {showAddAdmin && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h2>Create Admin Account</h2>
                  <input style={styles.input} placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} />
                  <input style={styles.input} type="password" placeholder="Password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={styles.saveBtn} onClick={handleAddAdmin}>Create Admin</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setShowAddAdmin(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EMPLOYER REQUESTS - Req 14, 15, 16, 17, 18 */}
        {activePage === "employers" && (
          <div>
            <h1>Employer Requests</h1>
            {employers.filter(e => !e.verified && !e.rejected).length === 0 && (
              <p style={styles.empty}>No pending employer requests.</p>
            )}
            {employers.filter(e => !e.verified && !e.rejected).map(e => (
              <div key={e.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>🏢 {e.companyName}</h3>
                  <span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#000" }}>⏳ Pending</span>
                </div>
                <p><b>Email:</b> {e.email}</p>
                <p><b>Bio:</b> {e.bio || "Not provided"}</p>
                <p><b>Address:</b> {e.address || "Not provided"}</p>
                <div style={{ marginTop: "10px" }}>
                  <p><b>Uploaded Documents:</b></p>
                  <div style={styles.docBox}>
                    📄 {e.taxCertificate || "tax_certificate.pdf"}
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", marginLeft: "10px" }}
                      onClick={() => {
                        if (e.taxCertificateBase64) {
                          const win = window.open();
                          win.document.write(`<iframe src="${e.taxCertificateBase64}" width="100%" height="100%" style="border:none;"></iframe>`);
                        } else {
                          window.open("https://www.africau.edu/images/default/sample.pdf", "_blank");
                        }
                      }}>
                      View
                    </button>
                    <a
                      href={e.taxCertificateBase64 || "https://www.africau.edu/images/default/sample.pdf"}
                      download={e.taxCertificate || "tax_certificate.pdf"}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", marginLeft: "5px", backgroundColor: "#28a745", textDecoration: "none", display: "inline-block" }}>
                      Download
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#28a745" }} onClick={() => handleEmployerAction(e.id, "accept")}>✅ Accept</button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleEmployerAction(e.id, "reject")}>❌ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MANAGE COURSES - Req 55, 56 */}
        {activePage === "courses" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>Manage Courses</h1>
              <button style={styles.saveBtn} onClick={() => { setShowAddCourse(true); setEditingCourse(null); }}>+ Add Course</button>
            </div>
            {courses.map(c => (
              <div key={c.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <div>
                    <b>{c.name}</b> <span style={{ color: "#888" }}>({c.code})</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px" }} onClick={() => setEditingCourse({ ...c })}>Edit</button>
                    <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px", backgroundColor: "#dc3545" }} onClick={() => handleDeleteCourse(c.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {(showAddCourse || editingCourse) && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h2>{editingCourse ? "Edit Course" : "Add New Course"}</h2>
                  <input style={styles.input} placeholder="Course Name"
                    value={editingCourse ? editingCourse.name : newCourse.name}
                    onChange={e => editingCourse ? setEditingCourse({ ...editingCourse, name: e.target.value }) : setNewCourse({ ...newCourse, name: e.target.value })} />
                  <input style={styles.input} placeholder="Course Code (e.g. CSEN401)"
                    value={editingCourse ? editingCourse.code : newCourse.code}
                    onChange={e => editingCourse ? setEditingCourse({ ...editingCourse, code: e.target.value }) : setNewCourse({ ...newCourse, code: e.target.value })} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={styles.saveBtn} onClick={editingCourse ? handleSaveEditCourse : handleAddCourse}>
                      {editingCourse ? "Save Changes" : "Add Course"}
                    </button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => { setShowAddCourse(false); setEditingCourse(null); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activePage === "link-requests" && (
          <div>
            <h1>Link/Unlink Requests</h1>
            {linkRequests.length === 0 && <p style={styles.empty}>No pending requests.</p>}
            {linkRequests.map(r => (
              <div key={r.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <div>
                    <b>{r.instructorName}</b>
                    <span style={{ color: "#888", marginLeft: "8px", fontSize: "13px" }}>{r.instructorEmail}</span>
                  </div>
                  {r.status === "pending"
                    ? <span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#000" }}>⏳ Pending</span>
                    : r.status === "accepted"
                      ? <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Accepted</span>
                      : <span style={{ ...styles.badge, backgroundColor: "#dc3545" }}>❌ Rejected</span>}
                </div>
                <p>Requesting to <b style={{ color: r.type === "unlink" ? "#dc3545" : "#28a745" }}>
                  {r.type === "unlink" ? "🔓 UNLINK from" : "🔗 LINK to"}
                </b> course: <b>{r.courseName}</b></p>
                {r.status === "pending" && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#28a745" }} onClick={() => handleLinkRequest(r.id, "accepted")}>✅ Accept</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleLinkRequest(r.id, "rejected")}>❌ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FLAGGED PROJECTS - Req 62, 63, 64 */}
        {activePage === "flagged" && (
          <div>
            <h1>Flagged Projects</h1>
            {flaggedProjects.length === 0 && <p style={styles.empty}>No flagged projects.</p>}
            {flaggedProjects.map(f => (
              <div key={f.projectId} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#dc3545" }}>🚩 {f.projectTitle}</h3>
                  <span style={{ ...styles.badge, backgroundColor: f.active ? "#28a745" : "#dc3545" }}>
                    {f.active ? "Active" : "Deactivated"}
                  </span>
                </div>
                <p><b>Reason:</b> {f.reason}</p>
                <p><b>Flagged by:</b> {f.flaggedBy}</p>
                <p><b>Flagged at:</b> {f.flaggedAt}</p>

                {/* Appeals - Req 63 */}
                {f.appealSent && (
                  <div style={styles.appealBox}>
                    <b>📩 Student Appeal:</b>
                    <p style={{ margin: "5px 0 0" }}>{f.appeal}</p>
                  </div>
                )}
                {!f.appealSent && (
                  <p style={{ color: "#888", fontSize: "13px" }}>No appeal submitted yet.</p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#28a745" }} onClick={() => handleProjectAction(f.projectId, "activate")}>✅ Activate Project</button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleProjectAction(f.projectId, "deactivate")}>🚫 Deactivate Project</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEARCH PROJECTS - Req 42-46 */}
        {activePage === "search-projects" && (
          <div>
            <h1>Search Projects</h1>
            <div style={styles.filterRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="Search by title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <select style={{ ...styles.input, width: "180px" }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select style={{ ...styles.input, width: "180px" }} value={filterInstructor} onChange={e => setFilterInstructor(e.target.value)}>
                <option value="">All Instructors</option>
                <option value="4">Omar Salem</option>
                <option value="5">Mona Tarek</option>
              </select>
              <select style={{ ...styles.input, width: "160px" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
            {filteredProjects.length === 0 && <p style={styles.empty}>No projects found.</p>}
            {filteredProjects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{p.title}</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span>⭐ {p.rating}/5</span>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }}
                      onClick={() => setSelectedViewProject(selectedViewProject?.id === p.id ? null : p)}>
                      {selectedViewProject?.id === p.id ? "Hide Details" : "View Details"}
                    </button>
                    {flaggedProjects.find(f => f.projectId === p.id)
                      ? <span style={{ ...styles.badge, backgroundColor: "#dc3545" }}>🚩 Flagged</span>
                      : <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#dc3545" }}
                          onClick={() => setShowFlagModal(p.id)}>🚩 Flag</button>
                    }
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#28a745" }}
                      onClick={() => alert("Project activated!")}>Activate</button>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#6c757d" }}
                      onClick={() => alert("Project deactivated!")}>Deactivate</button>
                  </div>
                </div>
                <p style={{ color: "#666" }}>{p.description}</p>
                <p><b>Course:</b> {courses.find(c => c.id === p.courseId)?.name}</p>
                <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                <p><b>Created:</b> {p.createdAt}</p>

                {/* Full project details - Req 46 */}
                {selectedViewProject?.id === p.id && (
                  <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4 style={{ color: "#003366", marginTop: 0 }}>Full Project Details</h4>
                    <p><b>Title:</b> {p.title}</p>
                    <p><b>Description:</b> {p.description}</p>
                    <p><b>Course:</b> {courses.find(c => c.id === p.courseId)?.name}</p>
                    <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                    {p.githubLink && <p><b>GitHub:</b> <a href={p.githubLink} target="_blank" rel="noreferrer">{p.githubLink}</a></p>}
                    {p.demoVideo && <p><b>Demo Video:</b> <a href={p.demoVideo} target="_blank" rel="noreferrer">Watch Demo</a></p>}
                    <p><b>Created:</b> {p.createdAt}</p>
                    <p><b>Rating:</b> ⭐ {p.rating}/5</p>
                    <p><b>Visibility:</b> {p.visibility}</p>
                    <p><b>Collaborators:</b> {(p.collaborators || []).length === 0 ? "None" : `${p.collaborators.length} collaborator(s)`}</p>
                    {(p.tasks || []).length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <b>Tasks ({p.tasks.length}):</b>
                        {p.tasks.map((t, i) => (
                          <div key={i} style={{ backgroundColor: "white", padding: "8px", borderRadius: "6px", marginTop: "6px", border: "1px solid #eee" }}>
                            <b>{t.title}</b> — <span style={{ color: "#666", fontSize: "13px" }}>{t.status}</span>
                            <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>{t.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Flag Modal */}
            {showFlagModal && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h3>🚩 Flag Project</h3>
                  <p>Please provide a reason for flagging this project:</p>
                  <textarea style={{ ...styles.input, height: "100px" }}
                    placeholder="e.g. Suspected plagiarism..."
                    value={flagReason}
                    onChange={e => setFlagReason(e.target.value)} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleAdminFlag(showFlagModal)}>Flag Project</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setShowFlagModal(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEARCH PORTFOLIOS - Req 47-51 */}
        {activePage === "search-portfolios" && (
          <div>
            <h1>Search Portfolios</h1>
            <div style={styles.filterRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="Search by name or email..." value={portfolioSearch} onChange={e => setPortfolioSearch(e.target.value)} />
              <select style={{ ...styles.input, width: "180px" }} value={filterMajor} onChange={e => setFilterMajor(e.target.value)}>
                <option value="">All Majors</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
              </select>
              <input style={{ ...styles.input, width: "160px" }} placeholder="Filter by skill..." value={filterSkill} onChange={e => setFilterSkill(e.target.value)} />
            </div>
            <p style={{ color: "#666" }}>Sorted by number of projects</p>
            {filteredPortfolios.length === 0 && <p style={styles.empty}>No portfolios found.</p>}
            {filteredPortfolios.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>👤 {p.name}</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={styles.badge}>{p.projects} projects</span>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }}
                      onClick={() => setSelectedPortfolio(selectedPortfolio?.id === p.id ? null : p)}>
                      {selectedPortfolio?.id === p.id ? "Hide Profile" : "View Profile"}
                    </button>
                  </div>
                </div>
                <p><b>Email:</b> {p.email}</p>
                <p><b>Major:</b> {p.major}</p>
                <p><b>Skills:</b> {p.skills.join(", ")}</p>
                {selectedPortfolio?.id === p.id && (
                  <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4 style={{ color: "#003366", marginTop: 0 }}>Full Portfolio</h4>
                    <p><b>Name:</b> {p.name}</p>
                    <p><b>Email:</b> {p.email}</p>
                    <p><b>Major:</b> {p.major}</p>
                    <p><b>Skills:</b> {p.skills.join(", ")}</p>
                    <p><b>Total Projects:</b> {p.projects}</p>
                    <div style={{ marginTop: "10px" }}>
                      <b>Projects:</b>
                      {allProjects.filter(proj => proj.visibility === "public").slice(0, p.projects).map(proj => (
                        <div key={proj.id} style={{ backgroundColor: "white", padding: "10px", borderRadius: "8px", marginTop: "8px", border: "1px solid #eee" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <b style={{ color: "#003366" }}>{proj.title}</b>
                            <span>⭐ {proj.rating}/5</span>
                          </div>
                          <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>{proj.description}</p>
                          <p style={{ fontSize: "13px", margin: "4px 0" }}><b>Languages:</b> {Array.isArray(proj.languages) ? proj.languages.join(", ") : proj.languages}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SEARCH INSTRUCTORS - Req 8, 9 */}
        {activePage === "search-instructors" && (
          <div>
            <h1>Search Instructors</h1>
            <div style={styles.filterRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="Search by name or course..." value={instructorSearch} onChange={e => setInstructorSearch(e.target.value)} />
            </div>
            {filteredInstructors.length === 0 && <p style={styles.empty}>No instructors found.</p>}
            {filteredInstructors.map(inst => (
              <div key={inst.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>👨‍🏫 {inst.name}</h3>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 14px" }}
                    onClick={() => setSelectedInstructor(selectedInstructor?.id === inst.id ? null : inst)}>
                    {selectedInstructor?.id === inst.id ? "Hide Profile" : "View Profile"}
                  </button>
                </div>
                <p style={{ color: "#666", margin: "4px 0" }}>{inst.email}</p>
                {selectedInstructor?.id === inst.id && (
                  <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                    <p><b>Bio:</b> {inst.bio}</p>
                    <p><b>Research Interests:</b> {inst.researchInterests}</p>
                    <p><b>Education:</b> {inst.education}</p>
                    <p><b>Linked Courses:</b></p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                      {inst.courses.map((course, i) => (
                        <span key={i} style={{ ...styles.badge, backgroundColor: "#003366" }}>📚 {course}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STATISTICS - Req 73 */}
        {activePage === "statistics" && (
          <div>
            <h1>Platform Statistics</h1>
            <div style={styles.statsGrid}>
              {[
                { label: "Total Students", value: stats.totalStudents, color: "#003366" },
                { label: "Total Instructors", value: stats.totalInstructors, color: "#1a4a7a" },
                { label: "Total Employers", value: stats.totalEmployers, color: "#17a2b8" },
                { label: "Total Projects", value: stats.totalProjects, color: "#28a745" },
                { label: "Total Courses", value: stats.totalCourses, color: "#ffc107" },
                { label: "Total Internships", value: stats.totalInternships, color: "#dc3545" },
              ].map((s, i) => (
                <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ color: "#666" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={styles.sectionCard}>
              <h2>Users Breakdown</h2>
              {[
                { label: "Students", count: stats.totalStudents, color: "#003366" },
                { label: "Instructors", count: stats.totalInstructors, color: "#1a4a7a" },
                { label: "Employers", count: stats.totalEmployers, color: "#17a2b8" },
              ].map((item, i) => {
                const total = stats.totalStudents + stats.totalInstructors + stats.totalEmployers;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={i} style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <b>{item.label}</b><span>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{ backgroundColor: "#e0e0e0", borderRadius: "4px", height: "12px" }}>
                      <div style={{ backgroundColor: item.color, width: `${pct}%`, height: "12px", borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Internships per company - Req 73 */}
            <div style={styles.sectionCard}>
              <h2>💼 Internships Per Company</h2>
              {allUsers.filter(u => u.role === "employer").map(employer => {
                const empInternships = internships.filter(i => i.employerId === employer.id);
                const studentsCompleted = empInternships.reduce((sum, i) =>
                  sum + (i.applicants?.filter(a => a.status === "accepted").length || 0), 0);
                return (
                  <div key={employer.id} style={styles.userRow}>
                    <div>
                      <b>🏢 {employer.companyName}</b>
                      <p style={{ margin: "2px 0", fontSize: "13px", color: "#888" }}>{employer.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ ...styles.badge, backgroundColor: "#003366" }}>{empInternships.length} internships offered</span>
                      <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>{studentsCompleted} students completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS - Req 35, 36 */}
        {activePage === "notifications" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>Notifications</h1>
              <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={markAllRead}>Mark All as Read</button>
            </div>
            {notifications.map(n => (
              <div key={n.id} style={{ ...styles.projectCard, borderLeft: n.read ? "4px solid #ddd" : "4px solid #003366" }}>
                <div style={styles.projectHeader}>
                  <span>{n.read ? "📭" : "📬"} {n.message}</span>
                  <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#6c757d" }} onClick={() => toggleRead(n.id)}>
                    {n.read ? "Mark Unread" : "Mark Read"}
                  </button>
                </div>
                <small style={{ color: "#999" }}>{n.time}</small>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, Arial, sans-serif" },
  sidebar: { width: "240px", backgroundColor: "#2c2c2c", color: "white", padding: "20px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  logo: { color: "white", marginBottom: "5px", fontSize: "18px" },
  roleTag: { color: "#aaa", fontSize: "12px", marginBottom: "20px" },
  navItem: { padding: "10px 15px", cursor: "pointer", borderRadius: "8px", marginBottom: "4px", fontSize: "13px" },
  activeNav: { backgroundColor: "#003366" },
  logoutBtn: { marginTop: "auto", padding: "10px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  main: { flex: 1, padding: "40px", backgroundColor: "#f0f2f5", overflowY: "auto" },
  subtitle: { color: "#666", marginBottom: "20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "30px" },
  statCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" },
  card: { backgroundColor: "white", padding: "20px", borderRadius: "12px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  cardIcon: { fontSize: "30px", marginBottom: "8px" },
  cardLabel: { fontSize: "14px", fontWeight: "bold", color: "#003366" },
  sectionCard: { backgroundColor: "white", padding: "25px", borderRadius: "12px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  userRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", marginBottom: "8px" },
  projectCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  projectHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  badge: { padding: "4px 10px", borderRadius: "20px", color: "white", fontSize: "12px", backgroundColor: "#003366" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  filterRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  input: { display: "block", width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box", fontFamily: "inherit" },
  saveBtn: { padding: "10px 20px", backgroundColor: "#003366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { backgroundColor: "white", padding: "30px", borderRadius: "12px", width: "500px", maxHeight: "85vh", overflowY: "auto" },
  docBox: { backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "5px" },
  appealBox: { backgroundColor: "#fff3cd", padding: "12px", borderRadius: "8px", marginTop: "10px", border: "1px solid #ffc107" },
  empty: { color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333", fontSize: "14px" },
};

export default AdminDashboard;