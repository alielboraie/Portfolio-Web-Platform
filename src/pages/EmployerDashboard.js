import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { internships as initialInternships, projects, users } from "../data/mockData";

function EmployerDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");

  // Profile state
  const [profile, setProfile] = useState({
    bio: currentUser?.bio || "",
    address: currentUser?.address || "",
    phone: currentUser?.phone || "",
    lat: "30.0444",
    lng: "31.2357",
    profilePic: null,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Internships state
  const [internships, setInternships] = useState(initialInternships.filter(i => i.employerId === currentUser?.id));
  const [showAddInternship, setShowAddInternship] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [newInternship, setNewInternship] = useState({ title: "", details: "", skills: "", duration: "3 months", deadline: "", languages: "", status: "hiring" });
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [selectedInternshipView, setSelectedInternshipView] = useState(null);
  const [selectedViewProject, setSelectedViewProject] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Favorites
  const [favoriteProjects, setFavoriteProjects] = useState([projects[0]]);
  const [favoritePortfolios, setFavoritePortfolios] = useState([
    { id: 1, name: "Shaza Ahmed", email: "shaza.ahmed@student.guc.edu.eg", major: "Computer Science", skills: ["React", "Python"], projects: 5 },
    { id: 3, name: "Sara Khaled", email: "sara.khaled@student.guc.edu.eg", major: "Computer Science", skills: ["Python", "ML"], projects: 7 },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New application received for Frontend Developer Intern", read: false, time: "2 hours ago" },
    { id: 2, message: "Your company profile was approved by admin", read: true, time: "1 day ago" },
    { id: 3, message: "New message from student Shaza Ahmed", read: false, time: "3 hours ago" },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Messages
  const [contacts] = useState([
    { id: 1, name: "Shaza Ahmed", role: "student" },
    { id: 2, name: "Ahmed Hassan", role: "student" },
    { id: 3, name: "Sara Khaled", role: "student" },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});

  const getChatKey = (otherId) => {
    const myId = currentUser?.id || 6;
    return `chat_${Math.min(myId, otherId)}_${Math.max(myId, otherId)}`;
  };

  const sendMessage = (contact) => {
    if (!newMessage.trim()) return;
    const key = getChatKey(contact.id);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const msg = { id: Date.now(), senderId: currentUser?.id || 6, senderName: currentUser?.companyName || "Employer", text: newMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    existing.push(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    setChatMessages({ ...chatMessages, [key]: existing });
    const recipientNotifs = JSON.parse(localStorage.getItem(`studentNotifications_${contact.id}`) || "[]");
    recipientNotifs.push({ id: Date.now(), message: `New message from ${currentUser?.companyName}`, read: false, time: "Just now", type: "message" });
    localStorage.setItem(`studentNotifications_${contact.id}`, JSON.stringify(recipientNotifs));
    setNewMessage("");
  };

  // Mock data
  const allPortfolios = [
    { id: 1, name: "Shaza Ahmed", email: "shaza.ahmed@student.guc.edu.eg", major: "Computer Science", skills: ["React", "Python"], projects: 5 },
    { id: 2, name: "Ahmed Hassan", email: "ahmed.hassan@student.guc.edu.eg", major: "Engineering", skills: ["Java", "C++"], projects: 3 },
    { id: 3, name: "Sara Khaled", email: "sara.khaled@student.guc.edu.eg", major: "Computer Science", skills: ["Python", "ML"], projects: 7 },
  ];

  const allInstructors = [
    { id: 4, name: "Omar Salem", email: "omar.salem@guc.edu.eg", courses: ["Software Engineering", "Bachelor Project"], bio: "Professor in CS", researchInterests: "AI, ML", education: "PhD MIT", linkedCourses: [1, 3] },
    { id: 5, name: "Mona Tarek", email: "mona.tarek@guc.edu.eg", courses: ["Computer Networks", "Bachelor Project"], bio: "Associate Professor in Networks", researchInterests: "Networks, Security", education: "PhD Cairo University", linkedCourses: [2, 3] },
  ];

  const courses = [
    { id: 1, name: "Software Engineering" }, { id: 2, name: "Computer Networks" },
    { id: 3, name: "Bachelor Project" }, { id: 4, name: "Database Systems" },
  ];

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleSaveProfile = () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); };

  // Internship handlers
  const handleAddInternship = () => {
    if (!newInternship.title || !newInternship.details || !newInternship.deadline) { alert("Please fill required fields"); return; }
    const created = {
      ...newInternship, id: Date.now(), employerId: currentUser?.id,
      skills: newInternship.skills.split(",").map(s => s.trim()).filter(Boolean),
      languages: newInternship.languages.split(",").map(l => l.trim()).filter(Boolean),
      archived: false, postedAt: new Date().toISOString().split("T")[0], applicants: []
    };
    setInternships([...internships, created]);
    setNewInternship({ title: "", details: "", skills: "", duration: "3 months", deadline: "", languages: "", status: "hiring" });
    setShowAddInternship(false);
  };

  const handleDeleteInternship = (id) => {
    if (window.confirm("Delete this internship?")) setInternships(internships.filter(i => i.id !== id));
  };

  const handleSaveEditInternship = () => {
    setInternships(internships.map(i => i.id === editingInternship.id ? {
      ...editingInternship,
      skills: typeof editingInternship.skills === "string" ? editingInternship.skills.split(",").map(s => s.trim()) : editingInternship.skills,
      languages: typeof editingInternship.languages === "string" ? editingInternship.languages.split(",").map(l => l.trim()) : editingInternship.languages,
    } : i));
    setEditingInternship(null);
  };

  const handleToggleArchive = (id) => {
    const internship = internships.find(i => i.id === id);
    if (!internship.archived) {
      const deadline = new Date(internship.deadline);
      const today = new Date();
      if (deadline > today) {
        alert("You can only archive internships whose application deadline has passed!");
        return;
      }
    }
    setInternships(internships.map(i => i.id === id ? { ...i, archived: !i.archived } : i));
  };

  const handleSetStatus = (id, status) => {
    setInternships(internships.map(i => i.id === id ? { ...i, status } : i));
  };

  const handleApplicantStatus = (internshipId, studentId, status) => {
    setInternships(internships.map(i => i.id === internshipId ? {
      ...i, applicants: i.applicants.map(a => a.studentId === studentId ? { ...a, status } : a)
    } : i));
    // Notify student via localStorage
    if (status === "accepted" || status === "rejected") {
      const internship = internships.find(i => i.id === internshipId);
      const notifs = JSON.parse(localStorage.getItem(`studentNotifications_${studentId}`) || "[]");
      notifs.push({
        id: Date.now(),
        message: `Your internship application for "${internship?.title}" at ${currentUser?.companyName} has been ${status}! ${status === "accepted" ? "🎉" : ""}`,
        read: false,
        time: "Just now",
        type: "internship"
      });
      localStorage.setItem(`studentNotifications_${studentId}`, JSON.stringify(notifs));
    }
  };

  // Notification handlers
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const toggleRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtered data
  const publicProjects = projects.filter(p => p.visibility === "public");
  const filteredProjects = publicProjects
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => filterCourse ? p.courseId === parseInt(filterCourse) : true)
    .filter(p => filterInstructor ? (() => {
      const instCourses = allInstructors.find(u => u.id === parseInt(filterInstructor))?.linkedCourses || [];
      return instCourses.includes(p.courseId);
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

  const suggestedApplications = allPortfolios
    .filter(p => favoritePortfolios.find(f => f.id === p.id))
    .sort((a, b) => b.projects - a.projects);

  const completedInternships = internships.filter(i => i.archived).length;
  const totalApplicants = internships.reduce((sum, i) => sum + (i.applicants?.length || 0), 0);
  const studentsCompleted = internships.reduce((sum, i) => sum + (i.applicants?.filter(a => a.status === "accepted").length || 0), 0);

  const navItems = [
    { key: "home", label: "🏠 Home" },
    { key: "profile", label: "🏢 Company Profile" },
    { key: "internships", label: "💼 My Internships" },
    { key: "search-projects", label: "🔍 Search Projects" },
    { key: "search-portfolios", label: "🎓 Search Portfolios" },
    { key: "search-instructors", label: "👨‍🏫 Search Instructors" },
    { key: "favorites", label: "⭐ Favorites" },
    { key: "messages", label: "💬 Messages" },
    { key: "statistics", label: "📊 Statistics" },
    { key: "notifications", label: `🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>GUC Portfolio</h2>
        <p style={styles.roleTag}>Employer</p>
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

      <div style={styles.main}>

        {/* HOME */}
        {activePage === "home" && (
          <div>
            <h1>Welcome, {currentUser?.companyName}! 👋</h1>
            <p style={styles.subtitle}>Employer Dashboard</p>
            <div style={styles.grid}>
              {navItems.slice(1).map(card => (
                <div key={card.key} style={styles.card} onClick={() => setActivePage(card.key)}>
                  <div style={styles.cardIcon}>{card.label.split(" ")[0]}</div>
                  <div style={styles.cardLabel}>{card.label.substring(card.label.indexOf(" ") + 1)}</div>
                </div>
              ))}
            </div>

            {/* Recommended Projects - Req 67 */}
            <div style={{ marginTop: "30px" }}>
              <h2>⭐ Recommended Projects</h2>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "15px" }}>Top rated public projects on the platform</p>
              {projects.filter(p => p.visibility === "public" && p.rating >= 3)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3)
                .map(p => (
                  <div key={p.id} style={styles.projectCard}>
                    <div style={styles.projectHeader}>
                      <h3 style={{ margin: 0, color: "#003366" }}>{p.title}</h3>
                      <span>⭐ {p.rating}/5</span>
                    </div>
                    <p style={{ color: "#666" }}>{p.description}</p>
                    <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                  </div>
                ))}
            </div>

            {/* Suggested Applications - Req */}
            {suggestedApplications.length > 0 && (
              <div style={{ marginTop: "30px" }}>
                <h2>🌟 Top Suggested Applications</h2>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "15px" }}>Based on your favorite portfolios — sorted by top contributors</p>
                {suggestedApplications.map(p => (
                  <div key={p.id} style={styles.projectCard}>
                    <div style={styles.projectHeader}>
                      <h3 style={{ margin: 0, color: "#003366" }}>👤 {p.name}</h3>
                      <span style={{ ...styles.badge, backgroundColor: "#003366" }}>{p.projects} projects</span>
                    </div>
                    <p><b>Email:</b> {p.email}</p>
                    <p><b>Major:</b> {p.major}</p>
                    <p><b>Skills:</b> {p.skills.join(", ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE - Req 10, 11, 12 */}
        {activePage === "profile" && (
          <div>
            <h1>Company Profile</h1>
            <div style={styles.profileCard}>
              <div style={{ textAlign: "center" }}>
                {profile.profilePic
                  ? <img src={profile.profilePic} alt="logo" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ fontSize: "60px" }}>🏢</div>
                }
                <label style={{ ...styles.saveBtn, cursor: "pointer", fontSize: "12px", padding: "5px 10px", display: "inline-block", marginTop: "8px" }}>
                  📷 Upload Logo
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProfile({ ...profile, profilePic: reader.result });
                        reader.readAsDataURL(file);
                      }
                    }} />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <p><b>Company Name:</b> {currentUser?.companyName}</p>
                <p><b>Email:</b> {currentUser?.email}</p>
                <p><b>Bio:</b> {profile.bio || "Not set"}</p>
                <p><b>Address:</b> {profile.address || "Not set"}</p>
                <p><b>Phone:</b> {profile.phone || "Not set"}</p>
                {profile.lat && profile.lng && (
                  <p><b>📍 Location:</b> {profile.lat}, {profile.lng}</p>
                )}
              </div>
            </div>

            <div style={styles.sectionCard}>
              <h2>Edit Company Info</h2>
              <label style={styles.label}>Company Bio</label>
              <textarea style={{ ...styles.input, height: "80px" }} placeholder="Short company biography..." value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
              <label style={styles.label}>Address</label>
              <input style={styles.input} placeholder="Company address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
              <label style={styles.label}>Contact Phone</label>
              <input style={styles.input} placeholder="Phone number" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />

              <label style={styles.label}>📍 Company Location</label>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>
                Type your company address and click Search to find it on the map
              </p>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <input
                  style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                  placeholder="e.g. Smart Village, Cairo, Egypt"
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                />
                <button style={{ ...styles.saveBtn, whiteSpace: "nowrap" }}
                  onClick={async () => {
                    if (!profile.address.trim()) { alert("Please enter an address"); return; }
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.address)}`);
                      const data = await res.json();
                      if (data.length > 0) {
                        setProfile({ ...profile, lat: parseFloat(data[0].lat).toFixed(4), lng: parseFloat(data[0].lon).toFixed(4) });
                      } else {
                        alert("Location not found. Try a more specific address.");
                      }
                    } catch (e) {
                      alert("Could not search location. Check your connection.");
                    }
                  }}>
                  🔍 Search on Map
                </button>
              </div>

              {profile.lat && profile.lng && (
                <div style={{ marginBottom: "15px" }}>
                  <p style={{ fontSize: "13px", color: "#28a745", marginBottom: "8px" }}>
                    📍 Location found: {profile.address}
                  </p>
                  <iframe
                    title="company-map" width="100%" height="300"
                    style={{ borderRadius: "8px", border: "1px solid #ddd" }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(profile.lng) - 0.05},${parseFloat(profile.lat) - 0.05},${parseFloat(profile.lng) + 0.05},${parseFloat(profile.lat) + 0.05}&layer=mapnik&marker=${profile.lat},${profile.lng}`}
                  />
                </div>
              )}

              <button style={styles.saveBtn} onClick={handleSaveProfile}>
                {profileSaved ? "✅ Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* INTERNSHIPS */}
        {activePage === "internships" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>My Internships</h1>
              <button style={styles.saveBtn} onClick={() => { setShowAddInternship(true); setEditingInternship(null); }}>+ Add Internship</button>
            </div>

            {internships.length === 0 && <p style={styles.empty}>No internships yet.</p>}

            {internships.map(i => (
              <div key={i.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{i.title}</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ ...styles.badge, backgroundColor: i.status === "hiring" ? "#28a745" : "#6c757d" }}>
                      {i.status === "hiring" ? "Now Hiring" : "Position Filled"}
                    </span>
                    {i.archived && <span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#000" }}>Archived</span>}
                  </div>
                </div>
                <p>{i.details}</p>
                <p><b>Skills:</b> {Array.isArray(i.skills) ? i.skills.join(", ") : i.skills}</p>
                <p><b>Duration:</b> {i.duration} | <b>Deadline:</b> {i.deadline}</p>
                <p><b>Languages:</b> {Array.isArray(i.languages) ? i.languages.join(", ") : i.languages}</p>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px", backgroundColor: "#17a2b8" }}
                    onClick={() => setSelectedInternshipView(selectedInternshipView?.id === i.id ? null : i)}>
                    {selectedInternshipView?.id === i.id ? "Hide Details" : "View Details"}
                  </button>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px" }}
                    onClick={() => setEditingInternship({ ...i, skills: Array.isArray(i.skills) ? i.skills.join(", ") : i.skills, languages: Array.isArray(i.languages) ? i.languages.join(", ") : i.languages })}>Edit</button>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px", backgroundColor: "#dc3545" }}
                    onClick={() => handleDeleteInternship(i.id)}>Delete</button>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px", backgroundColor: i.status === "hiring" ? "#6c757d" : "#28a745" }}
                    onClick={() => handleSetStatus(i.id, i.status === "hiring" ? "filled" : "hiring")}>
                    {i.status === "hiring" ? "Mark Position Filled" : "Mark Now Hiring"}
                  </button>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px", backgroundColor: "#ffc107", color: "#000" }}
                    onClick={() => handleToggleArchive(i.id)}>
                    {i.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px", backgroundColor: "#17a2b8" }}
                    onClick={() => setSelectedInternship(selectedInternship?.id === i.id ? null : i)}>
                    {selectedInternship?.id === i.id ? "Hide Applicants" : `View Applicants (${i.applicants?.length || 0})`}
                  </button>
                </div>

                {/* Full internship details - when selected */}
                {selectedInternshipView?.id === i.id && (
                  <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4 style={{ color: "#003366", marginTop: 0 }}>Full Internship Details</h4>
                    <p><b>Title:</b> {i.title}</p>
                    <p><b>Details:</b> {i.details}</p>
                    <p><b>Skills Required:</b> {Array.isArray(i.skills) ? i.skills.join(", ") : i.skills}</p>
                    <p><b>Languages:</b> {Array.isArray(i.languages) ? i.languages.join(", ") : i.languages}</p>
                    <p><b>Duration:</b> {i.duration}</p>
                    <p><b>Application Deadline:</b> {i.deadline}</p>
                    <p><b>Posted At:</b> {i.postedAt}</p>
                    <p><b>Status:</b> <span style={{ ...styles.badge, backgroundColor: i.status === "hiring" ? "#28a745" : "#6c757d" }}>{i.status === "hiring" ? "Now Hiring" : "Position Filled"}</span></p>
                    <p><b>Archived:</b> {i.archived ? "Yes" : "No"}</p>
                    <p><b>Total Applicants:</b> {i.applicants?.length || 0}</p>
                  </div>
                )}

                {selectedInternship?.id === i.id && (
                  <div style={styles.taskSection}>
                    <h4>Applicants <span style={{ fontSize: "12px", color: "#888" }}>(sorted by top contributors)</span></h4>
                    {(i.applicants || []).length === 0 && <p style={styles.empty}>No applicants yet.</p>}
                    {(i.applicants || [])
                      .map(a => ({ ...a, projectCount: projects.filter(p => p.studentId === a.studentId).length }))
                      .sort((a, b) => b.projectCount - a.projectCount)
                      .map((applicant, idx) => {
                        const student = users.find(u => u.id === applicant.studentId);
                        return (
                          <div key={idx} style={styles.taskCard}>
                            <div style={styles.projectHeader}>
                              <div>
                                <b>👤 {student ? `${student.firstName} ${student.lastName}` : `Student #${applicant.studentId}`}</b>
                                <span style={{ ...styles.badge, marginLeft: "8px", backgroundColor: "#17a2b8", fontSize: "11px" }}>{applicant.projectCount} projects</span>
                              </div>
                              <span style={{ ...styles.badge, backgroundColor: applicant.status === "accepted" ? "#28a745" : applicant.status === "nominated" ? "#ffc107" : applicant.status === "rejected" ? "#dc3545" : "#6c757d", color: applicant.status === "nominated" ? "#000" : "white" }}>
                                {applicant.status || "pending"}
                              </span>
                            </div>
                            <p style={{ fontSize: "13px", color: "#666" }}><b>Cover Letter:</b> {applicant.coverLetter}</p>
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                              <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#ffc107", color: "#000" }}
                                onClick={() => handleApplicantStatus(i.id, applicant.studentId, "nominated")}>Nominate</button>
                              <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#28a745" }}
                                onClick={() => handleApplicantStatus(i.id, applicant.studentId, "accepted")}>Accept</button>
                              <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#dc3545" }}
                                onClick={() => handleApplicantStatus(i.id, applicant.studentId, "rejected")}>Reject</button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}

            {(showAddInternship || editingInternship) && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h2>{editingInternship ? "Edit Internship" : "Add New Internship"}</h2>
                  {[
                    { label: "Title", field: "title", placeholder: "e.g. Frontend Developer Intern" },
                    { label: "Details / Responsibilities", field: "details", placeholder: "Describe responsibilities..." },
                    { label: "Skills Required (comma separated)", field: "skills", placeholder: "e.g. React, CSS, Python" },
                    { label: "Languages (comma separated)", field: "languages", placeholder: "e.g. English, Arabic, French" },
                    { label: "Application Deadline", field: "deadline", placeholder: "", type: "date" },
                  ].map(({ label, field, placeholder, type }) => (
                    <div key={field}>
                      <label style={styles.label}>{label}</label>
                      <input style={styles.input} type={type || "text"} placeholder={placeholder}
                        value={editingInternship ? editingInternship[field] : newInternship[field]}
                        onChange={e => editingInternship
                          ? setEditingInternship({ ...editingInternship, [field]: e.target.value })
                          : setNewInternship({ ...newInternship, [field]: e.target.value })} />
                    </div>
                  ))}
                  <label style={styles.label}>Duration</label>
                  <select style={styles.input}
                    value={editingInternship ? editingInternship.duration : newInternship.duration}
                    onChange={e => editingInternship
                      ? setEditingInternship({ ...editingInternship, duration: e.target.value })
                      : setNewInternship({ ...newInternship, duration: e.target.value })}>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={styles.saveBtn} onClick={editingInternship ? handleSaveEditInternship : handleAddInternship}>
                      {editingInternship ? "Save Changes" : "Add Internship"}
                    </button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => { setShowAddInternship(false); setEditingInternship(null); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEARCH PROJECTS */}
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
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>⭐ {p.rating}/5</span>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#ffc107", color: "#000", fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => { if (!favoriteProjects.find(f => f.id === p.id)) setFavoriteProjects([...favoriteProjects, p]); }}>
                      {favoriteProjects.find(f => f.id === p.id) ? "⭐ Saved" : "☆ Save"}
                    </button>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }}
                      onClick={() => setSelectedViewProject(selectedViewProject?.id === p.id ? null : p)}>
                      {selectedViewProject?.id === p.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>
                <p style={{ color: "#666" }}>{p.description}</p>
                <p><b>Course:</b> {courses.find(c => c.id === p.courseId)?.name}</p>
                <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                <p><b>Created:</b> {p.createdAt}</p>
                {selectedViewProject?.id === p.id && (
                  <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4 style={{ color: "#003366", marginTop: 0 }}>Full Project Details</h4>
                    <p><b>GitHub:</b> {p.githubLink || "N/A"}</p>
                    <p><b>Demo Video:</b> {p.demoVideo || "N/A"}</p>
                    <p><b>Collaborators:</b> {(p.collaborators || []).length === 0 ? "None" : `${p.collaborators.length} collaborator(s)`}</p>
                    <p><b>Tasks:</b> {(p.tasks || []).length}</p>
                    <p><b>Rating:</b> ⭐ {p.rating}/5</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SEARCH PORTFOLIOS */}
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
                    <button style={{ ...styles.saveBtn, backgroundColor: "#ffc107", color: "#000", fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => { if (!favoritePortfolios.find(f => f.id === p.id)) setFavoritePortfolios([...favoritePortfolios, p]); }}>
                      {favoritePortfolios.find(f => f.id === p.id) ? "⭐ Saved" : "☆ Save"}
                    </button>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }}
                      onClick={() => setSelectedPortfolio(selectedPortfolio?.id === p.id ? null : p)}>
                      {selectedPortfolio?.id === p.id ? "Hide" : "View Profile"}
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
                      {projects.filter(proj => proj.visibility === "public").slice(0, p.projects).map(proj => (
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

        {/* SEARCH INSTRUCTORS */}
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
                        <span key={i} style={{ ...styles.badge }}>📚 {course}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FAVORITES */}
        {activePage === "favorites" && (
          <div>
            <h1>Favorites</h1>
            {suggestedApplications.length > 0 && (
              <div style={styles.sectionCard}>
                <h2>⭐ Suggested Applications (from Favorite Portfolios)</h2>
                {suggestedApplications.map(p => (
                  <div key={p.id} style={styles.userRow}>
                    <div><b>{p.name}</b> — {p.major} — {p.skills.join(", ")}</div>
                    <span style={styles.badge}>{p.projects} projects</span>
                  </div>
                ))}
              </div>
            )}
            <h2>⭐ Favorite Projects</h2>
            {favoriteProjects.length === 0 && <p style={styles.empty}>No favorite projects yet.</p>}
            {favoriteProjects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{p.title}</h3>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545", fontSize: "12px", padding: "4px 10px" }}
                    onClick={() => setFavoriteProjects(favoriteProjects.filter(f => f.id !== p.id))}>Remove</button>
                </div>
                <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                <p>⭐ Rating: {p.rating}/5</p>
              </div>
            ))}
            <h2>🎓 Favorite Portfolios</h2>
            {favoritePortfolios.length === 0 && <p style={styles.empty}>No favorite portfolios yet.</p>}
            {favoritePortfolios.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>👤 {p.name}</h3>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545", fontSize: "12px", padding: "4px 10px" }}
                    onClick={() => setFavoritePortfolios(favoritePortfolios.filter(f => f.id !== p.id))}>Remove</button>
                </div>
                <p><b>Major:</b> {p.major}</p>
                <p><b>Skills:</b> {p.skills.join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES */}
        {activePage === "messages" && (
          <div>
            <h1>Messages</h1>
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ width: "260px" }}>
                {contacts.map(contact => {
                  const key = getChatKey(contact.id);
                  const msgs = JSON.parse(localStorage.getItem(key) || "[]");
                  const last = msgs[msgs.length - 1];
                  return (
                    <div key={contact.id} style={{ ...styles.projectCard, cursor: "pointer", borderLeft: selectedChat?.id === contact.id ? "4px solid #003366" : "4px solid transparent" }}
                      onClick={() => { setSelectedChat(contact); const k = getChatKey(contact.id); setChatMessages({ ...chatMessages, [k]: JSON.parse(localStorage.getItem(k) || "[]") }); }}>
                      <div style={styles.projectHeader}>
                        <b>{contact.name}</b>
                        <span style={{ ...styles.badge, backgroundColor: "#17a2b8", fontSize: "11px" }}>{contact.role}</span>
                      </div>
                      <p style={{ color: "#666", fontSize: "13px", margin: "4px 0" }}>{last ? last.text : "No messages yet"}</p>
                      <small style={{ color: "#999" }}>{last ? last.time : ""}</small>
                    </div>
                  );
                })}
              </div>
              {selectedChat ? (
                <div style={{ flex: 1 }}>
                  <div style={styles.sectionCard}>
                    <h3>Chat with {selectedChat.name}</h3>
                    <div style={{ backgroundColor: "#f0f2f5", padding: "15px", borderRadius: "8px", minHeight: "300px", maxHeight: "400px", overflowY: "auto", marginBottom: "15px" }}>
                      {(chatMessages[getChatKey(selectedChat.id)] || JSON.parse(localStorage.getItem(getChatKey(selectedChat.id)) || "[]")).length === 0
                        ? <p style={{ color: "#999", textAlign: "center", marginTop: "50px" }}>No messages yet. Say hello!</p>
                        : (chatMessages[getChatKey(selectedChat.id)] || JSON.parse(localStorage.getItem(getChatKey(selectedChat.id)) || "[]")).map(msg => {
                          const isMe = msg.senderId === (currentUser?.id || 6);
                          return (
                            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "10px" }}>
                              <div style={{ backgroundColor: isMe ? "#1a3a5c" : "#e0e0e0", color: isMe ? "white" : "#333", padding: "10px 14px", borderRadius: "18px", maxWidth: "70%" }}>
                                {!isMe && <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "3px", color: "#666" }}>{msg.senderName}</div>}
                                <div>{msg.text}</div>
                                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>{msg.time}</div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input style={{ ...styles.input, flex: 1, marginBottom: 0 }} placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(selectedChat); }} />
                      <button style={styles.saveBtn} onClick={() => sendMessage(selectedChat)}>Send</button>
                    </div>
                  </div>
                </div>
              ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Select a conversation</div>}
            </div>
          </div>
        )}

        {activePage === "statistics" && (
          <div>
            <h1>Company Statistics</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px", marginBottom: "30px" }}>
              {[
                { label: "Total Internships Offered", value: internships.length, color: "#003366", icon: "💼" },
                { label: "Students Who Completed Internships", value: studentsCompleted, color: "#28a745", icon: "🎓" },
                { label: "Completed & Archived Internships", value: completedInternships, color: "#17a2b8", icon: "✅" },
                { label: "Total Applicants", value: totalApplicants, color: "#6f42c1", icon: "📋" },
              ].map((stat, i) => (
                <div key={i} style={{ ...styles.sectionCard, textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>{stat.icon}</div>
                  <div style={{ fontSize: "40px", fontWeight: "bold", color: stat.color }}>{stat.value}</div>
                  <div style={{ color: "#666", marginTop: "6px" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Internships over time */}
            <div style={styles.sectionCard}>
              <h2>📅 Internships Offered Over Time</h2>
              {internships.map(i => (
                <div key={i.id} style={styles.userRow}>
                  <div>
                    <b>{i.title}</b>
                    <p style={{ margin: "2px 0", fontSize: "13px", color: "#888" }}>Posted: {i.postedAt} | Deadline: {i.deadline}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ ...styles.badge, backgroundColor: i.status === "hiring" ? "#28a745" : "#6c757d" }}>{i.status}</span>
                    <span style={{ ...styles.badge, backgroundColor: "#17a2b8" }}>{i.applicants?.length || 0} applicants</span>
                    <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>{i.applicants?.filter(a => a.status === "accepted").length || 0} accepted</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Students who did internships */}
            <div style={styles.sectionCard}>
              <h2>🎓 Students Who Completed Internships</h2>
              {internships.every(i => (i.applicants?.filter(a => a.status === "accepted").length || 0) === 0)
                ? <p style={styles.empty}>No students have completed internships yet.</p>
                : internships.map(i => {
                  const accepted = (i.applicants || []).filter(a => a.status === "accepted");
                  if (accepted.length === 0) return null;
                  return (
                    <div key={i.id} style={{ marginBottom: "15px" }}>
                      <b style={{ color: "#003366" }}>{i.title}</b>
                      {accepted.map((a, idx) => {
                        const student = users.find(u => u.id === a.studentId);
                        return (
                          <div key={idx} style={{ ...styles.userRow, marginTop: "6px" }}>
                            <span>👤 {student ? `${student.firstName} ${student.lastName}` : `Student #${a.studentId}`}</span>
                            <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Completed</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activePage === "notifications" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>Notifications</h1>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={markAllRead}>Mark All as Read</button>
                <button style={{ ...styles.saveBtn, backgroundColor: notificationsEnabled ? "#dc3545" : "#28a745" }}
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                  {notificationsEnabled ? "🔕 Turn Off Notifications" : "🔔 Turn On Notifications"}
                </button>
              </div>
            </div>
            {!notificationsEnabled && (
              <div style={{ backgroundColor: "#fff3cd", padding: "12px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #ffc107" }}>
                ⚠️ Notifications are turned off. You won't receive new notifications.
              </div>
            )}
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
  sidebar: { width: "240px", backgroundColor: "#1a3a5c", color: "white", padding: "20px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  logo: { color: "white", marginBottom: "5px", fontSize: "18px" },
  roleTag: { color: "#a0c4ff", fontSize: "12px", marginBottom: "20px" },
  navItem: { padding: "11px 15px", cursor: "pointer", borderRadius: "8px", marginBottom: "4px", fontSize: "13px" },
  activeNav: { backgroundColor: "#003366" },
  logoutBtn: { marginTop: "auto", padding: "10px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  main: { flex: 1, padding: "40px", backgroundColor: "#f0f2f5", overflowY: "auto" },
  subtitle: { color: "#666", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", padding: "25px", borderRadius: "12px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  cardIcon: { fontSize: "35px", marginBottom: "8px" },
  cardLabel: { fontSize: "14px", fontWeight: "bold", color: "#003366" },
  profileCard: { display: "flex", gap: "20px", backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  profilePicBox: { fontSize: "60px" },
  sectionCard: { backgroundColor: "white", padding: "25px", borderRadius: "12px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333", fontSize: "14px" },
  input: { display: "block", width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box", fontFamily: "inherit" },
  saveBtn: { padding: "10px 20px", backgroundColor: "#003366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  projectCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  projectHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  badge: { padding: "4px 10px", borderRadius: "20px", color: "white", fontSize: "12px", backgroundColor: "#003366" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  filterRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { backgroundColor: "white", padding: "30px", borderRadius: "12px", width: "500px", maxHeight: "85vh", overflowY: "auto" },
  taskSection: { marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" },
  taskCard: { backgroundColor: "white", padding: "12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #eee" },
  userRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", marginBottom: "8px" },
  empty: { color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" },
};

export default EmployerDashboard;