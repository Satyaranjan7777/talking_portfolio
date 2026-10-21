import React from "react";

// Official brand SVGs with true brand colors
export const BRAND_LOGOS = {
  javascript: {
    name: "JavaScript",
    color: "#F7DF1E",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <rect width="128" height="128" rx="16" fill="#F7DF1E" />
        <path d="M75.5 100.2c2.6 4.3 6.1 7.2 12.1 7.2 5.1 0 8.3-2.5 8.3-6 0-4.2-3.4-5.7-9-8.1l-3.1-1.3c-8.9-3.8-14.8-8.6-14.8-18.7 0-9.3 7.1-16.3 18.2-16.3 7.9 0 13.6 2.8 17.5 9.7l-7.7 4.9c-2-3.5-4.5-5-9.8-5-4.3 0-7.1 2.6-7.1 5.6 0 3.7 2.6 5.2 7.7 7.4l3.1 1.3c10.4 4.5 16.3 9.1 16.3 19.5 0 11.2-8.8 17.3-20.3 17.3-11.5 0-19-5.6-22.5-12.8l9.1-4.7zm-40-1.8c2.1 3.4 4.8 5.8 9.5 5.8 4.9 0 8-2 8-9.8V57.9h11.9v36.6c0 14.1-8.2 20.3-20 20.3-10.8 0-17.1-5.5-20.2-12.2l10.8-5.2z" fill="#000" />
      </svg>
    ),
  },
  typescript: {
    name: "TypeScript",
    color: "#3178C6",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path d="M1.5 63.8C1.5 29.4 29.4 1.5 63.8 1.5s62.3 27.9 62.3 62.3-27.9 62.3-62.3 62.3S1.5 98.2 1.5 63.8z" fill="#3178C6" />
        <path d="M38.8 57.6h17v48.6H38.8V57.6zm-11.2-10.5h39.4v8.8H27.6v-8.8zm45.8 35.8c2.9 5.3 7.6 8.3 14.4 8.3 6.1 0 9.8-3.1 9.8-7.5 0-5.3-4.2-7.2-11.2-10.2l-3.9-1.7c-11.2-4.8-18.6-10.9-18.6-23.7 0-11.8 9-20.7 23.1-20.7 10 0 17.2 3.6 22.1 12.3l-9.8 6.2c-2.5-4.4-5.7-6.3-12.4-6.3-5.5 0-9 3.3-9 7.1 0 4.7 3.3 6.6 9.8 9.4l3.9 1.7c13.2 5.7 20.7 11.5 20.7 24.7 0 14.2-11.2 21.9-25.7 21.9-14.6 0-24.1-7.1-28.5-16.2l11.4-5.9z" fill="#FFFFFF" />
      </svg>
    ),
  },
  html5: {
    name: "HTML5",
    color: "#E34F26",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#E34F26" d="M19.1 113.6L9.6 7.4h108.8l-9.5 106.2L63.9 126" />
        <path fill="#EF652A" d="M64 117.2l36.5-10.1 8-89.9H64" />
        <path fill="#ECECEC" d="M64 45.3H45.7l-1.3-14.4H64V17.5H30.9l3.8 42.1H64v-14.3zm0 37.7l-.2.1-15.6-4.2-1-11.1H33.8l1.9 21.6 28.3 7.8V83z" />
        <path fill="#FFFFFF" d="M63.9 45.3h18.3l-1.7 19.4H63.9v14.3h17.9l-1.7 19-16.2 4.4v14.2l28.3-7.8.2-2.8 3.3-37.4.4-4.5.8-9.4.5-5.3H63.9v14.3z" />
      </svg>
    ),
  },
  css3: {
    name: "CSS3",
    color: "#1572B6",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#1572B6" d="M19.1 113.6L9.6 7.4h108.8l-9.5 106.2L63.9 126" />
        <path fill="#33A9DC" d="M64 117.2l36.5-10.1 8-89.9H64" />
        <path fill="#ECECEC" d="M64 59.6H46.9l-1.2-14.3H64V30.9H31.9l3.6 43H64V59.6zm0 23.4l-.2.1-15.6-4.2-1-11.1H33.8l1.9 21.6 28.3 7.8V83z" />
        <path fill="#FFFFFF" d="M63.9 59.6h16.6l-1.6 17.5-15 4.1v14.4l27.1-7.5.3-3.7 2.4-27.1.8-9.4.8-8.3H63.9v14.4zm18.3-28.7H63.9v14.4h19.5l1.3-14.4h-2.9z" />
      </svg>
    ),
  },
  react: {
    name: "React.js",
    color: "#61DAFB",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <ellipse cx="64" cy="64" rx="14" ry="14" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="5.5" fill="none">
          <ellipse cx="64" cy="64" rx="46" ry="17" />
          <ellipse cx="64" cy="64" rx="46" ry="17" transform="rotate(60 64 64)" />
          <ellipse cx="64" cy="64" rx="46" ry="17" transform="rotate(120 64 64)" />
        </g>
      </svg>
    ),
  },
  redux: {
    name: "Redux",
    color: "#764ABC",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#764ABC" d="M64 10a54 54 0 1 0 0 108 54 54 0 0 0 0-108zm24 68c-4.4 0-8-3.6-8-8 0-1.8.6-3.4 1.6-4.7L67.7 54.4a8 8 0 0 1-7.4 0L46.4 65.3c1 1.3 1.6 2.9 1.6 4.7 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-3.3 2-6.1 4.9-7.3l.3-13.6c-4.1-1.3-7.2-5.1-7.2-9.7 0-5.5 4.5-10 10-10s10 4.5 10 10c0 2-.6 3.8-1.6 5.3l13.9 10.9a8 8 0 0 1 7.4 0l13.9-10.9a9.9 9.9 0 0 1-1.6-5.3c0-5.5 4.5-10 10-10s10 4.5 10 10c0 4.6-3.1 8.4-7.2 9.7l.3 13.6c2.9 1.2 4.9 4 4.9 7.3 0 4.4-3.6 8-8 8z" />
      </svg>
    ),
  },
  vite: {
    name: "Vite",
    color: "#646CFF",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="url(#vite-grad1)" d="M115.4 15.3L67.1 121.2a4 4 0 0 1-7.2.1L12.7 15.3a4 4 0 0 1 4.7-5.5l45.4 10.5a4 4 0 0 0 1.8 0l46.1-10.5a4 4 0 0 1 4.7 5.5z" />
        <path fill="url(#vite-grad2)" d="M83.2 12.8L44.8 61.5a2 2 0 0 0 1.9 3.2h21.4l-7.7 32.5a2 2 0 0 0 3.6 1.6L98.5 48.2a2 2 0 0 0-1.8-3.1H77.9l7.2-30.8a2 2 0 0 0-1.9-1.5z" />
        <defs>
          <linearGradient id="vite-grad1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#41D1FF" />
            <stop offset="1" stopColor="#BD34FE" />
          </linearGradient>
          <linearGradient id="vite-grad2" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFEA83" />
            <stop offset="1" stopColor="#FFDD35" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  zustand: {
    name: "Zustand",
    color: "#443E38",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r="54" fill="#443E38" />
        <circle cx="45" cy="52" r="7" fill="#F4F2EE" />
        <circle cx="83" cy="52" r="7" fill="#F4F2EE" />
        <ellipse cx="64" cy="72" rx="14" ry="9" fill="#F4F2EE" />
        <path d="M57 74c0 3 3.1 5 7 5s7-2 7-5" stroke="#443E38" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
  tailwindcss: {
    name: "Tailwind CSS",
    color: "#06B6D4",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#06B6D4" d="M64 36c-18 0-29.3 9-34 27 6.8-9 14.6-12.4 23.6-10.1 5.2 1.3 8.9 5.1 13 9.3C73.2 68.9 81.3 77 98 77c18 0 29.3-9 34-27-6.8 9-14.6 12.4-23.6 10.1-5.2-1.3-8.9-5.1-13-9.3C88.8 44.1 80.7 36 64 36zm-34 32C12 68 0.7 77-4 95c6.8-9 14.6-12.4 23.6-10.1 5.2 1.3 8.9 5.1 13 9.3 6.6 6.7 14.7 14.8 31.4 14.8 18 0 29.3-9 34-27-6.8 9-14.6 12.4-23.6 10.1-5.2-1.3-8.9-5.1-13-9.3C54.8 76.1 46.7 68 30 68z" />
      </svg>
    ),
  },
  daisyui: {
    name: "DaisyUI",
    color: "#1AD1A5",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r="56" fill="#1AD1A5" />
        <circle cx="64" cy="64" r="38" fill="#FFFFFF" />
        <circle cx="64" cy="64" r="20" fill="#1AD1A5" />
      </svg>
    ),
  },
  bootstrap: {
    name: "Bootstrap 5",
    color: "#7952B3",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <rect width="128" height="128" rx="28" fill="#7952B3" />
        <path fill="#FFFFFF" d="M48 35h18.8c9.5 0 15.6 4.9 15.6 12.8 0 5.6-3.3 9.8-8.5 11.2 6.8 1.4 10.9 6.2 10.9 13 0 9-7.3 14.5-17.7 14.5H48V35zm12.5 19.3h5.7c4 0 6.6-2 6.6-5.3 0-3.4-2.5-5.2-6.6-5.2h-5.7v10.5zm0 23.5h6.7c4.6 0 7.5-2.2 7.5-5.8 0-3.6-2.9-5.8-7.5-5.8h-6.7v11.6z" />
      </svg>
    ),
  },
  nodejs: {
    name: "Node.js",
    color: "#339933",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#339933" d="M64 8.5L14 37.4v57.8l50 28.9 50-28.9V37.4L64 8.5zm25.5 73.1c-1.3 7.8-6.9 12.3-15.8 12.7-14.8.7-22.3-6.5-22.3-21.5 0-15.6 8.5-22.9 22.9-22.9 10 0 16.5 4.9 17.5 13.9h-8.7c-.8-5.3-4.1-7.8-9.1-7.8-8.5 0-13.3 4.8-13.3 16.4 0 11.4 4.5 16 12.8 16 5.8 0 9.2-2.8 9.9-7.7l6.1.9z" />
      </svg>
    ),
  },
  express: {
    name: "Express.js",
    color: "#000000",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <rect width="128" height="128" rx="20" fill="#181818" />
        <text x="64" y="74" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="700" fontFamily="sans-serif">ex</text>
      </svg>
    ),
  },
  socketio: {
    name: "Socket.io",
    color: "#010101",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r="54" fill="#010101" />
        <path d="M43 38l28 26-28 26V38zm42 0v52L57 64l28-26z" fill="#FFFFFF" />
      </svg>
    ),
  },
  jwt: {
    name: "JWT",
    color: "#000000",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r="54" fill="#D63AFF" />
        <path d="M38 52h52v24H38z" fill="#00B9F1" rx="4" />
        <circle cx="64" cy="64" r="8" fill="#FFFFFF" />
      </svg>
    ),
  },
  mongodb: {
    name: "MongoDB",
    color: "#47A248",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#47A248" d="M64 12c-4 12-28 42-28 66 0 24 16 38 28 42 12-4 28-18 28-42 0-24-24-54-28-66z" />
        <path fill="#499D4A" d="M64 12v106c12-4 28-18 28-42 0-24-24-54-28-64z" />
        <path fill="#FFFFFF" d="M63 32v68l-3 3c-4-4-10-14-10-23 0-14 9-33 13-48z" opacity="0.6" />
      </svg>
    ),
  },
  mongoose: {
    name: "Mongoose",
    color: "#880000",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r="54" fill="#880000" />
        <path d="M40 78l12-32 12 24 12-24 12 32" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  mysql: {
    name: "MySQL",
    color: "#4479A1",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#4479A1" d="M64 18c-28 0-48 18-48 44 0 19 11 34 28 40l-4 14 16-10c2.6.4 5.2.6 8 .6 28 0 48-18 48-44s-20-44-48-44zm14 58l-10-8-10 8V48l10 8 10-8v28z" />
      </svg>
    ),
  },
  gemini: {
    name: "Gemini API",
    color: "#1BA1E2",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="url(#gemini-grad)" d="M64 12c0 28.7-23.3 52-52 52 28.7 0 52 23.3 52 52 0-28.7 23.3-52 52-52-28.7 0-52-23.3-52-52z" />
        <defs>
          <linearGradient id="gemini-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#1B73E8" />
            <stop offset="0.5" stopColor="#8AB4F8" />
            <stop offset="1" stopColor="#C58AF9" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  cloudinary: {
    name: "Cloudinary",
    color: "#3448C5",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#3448C5" d="M88 44a26 26 0 0 0-24 16 18 18 0 0 0-24 6 18 18 0 0 0-6 14c0 10 8 18 18 18h36a22 22 0 0 0 0-44c0-3-.5-7-1.5-10h1.5z" />
      </svg>
    ),
  },
  git: {
    name: "Git",
    color: "#F05032",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#F05032" d="M117.8 55.6L72.4 10.2a11.9 11.9 0 0 0-16.8 0L44.8 21l14.2 14.2a8.9 8.9 0 0 1 11.3 11.4l13.6 13.6a8.9 8.9 0 1 1-5.7 5.7L65.4 53a9 9 0 0 1-11.4-1.2L39.8 66a8.9 8.9 0 1 1-7.1 2.8l-22.5-22.5a11.9 11.9 0 0 0 0 16.8l45.4 45.4a11.9 11.9 0 0 0 16.8 0l45.4-45.4a11.9 11.9 0 0 0 0-16.8z" />
      </svg>
    ),
  },
  github: {
    name: "GitHub",
    color: "#181717",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <path fill="#181717" d="M64 8a56 56 0 0 0-17.7 109.1c2.8.5 3.8-1.2 3.8-2.7v-10.4c-15.6 3.4-18.9-6.6-18.9-6.6-2.5-6.5-6.2-8.2-6.2-8.2-5.1-3.5.4-3.4.4-3.4 5.6.4 8.6 5.8 8.6 5.8 5 8.6 13.2 6.1 16.4 4.7a12 12 0 0 1 3.6-7.5c-12.4-1.4-25.5-6.2-25.5-27.7 0-6.1 2.2-11.1 5.8-15-0.6-1.4-2.5-7.1.6-14.8 0 0 4.7-1.5 15.4 5.8a53.6 53.6 0 0 1 28 0c10.7-7.3 15.4-5.8 15.4-5.8 3.1 7.7 1.2 13.4.6 14.8 3.6 3.9 5.8 8.9 5.8 15 0 21.6-13.1 26.2-25.6 27.6 2 1.7 3.9 5.2 3.9 10.5v15.6c0 1.5 1 3.3 3.9 2.7A56 56 0 0 0 64 8z" />
      </svg>
    ),
  },
  postman: {
    name: "Postman",
    color: "#FF6C37",
    svg: (
      <svg viewBox="0 0 128 128" className="w-full h-full">
        <circle cx="64" cy="64" r="54" fill="#FF6C37" />
        <path fill="#FFFFFF" d="M96 64c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32zm-28-14l-14 14 14 14V50z" />
      </svg>
    ),
  },
};

// Custom thin line concept icons
export const CONCEPT_ICONS = {
  restapi: {
    name: "REST API",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="14" width="48" height="36" rx="8" />
        <path d="M18 32h8m12 0h8M22 26l6 6-6 6m20-12l-6 6 6 6" />
      </svg>
    ),
  },
  mvc: {
    name: "MVC Architecture",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="18" height="18" rx="4" />
        <rect x="38" y="8" width="18" height="18" rx="4" />
        <rect x="23" y="38" width="18" height="18" rx="4" />
        <path d="M26 17h12M17 26v12m30-12v12" />
      </svg>
    ),
  },
  security: {
    name: "Security & RBAC",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 10l18 8v16c0 14-18 22-18 22s-18-8-18-22V18l18-8z" />
        <path d="M26 32l4 4 8-8" />
      </svg>
    ),
  },
  architecture: {
    name: "Multi-Tenancy",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="10" width="44" height="12" rx="3" />
        <rect x="10" y="26" width="44" height="12" rx="3" />
        <rect x="10" y="42" width="44" height="12" rx="3" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <circle cx="16" cy="32" r="2" fill="currentColor" />
        <circle cx="16" cy="48" r="2" fill="currentColor" />
      </svg>
    ),
  },
  agile: {
    name: "Agile / Scrum",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 32a20 20 0 1 1 36.5 11.5L52 48m-12 0h12v-12" />
        <circle cx="32" cy="32" r="6" />
      </svg>
    ),
  },
  ai: {
    name: "AI & LLM Integration",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 8l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12zM48 40l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
      </svg>
    ),
  },
  data: {
    name: "Data Parsing",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 10h24l12 12v32a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" />
        <path d="M40 10v12h12M20 32h24M20 42h16" />
      </svg>
    ),
  },
  email: {
    name: "Email Services",
    color: "#3A3A3A",
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="14" width="48" height="36" rx="6" />
        <path d="M10 18l22 18 22-18" />
      </svg>
    ),
  },
};

export function isBrand(key) {
  return Boolean(BRAND_LOGOS[key]);
}

export default function TechLogo({ brandKey, conceptKey, size = 32, className = "" }) {
  if (brandKey && BRAND_LOGOS[brandKey]) {
    const brand = BRAND_LOGOS[brandKey];
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={brand.name}
      >
        {brand.svg}
      </div>
    );
  }

  if (conceptKey && CONCEPT_ICONS[conceptKey]) {
    const concept = CONCEPT_ICONS[conceptKey];
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={concept.name}
      >
        {concept.svg}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-neutral-200 text-xs font-mono font-bold text-neutral-800 ${className}`}
      style={{ width: size, height: size }}
    >
      {brandKey?.slice(0, 2).toUpperCase() || "??"}
    </div>
  );
}
