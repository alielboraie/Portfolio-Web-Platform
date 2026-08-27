import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { projects as initialProjects, courses, internships as initialInternships, users } from "../data/mockData";

function StudentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");

  // Profile state - loaded from localStorage
  const savedProfile = (() => { try { const s = localStorage.getItem(`profile_${currentUser?.id}`); return s ? JSON.parse(s) : null; } catch(e) { return null; } })();
  const [profile, setProfile] = useState(savedProfile || {
    major: currentUser?.major || "",
    skills: currentUser?.skills?.join(", ") || "",
    linkedin: currentUser?.linkedin || "",
    profilePic: null,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Projects state
  const [myProjects, setMyProjects] = useState(initialProjects.filter(p => p.studentId === currentUser?.id));
  const [collaboratingProjects, setCollaboratingProjects] = useState(
    initialProjects.filter(p => (p.collaborators || []).includes(currentUser?.id))
  );
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: "", courseId: "", githubLink: "", demoVideo: "",
    languages: "", description: "", visibility: "public", report: "", showOnPortfolio: true
  });
  const [viewingProject, setViewingProject] = useState(null);

  // Tasks state
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "", status: "pending", deadline: "" });
  const [editingTask, setEditingTask] = useState(null);

  // Collaborator state
  const [showCollaboratorSearch, setShowCollaboratorSearch] = useState(null);
  const [collaboratorQuery, setCollaboratorQuery] = useState("");

  // Invitations state - invitations sent TO this student
  const [myInvitations, setMyInvitations] = useState([
    { id: 1, projectId: 3, projectTitle: "AI Chatbot", fromName: "Ahmed Hassan", fromEmail: "ahmed.hassan@student.guc.edu.eg", status: "pending" },
    { id: 2, projectId: 4, projectTitle: "E-Commerce App", fromName: "Sara Khaled", fromEmail: "sara.khaled@student.guc.edu.eg", status: "pending" },
  ]);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedViewProject, setSelectedViewProject] = useState(null);

  // Portfolio search state
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Internships state
  const [internships] = useState(initialInternships);
  const [internshipSearch, setInternshipSearch] = useState("");
  const [internshipCompanyFilter, setInternshipCompanyFilter] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [selectedInternshipView, setSelectedInternshipView] = useState(null);
  const [internshipSortBy, setInternshipSortBy] = useState("date");
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [completedInternships] = useState([
    { id: 2, title: "Backend Developer Intern", company: "TechCorp", duration: "6 months", completedAt: "2024-03-01" }
  ]);
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    const base = [
      { id: 1, message: "Your project 'GUC Portfolio System' received a comment from Omar Salem", read: false, time: "2 hours ago", type: "comment" },
      { id: 6, message: "Omar Salem left a comment on your task 'Design UI' in GUC Portfolio System", read: false, time: "3 hours ago", type: "comment" },
      { id: 2, message: "Ahmed Hassan invited you to collaborate on 'AI Chatbot'", read: false, time: "1 day ago", type: "invitation" },
      { id: 3, message: "Your internship application at TechCorp has been accepted! 🎉", read: true, time: "3 days ago", type: "internship" },
      { id: 7, message: "Your internship application at DataSoft has been rejected.", read: true, time: "1 week ago", type: "internship" },
      { id: 4, message: "Your project 'Network Simulator' has been flagged for review - Reason: Suspected plagiarism", read: false, time: "5 days ago", type: "flag" },
      { id: 5, message: "You received a new message from Omar Salem", read: false, time: "1 hour ago", type: "message" },
    ];
    const flagNotifs = JSON.parse(localStorage.getItem("studentNotifications_2") || "[]");
    const inviteNotifs = JSON.parse(localStorage.getItem(`studentInvitations_${window.__userId || 1}`) || "[]");
    return [...base, ...flagNotifs, ...inviteNotifs];
  });

  // Messages state
  const [contacts] = useState([
    { id: 4, name: "Omar Salem", role: "instructor" },
    { id: 6, name: "TechCorp HR", role: "employer" },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});

  const getChatKey = (otherId) => {
    const myId = currentUser?.id || 1;
    return `chat_${Math.min(myId, otherId)}_${Math.max(myId, otherId)}`;
  };

  const loadMessages = (otherId) => {
    const key = getChatKey(otherId);
    return JSON.parse(localStorage.getItem(key) || "[]");
  };

  const sendMessage = (contact) => {
    if (!newMessage.trim()) return;
    const key = getChatKey(contact.id);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const msg = {
      id: Date.now(),
      senderId: currentUser?.id || 1,
      senderName: `${currentUser?.firstName} ${currentUser?.lastName}`,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    existing.push(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    setChatMessages({ ...chatMessages, [key]: existing });
    // Notify recipient
    const recipientNotifs = JSON.parse(localStorage.getItem(`instructorNotifications_${contact.id}`) || "[]");
    recipientNotifs.push({ id: Date.now(), message: `New message from ${currentUser?.firstName} ${currentUser?.lastName}`, read: false, time: "Just now" });
    localStorage.setItem(`instructorNotifications_${contact.id}`, JSON.stringify(recipientNotifs));
    setNotifications([...notifications, { id: Date.now(), message: `Message sent to ${contact.name}`, read: false, time: "Just now", type: "message" }]);
    setNewMessage("");
  };

  // Favorites state
  const [favoriteProjects, setFavoriteProjects] = useState([initialProjects[0]]);
  const [favoritePortfolios, setFavoritePortfolios] = useState([]);

  // Appeal state
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [appealSent, setAppealSent] = useState(false);

  // Mock data
  const allPortfolios = [
    { id: 10, name: "Ahmed Hassan", email: "ahmed.hassan@student.guc.edu.eg", major: "Computer Science", skills: ["React", "Node.js"], projects: 5, profilePic: null },
    { id: 11, name: "Sara Khaled", email: "sara.khaled@student.guc.edu.eg", major: "Engineering", skills: ["Python", "ML"], projects: 3, profilePic: null },
    { id: 12, name: "Mohamed Ali", email: "mo@student.guc.edu.eg", major: "Computer Science", skills: ["Java", "Spring"], projects: 7, profilePic: null },
  ];

  const allUsers = [
    { id: 10, firstName: "Ahmed", lastName: "Hassan", email: "ahmed.hassan@student.guc.edu.eg", role: "student", linkedCourses: [] },
    { id: 11, firstName: "Sara", lastName: "Khaled", email: "sara.khaled@student.guc.edu.eg", role: "student", linkedCourses: [] },
    { id: 4, firstName: "Omar", lastName: "Salem", email: "omar.salem@guc.edu.eg", role: "instructor", linkedCourses: [1, 3] },
    { id: 5, firstName: "Mona", lastName: "Tarek", email: "mona.tarek@guc.edu.eg", role: "instructor", linkedCourses: [2, 3] },
  ];

  const handleLogout = () => { logout(); navigate("/login"); };

  // Project handlers
  const handleAddProject = () => {
    if (!newProject.title || !newProject.courseId) { alert("Please fill title and course"); return; }
    const created = {
      ...newProject, id: Date.now(), studentId: currentUser.id,
      languages: newProject.languages.split(",").map(l => l.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0],
      rating: 0, collaborators: [], tasks: [], comments: [], thesisDrafts: []
    };
    setMyProjects([...myProjects, created]);
    setNewProject({ title: "", courseId: "", githubLink: "", demoVideo: "", languages: "", description: "", visibility: "public", report: "", showOnPortfolio: true });
    setShowAddProject(false);
  };

  const handleDeleteProject = (id) => {
    if (window.confirm("Delete this project?")) setMyProjects(myProjects.filter(p => p.id !== id));
  };

  const handleToggleVisibility = (id) => {
    setMyProjects(myProjects.map(p => p.id === id ? { ...p, visibility: p.visibility === "public" ? "private" : "public" } : p));
  };

  const handleTogglePortfolio = (id) => {
    setMyProjects(myProjects.map(p => p.id === id ? { ...p, showOnPortfolio: !p.showOnPortfolio } : p));
  };

  const handleSaveEdit = () => {
    setMyProjects(myProjects.map(p => p.id === editingProject.id ? {
      ...editingProject,
      languages: typeof editingProject.languages === "string"
        ? editingProject.languages.split(",").map(l => l.trim())
        : editingProject.languages
    } : p));
    setEditingProject(null);
  };

  // Task handlers
  const handleAddTask = (projectId) => {
    if (!newTask.title) { alert("Task title required"); return; }
    const task = { ...newTask, id: Date.now() };
    setMyProjects(myProjects.map(p => p.id === projectId ? { ...p, tasks: [...(p.tasks || []), task] } : p));
    setNewTask({ title: "", description: "", assignedTo: "", status: "pending", deadline: "" });
    setShowAddTask(false);
  };

  const handleSaveEditTask = (projectId) => {
    if (!editingTask.title) { alert("Task title required"); return; }
    setMyProjects(myProjects.map(p => p.id === projectId ? {
      ...p, tasks: p.tasks.map(t => t.id === editingTask.id ? editingTask : t)
    } : p));
    setEditingTask(null);
  };

  const handleMoveTask = (projectId, taskIndex, direction) => {
    setMyProjects(myProjects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = [...p.tasks];
      const newIndex = taskIndex + direction;
      if (newIndex < 0 || newIndex >= tasks.length) return p;
      [tasks[taskIndex], tasks[newIndex]] = [tasks[newIndex], tasks[taskIndex]];
      return { ...p, tasks };
    }));
  };

  // Invitation handlers
  const handleInvitationResponse = (invId, response) => {
    setMyInvitations(myInvitations.map(inv => inv.id === invId ? { ...inv, status: response } : inv));
  };

  // Notification handlers
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const toggleRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const unreadCount = notifications.filter(n => !n.read).length;

  // Internship handlers
  const handleApply = () => {
    if (!coverLetter) { alert("Please write a cover letter"); return; }
    setAppliedInternships([...appliedInternships, showApplyModal]);
    setNotifications([...notifications, { id: Date.now(), message: "Your internship application has been submitted!", read: false, time: "Just now", type: "internship" }]);
    setCoverLetter("");
    setShowApplyModal(null);
    alert("Application submitted!");
  };

  // Profile save
  const handleSaveProfile = () => {
    localStorage.setItem(`profile_${currentUser?.id}`, JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  // Appeal handler
  const handleSendAppeal = () => {
    if (!appealText.trim()) { alert("Please write your appeal"); return; }
    setAppealSent(true);
    setShowAppealModal(false);
    setNotifications([...notifications, { id: Date.now(), message: "Your appeal has been sent to the admin", read: false, time: "Just now", type: "appeal" }]);
    // Save appeal to localStorage for admin
    const adminNotifs = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
    adminNotifs.push({ id: Date.now(), message: `Student ${currentUser?.firstName} ${currentUser?.lastName} sent an appeal: "${appealText.substring(0, 60)}..."`, read: false, time: "Just now" });
    localStorage.setItem("adminNotifications", JSON.stringify(adminNotifs));
    // Save appeal text for admin to view
    const appeals = JSON.parse(localStorage.getItem("studentAppeals") || "[]");
    appeals.push({ studentName: `${currentUser?.firstName} ${currentUser?.lastName}`, appeal: appealText, time: new Date().toISOString() });
    localStorage.setItem("studentAppeals", JSON.stringify(appeals));
    alert("Appeal sent to admin!");
  };

  // Filtered data
  const allProjects = [...initialProjects, ...myProjects.filter(p => !initialProjects.find(ip => ip.id === p.id))];

  const filteredProjects = allProjects
    .filter(p => p.visibility === "public")
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => filterCourse ? p.courseId === parseInt(filterCourse) : true)
    .filter(p => filterInstructor ? (() => {
      const instructorCourses = allUsers.find(u => u.id === parseInt(filterInstructor))?.linkedCourses || [];
      return instructorCourses.includes(p.courseId);
    })() : true)
    .sort((a, b) => sortBy === "date" ? new Date(b.createdAt) - new Date(a.createdAt) : b.rating - a.rating);

  const filteredPortfolios = allPortfolios
    .filter(p => p.name.toLowerCase().includes(portfolioSearch.toLowerCase()) || p.email.toLowerCase().includes(portfolioSearch.toLowerCase()))
    .filter(p => filterMajor ? p.major === filterMajor : true)
    .filter(p => filterSkill ? p.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())) : true)
    .sort((a, b) => b.projects - a.projects);

  const filteredInternships = internships
    .filter(i => !i.archived)
    .filter(i => {
      const employer = users.find(u => u.id === i.employerId);
      const companyName = employer?.companyName?.toLowerCase() || "";
      return i.title.toLowerCase().includes(internshipSearch.toLowerCase()) ||
        companyName.includes(internshipSearch.toLowerCase());
    })
    .filter(i => internshipCompanyFilter ? i.employerId === parseInt(internshipCompanyFilter) : true)
    .filter(i => filterDuration ? i.duration === filterDuration : true)
    .sort((a, b) => internshipSortBy === "date" ? new Date(b.postedAt) - new Date(a.postedAt) : 0);

  // Recommended projects - projects with high rating that aren't mine
  const recommendedProjects = allProjects
    .filter(p => p.visibility === "public" && p.studentId !== currentUser?.id && p.rating >= 3)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const navItems = [
    { key: "home", label: "🏠 Home" },
    { key: "my-portfolio", label: "🌐 My Portfolio" },
    { key: "projects", label: "📁 My Projects" },
    { key: "collaborating", label: "🤝 Collaborating Projects" },
    { key: "invitations", label: `📩 Invitations ${myInvitations.filter(i => i.status === "pending").length > 0 ? `(${myInvitations.filter(i => i.status === "pending").length})` : ""}` },
    { key: "search-projects", label: "🔍 Search Projects" },
    { key: "search-portfolios", label: "🎓 Search Portfolios" },
    { key: "search-instructors", label: "👨‍🏫 Search Instructors" },
    { key: "internships", label: "💼 Internships" },
    { key: "messages", label: "💬 Messages" },
    { key: "notifications", label: `🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
    { key: "favorites", label: "⭐ Favorites" },
    { key: "statistics", label: "📊 Statistics" },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>GUC Portfolio</h2>
        <p style={styles.roleTag}>Student</p>
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
            <p style={styles.subtitle}>What would you like to do today?</p>
            <div style={styles.grid}>
              {[
                { label: "My Portfolio", icon: "🌐", key: "my-portfolio" },
                { label: "My Projects", icon: "📁", key: "projects" },
                { label: "Invitations", icon: "📩", key: "invitations" },
                { label: "Search Projects", icon: "🔍", key: "search-projects" },
                { label: "Search Portfolios", icon: "🎓", key: "search-portfolios" },
                { label: "Search Instructors", icon: "👨‍🏫", key: "search-instructors" },
                { label: "Internships", icon: "💼", key: "internships" },
                { label: "Messages", icon: "💬", key: "messages" },
                { label: "Notifications", icon: "🔔", key: "notifications" },
                { label: "Favorites", icon: "⭐", key: "favorites" },
                { label: "Statistics", icon: "📊", key: "statistics" },
              ].map(card => (
                <div key={card.key} style={styles.card} onClick={() => setActivePage(card.key)}>
                  <div style={styles.cardIcon}>{card.icon}</div>
                  <div style={styles.cardLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Recommended Projects - Req 67 */}
            <div style={{ marginTop: "30px" }}>
              <h2>⭐ Recommended Projects</h2>
              {recommendedProjects.map(p => (
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
          </div>
        )}

        {/* MY PORTFOLIO - with editable profile info - Req 5, 22 */}
        {activePage === "my-portfolio" && (
          <div>
            <h1>My Portfolio</h1>

            {/* Profile Info Card */}
            <div style={styles.sectionCard}>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  {profile.profilePic
                    ? <img src={profile.profilePic} alt="profile" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover" }} />
                    : <div style={{ fontSize: "70px" }}>👤</div>
                  }
                  <label style={{ ...styles.saveBtn, cursor: "pointer", fontSize: "12px", padding: "5px 10px", display: "inline-block", marginTop: "8px" }}>
                    📷 Upload Photo
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
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <h2 style={{ margin: "0 0 5px" }}>{currentUser?.firstName} {currentUser?.lastName}</h2>
                  <p style={{ color: "#888", margin: "0 0 15px" }}>{currentUser?.email}</p>
                  <label style={styles.label}>Major</label>
                  <input style={styles.input} placeholder="e.g. Computer Science" value={profile.major}
                    onChange={e => setProfile({ ...profile, major: e.target.value })} />
                  <label style={styles.label}>Skills (comma separated)</label>
                  <input style={styles.input} placeholder="e.g. React, Python, Java" value={profile.skills}
                    onChange={e => setProfile({ ...profile, skills: e.target.value })} />
                  <label style={styles.label}>LinkedIn URL</label>
                  <input style={styles.input} placeholder="https://linkedin.com/in/yourname" value={profile.linkedin}
                    onChange={e => setProfile({ ...profile, linkedin: e.target.value })} />
                  <button style={styles.saveBtn} onClick={handleSaveProfile}>
                    {profileSaved ? "✅ Saved!" : "💾 Save Changes"}
                  </button>
                </div>
              </div>
            </div>

            {/* Portfolio visibility toggle */}
            <h2>Projects on Portfolio</h2>
            <p style={{ color: "#888", fontSize: "13px" }}>Toggle which projects appear on your portfolio</p>
            {myProjects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{p.title}</h3>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ ...styles.badge, backgroundColor: p.visibility === "public" ? "#28a745" : "#dc3545" }}>{p.visibility}</span>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "5px 12px", backgroundColor: p.showOnPortfolio !== false ? "#28a745" : "#6c757d" }}
                      onClick={() => handleTogglePortfolio(p.id)}>
                      {p.showOnPortfolio !== false ? "✅ On Portfolio" : "➕ Add to Portfolio"}
                    </button>
                  </div>
                </div>
                <p style={{ color: "#666", fontSize: "13px" }}>{p.description}</p>
              </div>
            ))}

            {/* Public Preview */}
            <h2 style={{ marginTop: "30px" }}>👁 Public Preview</h2>
            <p style={{ color: "#888", fontSize: "13px" }}>This is how others see your portfolio</p>
            <div style={{ ...styles.sectionCard, backgroundColor: "#f8f9fa" }}>
              <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "15px" }}>
                {profile.profilePic
                  ? <img src={profile.profilePic} alt="profile" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ fontSize: "50px" }}>👤</div>}
                <div>
                  <h3 style={{ margin: 0 }}>{currentUser?.firstName} {currentUser?.lastName}</h3>
                  <p style={{ margin: "3px 0", color: "#666" }}>{currentUser?.email}</p>
                  {profile.major && <p style={{ margin: "3px 0" }}><b>Major:</b> {profile.major}</p>}
                  {profile.skills && <p style={{ margin: "3px 0" }}><b>Skills:</b> {profile.skills}</p>}
                  {profile.linkedin && <p style={{ margin: "3px 0" }}><b>LinkedIn:</b> <a href={profile.linkedin} target="_blank" rel="noreferrer">{profile.linkedin}</a></p>}
                </div>
              </div>
              {myProjects.filter(p => p.visibility === "public" && p.showOnPortfolio !== false).length === 0
                ? <p style={styles.empty}>No public projects on portfolio yet.</p>
                : myProjects.filter(p => p.visibility === "public" && p.showOnPortfolio !== false).map(p => (
                  <div key={p.id} style={styles.projectCard}>
                    <h3 style={{ color: "#003366" }}>{p.title}</h3>
                    <p>{p.description}</p>
                    <p><b>Course:</b> {courses.find(c => c.id === parseInt(p.courseId))?.name}</p>
                    <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                    {p.githubLink && <p><b>GitHub:</b> <a href={p.githubLink} target="_blank" rel="noreferrer">{p.githubLink}</a></p>}
                    {p.demoVideo && <p><b>Demo:</b> <a href={p.demoVideo} target="_blank" rel="noreferrer">Watch Demo</a></p>}
                    <p>⭐ Rating: {p.rating}/5</p>
                    {p.courseId === 3 && p.thesisDrafts && p.thesisDrafts.find(d => d.isFinal) && (
                      <div style={{ marginTop: "10px", backgroundColor: "#f0fff0", padding: "10px", borderRadius: "8px", border: "1px solid #28a745" }}>
                        <b>📄 Final Thesis Draft:</b>
                        <p style={{ margin: "4px 0" }}>
                          <a href={p.thesisDrafts.find(d => d.isFinal).url || "#"} target="_blank" rel="noreferrer">
                            {p.thesisDrafts.find(d => d.isFinal).name}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                ))
              }
              {/* Completed Internships - Req 90 */}
              {completedInternships.length > 0 && (
                <div>
                  <h3>💼 Completed Internships</h3>
                  {completedInternships.map(i => (
                    <div key={i.id} style={styles.projectCard}>
                      <h3 style={{ color: "#003366" }}>{i.title}</h3>
                      <p><b>Company:</b> {i.company}</p>
                      <p><b>Duration:</b> {i.duration}</p>
                      <p><b>Completed:</b> {i.completedAt}</p>
                      <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Completed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY PROJECTS */}
        {activePage === "projects" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>My Projects</h1>
              <button style={styles.saveBtn} onClick={() => { setShowAddProject(true); setEditingProject(null); }}>+ Add Project</button>
            </div>

            {myProjects.length === 0 && <p style={styles.empty}>No projects yet. Add your first project!</p>}

            {myProjects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{p.title}</h3>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ ...styles.badge, backgroundColor: p.visibility === "public" ? "#28a745" : "#dc3545" }}>{p.visibility}</span>
                    {p.showOnPortfolio !== false && <span style={{ ...styles.badge, backgroundColor: "#17a2b8" }}>On Portfolio</span>}
                  </div>
                </div>
                <p style={{ color: "#666" }}>{p.description}</p>
                <p><b>Course:</b> {courses.find(c => c.id === parseInt(p.courseId))?.name || "N/A"}</p>
                <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                {p.githubLink && <p><b>GitHub:</b> <a href={p.githubLink} target="_blank" rel="noreferrer">{p.githubLink}</a></p>}
                {p.demoVideo && <p><b>Demo:</b> <a href={p.demoVideo} target="_blank" rel="noreferrer">Watch Demo</a></p>}
                {p.report && <p><b>Report:</b> 📄 {p.report} <a href="#" style={{ ...styles.saveBtn, fontSize: "11px", padding: "2px 8px", marginLeft: "8px", textDecoration: "none", display: "inline-block" }} download={p.report}>⬇ Download</a></p>}
                <p><b>Created:</b> {p.createdAt} &nbsp; ⭐ Rating: {p.rating}/5</p>

                {/* Instructor Comments - Req 40 */}
                {(p.comments || []).length > 0 && (
                  <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
                    <b>💬 Instructor Feedback:</b>
                    {p.comments.map((c, i) => (
                      <p key={i} style={{ margin: "4px 0", fontSize: "13px" }}>{c.text} — <i>{c.instructorName}</i></p>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  <button style={styles.saveBtn} onClick={() => setViewingProject(viewingProject?.id === p.id ? null : p)}>
                    {viewingProject?.id === p.id ? "Hide Details" : "View Details"}
                  </button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setEditingProject({ ...p, languages: Array.isArray(p.languages) ? p.languages.join(", ") : p.languages })}>Edit</button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleDeleteProject(p.id)}>Delete</button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => handleToggleVisibility(p.id)}>
                    {p.visibility === "public" ? "Make Private" : "Make Public"}
                  </button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#17a2b8" }} onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}>
                    {selectedProject?.id === p.id ? "Hide Tasks" : "View Tasks"}
                  </button>
                  <button style={{ ...styles.saveBtn, backgroundColor: "#6f42c1" }} onClick={() => setShowCollaboratorSearch(p.id)}>
                    {parseInt(p.courseId) === 3 ? "👨‍🏫 Invite Instructor" : "👥 Collaborators"}
                  </button>
                </div>

                {/* View Full Project Details - Req 46 */}
                {viewingProject?.id === p.id && (
                  <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4>Full Project Details</h4>
                    <p><b>Title:</b> {p.title}</p>
                    <p><b>Description:</b> {p.description}</p>
                    <p><b>Course:</b> {courses.find(c => c.id === parseInt(p.courseId))?.name}</p>
                    <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                    <p><b>GitHub:</b> {p.githubLink || "N/A"}</p>
                    <p><b>Demo Video:</b> {p.demoVideo || "N/A"}</p>
                    <p><b>Created:</b> {p.createdAt}</p>
                    <p><b>Rating:</b> ⭐ {p.rating}/5</p>
                    <p><b>Visibility:</b> {p.visibility}</p>
                    <p><b>Collaborators:</b> {(p.collaborators || []).length === 0 ? "None" : p.collaborators.join(", ")}</p>
                  </div>
                )}

                {/* TASKS - Req 32, 33, 34 */}
                {selectedProject?.id === p.id && (
                  <div style={styles.taskSection}>
                    <div style={styles.pageHeader}>
                      <h4>Tasks</h4>
                      <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px" }} onClick={() => setShowAddTask(true)}>+ Add Task</button>
                    </div>
                    {(p.tasks || []).length === 0 && <p style={styles.empty}>No tasks yet.</p>}
                    {(p.tasks || []).map((task, i) => (
                      <div key={i} style={styles.taskCard}>
                        <div style={styles.projectHeader}>
                          <b>{task.title}</b>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {/* Reorder buttons - Req 34 */}
                            <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "2px 8px", backgroundColor: "#6c757d" }}
                              onClick={() => handleMoveTask(p.id, i, -1)} disabled={i === 0}>▲</button>
                            <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "2px 8px", backgroundColor: "#6c757d" }}
                              onClick={() => handleMoveTask(p.id, i, 1)} disabled={i === p.tasks.length - 1}>▼</button>
                            <span style={{ ...styles.badge, backgroundColor: task.status === "completed" ? "#28a745" : task.status === "postponed" ? "#ffc107" : "#17a2b8", color: task.status === "postponed" ? "#000" : "white" }}>
                              {task.status}
                            </span>
                            {p.studentId === currentUser?.id && (
                              <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 8px", backgroundColor: "#ffc107", color: "#000" }}
                                onClick={() => setEditingTask({ ...task })}>✏️</button>
                            )}
                            <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 8px", backgroundColor: "#dc3545" }}
                              onClick={() => setMyProjects(myProjects.map(proj => proj.id === p.id ? { ...proj, tasks: proj.tasks.filter((_, idx) => idx !== i) } : proj))}>
                              ✕
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: "4px 0", color: "#666" }}>{task.description}</p>
                        {task.assignedTo && <p style={{ margin: "4px 0", fontSize: "13px" }}><b>Assigned to:</b> {task.assignedTo}</p>}
                        {task.deadline && <p style={{ margin: "4px 0", fontSize: "13px" }}><b>Deadline:</b> {task.deadline}</p>}

                        {/* Instructor comments on this task - Req 40 */}
                        {(task.comments || []).length > 0 && (
                          <div style={{ backgroundColor: "#e8f0fe", padding: "8px", borderRadius: "6px", marginTop: "6px" }}>
                            <b style={{ fontSize: "13px" }}>💬 Instructor Comments:</b>
                            {task.comments.map((c, ci) => (
                              <p key={ci} style={{ margin: "3px 0", fontSize: "13px" }}>{c.text} — <i>{c.instructorName}</i></p>
                            ))}
                          </div>
                        )}
                        <select style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", marginTop: "8px" }}
                          value={task.status}
                          onChange={e => setMyProjects(myProjects.map(proj => proj.id === p.id ? {
                            ...proj, tasks: proj.tasks.map((t, idx) => idx === i ? { ...t, status: e.target.value } : t)
                          } : proj))}>
                          <option value="pending">Pending</option>
                          <option value="postponed">Postponed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    ))}
                    {showAddTask && (
                      <div style={styles.modal}>
                        <div style={styles.modalBox}>
                          <h3>Add Task</h3>
                          <input style={styles.input} placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                          <input style={styles.input} placeholder="Assign to (collaborator email)" value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} />
                          <textarea style={styles.input} placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                          <select style={styles.input} value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="postponed">Postponed</option>
                            <option value="completed">Completed</option>
                          </select>
                          <input style={styles.input} type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button style={styles.saveBtn} onClick={() => handleAddTask(p.id)}>Save Task</button>
                            <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setShowAddTask(false)}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* THESIS DRAFTS - Req 23, 24 */}
                {p.courseId === 3 && selectedProject?.id === p.id && (
                  <div style={styles.taskSection}>
                    <h4>📄 Thesis Drafts</h4>
                    {(p.thesisDrafts || []).length === 0 && <p style={styles.empty}>No drafts uploaded yet.</p>}
                    {(p.thesisDrafts || []).map((draft, i) => (
                      <div key={i} style={styles.taskCard}>
                        <div style={styles.projectHeader}>
                          <span>📄 {draft.name}</span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {draft.isFinal
                              ? <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>Final Draft</span>
                              : (
                                <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#28a745" }}
                                  onClick={() => setMyProjects(myProjects.map(proj => proj.id === p.id ? {
                                    ...proj, thesisDrafts: proj.thesisDrafts.map((d, idx) => ({ ...d, isFinal: idx === i, visible: idx !== i ? false : true }))
                                  } : proj))}>
                                  Set as Final
                                </button>
                              )
                            }
                            {draft.url && (
                              <a href={draft.url} download={draft.name}
                                style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8", textDecoration: "none", display: "inline-block" }}>
                                ⬇ Download
                              </a>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", color: "#888" }}>Uploaded: {draft.uploadedAt}</p>
                      </div>
                    ))}
                    <label style={{ ...styles.saveBtn, cursor: "pointer", display: "inline-block", marginTop: "10px", backgroundColor: "#6f42c1" }}>
                      + Upload New Draft
                      <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const newDraft = { id: Date.now(), name: file.name, url: URL.createObjectURL(file), uploadedAt: new Date().toISOString().split("T")[0], isFinal: false, visible: true };
                            setMyProjects(myProjects.map(proj => proj.id === p.id ? {
                              ...proj, thesisDrafts: [...(proj.thesisDrafts || []), newDraft]
                            } : proj));
                          }
                        }} />
                    </label>
                  </div>
                )}

                {/* COLLABORATOR & INSTRUCTOR MODAL - Req 25, 26, 27, 31 */}
                {showCollaboratorSearch === p.id && (
                  <div style={styles.modal}>
                    <div style={styles.modalBox}>
                      <h3>👥 Manage Project Members</h3>
                      <input style={styles.input} placeholder="Search by name or email..."
                        value={collaboratorQuery}
                        onChange={e => setCollaboratorQuery(e.target.value)} />

                      {/* SECTION 1 - Collaborators (Students only) - hidden for Bachelor Project */}
                      {parseInt(p.courseId) !== 3 && (
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ color: "#003366", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>🎓 Collaborators (Students)</h4>

                          {collaboratorQuery.length > 0 && (
                            <div style={{ marginBottom: "10px" }}>
                              {allUsers.filter(u =>
                                u.role === "student" &&
                                (u.firstName.toLowerCase().includes(collaboratorQuery.toLowerCase()) ||
                                  u.lastName.toLowerCase().includes(collaboratorQuery.toLowerCase()) ||
                                  u.email.toLowerCase().includes(collaboratorQuery.toLowerCase()))
                              ).map(u => (
                                <div key={u.id} style={{ ...styles.taskCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <b>{u.firstName} {u.lastName}</b>
                                    <span style={{ ...styles.badge, marginLeft: "8px", backgroundColor: "#6c757d", fontSize: "11px" }}>student</span>
                                    <p style={{ margin: "2px 0", fontSize: "13px", color: "#666" }}>{u.email}</p>
                                  </div>
                                  {(p.collaborators || []).includes(u.id)
                                    ? <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Added</span>
                                    : <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px" }}
                                      onClick={() => {
                                        setMyProjects(myProjects.map(proj => proj.id === p.id ? { ...proj, collaborators: [...(proj.collaborators || []), u.id] } : proj));
                                        setNotifications([...notifications, { id: Date.now(), message: `Invitation sent to ${u.firstName} ${u.lastName}`, read: false, time: "Just now", type: "invitation" }]);
                                        alert(`Invitation sent to ${u.firstName}!`);
                                      }}>
                                      + Invite
                                    </button>
                                  }
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Current Collaborators - Req 27 */}
                          <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "8px" }}>Current Collaborators:</p>
                          {(p.collaborators || []).filter(id => allUsers.find(u => u.id === id && u.role === "student")).length === 0
                            && <p style={styles.empty}>No collaborators yet.</p>}
                          {(p.collaborators || []).map(collabId => {
                            const collab = allUsers.find(u => u.id === collabId && u.role === "student");
                            return collab ? (
                              <div key={collabId} style={{ ...styles.taskCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <b>{collab.firstName} {collab.lastName}</b>
                                  <p style={{ margin: "2px 0", fontSize: "13px", color: "#666" }}>{collab.email}</p>
                                  <span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#000", fontSize: "11px" }}>No Reply</span>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#ffc107", color: "#000" }}
                                    onClick={() => {
                                      setMyProjects(myProjects.map(proj => proj.id === p.id ? { ...proj, collaborators: proj.collaborators.filter(id => id !== collabId) } : proj));
                                      alert("Invitation cancelled!");
                                    }}>Cancel</button>
                                  <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#dc3545" }}
                                    onClick={() => setMyProjects(myProjects.map(proj => proj.id === p.id ? { ...proj, collaborators: proj.collaborators.filter(id => id !== collabId) } : proj))}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* SECTION 2 - Course Instructors */}
                      <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ color: "#003366", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>👨‍🏫 Course Instructors</h4>

                        {collaboratorQuery.length > 0 && (
                          <div style={{ marginBottom: "10px" }}>
                            {allUsers.filter(u =>
                              u.role === "instructor" &&
                              u.linkedCourses.includes(parseInt(p.courseId)) &&
                              (u.firstName.toLowerCase().includes(collaboratorQuery.toLowerCase()) ||
                                u.lastName.toLowerCase().includes(collaboratorQuery.toLowerCase()) ||
                                u.email.toLowerCase().includes(collaboratorQuery.toLowerCase()))
                            ).map(u => (
                              <div key={u.id} style={{ ...styles.taskCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <b>{u.firstName} {u.lastName}</b>
                                  <span style={{ ...styles.badge, marginLeft: "8px", backgroundColor: "#17a2b8", fontSize: "11px" }}>instructor</span>
                                  <p style={{ margin: "2px 0", fontSize: "13px", color: "#666" }}>{u.email}</p>
                                </div>
                                {(p.collaborators || []).includes(u.id)
                                  ? <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Invited</span>
                                  : <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }}
                                    onClick={() => {
                                      setMyProjects(myProjects.map(proj => proj.id === p.id ? { ...proj, collaborators: [...(proj.collaborators || []), u.id] } : proj));
                                      setNotifications([...notifications, { id: Date.now(), message: `Invitation sent to instructor ${u.firstName} ${u.lastName}`, read: false, time: "Just now", type: "invitation" }]);
                                      // Notify instructor via localStorage
                                      const instNotifs = JSON.parse(localStorage.getItem(`instructorNotifications_${u.id}`) || "[]");
                                      instNotifs.push({ id: Date.now(), message: `${currentUser?.firstName} ${currentUser?.lastName} invited you to join project "${p.title}"`, read: false, time: "Just now" });
                                      localStorage.setItem(`instructorNotifications_${u.id}`, JSON.stringify(instNotifs));
                                      alert(`Invitation sent to ${u.firstName}!`);
                                    }}>
                                    + Invite
                                  </button>
                                }
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Current Invited Instructors */}
                        <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "8px" }}>Invited Instructors:</p>
                        {(p.collaborators || []).filter(id => allUsers.find(u => u.id === id && u.role === "instructor")).length === 0
                          && <p style={styles.empty}>No instructors invited yet.</p>}
                        {(p.collaborators || []).map(collabId => {
                          const instructor = allUsers.find(u => u.id === collabId && u.role === "instructor");
                          return instructor ? (
                            <div key={collabId} style={{ ...styles.taskCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <b>{instructor.firstName} {instructor.lastName}</b>
                                <p style={{ margin: "2px 0", fontSize: "13px", color: "#666" }}>{instructor.email}</p>
                                <span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#000", fontSize: "11px" }}>No Reply</span>
                              </div>
                              <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#dc3545" }}
                                onClick={() => setMyProjects(myProjects.map(proj => proj.id === p.id ? { ...proj, collaborators: proj.collaborators.filter(id => id !== collabId) } : proj))}>
                                Remove
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d", marginTop: "5px" }}
                        onClick={() => { setShowCollaboratorSearch(null); setCollaboratorQuery(""); }}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add/Edit Project Modal */}
            {(showAddProject || editingProject) && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h2>{editingProject ? "Edit Project" : "Add New Project"}</h2>
                  <label style={styles.label}>Project Title</label>
                  <input style={styles.input} placeholder="Project Title"
                    value={editingProject ? editingProject.title : newProject.title}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, title: e.target.value }) : setNewProject({ ...newProject, title: e.target.value })} />
                  <label style={styles.label}>Course</label>
                  <select style={styles.input}
                    value={editingProject ? editingProject.courseId : newProject.courseId}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, courseId: parseInt(e.target.value) }) : setNewProject({ ...newProject, courseId: e.target.value })}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <label style={styles.label}>GitHub Link</label>
                  <input style={styles.input} placeholder="GitHub Link"
                    value={editingProject ? editingProject.githubLink : newProject.githubLink}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, githubLink: e.target.value }) : setNewProject({ ...newProject, githubLink: e.target.value })} />
                  <label style={styles.label}>Demo Video Link</label>
                  <input style={styles.input} placeholder="Demo Video Link (YouTube, Drive...)"
                    value={editingProject ? editingProject.demoVideo : newProject.demoVideo}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, demoVideo: e.target.value }) : setNewProject({ ...newProject, demoVideo: e.target.value })} />
                  <label style={styles.label}>Languages (comma separated)</label>
                  <input style={styles.input} placeholder="e.g. React, Python"
                    value={editingProject ? editingProject.languages : newProject.languages}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, languages: e.target.value }) : setNewProject({ ...newProject, languages: e.target.value })} />
                  <label style={styles.label}>Description</label>
                  <textarea style={styles.input} placeholder="Short Description"
                    value={editingProject ? editingProject.description : newProject.description}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, description: e.target.value }) : setNewProject({ ...newProject, description: e.target.value })} />
                  <label style={styles.label}>Project Report (PDF)</label>
                  <input type="file" accept=".pdf" style={{ ...styles.input, padding: "8px" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        editingProject
                          ? setEditingProject({ ...editingProject, report: file.name })
                          : setNewProject({ ...newProject, report: file.name });
                      }
                    }} />
                  {(editingProject?.report || newProject.report) && (
                    <p style={{ color: "#28a745", fontSize: "13px", marginBottom: "10px" }}>
                      ✅ Report: {editingProject ? editingProject.report : newProject.report}
                    </p>
                  )}
                  <label style={styles.label}>Visibility</label>
                  <select style={styles.input}
                    value={editingProject ? editingProject.visibility : newProject.visibility}
                    onChange={e => editingProject ? setEditingProject({ ...editingProject, visibility: e.target.value }) : setNewProject({ ...newProject, visibility: e.target.value })}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={styles.saveBtn} onClick={editingProject ? handleSaveEdit : handleAddProject}>
                      {editingProject ? "Save Changes" : "Add Project"}
                    </button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => { setShowAddProject(false); setEditingProject(null); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Flag Appeal - Req 61 */}
            {notifications.find(n => n.type === "flag" && !appealSent) && (
              <div style={{ ...styles.sectionCard, border: "1px solid #dc3545", marginTop: "20px" }}>
                <h3 style={{ color: "#dc3545" }}>🚩 One of your projects has been flagged</h3>
                <p>Your project "Network Simulator" was flagged for: <b>Suspected plagiarism</b></p>
                {!appealSent
                  ? <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => setShowAppealModal(true)}>Send Appeal</button>
                  : <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Appeal Sent</span>
                }
              </div>
            )}

            {showAppealModal && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h3>Send Appeal</h3>
                  <p>Explain your point of view regarding the flagged project:</p>
                  <textarea style={{ ...styles.input, height: "120px" }} placeholder="Write your appeal..." value={appealText} onChange={e => setAppealText(e.target.value)} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={styles.saveBtn} onClick={handleSendAppeal}>Send Appeal</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setShowAppealModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVITATIONS - Req 29, 30 */}
        {activePage === "invitations" && (
          <div>
            <h1>📩 Project Invitations</h1>
            {myInvitations.length === 0 && <p style={styles.empty}>No invitations yet.</p>}
            {myInvitations.map(inv => (
              <div key={inv.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{inv.projectTitle}</h3>
                  <span style={{ ...styles.badge, backgroundColor: inv.status === "accepted" ? "#28a745" : inv.status === "rejected" ? "#dc3545" : "#ffc107", color: inv.status === "pending" ? "#000" : "white" }}>
                    {inv.status}
                  </span>
                </div>
                <p><b>From:</b> {inv.fromName} ({inv.fromEmail})</p>
                {inv.status === "pending" && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#28a745" }} onClick={() => handleInvitationResponse(inv.id, "accepted")}>✅ Accept</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleInvitationResponse(inv.id, "rejected")}>❌ Reject</button>
                  </div>
                )}
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
                          <div key={i} style={{ ...styles.taskCard, marginTop: "6px" }}>
                            <div style={styles.projectHeader}>
                              <span><b>{t.title}</b></span>
                              <span style={{ ...styles.badge, backgroundColor: t.status === "completed" ? "#28a745" : t.status === "postponed" ? "#ffc107" : "#17a2b8", color: t.status === "postponed" ? "#000" : "white", fontSize: "11px" }}>{t.status}</span>
                            </div>
                            <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>{t.description}</p>
                            {t.deadline && <p style={{ fontSize: "13px", margin: 0 }}><b>Deadline:</b> {t.deadline}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {p.thesisDrafts && p.thesisDrafts.filter(d => d.isFinal).length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <b>Final Thesis Draft:</b>
                        {p.thesisDrafts.filter(d => d.isFinal).map((d, i) => (
                          <p key={i} style={{ margin: "4px 0" }}>📄 {d.name} — Uploaded: {d.uploadedAt}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
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
                {/* Full portfolio view - Req 51 */}
                {selectedPortfolio?.id === p.id && (
                  <div style={{ marginTop: "10px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4>Full Portfolio</h4>
                    <p><b>Name:</b> {p.name}</p>
                    <p><b>Email:</b> {p.email}</p>
                    <p><b>Major:</b> {p.major}</p>
                    <p><b>Skills:</b> {p.skills.join(", ")}</p>
                    <p><b>Total Projects:</b> {p.projects}</p>
                    <div style={{ marginTop: "10px" }}>
                      <b>Projects:</b>
                      {allProjects.filter(proj => proj.visibility === "public" && allPortfolios.find(port => port.id === p.id && port.email === (proj.studentEmail || ""))).length === 0
                        ? allProjects.filter(proj => proj.visibility === "public").slice(0, p.projects).map(proj => (
                          <div key={proj.id} style={{ ...styles.taskCard, marginTop: "8px" }}>
                            <div style={styles.projectHeader}>
                              <b style={{ color: "#003366" }}>{proj.title}</b>
                              <span>⭐ {proj.rating}/5</span>
                            </div>
                            <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>{proj.description}</p>
                            <p style={{ fontSize: "13px", margin: "4px 0" }}><b>Course:</b> {courses.find(c => c.id === proj.courseId)?.name}</p>
                            <p style={{ fontSize: "13px", margin: "4px 0" }}><b>Languages:</b> {Array.isArray(proj.languages) ? proj.languages.join(", ") : proj.languages}</p>
                          </div>
                        ))
                        : null
                      }
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
              <input style={{ ...styles.input, flex: 1 }}
                placeholder="Search by name or course..."
                value={instructorSearch}
                onChange={e => setInstructorSearch(e.target.value)} />
            </div>
            {[
              { id: 4, name: "Omar Salem", email: "omar.salem@guc.edu.eg", courses: ["Software Engineering", "Bachelor Project"], bio: "Professor in CS with 10 years experience", researchInterests: "AI, ML", education: "PhD MIT" },
              { id: 5, name: "Mona Tarek", email: "mona.tarek@guc.edu.eg", courses: ["Computer Networks", "Bachelor Project"], bio: "Associate Professor in Networks", researchInterests: "Networks, Security", education: "PhD Cairo University" },
            ].filter(inst =>
              inst.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
              inst.courses.some(c => c.toLowerCase().includes(instructorSearch.toLowerCase()))
            ).map(inst => (
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

        {/* INTERNSHIPS - Req 79-84, 89, 90 */}
        {activePage === "internships" && (
          <div>
            <h1>Internships</h1>
            <div style={styles.filterRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="Search by title or company name..." value={internshipSearch} onChange={e => setInternshipSearch(e.target.value)} />
              <select style={{ ...styles.input, width: "180px" }} value={internshipCompanyFilter} onChange={e => setInternshipCompanyFilter(e.target.value)}>
                <option value="">All Companies</option>
                <option value="6">TechCorp</option>
                <option value="7">DataSoft</option>
              </select>
              <select style={{ ...styles.input, width: "160px" }} value={filterDuration} onChange={e => setFilterDuration(e.target.value)}>
                <option value="">All Durations</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
              </select>
              <select style={{ ...styles.input, width: "160px" }} value={internshipSortBy} onChange={e => setInternshipSortBy(e.target.value)}>
                <option value="date">Sort by Date Posted</option>
              </select>
            </div>

            {filteredInternships.map(i => {
              const employer = users.find(u => u.id === i.employerId);
              return (
              <div key={i.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{i.title}</h3>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ ...styles.badge, backgroundColor: i.status === "hiring" ? "#28a745" : "#6c757d" }}>
                      {i.status === "hiring" ? "Now Hiring" : "Position Filled"}
                    </span>
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }}
                      onClick={() => setSelectedInternshipView(selectedInternshipView?.id === i.id ? null : i)}>
                      {selectedInternshipView?.id === i.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>
                <p><b>Company:</b> {employer?.companyName || "Unknown"}</p>
                <p><b>Duration:</b> {i.duration} | <b>Deadline:</b> {i.deadline}</p>

                {/* Full internship details when selected */}
                {selectedInternshipView?.id === i.id && (
                  <div style={{ marginTop: "12px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4 style={{ color: "#003366", marginTop: 0 }}>Full Internship Details</h4>
                    <p><b>Company:</b> {employer?.companyName || "Unknown"}</p>
                    <p><b>Description:</b> {i.details}</p>
                    <p><b>Skills Required:</b> {i.skills.join(", ")}</p>
                    <p><b>Languages:</b> {i.languages.join(", ")}</p>
                    <p><b>Duration:</b> {i.duration}</p>
                    <p><b>Deadline:</b> {i.deadline}</p>
                    <p><b>Posted:</b> {i.postedAt}</p>
                  </div>
                )}

                <div style={{ marginTop: "10px" }}>
                  {appliedInternships.includes(i.id)
                    ? <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Applied</span>
                    : i.status === "hiring" && (
                      <button style={styles.saveBtn} onClick={() => setShowApplyModal(i.id)}>Apply Now</button>
                    )}
                </div>
              </div>
              );
            })}

            {showApplyModal && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h2>Apply for Internship</h2>
                  <p>Write a cover letter explaining why you fit this role:</p>
                  <textarea style={{ ...styles.input, height: "120px" }} placeholder="Cover letter..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={styles.saveBtn} onClick={handleApply}>Submit Application</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setShowApplyModal(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: "30px" }}>
              <h2>My Applied Internships</h2>
              {appliedInternships.length === 0 && <p style={styles.empty}>You haven't applied to any internships yet.</p>}
              {appliedInternships.map(id => {
                const i = internships.find(x => x.id === id);
                return i ? (
                  <div key={id} style={styles.projectCard}>
                    <h3 style={{ color: "#003366" }}>{i.title}</h3>
                    <p><b>Duration:</b> {i.duration}</p>
                    <span style={{ ...styles.badge, backgroundColor: "#17a2b8" }}>Applied ✅</span>
                  </div>
                ) : null;
              })}
            </div>

            {/* Completed Internships - Req 90 */}
            <div style={{ marginTop: "30px" }}>
              <h2>✅ Completed Internships</h2>
              {completedInternships.length === 0 && <p style={styles.empty}>No completed internships yet.</p>}
              {completedInternships.map(i => (
                <div key={i.id} style={styles.projectCard}>
                  <h3 style={{ color: "#003366" }}>{i.title}</h3>
                  <p><b>Company:</b> {i.company}</p>
                  <p><b>Duration:</b> {i.duration}</p>
                  <p><b>Completed:</b> {i.completedAt}</p>
                  <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Completed — Shown on Portfolio</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES - Req 68, 69, 70 */}
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
                      onClick={() => {
                        setSelectedChat(contact);
                        const key2 = getChatKey(contact.id);
                        setChatMessages({ ...chatMessages, [key2]: JSON.parse(localStorage.getItem(key2) || "[]") });
                      }}>
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
                          const isMe = msg.senderId === (currentUser?.id || 1);
                          return (
                            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "10px" }}>
                              <div style={{ backgroundColor: isMe ? "#003366" : "#e0e0e0", color: isMe ? "white" : "#333", padding: "10px 14px", borderRadius: "18px", maxWidth: "70%" }}>
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
                      <input style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") sendMessage(selectedChat); }} />
                      <button style={styles.saveBtn} onClick={() => sendMessage(selectedChat)}>Send</button>
                    </div>
                  </div>
                </div>
              ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Select a conversation</div>}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS - Req 35, 36, 91 */}
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

        {/* FAVORITES - Req 65, 66 */}
        {activePage === "favorites" && (
          <div>
            <h1>Favorites</h1>
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

        {/* COLLABORATING PROJECTS */}
        {activePage === "collaborating" && (
          <div>
            <h1>🤝 Collaborating Projects</h1>
            <p style={{ color: "#666" }}>Projects you are collaborating on — you can only update your assigned task status</p>
            {collaboratingProjects.length === 0 && <p style={styles.empty}>You are not collaborating on any projects yet.</p>}
            {collaboratingProjects.map(p => (
              <div key={p.id} style={styles.projectCard}>
                <h3 style={{ color: "#003366" }}>{p.title}</h3>
                <p style={{ color: "#666" }}>{p.description}</p>
                <p><b>Course:</b> {courses.find(c => c.id === p.courseId)?.name}</p>
                <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                <p><b>Created:</b> {p.createdAt}</p>

                {/* Instructor comments on project - Req 40 */}
                {(p.comments || []).length > 0 && (
                  <div style={{ backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
                    <b>💬 Instructor Feedback on Project:</b>
                    {p.comments.map((c, i) => (
                      <p key={i} style={{ margin: "4px 0", fontSize: "13px" }}>{c.text} — <i>{c.instructorName}</i></p>
                    ))}
                  </div>
                )}

                <h4 style={{ marginTop: "15px" }}>My Assigned Tasks:</h4>
                {(p.tasks || []).filter(t => t.assignedTo === currentUser?.email).length === 0
                  ? <p style={styles.empty}>No tasks assigned to you yet.</p>
                  : (p.tasks || []).filter(t => t.assignedTo === currentUser?.email).map((task, i) => (
                    <div key={i} style={styles.taskCard}>
                      <div style={styles.projectHeader}>
                        <b>{task.title}</b>
                        <span style={{ ...styles.badge, backgroundColor: task.status === "completed" ? "#28a745" : task.status === "postponed" ? "#ffc107" : "#17a2b8", color: task.status === "postponed" ? "#000" : "white" }}>
                          {task.status}
                        </span>
                      </div>
                      <p style={{ color: "#666", fontSize: "13px" }}>{task.description}</p>
                      {task.deadline && <p style={{ fontSize: "13px" }}><b>Deadline:</b> {task.deadline}</p>}

                      {/* Instructor comments on this task - Req 40 */}
                      {(task.comments || []).length > 0 && (
                        <div style={{ backgroundColor: "#e8f0fe", padding: "8px", borderRadius: "6px", marginTop: "6px" }}>
                          <b style={{ fontSize: "13px" }}>💬 Instructor Comments on Task:</b>
                          {task.comments.map((c, ci) => (
                            <p key={ci} style={{ margin: "3px 0", fontSize: "13px" }}>{c.text} — <i>{c.instructorName}</i></p>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: "8px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Update Status:</label>
                        <select style={{ marginLeft: "10px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px" }}
                          value={task.status}
                          onChange={e => {
                            const newStatus = e.target.value;
                            setCollaboratingProjects(prev => prev.map(proj => proj.id === p.id ? {
                              ...proj, tasks: proj.tasks.map(t => t.assignedTo === currentUser?.email && t.title === task.title ? { ...t, status: newStatus } : t)
                            } : proj));
                          }}>
                          <option value="pending">Pending</option>
                          <option value="postponed">Postponed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        )}

        {/* STATISTICS - Req 72 */}
        {activePage === "statistics" && (
          <div>
            <h1>My Statistics</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "30px" }}>
              {[
                { label: "Total Projects", value: myProjects.length, color: "#003366" },
                { label: "Public Projects", value: myProjects.filter(p => p.visibility === "public").length, color: "#28a745" },
                { label: "Private Projects", value: myProjects.filter(p => p.visibility === "private").length, color: "#dc3545" },
              ].map((stat, i) => (
                <div key={i} style={{ ...styles.sectionCard, textAlign: "center" }}>
                  <div style={{ fontSize: "40px", fontWeight: "bold", color: stat.color }}>{stat.value}</div>
                  <div style={{ color: "#666" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Languages percentage */}
            <div style={styles.sectionCard}>
              <h2>Programming Languages Used</h2>
              {(() => {
                const langCount = {};
                myProjects.forEach(p => {
                  const langs = Array.isArray(p.languages) ? p.languages : p.languages?.split(",") || [];
                  langs.forEach(l => { const k = l.trim(); if (k) langCount[k] = (langCount[k] || 0) + 1; });
                });
                const total = Object.values(langCount).reduce((a, b) => a + b, 0);
                if (total === 0) return <p style={styles.empty}>No languages data yet.</p>;
                return Object.entries(langCount).map(([lang, count]) => (
                  <div key={lang} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span><b>{lang}</b></span>
                      <span>{Math.round((count / total) * 100)}%</span>
                    </div>
                    <div style={{ backgroundColor: "#e0e0e0", borderRadius: "4px", height: "10px" }}>
                      <div style={{ backgroundColor: "#003366", width: `${(count / total) * 100}%`, height: "10px", borderRadius: "4px" }} />
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Top Collaborators per project - Req 72 */}
            <div style={styles.sectionCard}>
              <h2>Top Collaborators Per Project</h2>
              {myProjects.filter(p => (p.collaborators || []).length > 0).length === 0
                ? <p style={styles.empty}>No collaborators yet.</p>
                : myProjects.filter(p => (p.collaborators || []).length > 0).map(p => (
                  <div key={p.id} style={{ marginBottom: "15px" }}>
                    <b>{p.title}</b>
                    <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                      {(p.collaborators || []).map(id => {
                        const collab = allUsers.find(u => u.id === id);
                        return collab ? (
                          <span key={id} style={{ ...styles.badge, backgroundColor: "#17a2b8" }}>
                            {collab.firstName} {collab.lastName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, Arial, sans-serif" },
  sidebar: { width: "240px", backgroundColor: "#003366", color: "white", padding: "20px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  logo: { color: "white", marginBottom: "5px", fontSize: "18px" },
  roleTag: { color: "#a0c4ff", fontSize: "12px", marginBottom: "20px" },
  navItem: { padding: "10px 15px", cursor: "pointer", borderRadius: "8px", marginBottom: "5px", fontSize: "13px" },
  activeNav: { backgroundColor: "#0055a5" },
  logoutBtn: { marginTop: "auto", padding: "10px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  main: { flex: 1, padding: "40px", backgroundColor: "#f0f2f5", overflowY: "auto" },
  subtitle: { color: "#666", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", padding: "25px", borderRadius: "12px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  cardIcon: { fontSize: "35px", marginBottom: "10px" },
  cardLabel: { fontSize: "14px", fontWeight: "bold", color: "#003366" },
  profileCard: { display: "flex", gap: "20px", backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  profilePicBox: { textAlign: "center" },
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
  empty: { color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" },
};

export default StudentDashboard;