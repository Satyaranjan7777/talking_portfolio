# Satyaranjan Moharana — MERN Portfolio & Real-Time Admin Platform

A production-ready personal portfolio platform featuring an Awwwards-inspired public site and an administrative control panel with real-time SSE visitor hydration, WebSocket synchronization, revision history with visual diffs, and RFC 6238 TOTP two-factor authentication.

---

## 🌟 Highlights

- **Awwwards-Inspired Monochrome Aesthetic**: Ultra-clean `#f4f2ee` paper palette, talking video hero with audio auto-unlock, 3D pendulum ID card on lanyard, periodic table of skills, and expanding accordion project showcase.
- **Instant First Paint (< 100 kB gzipped JS)**: Public site renders synchronously on frame 1 from bundled fallback with zero splash screens or blank loaders. Public bundle size is strictly kept below 100 kB (currently ~92.5 kB gzipped).
- **Native Server-Sent Events (SSE)**: Live visitor view hydration with zero third-party bundle weight. Updates published in the Admin Panel reflect on visitor screens instantly.
- **Isolated Admin Panel**: Multi-page Vite architecture (`admin.html` entry) completely isolating admin tools, WebSockets, QR code generators, and diff viewers from the public bundle.
- **Interactive Section Editors**: 10 dedicated editors covering Projects (with mini-UI variant preview selector), Hero, Bio & 3D ID Card, Skills Matrix, Certifications, Chronology, Education, Contact, SEO, and Section Visibility Toggles.
- **Revision History & Visual Diff Viewer**: Slide-over drawer archiving the last 30 immutable snapshots with inline line-by-line colored diffs and one-click rollback.
- **Security & Hardening**: JWT in httpOnly cookies, rate limiting, Helmet headers, Zod schema validation, bcrypt (12 rounds), RFC 6238 TOTP Two-Factor Authentication, and an immutable audit log.

---

## 📁 Repository Structure

```
├── backend/                   # Node.js + Express + MongoDB REST API & SSE Hub
│   ├── src/
│   │   ├── config/            # DB connection & environment variables
│   │   ├── controllers/       # Auth, Content, Admin, and Audit controllers
│   │   ├── middleware/        # JWT auth, rate limiter, Zod validate, error handler
│   │   ├── models/            # Admin, Content, Revision, Asset, AuditLog
│   │   ├── routes/            # /api/auth, /api/content, /api/admin
│   │   ├── schemas/           # Zod validation schemas
│   │   └── seed/              # Data seeder from data.js
│   ├── uploads/               # Uploaded media assets
│   ├── render.yaml            # Render deployment config
│   ├── package.json
│   └── .env.example
│
├── portfolio/                 # React 19 + Vite 8 + Tailwind CSS 4 Frontend
│   ├── public/                # Static assets, hero video, résumé PDF
│   ├── scripts/               # Python/FFmpeg hero video loop builder
│   ├── src/
│   │   ├── admin/             # Isolated Admin Console (admin.html entry)
│   │   │   ├── components/    # Layout, Login, Dashboard, Editors, Revisions, Audit
│   │   │   ├── context/       # AuthContext, SocketContext
│   │   │   └── hooks/         # useSectionEditor hook
│   │   ├── components/        # Public components (Hero, About, Skills, Work, etc.)
│   │   ├── lib/               # content.js (SSE + 3-tier fallback), data.js, scroll.js
│   │   ├── App.jsx            # Public application container
│   │   └── index.css          # Design system tokens
│   ├── admin.html             # Multi-page admin entry
│   ├── index.html             # Public visitor entry
│   ├── netlify.toml           # Netlify routing & security headers
│   └── package.json
│
└── resources/                 # Original source files (Résumé PDF, Raw Intro Video)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18 or later
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017/portfolio` (or MongoDB Atlas URI)

### 1. Setup & Launch Backend
```bash
cd backend
npm install

# Seed initial sections from data.js and create initial admin account
npm run seed

# Start API server on http://localhost:5000
npm start
```

### 2. Setup & Launch Frontend
```bash
cd portfolio
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

### 3. Access URLs & Credentials
- **Public Portfolio**: [http://localhost:5173/](http://localhost:5173/)
- **Admin Control Panel**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Initial Admin Credentials**:
  - **Email**: `satyaranjanmoharana77@gmail.com`
  - **Password**: `Admin@Portfolio2025!`

---

## 🛡️ Admin Features & Section Editors

| Section | Route | Capabilities |
|---|---|---|
| **Dashboard** | `#/dashboard` | Overview cards, system health, quick links, recent activity |
| **Selected Work** | `#/projects` | Reorder projects, change mini-UI mockup (`chat`, `store`, `kanban`, `generic`), edit tech chips & repo URLs |
| **Hero Video** | `#/hero` | Headline, ghost watermark, quote, talking video file paths, PDF résumé uploader |
| **About & ID** | `#/about` | Executive summary, core focus, 3D pendulum ID card badge details & portrait image |
| **Skills Matrix** | `#/skills` | Periodic table groups (Languages, Frontend, Backend...), symbols, brand vector toggles |
| **Certifications** | `#/certifications` | Professional credentials, verification details, issuer authorities, year |
| **Chronology** | `#/experience` | Career milestones, internship stops, timeline reordering |
| **Education** | `#/education` | University degrees, institutions, CGPA scores, completion years |
| **Contact** | `#/contact` | Communication endpoints, telephone links, social profile URLs, CTA banner |
| **Resume & PDF** | `#/resume` | Cloudinary raw PDF upload, inline preview, draft/publish flow, version rollback, download filename |
| **SEO & Meta** | `#/seo` | Document title, meta description, OpenGraph 1200x630 banner, theme color |
| **Settings** | `#/settings` | Instant public section visibility switches |
| **Security & Audit** | `#/security` | RFC 6238 TOTP 2FA QR code generator, live event counters, filterable audit table |
| **Revisions Drawer**| *Global* | Historical snapshot list (max 30), inline visual JSON diff viewer, one-click draft restore |

---

## 📄 Resume Management & Cloudinary PDF Delivery

The platform supports live-synced PDF resume management:
1. **Upload & Inspection**: PDFs uploaded in the `/admin#/resume` portal are verified via MIME type, `.pdf` extension, size limit (`RESUME_MAX_MB`), and `%PDF-` binary magic bytes.
2. **Cloudinary Storage**: Files are streamed directly into Cloudinary under `portfolio/resume` using `resource_type: "raw"`. Each upload receives an immutable timestamped `public_id` ensuring CDN cache-busting and rollback capability.
3. **Real-Time Public Sync**: Publishing emits a `content:updated { key: "resume" }` event across the native SSE stream, refreshing links on all connected visitor tabs with zero page reload or layout shift.
4. **Stable Redirect**: `GET /api/resume` provides an external-friendly 302 redirect pointing directly to the active live resume URL (ideal for LinkedIn or GitHub profile links).
5. **Retention Pruning**: Only the latest $N$ versions (configured via `RESUME_KEEP_VERSIONS`, default 10) are retained; older archives are pruned from Cloudinary and MongoDB.

> [!IMPORTANT]
> **Cloudinary Console Setting for PDF Delivery**:
> On new Cloudinary accounts, raw PDF delivery may be restricted by default. To enable direct delivery:
> 1. Log into your **Cloudinary Console**.
> 2. Navigate to **Settings** (gear icon) $\rightarrow$ **Security**.
> 3. Under **Restricted media types**, uncheck **PDF and ZIP files delivery** (or enable PDF delivery).
> 4. Save changes.

---

## 🎬 Hero Video Architecture (Cloudinary-Only)

Built on the exact same draft/publish/rollback lifecycle as the Résumé pipeline:

1. **Direct Signed Upload**: To handle videos up to 40 MB without hitting Render's 30-second proxy timeout, the browser requests signed upload parameters (`POST /api/admin/hero-video/sign`) and streams the video directly to Cloudinary with real-time `XMLHttpRequest` progress.
2. **Strict Verification (`POST /api/admin/hero-video/commit`)**: The server inspects the uploaded asset via `cloudinary.api.resource` to verify duration ($\le 20$s), file size ($\le 40$ MB), and format (`mp4` or `webm`). Any asset failing validation is deleted immediately from Cloudinary.
3. **Auto-Transcoded Delivery URLs**:
   - `mp4Url`: Cloudinary video URL transformed with `f_mp4,q_auto`.
   - `webmUrl`: Auto-transcoded WebM version with `f_webm,q_auto`.
   - `posterUrl`: First frame extracted at 0.2s with `so_0.2,f_webp` (or custom uploaded poster).
4. **Seamless Preload & Zero Flash Swap**: When a new video version is published, the public `Hero.jsx` preloads the new video in a hidden element and listens for `canplaythrough` before swapping active `<source>` elements. Playback, volume, and mute state are preserved with zero flash or scroll reset.
5. **Rollback & Pruning**: Version history tracks past versions. Restoring an archived version promotes it back to live. Only the last 5 versions are kept; older versions are automatically pruned from Cloudinary.


---

## 🌐 Production Deployment

### Frontend (Netlify)
1. Link your repository on [Netlify](https://www.netlify.com/).
2. Set **Base directory** to `portfolio`.
3. Set **Build command** to `npm run build`.
4. Set **Publish directory** to `dist`.
5. Set Environment Variable:
   - `VITE_API_URL`: Your backend URL (e.g. `https://portfolio-backend.onrender.com`).
6. Routing for `/admin` and `/admin/*` to `admin.html` is automatically handled by `portfolio/netlify.toml`.

### Backend (Render / Railway)
1. Deploy `backend` to [Render](https://render.com/) or [Railway](https://railway.app/).
2. On Render, select **Blueprint** using `backend/render.yaml` or create a Web Service.
3. Configure the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`)
   - `JWT_SECRET`: High-entropy 32+ character random string
   - `JWT_EXPIRES_IN`: `7d`
   - `COOKIE_NAME`: `portfolio_admin_token`
   - `CLIENT_ORIGIN`: Your public domain (e.g. `https://satyaranjan7777.netlify.app`)
   - `ADMIN_EMAIL`: Initial admin login email
   - `ADMIN_PASSWORD`: Strong initial administrative password
4. Run `npm run seed` once to initialize database records.

---

## 📄 License & Verification

- All candidate data extracted verbatim from `resources/Satyaranjan_moharana_MERN_Stack_Fresher_2025.pdf`.
- Video media generated from candidate introduction video via `portfolio/scripts/build-hero-assets.py`.
- Brand trademarks (React, Node.js, MongoDB, Express, Socket.io) belong to their respective foundations.
