import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { courses, projects as allProjects } from "../data/mockData";

function InstructorDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");

  const [profile, setProfile] = useState({ bio: currentUser?.bio || "", researchInterests: currentUser?.researchInterests || "", education: currentUser?.education || "", profilePic: null });
  const [profileSaved, setProfileSaved] = useState(false);
  const [linkedCourses, setLinkedCourses] = useState(currentUser?.linkedCourses || [3]);
  const [linkRequests, setLinkRequests] = useState([{ id: 1, courseId: 1, status: "pending" }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [projectComments, setProjectComments] = useState({ 1: [{ id: 1, text: "Great progress! Keep it up.", createdAt: "2024-02-15", instructorName: "Omar Salem" }], 2: [], 3: [], 4: [], 5: [] });
  const [taskComments, setTaskComments] = useState({});
  const [ratings, setRatings] = useState({ 1: 4, 2: 3, 3: 5, 4: 4, 5: 0 });
  const [flagReason, setFlagReason] = useState("");
  const [showFlagModal, setShowFlagModal] = useState(null);
  const [flaggedProjects, setFlaggedProjects] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    const base = [
      { id: 1, message: "Shaza Ahmed invited you to join project 'GUC Portfolio System'", read: false, time: "2 hours ago" },
      { id: 2, message: "Admin approved your link request to Software Engineering", read: true, time: "1 day ago" },
      { id: 3, message: "New message from student Ahmed Hassan", read: false, time: "3 hours ago" },
    ];
    const fromStorage = JSON.parse(localStorage.getItem(`instructorNotifications_${currentUser?.id}`) || "[]");
    return [...base, ...fromStorage];
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [myInvitations, setMyInvitations] = useState([
    { id: 1, projectId: 1, projectTitle: "GUC Portfolio System", fromName: "Shaza Ahmed", fromEmail: "shaza.ahmed@student.guc.edu.eg", course: "Software Engineering", status: "pending" },
    { id: 2, projectId: 5, projectTitle: "Bachelor Thesis - Smart Campus", fromName: "Shaza Ahmed", fromEmail: "shaza.ahmed@student.guc.edu.eg", course: "Bachelor Project", status: "pending" },
  ]);
  const [contacts] = useState([
    { id: 1, name: "Shaza Ahmed", role: "student" },
    { id: 2, name: "Ahmed Hassan", role: "student" },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});

  const getChatKey = (otherId) => {
    const myId = currentUser?.id || 4;
    return `chat_${Math.min(myId, otherId)}_${Math.max(myId, otherId)}`;
  };

  const sendMessage = (contact) => {
    if (!newMessage.trim()) return;
    const key = getChatKey(contact.id);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const msg = { id: Date.now(), senderId: currentUser?.id || 4, senderName: `${currentUser?.firstName} ${currentUser?.lastName}`, text: newMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    existing.push(msg);
    localStorage.setItem(key, JSON.stringify(existing));
    setChatMessages({ ...chatMessages, [key]: existing });
    const recipientNotifs = JSON.parse(localStorage.getItem(`studentNotifications_${contact.id}`) || "[]");
    recipientNotifs.push({ id: Date.now(), message: `New message from ${currentUser?.firstName} ${currentUser?.lastName}`, read: false, time: "Just now", type: "message" });
    localStorage.setItem(`studentNotifications_${contact.id}`, JSON.stringify(recipientNotifs));
    setNewMessage("");
  };

  const allPortfolios = [
    { id: 1, name: "Shaza Ahmed", email: "shaza.ahmed@student.guc.edu.eg", major: "Computer Science", skills: ["React", "Python"], projects: 5 },
    { id: 2, name: "Ahmed Hassan", email: "ahmed.hassan@student.guc.edu.eg", major: "Engineering", skills: ["Java", "C++"], projects: 3 },
    { id: 3, name: "Sara Khaled", email: "sara.khaled@student.guc.edu.eg", major: "Computer Science", skills: ["Python", "ML"], projects: 7 },
  ];
  const allInstructors = [
    { id: 4, name: "Omar Salem", email: "omar.salem@guc.edu.eg", courses: ["Software Engineering", "Bachelor Project"], bio: "Professor in CS with 10 years experience", researchInterests: "AI, ML", education: "PhD MIT" },
    { id: 5, name: "Mona Tarek", email: "mona.tarek@guc.edu.eg", courses: ["Computer Networks", "Bachelor Project"], bio: "Associate Professor in Networks", researchInterests: "Networks, Security", education: "PhD Cairo University" },
  ];

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleSaveProfile = () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); };
  const handleLinkRequest = (courseId) => {
    const courseName = courses.find(c => c.id === courseId)?.name;
    if (linkedCourses.includes(courseId)) {
      setLinkRequests([...linkRequests, { id: Date.now(), courseId, status: "pending", type: "unlink" }]);
      // Save to localStorage for admin to see
      const existing = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      existing.push({ id: Date.now(), message: `${currentUser?.firstName} ${currentUser?.lastName} requested to UNLINK from ${courseName}`, read: false, time: "Just now" });
      localStorage.setItem("adminNotifications", JSON.stringify(existing));
      alert("Unlink request sent to admin for approval!");
    } else {
      setLinkRequests([...linkRequests, { id: Date.now(), courseId, status: "pending", type: "link" }]);
      // Save to localStorage for admin to see
      const existing = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      existing.push({ id: Date.now(), message: `${currentUser?.firstName} ${currentUser?.lastName} requested to LINK to ${courseName}`, read: false, time: "Just now" });
      localStorage.setItem("adminNotifications", JSON.stringify(existing));
      alert("Link request sent to admin!");
    }
  };
  const handleAddComment = (projectId) => {
    if (!newComment.trim()) return;
    const comment = { id: Date.now(), text: newComment, createdAt: new Date().toISOString().split("T")[0], instructorName: `${currentUser?.firstName} ${currentUser?.lastName}` };
    setProjectComments({ ...projectComments, [projectId]: [...(projectComments[projectId] || []), comment] });
    setNotifications([...notifications, { id: Date.now(), message: `You left feedback on a project`, read: false, time: "Just now" }]);
    setNewComment("");
  };
  const handleDeleteComment = (projectId, commentId) => setProjectComments({ ...projectComments, [projectId]: projectComments[projectId].filter(c => c.id !== commentId) });
  const handleEditComment = (projectId, commentId) => {
    if (!editingCommentText.trim()) return;
    setProjectComments({ ...projectComments, [projectId]: projectComments[projectId].map(c => c.id === commentId ? { ...c, text: editingCommentText } : c) });
    setEditingComment(null); setEditingCommentText("");
  };
  const handleAddTaskComment = (taskId) => {
    const text = taskComments[`input_${taskId}`];
    if (!text?.trim()) return;
    const comment = { id: Date.now(), text, instructorName: `${currentUser?.firstName} ${currentUser?.lastName}` };
    setTaskComments({ ...taskComments, [taskId]: [...(taskComments[taskId] || []), comment], [`input_${taskId}`]: "" });
  };
  const handleEditTaskComment = (taskId, commentId) => {
    const newText = taskComments[`editText_${commentId}`];
    if (!newText?.trim()) return;
    setTaskComments({ ...taskComments, [taskId]: taskComments[taskId].map(c => c.id === commentId ? { ...c, text: newText } : c), [`editing_${commentId}`]: false, [`editText_${commentId}`]: "" });
  };
  const handleRate = (projectId, rating) => setRatings({ ...ratings, [projectId]: rating });
  const handleFlag = (projectId) => {
    if (!flagReason.trim()) { alert("Please enter a reason"); return; }
    setFlaggedProjects([...flaggedProjects, { projectId, reason: flagReason }]);
    // Notify admin via localStorage
    const adminNotifs = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
    adminNotifs.push({ id: Date.now(), message: `Project #${projectId} was flagged by ${currentUser?.firstName} ${currentUser?.lastName} - Reason: ${flagReason}`, read: false, time: "Just now" });
    localStorage.setItem("adminNotifications", JSON.stringify(adminNotifs));
    // Notify student via localStorage
    const studentNotifs = JSON.parse(localStorage.getItem(`studentNotifications_${projectId}`) || "[]");
    studentNotifs.push({ id: Date.now(), message: `Your project has been flagged - Reason: ${flagReason}`, read: false, time: "Just now", type: "flag" });
    localStorage.setItem(`studentNotifications_${projectId}`, JSON.stringify(studentNotifs));
    setFlagReason(""); setShowFlagModal(null);
    alert("Project flagged!");
  };
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const toggleRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const unreadCount = notifications.filter(n => !n.read).length;

  const publicProjects = allProjects.filter(p => p.visibility === "public");
  const filteredProjects = publicProjects
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => filterCourse ? p.courseId === parseInt(filterCourse) : true)
    .filter(p => filterInstructor ? (() => { const ic = allInstructors.find(u => u.id === parseInt(filterInstructor))?.linkedCourses || []; return ic.includes(p.courseId); })() : true)
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

  const navItems = [
    { key: "home", label: "🏠 Home" },
    { key: "profile", label: "👤 My Profile" },
    { key: "courses", label: "📚 My Courses" },
    { key: "projects", label: "🔍 Search Projects" },
    { key: "invitations", label: `📩 Invitations ${myInvitations.filter(i => i.status === "pending").length > 0 ? `(${myInvitations.filter(i => i.status === "pending").length})` : ""}` },
    { key: "search-portfolios", label: "🎓 Search Portfolios" },
    { key: "search-instructors", label: "🔍 Search Instructors" },
    { key: "messages", label: "💬 Messages" },
    { key: "notifications", label: `🔔 Notifications ${unreadCount > 0 ? `(${unreadCount})` : ""}` },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>GUC Portfolio</h2>
        <p style={styles.roleTag}>Course Instructor</p>
        <nav>{navItems.map(item => (<div key={item.key} style={{ ...styles.navItem, ...(activePage === item.key ? styles.activeNav : {}) }} onClick={() => setActivePage(item.key)}>{item.label}</div>))}</nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.main}>

        {activePage === "home" && (
          <div>
            <h1>Welcome, {currentUser?.firstName}! 👋</h1>
            <p style={styles.subtitle}>Instructor Dashboard</p>
            <div style={styles.grid}>
              {[{ label: "My Profile", icon: "👤", key: "profile" }, { label: "My Courses", icon: "📚", key: "courses" }, { label: "Search Projects", icon: "🔍", key: "projects" }, { label: "Invitations", icon: "📩", key: "invitations" }, { label: "Search Portfolios", icon: "🎓", key: "search-portfolios" }, { label: "Search Instructors", icon: "🔍", key: "search-instructors" }, { label: "Messages", icon: "💬", key: "messages" }, { label: "Notifications", icon: "🔔", key: "notifications" }].map(card => (
                <div key={card.key} style={styles.card} onClick={() => setActivePage(card.key)}>
                  <div style={styles.cardIcon}>{card.icon}</div>
                  <div style={styles.cardLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Recommended Projects - Req 67 */}
            <div style={{ marginTop: "30px" }}>
              <h2>⭐ Recommended Projects</h2>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "15px" }}>Top rated public projects on the platform</p>
              {allProjects.filter(p => p.visibility === "public" && p.rating >= 3)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3)
                .map(p => (
                  <div key={p.id} style={styles.projectCard}>
                    <div style={styles.projectHeader}>
                      <h3 style={{ margin: 0, color: "#003366" }}>{p.title}</h3>
                      <span>⭐ {p.rating}/5</span>
                    </div>
                    <p style={{ color: "#666" }}>{p.description}</p>
                    <p><b>Course:</b> {courses.find(c => c.id === p.courseId)?.name}</p>
                    <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activePage === "profile" && (
          <div>
            <h1>My Profile</h1>
            <div style={styles.profileCard}>
              <div style={{ textAlign: "center" }}>
                {profile.profilePic ? <img src={profile.profilePic} alt="profile" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ fontSize: "60px" }}>👨‍🏫</div>}
                <label style={{ ...styles.saveBtn, cursor: "pointer", fontSize: "12px", padding: "5px 10px", display: "inline-block", marginTop: "8px" }}>
                  📷 Upload Photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setProfile({ ...profile, profilePic: reader.result }); reader.readAsDataURL(file); } }} />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <p><b>Name:</b> {currentUser?.firstName} {currentUser?.lastName}</p>
                <p><b>Email:</b> {currentUser?.email}</p>
                <p><b>Bio:</b> {profile.bio || "Not set"}</p>
                <p><b>Research Interests:</b> {profile.researchInterests || "Not set"}</p>
                <p><b>Education:</b> {profile.education || "Not set"}</p>
              </div>
            </div>
            <div style={styles.sectionCard}>
              <h2>Edit Profile</h2>
              <label style={styles.label}>Short Biography</label>
              <textarea style={{ ...styles.input, height: "80px" }} placeholder="Write a short bio..." value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
              <label style={styles.label}>Research Interests</label>
              <input style={styles.input} placeholder="e.g. AI, Machine Learning" value={profile.researchInterests} onChange={e => setProfile({ ...profile, researchInterests: e.target.value })} />
              <label style={styles.label}>Education Background</label>
              <input style={styles.input} placeholder="e.g. PhD from MIT" value={profile.education} onChange={e => setProfile({ ...profile, education: e.target.value })} />
              <button style={styles.saveBtn} onClick={handleSaveProfile}>{profileSaved ? "✅ Saved!" : "Save Changes"}</button>
            </div>
            <div style={styles.sectionCard}>
              <h2>My Linked Courses</h2>
              {linkedCourses.map(cId => { const course = courses.find(c => c.id === cId); return course ? (<div key={cId} style={styles.courseItem}><span>📚 {course.name} ({course.code})</span>{cId === 3 && <span style={styles.badge}>Auto-linked</span>}</div>) : null; })}
            </div>
          </div>
        )}

        {activePage === "courses" && (
          <div>
            <h1>My Courses</h1>
            <div style={styles.sectionCard}>
              <h2>All Available Courses</h2>
              {courses.map(c => {
                const isLinked = linkedCourses.includes(c.id);
                const isPending = linkRequests.find(r => r.courseId === c.id && r.status === "pending");
                return (
                  <div key={c.id} style={styles.courseRow}>
                    <div><b>{c.name}</b> <span style={{ color: "#888" }}>({c.code})</span>{c.id === 3 && <span style={{ ...styles.badge, marginLeft: "10px" }}>Auto Linked</span>}</div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {isLinked ? (<><span style={{ ...styles.badge, backgroundColor: "#28a745" }}>✅ Linked</span>{c.id !== 3 && <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545", fontSize: "13px", padding: "6px 12px" }} onClick={() => handleLinkRequest(c.id)}>Request Unlink</button>}</>)
                        : isPending ? (<span style={{ ...styles.badge, backgroundColor: "#ffc107", color: "#000" }}>⏳ Pending Approval</span>)
                        : (<button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 12px" }} onClick={() => handleLinkRequest(c.id)}>Request Link</button>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activePage === "projects" && (
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
                    {flaggedProjects.find(f => f.projectId === p.id)
                      ? <span style={{ ...styles.badge, backgroundColor: "#dc3545" }}>🚩 Flagged</span>
                      : <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545", fontSize: "12px", padding: "4px 10px" }} onClick={() => setShowFlagModal(p.id)}>🚩 Flag</button>}
                    <button style={{ ...styles.saveBtn, backgroundColor: "#17a2b8", fontSize: "12px", padding: "4px 10px" }}
                      onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}>
                      {selectedProject?.id === p.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>
                <p style={{ color: "#666" }}>{p.description}</p>
                <p><b>Course:</b> {courses.find(c => c.id === p.courseId)?.name}</p>
                <p><b>Languages:</b> {Array.isArray(p.languages) ? p.languages.join(", ") : p.languages}</p>
                <p><b>Created:</b> {p.createdAt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <b>Rate:</b>
                  {[1, 2, 3, 4, 5].map(star => (<span key={star} style={{ fontSize: "22px", cursor: "pointer", color: ratings[p.id] >= star ? "#ffc107" : "#ddd" }} onClick={() => handleRate(p.id, star)}>★</span>))}
                  <span style={{ color: "#666" }}>({ratings[p.id]}/5)</span>
                </div>

                {selectedProject?.id === p.id && (
                  <div style={{ marginTop: "15px" }}>
                    <div style={styles.detailSection}>
                      <h4 style={{ color: "#003366", marginTop: 0 }}>Full Project Details</h4>
                      <p><b>GitHub:</b> {p.githubLink ? <a href={p.githubLink} target="_blank" rel="noreferrer">{p.githubLink}</a> : "N/A"}</p>
                      <p><b>Demo:</b> {p.demoVideo ? <a href={p.demoVideo} target="_blank" rel="noreferrer">Watch</a> : "N/A"}</p>
                      <p><b>Rating:</b> ⭐ {p.rating}/5</p>
                      <p><b>Collaborators:</b> {(p.collaborators || []).length === 0 ? "None" : `${p.collaborators.length} collaborator(s)`}</p>
                    </div>

                    {(p.tasks || []).length > 0 && (
                      <div style={styles.detailSection}>
                        <h4>Tasks & Comments — Req 37</h4>
                        {p.tasks.map(task => (
                          <div key={task.id} style={styles.taskCard}>
                            <div style={styles.projectHeader}>
                              <b>{task.title}</b>
                              <span style={{ ...styles.badge, backgroundColor: task.status === "completed" ? "#28a745" : "#17a2b8" }}>{task.status}</span>
                            </div>
                            <p style={{ color: "#666", fontSize: "13px" }}>{task.description}</p>
                            {task.assignedTo && <p style={{ fontSize: "13px" }}><b>Assigned to:</b> {task.assignedTo}</p>}
                            {task.deadline && <p style={{ fontSize: "13px" }}><b>Deadline:</b> {task.deadline}</p>}
                            <div style={{ marginTop: "8px" }}>
                              <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Comments:</p>
                              {(taskComments[task.id] || []).map(tc => (
                                <div key={tc.id} style={styles.commentBox}>
                                  {taskComments[`editing_${tc.id}`] ? (
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <input style={{ ...styles.input, flex: 1, marginBottom: 0, fontSize: "13px", padding: "6px" }} value={taskComments[`editText_${tc.id}`] || tc.text} onChange={e => setTaskComments({ ...taskComments, [`editText_${tc.id}`]: e.target.value })} />
                                      <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "4px 8px", backgroundColor: "#28a745" }} onClick={() => handleEditTaskComment(task.id, tc.id)}>Save</button>
                                      <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "4px 8px", backgroundColor: "#6c757d" }} onClick={() => setTaskComments({ ...taskComments, [`editing_${tc.id}`]: false })}>Cancel</button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span><b>{tc.instructorName}:</b> {tc.text}</span>
                                      <div style={{ display: "flex", gap: "5px" }}>
                                        <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "2px 8px", backgroundColor: "#ffc107", color: "#000" }} onClick={() => setTaskComments({ ...taskComments, [`editing_${tc.id}`]: true, [`editText_${tc.id}`]: tc.text })}>Edit</button>
                                        <button style={styles.deleteBtn} onClick={() => setTaskComments({ ...taskComments, [task.id]: taskComments[task.id].filter(c => c.id !== tc.id) })}>✕</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                <input style={{ ...styles.input, flex: 1, marginBottom: 0, fontSize: "13px", padding: "6px" }} placeholder="Add comment on task..." value={taskComments[`input_${task.id}`] || ""} onChange={e => setTaskComments({ ...taskComments, [`input_${task.id}`]: e.target.value })} />
                                <button style={{ ...styles.saveBtn, padding: "6px 12px", fontSize: "13px" }} onClick={() => handleAddTaskComment(task.id)}>Add</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {p.thesisDrafts && p.thesisDrafts.filter(d => d.isFinal).length > 0 && (
                      <div style={styles.detailSection}>
                        <h4>Thesis Drafts — Req 38</h4>
                        {p.thesisDrafts.filter(d => d.isFinal).map(draft => (
                          <div key={draft.id} style={styles.taskCard}>
                            <div style={styles.projectHeader}>
                              <span>📄 {draft.name}</span>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{ ...styles.badge, backgroundColor: "#28a745" }}>Final Draft</span>
                                <a href={draft.url || "https://www.africau.edu/images/default/sample.pdf"} download={draft.name} target="_blank" rel="noreferrer" style={{ ...styles.saveBtn, fontSize: "11px", padding: "3px 8px", backgroundColor: "#17a2b8", textDecoration: "none", display: "inline-block" }}>⬇ Download</a>
                              </div>
                            </div>
                            <p style={{ fontSize: "13px", color: "#888" }}>Uploaded: {draft.uploadedAt}</p>
                            <div style={{ marginTop: "8px" }}>
                              <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Comments on this draft:</p>
                              {(taskComments[`draft_${draft.id}`] || []).map(tc => (
                                <div key={tc.id} style={styles.commentBox}>
                                  {taskComments[`editing_${tc.id}`] ? (
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <input style={{ ...styles.input, flex: 1, marginBottom: 0, fontSize: "13px", padding: "6px" }} value={taskComments[`editText_${tc.id}`] || tc.text} onChange={e => setTaskComments({ ...taskComments, [`editText_${tc.id}`]: e.target.value })} />
                                      <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "4px 8px", backgroundColor: "#28a745" }} onClick={() => setTaskComments({ ...taskComments, [`draft_${draft.id}`]: taskComments[`draft_${draft.id}`].map(c => c.id === tc.id ? { ...c, text: taskComments[`editText_${tc.id}`] } : c), [`editing_${tc.id}`]: false })}>Save</button>
                                      <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "4px 8px", backgroundColor: "#6c757d" }} onClick={() => setTaskComments({ ...taskComments, [`editing_${tc.id}`]: false })}>Cancel</button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span><b>{tc.instructorName}:</b> {tc.text}</span>
                                      <div style={{ display: "flex", gap: "5px" }}>
                                        <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "2px 8px", backgroundColor: "#ffc107", color: "#000" }} onClick={() => setTaskComments({ ...taskComments, [`editing_${tc.id}`]: true, [`editText_${tc.id}`]: tc.text })}>Edit</button>
                                        <button style={styles.deleteBtn} onClick={() => setTaskComments({ ...taskComments, [`draft_${draft.id}`]: taskComments[`draft_${draft.id}`].filter(c => c.id !== tc.id) })}>✕</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                <input style={{ ...styles.input, flex: 1, marginBottom: 0, fontSize: "13px", padding: "6px" }} placeholder="Add comment on this draft..." value={taskComments[`draftInput_${draft.id}`] || ""} onChange={e => setTaskComments({ ...taskComments, [`draftInput_${draft.id}`]: e.target.value })} />
                                <button style={{ ...styles.saveBtn, padding: "6px 12px", fontSize: "13px" }} onClick={() => { const text = taskComments[`draftInput_${draft.id}`]; if (!text?.trim()) return; const comment = { id: Date.now(), text, instructorName: `${currentUser?.firstName} ${currentUser?.lastName}` }; setTaskComments({ ...taskComments, [`draft_${draft.id}`]: [...(taskComments[`draft_${draft.id}`] || []), comment], [`draftInput_${draft.id}`]: "" }); }}>Add</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={styles.detailSection}>
                      <h4>Project Comments & Feedback — Req 38</h4>
                      {(projectComments[p.id] || []).length === 0 && <p style={styles.empty}>No comments yet.</p>}
                      {(projectComments[p.id] || []).map(c => (
                        <div key={c.id} style={styles.commentBox}>
                          {editingComment === c.id ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <input style={{ ...styles.input, flex: 1, marginBottom: 0, fontSize: "13px", padding: "6px" }} value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} />
                              <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "4px 8px", backgroundColor: "#28a745" }} onClick={() => handleEditComment(p.id, c.id)}>Save</button>
                              <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "4px 8px", backgroundColor: "#6c757d" }} onClick={() => setEditingComment(null)}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div><span><b>{c.instructorName}:</b> {c.text}</span><div><small style={{ color: "#999" }}>{c.createdAt}</small></div></div>
                              <div style={{ display: "flex", gap: "5px" }}>
                                <button style={{ ...styles.saveBtn, fontSize: "11px", padding: "2px 8px", backgroundColor: "#ffc107", color: "#000" }} onClick={() => { setEditingComment(c.id); setEditingCommentText(c.text); }}>Edit</button>
                                <button style={styles.deleteBtn} onClick={() => handleDeleteComment(p.id, c.id)}>✕</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <input style={{ ...styles.input, flex: 1, marginBottom: 0 }} placeholder="Add comment on project..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                        <button style={styles.saveBtn} onClick={() => handleAddComment(p.id)}>Add</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {showFlagModal && (
              <div style={styles.modal}>
                <div style={styles.modalBox}>
                  <h3>🚩 Flag Project</h3>
                  <textarea style={{ ...styles.input, height: "100px" }} placeholder="e.g. Suspected plagiarism..." value={flagReason} onChange={e => setFlagReason(e.target.value)} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => handleFlag(showFlagModal)}>Flag Project</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={() => setShowFlagModal(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activePage === "invitations" && (
          <div>
            <h1>📩 Project Invitations</h1>
            <p style={{ color: "#666" }}>Students can invite you to review their projects</p>
            {myInvitations.length === 0 && <p style={styles.empty}>No invitations yet.</p>}
            {myInvitations.map(inv => (
              <div key={inv.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={{ margin: 0, color: "#003366" }}>{inv.projectTitle}</h3>
                  <span style={{ ...styles.badge, backgroundColor: inv.status === "accepted" ? "#28a745" : inv.status === "rejected" ? "#dc3545" : "#ffc107", color: inv.status === "pending" ? "#000" : "white" }}>{inv.status}</span>
                </div>
                <p><b>From:</b> {inv.fromName} ({inv.fromEmail})</p>
                <p><b>Course:</b> {inv.course}</p>
                {inv.status === "pending" && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#28a745" }} onClick={() => { setMyInvitations(myInvitations.map(i => i.id === inv.id ? { ...i, status: "accepted" } : i)); setNotifications([...notifications, { id: Date.now(), message: `You accepted invitation to join '${inv.projectTitle}'`, read: false, time: "Just now" }]); }}>✅ Accept</button>
                    <button style={{ ...styles.saveBtn, backgroundColor: "#dc3545" }} onClick={() => setMyInvitations(myInvitations.map(i => i.id === inv.id ? { ...i, status: "rejected" } : i))}>❌ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activePage === "search-portfolios" && (
          <div>
            <h1>Search Portfolios</h1>
            <div style={styles.filterRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="Search by name or email..." value={portfolioSearch} onChange={e => setPortfolioSearch(e.target.value)} />
              <select style={{ ...styles.input, width: "200px" }} value={filterMajor} onChange={e => setFilterMajor(e.target.value)}>
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
                    <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#17a2b8" }} onClick={() => setSelectedPortfolio(selectedPortfolio?.id === p.id ? null : p)}>{selectedPortfolio?.id === p.id ? "Hide Profile" : "View Profile"}</button>
                  </div>
                </div>
                <p><b>Email:</b> {p.email}</p>
                <p><b>Major:</b> {p.major}</p>
                <p><b>Skills:</b> {p.skills.join(", ")}</p>
                {selectedPortfolio?.id === p.id && (
                  <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h4 style={{ color: "#003366", marginTop: 0 }}>Full Portfolio</h4>
                    <p><b>Name:</b> {p.name}</p><p><b>Email:</b> {p.email}</p><p><b>Major:</b> {p.major}</p><p><b>Skills:</b> {p.skills.join(", ")}</p><p><b>Total Projects:</b> {p.projects}</p>
                    <div style={{ marginTop: "10px" }}>
                      <b>Projects:</b>
                      {allProjects.filter(proj => proj.visibility === "public").slice(0, p.projects).map(proj => (
                        <div key={proj.id} style={{ backgroundColor: "white", padding: "10px", borderRadius: "8px", marginTop: "8px", border: "1px solid #eee" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <b style={{ color: "#003366" }}>{proj.title}</b>
                            <span>⭐ {proj.rating}/5</span>
                          </div>
                          <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>{proj.description}</p>
                          <p style={{ fontSize: "13px", margin: "4px 0" }}><b>Course:</b> {courses.find(c => c.id === proj.courseId)?.name}</p>
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
                  <button style={{ ...styles.saveBtn, fontSize: "13px", padding: "6px 14px" }} onClick={() => setSelectedInstructor(selectedInstructor?.id === inst.id ? null : inst)}>{selectedInstructor?.id === inst.id ? "Hide Profile" : "View Profile"}</button>
                </div>
                <p style={{ color: "#666", margin: "4px 0" }}>{inst.email}</p>
                {selectedInstructor?.id === inst.id && (
                  <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                    <p><b>Bio:</b> {inst.bio}</p><p><b>Research Interests:</b> {inst.researchInterests}</p><p><b>Education:</b> {inst.education}</p>
                    <p><b>Linked Courses:</b></p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                      {inst.courses.map((course, i) => (<span key={i} style={{ ...styles.badge, backgroundColor: "#003366" }}>📚 {course}</span>))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
                          const isMe = msg.senderId === (currentUser?.id || 4);
                          return (
                            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "10px" }}>
                              <div style={{ backgroundColor: isMe ? "#1a4a7a" : "#e0e0e0", color: isMe ? "white" : "#333", padding: "10px 14px", borderRadius: "18px", maxWidth: "70%" }}>
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

        {activePage === "notifications" && (
          <div>
            <div style={styles.pageHeader}>
              <h1>Notifications</h1>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={{ ...styles.saveBtn, backgroundColor: "#6c757d" }} onClick={markAllRead}>Mark All as Read</button>
                <button style={{ ...styles.saveBtn, backgroundColor: notificationsEnabled ? "#dc3545" : "#28a745" }} onClick={() => setNotificationsEnabled(!notificationsEnabled)}>{notificationsEnabled ? "🔕 Turn Off Notifications" : "🔔 Turn On Notifications"}</button>
              </div>
            </div>
            {!notificationsEnabled && <div style={{ backgroundColor: "#fff3cd", padding: "12px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #ffc107" }}>⚠️ Notifications are turned off.</div>}
            {notifications.map(n => (
              <div key={n.id} style={{ ...styles.projectCard, borderLeft: n.read ? "4px solid #ddd" : "4px solid #003366" }}>
                <div style={styles.projectHeader}>
                  <span>{n.read ? "📭" : "📬"} {n.message}</span>
                  <button style={{ ...styles.saveBtn, fontSize: "12px", padding: "4px 10px", backgroundColor: "#6c757d" }} onClick={() => toggleRead(n.id)}>{n.read ? "Mark Unread" : "Mark Read"}</button>
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
  sidebar: { width: "240px", backgroundColor: "#1a4a7a", color: "white", padding: "20px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  logo: { color: "white", marginBottom: "5px", fontSize: "18px" },
  roleTag: { color: "#a0c4ff", fontSize: "12px", marginBottom: "20px" },
  navItem: { padding: "12px 15px", cursor: "pointer", borderRadius: "8px", marginBottom: "5px", fontSize: "14px" },
  activeNav: { backgroundColor: "#0055a5" },
  logoutBtn: { marginTop: "auto", padding: "10px", backgroundColor: "#cc0000", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  main: { flex: 1, padding: "40px", backgroundColor: "#f0f2f5", overflowY: "auto" },
  subtitle: { color: "#666", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  cardIcon: { fontSize: "40px", marginBottom: "10px" },
  cardLabel: { fontSize: "16px", fontWeight: "bold", color: "#003366" },
  profileCard: { display: "flex", gap: "20px", backgroundColor: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
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
  courseItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", marginBottom: "8px" },
  courseRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", marginBottom: "8px" },
  detailSection: { backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "10px" },
  taskCard: { backgroundColor: "white", padding: "12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #eee" },
  commentBox: { backgroundColor: "#e8f0fe", padding: "10px", borderRadius: "8px", marginBottom: "8px", fontSize: "14px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", color: "#dc3545", fontSize: "14px", marginLeft: "10px" },
  empty: { color: "#999", fontStyle: "italic", textAlign: "center", padding: "20px" },
};

export default InstructorDashboard;