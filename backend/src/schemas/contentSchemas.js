import { z } from "zod";

const safeUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val || val === "") return true;
      return /^https?:\/\//i.test(val) || val.startsWith("/");
    },
    { message: "URL must be a valid http(s) URL or relative path starting with /" }
  )
  .nullable()
  .optional();

export const heroSchema = z
  .object({
    name: z.string().optional().default("Satyaranjan Moharana"),
    firstName: z.string().optional().default("SATYARANJAN"),
    role: z.string().optional().default("Full Stack Developer (MERN Stack)"),
    roleShort: z.string().optional().default("Full Stack Developer"),
    statusTag: z.string().optional().default("Available for Full-Stack Opportunities"),
    quote: z.string().optional().default("Engineering robust multi-tenant platforms with real-time architectures and AI-driven workflows."),
    videoMp4: z.string().optional().default("/hero/hero.mp4"),
    videoWebm: z.string().optional().default("/hero/hero.webm"),
    resumePath: safeUrlSchema.default("/resume.pdf"),
  })
  .passthrough();

export const aboutSchema = z
  .object({
    name: z.string().optional().default("Satyaranjan Moharana"),
    resumeSummary: z.string().optional().default(""),
    focus: z.string().optional().default("High-concurrency WebSockets, role-based multi-tenancy, and LLM-powered candidate intelligence."),
    quote: z.string().optional().default(""),
    location: z.string().optional().default("Hyderabad, Telangana"),
    education: z.string().optional().default("MCA (2025)"),
    undergrad: z.string().optional().default("B.Sc. IT (8.51 CGPA)"),
    internship: z.string().optional().default("Arah Infotech"),
    email: z.string().optional(),
    github: safeUrlSchema,
    linkedin: safeUrlSchema,
    resumePath: safeUrlSchema,
    idCard: z
      .object({
        idNo: z.string().optional().default("SM-2025-DEV"),
        dept: z.string().optional().default("ENG"),
        validTill: z.string().optional().default("2025"),
        portraitBust: z.string().optional().default("/portrait-bust.webp"),
        backPoints: z.array(z.string()).optional().default([]),
        certifiedText: z.string().optional().default("Certified MERN Stack Developer — Naresh i Tech"),
      })
      .passthrough()
      .optional()
      .default({}),
  })
  .passthrough();

export const skillItemSchema = z
  .object({
    symbol: z.string().min(1),
    name: z.string().min(1),
    detail: z.string().default(""),
    isBrand: z.boolean().default(false),
    brandKey: z.string().optional(),
    conceptKey: z.string().optional(),
    usedIn: z.array(z.string()).default([]),
  })
  .passthrough();

export const skillGroupSchema = z
  .object({
    family: z.string().min(1),
    skills: z.array(skillItemSchema),
  })
  .passthrough();

export const skillsSchema = z
  .object({
    groups: z.array(skillGroupSchema),
  })
  .passthrough();

export const projectSchema = z
  .object({
    id: z.string().min(1),
    index: z.string().min(1),
    title: z.string().min(1),
    kicker: z.string().min(1),
    date: z.string().min(1),
    description: z.string().min(1),
    features: z.array(z.string()).default([]),
    tech: z.array(z.string()).default([]),
    github: safeUrlSchema,
    live: safeUrlSchema,
    miniUiVariant: z.string().optional().default("generic"),
  })
  .passthrough();

export const projectsSchema = z
  .object({
    projects: z.array(projectSchema),
  })
  .passthrough();

export const certificationSchema = z
  .object({
    id: z.string().min(1),
    index: z.string().min(1),
    title: z.string().min(1),
    issuer: z.string().min(1),
    detail: z.string().min(1),
    year: z.string().min(1),
  })
  .passthrough();

export const certificationsSchema = z
  .object({
    certifications: z.array(certificationSchema),
  })
  .passthrough();

export const experienceItemSchema = z
  .object({
    type: z.enum(["experience", "education"]),
    year: z.string().min(1),
    period: z.string().optional(),
    title: z.string().min(1),
    place: z.string().min(1),
    detail: z.string().min(1),
  })
  .passthrough();

export const experienceSchema = z
  .object({
    timeline: z.array(experienceItemSchema),
  })
  .passthrough();

export const educationItemSchema = z
  .object({
    degree: z.string().min(1),
    institution: z.string().min(1),
    cgpa: z.string().min(1),
    year: z.string().min(1),
  })
  .passthrough();

export const educationSchema = z
  .object({
    education: z.array(educationItemSchema),
  })
  .passthrough();

export const contactSchema = z
  .object({
    email: z.string().min(1),
    phone: z.string().optional().default("+91 8456087796"),
    phoneHref: z.string().optional().default("tel:+918456087796"),
    location: z.string().optional().default("Hyderabad, Telangana"),
    github: z.string().optional().default("https://github.com/Satyaranjan7777"),
    linkedin: z.string().optional().default("https://www.linkedin.com/in/satyaranjan-moharana"),
    portfolioUrl: z.string().optional().default("https://satyaranjan7777.netlify.app/"),
    ctaNextTeam: z.string().optional().default("Next — Your team?"),
  })
  .passthrough();

export const seoSchema = z
  .object({
    title: z.string().optional().default("Satyaranjan Moharana — Full Stack Developer (MERN Stack)"),
    description: z.string().optional().default("Portfolio of Satyaranjan Moharana, MERN Stack Developer building multi-tenant recruitment platforms, real-time architectures, and AI integrations."),
    ogImage: z.string().optional().default("/og.jpg"),
    themeColor: z.string().optional().default("#f4f2ee"),
  })
  .passthrough();

export const settingsSchema = z
  .object({
    visibility: z.record(z.string(), z.boolean()).default({
      about: true,
      skills: true,
      work: true,
      certifications: true,
      experience: true,
      contact: true,
    }),
    features: z
      .object({
        enableSound: z.boolean().default(true),
        showStatusBadge: z.boolean().default(true),
        showGhostWatermark: z.boolean().default(true),
        enableIdCardFlip: z.boolean().default(true),
      })
      .default({
        enableSound: true,
        showStatusBadge: true,
        showGhostWatermark: true,
        enableIdCardFlip: true,
      }),
  })
  .passthrough();

export const resumeSchema = z.object({
  url: z.string().min(1),
  downloadName: z.string().default("Satyaranjan_Moharana_Resume.pdf"),
  version: z.number().default(1),
  updatedAt: z.string().optional(),
});

export const resumeSettingsSchema = z.object({
  downloadName: z.string().min(1).max(255).regex(/^[\w\-. ]+\.pdf$/i, "Filename must end with .pdf"),
});

export const heroMediaSchema = z.object({
  mp4Url: z.string().min(1),
  webmUrl: z.string().min(1),
  posterUrl: z.string().min(1),
  version: z.number().default(1),
  bytes: z.number().optional(),
  duration: z.number().optional(),
  updatedAt: z.string().optional(),
});

export const SECTION_SCHEMAS = {
  hero: heroSchema,
  about: aboutSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  certifications: certificationsSchema,
  experience: experienceSchema,
  education: educationSchema,
  contact: contactSchema,
  seo: seoSchema,
  settings: settingsSchema,
  resume: resumeSchema,
  heroMedia: heroMediaSchema,
};

export function validateSection(key, data) {
  const schema = SECTION_SCHEMAS[key];
  if (!schema) {
    // Return raw if no specific schema
    return { success: true, data };
  }
  return schema.safeParse(data);
}
