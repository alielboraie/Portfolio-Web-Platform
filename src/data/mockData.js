export const users = [
  {
    id: 1, role: "student",
    firstName: "Shaza", lastName: "Ahmed",
    email: "shaza.ahmed@student.guc.edu.eg", password: "123456",
    major: "Computer Science", skills: ["React", "Python"],
    linkedin: "https://linkedin.com/in/shaza", profilePic: null
  },
  {
    id: 2, role: "student",
    firstName: "Ahmed", lastName: "Hassan",
    email: "ahmed.hassan@student.guc.edu.eg", password: "123456",
    major: "Engineering", skills: ["Java", "C++"],
    linkedin: "", profilePic: null
  },
  {
    id: 3, role: "student",
    firstName: "Sara", lastName: "Khaled",
    email: "sara.khaled@student.guc.edu.eg", password: "123456",
    major: "Computer Science", skills: ["Python", "ML"],
    linkedin: "", profilePic: null
  },
  {
    id: 4, role: "instructor",
    firstName: "Omar", lastName: "Salem",
    email: "omar.salem@guc.edu.eg", password: "123456",
    bio: "Professor in Computer Science with 10 years of experience",
    researchInterests: "Artificial Intelligence, Machine Learning",
    education: "PhD from MIT", profilePic: null,
    linkedCourses: [1, 3]
  },
  {
    id: 5, role: "instructor",
    firstName: "Mona", lastName: "Tarek",
    email: "mona.tarek@guc.edu.eg", password: "123456",
    bio: "Associate Professor in Networks",
    researchInterests: "Computer Networks, Security",
    education: "PhD from Cairo University", profilePic: null,
    linkedCourses: [2, 3]
  },
  {
    id: 6, role: "employer",
    companyName: "TechCorp",
    email: "hr@techcorp.com", password: "123456",
    bio: "Leading software company in Egypt",
    address: "Smart Village, Cairo, Egypt",
    phone: "+20 2 12345678",
    profilePic: null, verified: true
  },
  {
    id: 7, role: "employer",
    companyName: "DataSoft",
    email: "hr@datasoft.com", password: "123456",
    bio: "Data analytics and AI solutions company",
    address: "Maadi, Cairo, Egypt",
    phone: "+20 2 87654321",
    profilePic: null, verified: false, rejected: false
  },
  {
    id: 8, role: "admin",
    firstName: "Admin", lastName: "GUC",
    email: "admin@guc.edu.eg", password: "admin123"
  },
  {
    id: 9, role: "admin",
    firstName: "Admin2", lastName: "",
    email: "admin2@guc.edu.eg", password: "admin123"
  }
];

export const courses = [
  { id: 1, name: "Software Engineering", code: "CSEN401" },
  { id: 2, name: "Computer Networks", code: "CSEN303" },
  { id: 3, name: "Bachelor Project", code: "CSEN901" },
  { id: 4, name: "Database Systems", code: "CSEN402" },
  { id: 5, name: "Operating Systems", code: "CSEN502" },
];

export const projects = [
  {
    id: 1, title: "GUC Portfolio System",
    studentId: 1, courseId: 1,
    githubLink: "https://github.com/example/portfolio",
    languages: ["React", "Node.js"],
    description: "A full portfolio platform for GUC students and employers",
    createdAt: "2024-01-15", rating: 4, visibility: "public",
    collaborators: [2], tasks: [
      { id: 1, title: "Design UI", description: "Design all screens", assignedTo: "shaza.ahmed@student.guc.edu.eg", status: "completed", deadline: "2024-02-01", comments: [{ id: 1, text: "Excellent UI design! Very clean and user-friendly.", instructorName: "Omar Salem" }] },
      { id: 2, title: "Build Login", description: "Implement login page", assignedTo: "ahmed.hassan@student.guc.edu.eg", status: "completed", deadline: "2024-02-10", comments: [{ id: 2, text: "Good work, but please add input validation.", instructorName: "Omar Salem" }] },
      { id: 3, title: "Build Dashboard", description: "Student dashboard", assignedTo: "shaza.ahmed@student.guc.edu.eg", status: "pending", deadline: "2024-03-01", comments: [] },
    ],
    comments: [
      { id: 1, instructorId: 4, text: "Great progress! Keep it up.", createdAt: "2024-02-15" }
    ],
    flagged: false, active: true
  },
  {
    id: 2, title: "Network Simulator",
    studentId: 1, courseId: 2,
    githubLink: "https://github.com/example/network-sim",
    languages: ["Python", "C++"],
    description: "Simulates various network protocols for educational purposes",
    createdAt: "2024-02-20", rating: 3, visibility: "public",
    collaborators: [], tasks: [
      { id: 1, title: "Research protocols", description: "Study TCP/IP", assignedTo: "", status: "completed", deadline: "2024-03-01" },
    ],
    comments: [], flagged: false, active: true
  },
  {
    id: 3, title: "AI Chatbot",
    studentId: 2, courseId: 1,
    githubLink: "https://github.com/example/chatbot",
    languages: ["Python", "TensorFlow"],
    description: "An AI-powered chatbot using natural language processing",
    createdAt: "2024-03-10", rating: 5, visibility: "public",
    collaborators: [], tasks: [], comments: [],
    flagged: false, active: true
  },
  {
    id: 4, title: "E-Commerce App",
    studentId: 3, courseId: 4,
    githubLink: "https://github.com/example/ecommerce",
    languages: ["React", "MongoDB", "Express"],
    description: "Full stack e-commerce application with payment integration",
    createdAt: "2024-01-05", rating: 4, visibility: "public",
    collaborators: [], tasks: [], comments: [],
    flagged: false, active: true
  },
  {
    id: 5, title: "Bachelor Thesis - Smart Campus",
    studentId: 1, courseId: 3,
    githubLink: "https://github.com/example/smart-campus",
    languages: ["React", "Python", "IoT"],
    description: "Smart campus system using IoT sensors and AI",
    createdAt: "2024-04-01", rating: 0, visibility: "public",
    collaborators: [], tasks: [],
    thesisDrafts: [
      { id: 1, name: "Draft 1 - Introduction", uploadedAt: "2024-04-10", isFinal: false, visible: true },
      { id: 2, name: "Draft 2 - Methodology", uploadedAt: "2024-04-20", isFinal: true, visible: true },
    ],
    comments: [], flagged: false, active: true
  },
];

export const internships = [
  {
    id: 1, employerId: 6,
    title: "Frontend Developer Intern",
    details: "Work on building modern React web applications for our clients.",
    skills: ["React", "CSS", "JavaScript"],
    duration: "3 months",
    deadline: "2026-08-01",
    languages: ["English", "Arabic"],
    status: "hiring",
    archived: false,
    postedAt: "2024-03-01",
    applicants: [
      { studentId: 1, coverLetter: "I am passionate about React...", status: "nominated" },
      { studentId: 2, coverLetter: "I have experience in frontend...", status: "pending" },
    ]
  },
  {
    id: 2, employerId: 6,
    title: "Backend Developer Intern",
    details: "Work on Node.js APIs and database design.",
    skills: ["Node.js", "MongoDB", "REST APIs"],
    duration: "6 months",
    deadline: "2024-01-01",
    languages: ["English"],
    status: "filled",
    archived: false,
    postedAt: "2023-07-15",
    applicants: [
      { studentId: 3, coverLetter: "I love backend development...", status: "accepted" },
    ]
  },
  {
    id: 3, employerId: 7,
    title: "Data Science Intern",
    details: "Analyze large datasets and build machine learning models.",
    skills: ["Python", "ML", "Data Analysis"],
    duration: "3 months",
    deadline: "2024-03-01",
    languages: ["English", "French"],
    status: "hiring",
    archived: false,
    postedAt: "2024-04-01",
    applicants: []
  },
];

export const notifications = [
  { id: 1, userId: 1, message: "Your project 'GUC Portfolio System' received a comment", read: false, time: "2 hours ago" },
  { id: 2, userId: 1, message: "Ahmed Hassan accepted your collaboration invitation", read: false, time: "1 day ago" },
  { id: 3, userId: 1, message: "Your internship application at TechCorp has been accepted! 🎉", read: true, time: "3 days ago" },
];

export const messages = [
  { id: 1, fromId: 4, toId: 1, fromName: "Omar Salem", text: "Please update your project report by next week", time: "10:30 AM", read: false },
  { id: 2, fromId: 6, toId: 1, fromName: "TechCorp HR", text: "We reviewed your application.", time: "Yesterday", read: true },
];

export const flaggedProjects = [
  { projectId: 2, reason: "Suspected plagiarism", flaggedBy: 4, flaggedAt: "2024-04-15", appeal: "This is my original work.", appealSent: true }
];