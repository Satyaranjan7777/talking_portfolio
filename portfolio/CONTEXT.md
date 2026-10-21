# Project Context & Technical Architecture

## 1. Executive Summary

This repository houses a high-performance, full-stack personal portfolio system engineered for **Satyaranjan Moharana**, a Full Stack Developer specializing in the MERN stack (React.js, Node.js, Express.js, MongoDB), real-time architectures (Socket.io, Server-Sent Events), and AI-driven platforms.

The platform consists of two integrated sub-systems:
1. **Public Portfolio (`portfolio/`)**: A fast, quiet monochrome aesthetic (`#f4f2ee` paper, `#0d0d0d` ink, `#ffffff` card, `#77756f` mute) featuring tactile micro-interactions, an interactive talking video hero, a 3D pendulum ID card, a periodic table skill matrix, and an expanding project accordion gallery.
2. **Real-Time Admin Control Panel (`portfolio/src/admin/` & `backend/`)**: A secure, isolated multi-page administrative console with Zod schema validation, draft/publish workflows, revision history with visual JSON diffing, one-click rollbacks, RFC 6238 TOTP two-factor authentication, an immutable audit log, and instant zero-delay visitor hydration via Server-Sent Events.

---

## 2. Ground Truth & Core Architectural Invariants

### 2.1 Public Performance & Visual Invariants (Strict & Non-Negotiable)
- **Zero Fabrication**: All technical claims, companies, dates, credentials, metrics, and links are extracted verbatim from Satyaranjan's official résumé (`public/resume.pdf`).
- **Instant First Paint (Zero Loaders)**: The public frontend renders synchronously on the initial tick using the bundled `data.js` fallback. Visitors NEVER see loading spinners, splash screens, or empty layout shifts.
- **Strict Bundle Weight (< 100 kB gzipped JS)**: The public bundle is strictly maintained below 100 kB gzipped (current build: **~92.5 kB gzipped**). Zero heavy libraries (no Three.js, GSAP, Socket.io client, or UI kits) are ever included in the public bundle.
- **Monochrome & Grays Only**: Strict palette (`#f4f2ee`, `#0d0d0d`, `#ffffff`, neutral grays). The only permitted colors are official brand logos in the tech stack (rendered with subtle brand-tinted glows).
- **One Continuous Surface**: Single-page architecture without page transitions, routing curtains, or multi-page jumps.
- **Multi-Tier Public Data Fallback**:
  $$\text{Synchronous Bundled Fallback (data.js)} \longrightarrow \text{Cached LocalStorage (vX)} \longrightarrow \text{API / ETag Hydration} \longrightarrow \text{Native SSE Stream}$$

### 2.2 Admin Panel Invariants
- **Multi-Page Bundle Isolation**: Admin code is compiled exclusively into `admin.html` / `admin-*.js`. Admin dependencies (such as `socket.io-client`, QR code generators, and diff algorithms) are completely excluded from the public visitor bundle.
- **Strict Schema Validation**: All draft and published writes validate against strict Zod schemas matching the frontend data model before touching the database.
- **Immutable Revision Snapshots**: Every publish automatically records a versioned snapshot in MongoDB (retaining up to 30 revisions per section with automatic pruning).
- **Two-Factor Authentication (TOTP)**: Full RFC 6238 standard TOTP support compatible with Google Authenticator, Authy, and 1Password.

---

## 3. Technology Stack

### Frontend (`portfolio/`)
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime & Core** | React | `^19.3.1` | Concurrent UI Component tree |
| **Framework / Bundler** | Vite | `^8.3.4` | Multi-page ESM bundler (`index.html` + `admin.html`) |
| **Styling** | Tailwind CSS | `v4.x` via `@tailwindcss/vite` | Modern utility framework + curated CSS tokens |
| **Smooth Scrolling** | Lenis | `^1.3.x` | Smooth momentum scrolling (public site only) |
| **Admin Realtime** | `socket.io-client` | `^4.8.x` | Real-time cross-tab synchronization (admin bundle only) |
| **Public Live Stream** | Native `EventSource` (SSE) | Browser Native | Zero-bundle-weight real-time visitor updates |

### Backend (`backend/`)
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js (ES Modules) | `>= 18` | Asynchronous server runtime |
| **Framework** | Express.js | `^5.x` | RESTful API & Server-Sent Events streaming |
| **Database** | MongoDB + Mongoose | `^9.x` | Document store for content, revisions, assets & audits |
| **Schema Validation** | Zod | `^4.x` | Strict runtime typing & input validation |
| **Security & Auth** | `bcryptjs`, `jsonwebtoken` | Latest | Password hashing (12 rounds) & JWT httpOnly cookies |
| **2FA / TOTP** | `otplib`, `qrcode` | Latest | RFC 6238 TOTP secrets & QR code provisioning |
| **Hardening** | `helmet`, `express-rate-limit`, `cors` | Latest | Security headers, rate limiting, and origin control |
| **Admin Realtime** | Socket.io | `^4.8.x` | Real-time broadcast channel for admin sessions |
| **File Uploads** | `multer` | `^1.4.x` | Local disk storage (`backend/uploads/`) with static serving |

---

## 4. System Architecture & Data Flow

```
                      ┌────────────────────────────────────────┐
                      │          ADMIN USER / CONSOLE          │
                      │          (http://localhost:5173/admin) │
                      └───────────────────┬────────────────────┘
                                          │
                 REST (PUT /api/admin/content/:key)
                 REST (POST /api/admin/content/:key/publish)
                 WebSockets (Socket.io Admin Channel)
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          EXPRESS API BACKEND           │
                      │       (http://localhost:5000)          │
                      │                                        │
                      │  ├─ Auth & TOTP Middleware             │
                      │  ├─ Zod Schema Validator               │
                      │  ├─ Revision Engine (Max 30 Snapshots) │
                      │  ├─ Audit Logger (IP, Action, Details) │
                      │  └─ SSE Broadcast Hub                  │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                    Mongoose Database Writes           │ Native SSE Push
                              │                        │ ("event: content:updated")
                              ▼                        ▼
                      ┌───────────────┐        ┌──────────────────────────────────┐
                      │    MONGODB    │        │         PUBLIC VISITORS          │
                      │  (portfolio)  │        │     (http://localhost:5173/)     │
                      │               │        │                                  │
                      │ ├─ Admins     │        │ 1. Instant paint from data.js    │
                      │ ├─ Contents   │        │ 2. Read local storage cache      │
                      │ ├─ Revisions  │        │ 3. Fetch ETag /api/content       │
                      │ ├─ Assets     │        │ 4. Listen to EventSource stream  │
                      │ └─ AuditLogs  │        │ 5. Reactive Hook Re-render       │
                      └───────────────┘        └──────────────────────────────────┘
```

---

## 5. Database Schema Specifications

### 5.1 `Content` (`backend/src/models/Content.js`)
- `key`: Unique section identifier string (`hero`, `about`, `skills`, `projects`, `certifications`, `experience`, `education`, `contact`, `seo`, `settings`).
- `draft`: Mixed schema containing uncommitted working draft data.
- `published`: Mixed schema containing active production data served to visitors.
- `status`: Enum (`published`, `changed`).
- `version`: Monotonically increasing integer (e.g. `1`, `2`, `3`).
- `updatedBy`: Admin email identifier.
- `timestamps`: Automatic `createdAt` and `updatedAt`.

### 5.2 `Revision` (`backend/src/models/Revision.js`)
- `key`: Section key index.
- `snapshot`: Full JSON snapshot of the published section at the time of publish.
- `version`: Version integer corresponding to the snapshot.
- `note`: Publish note or audit comment.
- `createdAt`: Snapshot creation timestamp.
- **Automated Pruning**: `Revision.pruneOldRevisions(key, 30)` automatically removes revisions beyond the latest 30 snapshots per section.

### 5.3 `Admin` (`backend/src/models/Admin.js`)
- `email`: Lowercase, unique administrative email.
- `passwordHash`: Bcrypt salted hash (salt rounds ≥ 12).
- `totpSecret`: Base32 TOTP secret string.
- `isTotpEnabled`: Boolean flag for two-factor protection.
- `lastLoginAt`: Timestamp of last verified authentication.

### 5.4 `AuditLog` (`backend/src/models/AuditLog.js`)
- `action`: String enum (`LOGIN_SUCCESS`, `LOGIN_SUCCESS_2FA`, `LOGIN_FAILED`, `PUBLISH`, `SAVE_DRAFT`, `DISCARD_DRAFT`, `RESTORE_REVISION`, `UPLOAD_ASSET`, `2FA_ENABLED`, `2FA_DISABLED`, `PASSWORD_CHANGED`).
- `section`: Target section or `auth` / `general`.
- `adminId`: Admin ObjectId reference.
- `ip`: Origin client IPv4/IPv6 address.
- `details`: Mixed payload documenting fields modified, reasons for failure, or versions.
- `at`: Timestamp indexed for fast querying.

---

## 6. Public Data Hydration & Hook System

Implemented in `portfolio/src/lib/content.js`:

1. **Synchronous Bootstrapping**:
   ```javascript
   const initialData = readCachedData(sectionKey) || DATA_FALLBACKS[sectionKey];
   // Guarantees zero blank screen on first frame
   ```
2. **Native EventSource Subscription**:
   - Connects to `/api/content/stream` without adding third-party bundle weight.
   - Listens for `event: content:updated`.
   - Automatically polls `/api/content` with `If-None-Match: <ETag>` if SSE disconnects.
3. **Reactive Consumer Hooks**:
   - `useProfile()`: Hero, contact & bio data.
   - `useNav()`: Dynamic navigation items.
   - `useSkills()`: Periodic table groups and element chips.
   - `useProjects()`: Expanding project accordion showcase.
   - `useCertifications()`: Verified certifications list.
   - `useExperience()`: Chronological journey timeline.
   - `useEducation()`: Academic qualifications list.
   - `useContent(key)`: Generic section subscription hook.

---

## 7. Admin Control Panel Modules

All editors are located under `portfolio/src/admin/components/`:

- **Selected Work (`ProjectsEditor.jsx`)**:
  - Horizontal drag/move up-down reordering.
  - Interactive Mini-UI Mockup Style selector (`chat`, `store`, `kanban`, `generic`).
  - Interactive tech stack chips with add/remove tag input.
  - Deliverable highlights bullet point list.
  - Repository & Live URLs.
- **Hero Video (`HeroEditor.jsx`)**: Headline text, ghost name watermark, quote, status tag, MP4/WebM video paths, and PDF résumé uploader.
- **About & ID (`AboutEditor.jsx`)**: Executive bio, core engineering focus, quote, and 3D pendulum ID Card fields (ID No, Dept, Valid Till, Portrait Bust image, and back highlights).
- **Skills Matrix (`SkillsEditor.jsx`)**: Periodic table families, chemical element symbols (2-3 chars), brand SVG vector flags, detail tooltips, and project links.
- **Certifications (`CertificationsEditor.jsx`)**: Title, issuer, scope details, and completion years with reordering.
- **Chronology (`ExperienceEditor.jsx`)**: Career journey timeline items, role types (`experience` vs `education`), periods, and deliverables.
- **Education (`EducationEditor.jsx`)**: University degrees, institutions, CGPA scores, and graduation years.
- **Contact (`ContactEditor.jsx`)**: Communication channels, direct email, telephone links, base location, and social links.
- **SEO & Meta (`SeoEditor.jsx`)**: Document `<title>`, `<meta description>`, OpenGraph 1200x630 banner uploader, and theme color picker.
- **Settings (`SettingsEditor.jsx`)**: Instant public visibility toggles for all sections.
- **Security & Audit (`AuditLogsViewer.jsx`)**: Real-time event counter cards, 2FA QR code generator, and full filterable audit trail.
- **Revision History Drawer (`RevisionsDrawer.jsx`)**: Slide-over panel with visual line-by-line JSON diff viewer and one-click draft restore.

---

## 8. Production Deployment Guide

### 8.1 Frontend Deployment (Netlify)
- **Repo Root**: `portfolio/`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist/`
- **Environment Variables**:
  - `VITE_API_URL`: URL of the deployed backend (e.g. `https://portfolio-backend.onrender.com`).
- **Routing & Redirects**:
  Configured in `portfolio/netlify.toml` and `portfolio/public/_redirects`:
  ```
  /admin      /admin.html   200
  /admin/*    /admin.html   200
  /*          /index.html   200
  ```

### 8.2 Backend Deployment (Render / Railway)
- **Repo Root**: `backend/`
- **Specification**: Pre-configured in `backend/render.yaml`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Required Production Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (or host-assigned port)
  - `MONGODB_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
  - `JWT_SECRET`: High-entropy random string (min 32 chars)
  - `JWT_EXPIRES_IN`: `7d`
  - `COOKIE_NAME`: `portfolio_admin_token`
  - `CLIENT_ORIGIN`: Comma-separated frontend origins (e.g. `https://satyaranjan7777.netlify.app`)
  - `ADMIN_EMAIL`: Initial admin login email
  - `ADMIN_PASSWORD`: Strong initial administrative password

---

## 9. Local Development & Operational Commands

### 1. Start MongoDB:
Ensure local MongoDB is active on `mongodb://127.0.0.1:27017/portfolio`.

### 2. Start Backend API:
```bash
cd backend
npm install
npm run seed     # Seeds initial content from data.js & creates admin account
npm start        # Launches API on http://localhost:5000
```

### 3. Start Frontend Client:
```bash
cd portfolio
npm install
npm run dev      # Launches dev server on http://localhost:5173
```

### 4. Admin Credentials (Default Seed):
- **URL**: `http://localhost:5173/admin`
- **Email**: `satyaranjanmoharana77@gmail.com`
- **Password**: `Admin@Portfolio2025!`

### 5. Production Build Validation:
```bash
cd portfolio
npm run build    # Validates dual-entry bundling and bundle size invariants (<100 kB)
```
