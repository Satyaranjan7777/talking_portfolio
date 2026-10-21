import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { Content } from "../models/Content.js";
import { Revision } from "../models/Revision.js";
import { AuditLog } from "../models/AuditLog.js";

// Import existing data.js from portfolio
import {
  PROFILE,
  NAV,
  SKILL_GROUPS,
  PROJECTS,
  CERTIFICATIONS,
  EXPERIENCE,
  EDUCATION,
} from "../../../portfolio/src/lib/data.js";

async function seed() {
  console.log("\n=========================================");
  console.log("🌱 [Seed] Initializing Portfolio Database");
  console.log("=========================================\n");

  await connectDB();

  // 1. Seed or Update Admin User
  let admin = await Admin.findOne({ email: ENV.ADMIN_EMAIL.toLowerCase() });
  const passwordHash = await Admin.hashPassword(ENV.ADMIN_PASSWORD);
  if (!admin) {
    admin = await Admin.create({
      email: ENV.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
    });
    console.log(`[Admin] Created admin account: ${admin.email}`);
  } else {
    admin.passwordHash = passwordHash;
    await admin.save();
    console.log(`[Admin] Updated admin password from .env for: ${admin.email}`);
  }

  // 2. Prepare Structured Content from data.js
  const sections = {
    hero: {
      name: PROFILE.name,
      firstName: PROFILE.firstName,
      role: PROFILE.role,
      roleShort: PROFILE.roleShort,
      statusTag: "Available for Full-Stack Opportunities",
      quote: PROFILE.quote,
      videoMp4: "/hero/hero.mp4",
      videoWebm: "/hero/hero.webm",
      resumePath: PROFILE.resumePath,
    },
    about: {
      name: PROFILE.name,
      resumeSummary: PROFILE.resumeSummary,
      focus: "High-concurrency WebSockets, role-based multi-tenancy, and LLM-powered candidate intelligence.",
      quote: PROFILE.quote,
      location: PROFILE.location,
      education: "MCA (2025)",
      undergrad: "B.Sc. IT (8.51 CGPA)",
      internship: "Arah Infotech",
      email: PROFILE.email,
      github: PROFILE.github,
      linkedin: PROFILE.linkedin,
      resumePath: PROFILE.resumePath,
      idCard: {
        idNo: PROFILE.idNo,
        dept: PROFILE.dept,
        validTill: PROFILE.validTill,
        portraitBust: "/portrait-bust.webp",
        backPoints: [
          `• ${PROFILE.role}`,
          "• MCA (CGPA: 7.21) & B.Sc. IT (CGPA: 8.51)",
          "• Engineered Multi-Tenant ATS matching 100+ resumes/day",
          "• Real-time architectures: Socket.io, JWT, Zustand, Redis patterns",
        ],
      },
    },
    skills: {
      groups: SKILL_GROUPS,
    },
    projects: {
      projects: PROJECTS.map((p) => ({
        ...p,
        miniUiVariant:
          p.id === "draft-chat"
            ? "chat"
            : p.id === "ezzyshop"
            ? "store"
            : p.id === "cms-recruitment"
            ? "kanban"
            : "generic",
      })),
    },
    certifications: {
      certifications: CERTIFICATIONS,
    },
    experience: {
      timeline: EXPERIENCE,
    },
    education: {
      education: EDUCATION,
    },
    contact: {
      email: PROFILE.email,
      phone: PROFILE.phone,
      phoneHref: PROFILE.phoneHref,
      location: PROFILE.location,
      github: PROFILE.github,
      linkedin: PROFILE.linkedin,
      portfolioUrl: PROFILE.portfolioUrl,
      ctaNextTeam: "Next — Your team?",
    },
    seo: {
      title: "Satyaranjan Moharana — Full Stack Developer (MERN Stack)",
      description:
        "Portfolio of Satyaranjan Moharana, MERN Stack Developer building multi-tenant recruitment platforms, real-time architectures, and AI integrations.",
      ogImage: "/og.jpg",
      themeColor: "#f4f2ee",
    },
    settings: {
      visibility: {
        about: true,
        skills: true,
        work: true,
        certifications: true,
        experience: true,
        contact: true,
      },
    },
    resume: {
      url: "/resume.pdf",
      downloadName: "Satyaranjan_Moharana_Resume.pdf",
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  };


  // 3. Upsert each section into the Content collection
  for (const [key, data] of Object.entries(sections)) {
    const existing = await Content.findOne({ key });
    if (!existing) {
      await Content.create({
        key,
        draft: data,
        published: data,
        status: "published",
        version: 1,
        updatedBy: "seed",
      });

      // Create initial revision record
      await Revision.create({
        key,
        snapshot: data,
        version: 1,
        note: "Initial seed from data.js",
      });

      console.log(`[Content] Created published section: '${key}' (v1)`);
    } else {
      console.log(`[Content] Section '${key}' already exists (v${existing.version})`);
    }
  }

  // 4. Log Audit Event
  await AuditLog.create({
    action: "DATABASE_SEEDED",
    section: "system",
    adminId: admin._id.toString(),
    details: { sectionsCount: Object.keys(sections).length },
  });

  console.log("\n=========================================");
  console.log("✅ [Seed] Database seeded successfully!");
  console.log(`Admin email:    ${ENV.ADMIN_EMAIL}`);
  console.log(`Admin password: [PROTECTED / REDACTED]`);
  console.log("=========================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ [Seed] Error seeding database:", err);
  process.exit(1);
});
