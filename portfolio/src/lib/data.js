/**
 * Satyaranjan Moharana — Portfolio Data Source of Truth
 * Extracted verbatim from Satyaranjan_moharana_MERN_Stack_Fresher_2025.pdf
 */

export const PROFILE = {
  name: "Satyaranjan Moharana",
  firstName: "SATYARANJAN",
  role: "Full Stack Developer (MERN Stack)",
  roleShort: "Full Stack Developer",
  email: "satyaranjanmoharana77@gmail.com",
  phone: "+91 8456087796",
  phoneHref: "tel:+918456087796",
  location: "Hyderabad, Telangana",
  resumeSummary:
    "MERN Stack Developer (MCA, 2025) with an Apr–Jul 2026 internship building a multi-tenant recruitment platform: 8-stage candidate pipeline, bulk .xlsx/.csv import with duplicate detection, and Groq/Gemini AI candidate matching. Builds full-stack applications in React.js, Node.js, Express.js, and MongoDB with JWT authentication, RBAC, and Socket.io real-time features in an agile environment.",
  resumePath: "/resume.pdf",
  github: "https://github.com/Satyaranjan7777",
  linkedin: "https://www.linkedin.com/in/satyaranjan-moharana",
  portfolioUrl: "https://satyaranjan7777.netlify.app/",
  validTill: "2025",
  idNo: "SM-2025-DEV",
  dept: "Full Stack Engineering",
  quote:
    "Engineering robust multi-tenant platforms with real-time architectures and AI-driven workflows.",
};

export const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "certifications", label: "Certifications" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export const SKILL_GROUPS = [
  {
    family: "Languages",
    skills: [
      { symbol: "Js", name: "JavaScript", detail: "ES6+", isBrand: true, brandKey: "javascript" },
      { symbol: "Ts", name: "TypeScript", detail: "Type-safe", isBrand: true, brandKey: "typescript" },
      { symbol: "H5", name: "HTML5", detail: "Semantic markup", isBrand: true, brandKey: "html5" },
      { symbol: "C3", name: "CSS3", detail: "Modern layouts", isBrand: true, brandKey: "css3" },
    ],
  },
  {
    family: "Frontend",
    skills: [
      { symbol: "Re", name: "React.js", detail: "Hooks, SPA", isBrand: true, brandKey: "react" },
      { symbol: "Rx", name: "Redux", detail: "State store", isBrand: true, brandKey: "redux" },
      { symbol: "Vt", name: "Vite", detail: "Build tool", isBrand: true, brandKey: "vite" },
      { symbol: "Zu", name: "Zustand", detail: "Lightweight state", isBrand: true, brandKey: "zustand" },
      { symbol: "Tw", name: "Tailwind CSS", detail: "Utility-first", isBrand: true, brandKey: "tailwindcss" },
      { symbol: "Du", name: "DaisyUI", detail: "Tailwind components", isBrand: true, brandKey: "daisyui" },
      { symbol: "Bs", name: "Bootstrap 5", detail: "Responsive UI", isBrand: true, brandKey: "bootstrap" },
    ],
  },
  {
    family: "Backend",
    skills: [
      { symbol: "Nd", name: "Node.js", detail: "Runtime engine", isBrand: true, brandKey: "nodejs" },
      { symbol: "Ex", name: "Express.js", detail: "REST framework", isBrand: true, brandKey: "express" },
      { symbol: "Ra", name: "REST API", detail: "Stateless endpoints", isBrand: false, conceptKey: "restapi" },
      { symbol: "Mv", name: "MVC Architecture", detail: "Design pattern", isBrand: false, conceptKey: "mvc" },
      { symbol: "So", name: "Socket.io", detail: "Real-time websockets", isBrand: true, brandKey: "socketio" },
      { symbol: "Jw", name: "JWT", detail: "Auth tokens", isBrand: true, brandKey: "jwt" },
      { symbol: "Bc", name: "bcrypt", detail: "Password hashing", isBrand: false, conceptKey: "security" },
    ],
  },
  {
    family: "Databases",
    skills: [
      { symbol: "Mg", name: "MongoDB", detail: "NoSQL document", isBrand: true, brandKey: "mongodb" },
      { symbol: "Mo", name: "Mongoose", detail: "ODM modeling", isBrand: true, brandKey: "mongoose" },
      { symbol: "Sq", name: "MySQL", detail: "Relational DB", isBrand: true, brandKey: "mysql" },
    ],
  },
  {
    family: "Integrations",
    skills: [
      { symbol: "Gq", name: "Groq API", detail: "Ultra-fast LLM ATS", isBrand: false, conceptKey: "ai" },
      { symbol: "Gm", name: "Gemini API", detail: "Candidate matching", isBrand: true, brandKey: "gemini" },
      { symbol: "Sj", name: "SheetJS", detail: ".xlsx/.csv parsing", isBrand: false, conceptKey: "data" },
      { symbol: "Br", name: "Brevo", detail: "Email notifications", isBrand: false, conceptKey: "email" },
      { symbol: "Cl", name: "Cloudinary", detail: "Media cloud storage", isBrand: true, brandKey: "cloudinary" },
    ],
  },
  {
    family: "Tools & Concepts",
    skills: [
      { symbol: "Gt", name: "Git", detail: "Version control", isBrand: true, brandKey: "git" },
      { symbol: "Gh", name: "GitHub", detail: "Collaboration", isBrand: true, brandKey: "github" },
      { symbol: "Pm", name: "Postman", detail: "API testing", isBrand: true, brandKey: "postman" },
      { symbol: "Rb", name: "RBAC", detail: "Role-based access", isBrand: false, conceptKey: "security" },
      { symbol: "Mt", name: "Multi-Tenancy", detail: "Tenant isolation", isBrand: false, conceptKey: "architecture" },
      { symbol: "Ag", name: "Agile/Scrum", detail: "Sprint execution", isBrand: false, conceptKey: "agile" },
    ],
  },
];

export const ALL_SKILLS = SKILL_GROUPS.flatMap((group, gIdx) =>
  group.skills.map((s, sIdx) => ({
    ...s,
    family: group.family,
    atomicNumber: gIdx * 10 + sIdx + 1,
    usedIn:
      s.name.includes("React") || s.name.includes("Node") || s.name.includes("Mongo")
        ? ["Draft Chat", "EzzyShop", "Candidate Management System (CMS)", "HRMS"]
        : s.name.includes("Socket")
        ? ["Draft Chat", "Candidate Management System (CMS)", "HRMS"]
        : s.name.includes("Zustand")
        ? ["Draft Chat", "EzzyShop"]
        : s.name.includes("Groq") || s.name.includes("Gemini") || s.name.includes("SheetJS")
        ? ["Candidate Management System (CMS)"]
        : ["Draft Chat", "EzzyShop"],
  }))
);

export const PROJECTS = [
  {
    id: "draft-chat",
    index: "01",
    title: "Draft Chat",
    kicker: "Real-Time Chat Application",
    date: "May 2026",
    description:
      "A real-time one-to-one chat application built with Socket.io, featuring online user tracking, persistent message history, tab-isolated sessions, and Cloudinary media uploads.",
    features: [
      "Socket.io real-time 1-on-1 messaging & active presence",
      "JWT authentication & bcrypt password encryption",
      "Tab-isolated browser sessions & protected routes",
      "Zustand state management & Cloudinary profile media",
    ],
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Socket.io", "Zustand", "JWT", "Cloudinary", "Tailwind CSS", "DaisyUI"],
    github: "https://github.com/Satyaranjan7777/Draft_Chat",
    live: "https://draft-chat.netlify.app/",
  },
  {
    id: "ezzyshop",
    index: "02",
    title: "EzzyShop",
    kicker: "E-Commerce Application",
    date: "July 2026",
    description:
      "Full-stack MERN e-commerce application with REST APIs, JWT authentication, user/admin role-based authorization, and an administrative control panel for categories, products, and orders.",
    features: [
      "Dynamic catalogue browsing & cart management",
      "COD checkout flow with backend-controlled pricing & stock validation",
      "Dedicated admin dashboard for categories, inventory & orders",
      "Role-based authorization (RBAC) with JWT & Mongoose schemas",
    ],
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Mongoose", "JWT", "Zustand", "Tailwind CSS", "Axios"],
    github: "https://github.com/Satyaranjan7777/EzzyShop",
    live: "https://ezzyshop.onrender.com/",
  },
  {
    id: "cms-recruitment",
    index: "03",
    title: "Candidate Management System (CMS)",
    kicker: "Multi-Tenant Recruitment Platform",
    date: "Apr 2026 – Jul 2026",
    description:
      "Multi-tenant recruitment platform managing 500+ candidate records with an 8-stage pipeline, advanced search, filtering, and Groq/Gemini AI candidate-job matching.",
    features: [
      "8-stage visual pipeline & search reducing candidate-finding time by 85%",
      "Bulk .xlsx/.csv import processing 350+ records with duplicate detection",
      "Groq ATS scoring & Gemini candidate-job matching (100 resumes/day)",
      "Tenant isolation with RBAC & Socket.io real-time messaging",
    ],
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Socket.io", "Tailwind CSS", "Groq API", "Gemini API", "Brevo", "SheetJS", "JWT"],
    github: null,
    live: null,
  },
 
];

export const CERTIFICATIONS = [
  {
    id: "cert-1",
    index: "01",
    title: "MERN Stack Certification",
    issuer: "Naresh i Technologies, Hyderabad",
    detail: "Comprehensive specialization covering React, Node.js, Express, MongoDB, Tailwind CSS, and TypeScript.",
    year: "2025",
  },
];

export const EXPERIENCE = [
  {
    type: "experience",
    year: "Apr 2026 – Jul 2026",
    period: "Apr 2026 – Jul 2026",  
    title: "MERN Stack Developer Intern",
    place: "Arah Infotech Pvt. Ltd. — Hyderabad, Telangana",
    detail:
      "Architected multi-tenant recruitment platform (CMS) managing 500+ records across an 8-stage pipeline (85% discovery speedup). Engineered bulk import for 350+ records with duplicate detection. Integrated Groq and Gemini AI matching for 100 resumes/day. Cut API latency from 2s to 800ms. Implemented Socket.io real-time notifications and workflows in HRMS.",
  },
  {
    type: "education",
    year: "2023 – 2025",
    period: "2023 – 2025",
    title: "MCA — Master of Computer Applications",
    place: "M.P.C. Autonomous College, Baripada",
    detail: "Postgraduate degree in Computer Applications with CGPA: 7.21. Focused on advanced data structures, web systems, and database engineering.",
  },
  {
    type: "education",
    year: "2020 – 2023",
    period: "2020 – 2023",
    title: "B.Sc. IT & Management",
    place: "Bhadrak Autonomous College",
    detail: "Graduated with academic distinction (CGPA: 8.51). Strong foundation in computer programming, software engineering, and systems analysis.",
  },
];

export const EDUCATION = [
  {
    degree: "MCA (Master of Computer Applications)",
    institution: "M.P.C. Autonomous College, Baripada",
    cgpa: "7.21",
    year: "2023 – 2025",
  },
  {
    degree: "B.Sc. IT & Management",
    institution: "Bhadrak Autonomous College",
    cgpa: "8.51",
    year: "2020 – 2023",
  },
];


