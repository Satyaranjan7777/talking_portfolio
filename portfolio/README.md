# Satyaranjan Moharana — Personal Portfolio Website

A clean, quiet, Awwwards-inspired personal portfolio website built with **React 19**, **Vite**, **Tailwind CSS 4**, and **Lenis** smooth scrolling. Built strictly from the candidate's résumé and intro video.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📐 Sections Architecture

| Section | Component | Key Highlights & Animations |
|---|---|---|
| **0. Navigation** | `src/components/Navigation.jsx` | 2px scroll progress bar, initials badge (360° spin on hover), sliding indicator pill, and full-screen mobile menu. |
| **1. Hero** | `src/components/hero/Hero.jsx` | Seamless looping talking video (`mix-blend-mode: multiply`), ghost name background, audio auto-unlock, and single-button mute/unmute toggle. |
| **2. About** | `src/components/sections/About.jsx` | Damped pendulum swing ID card on lanyard, 3D flip card with headshot bust, barcode, metadata, and quick facts. |
| **3. Skills** | `src/components/sections/Skills.jsx` | "Periodic Table of My Stack" (27 elements), diagonal entrance wave, family filter chips, and sticky 150px logo inspector. |
| **4. Work** | `src/components/sections/Work.jsx` | Expanding accordion gallery with pure CSS/JSX grayscale illustrative mini-UIs, tech chips, and GitHub/Demo links. |
| **5. Certifications** | `src/components/sections/Certifications.jsx` | White band with hairline borders and ink-flood row hover transition (`scaleX: 0 -> 1`). |
| **6. Experience** | `src/components/sections/Experience.jsx` | Vertical timeline with a dynamic spine drawn by scroll progress, connecting education & internship stops. |
| **7. Contact & Footer** | `src/components/sections/Contact.jsx` | Interactive translateY bouncy heading letters, 1-click email copy chip with aria-live, spinning "Say Hello" badge, and links. |

---

## 🎬 How to Rebuild the Hero Video Assets

The video pipeline script is located in `scripts/build-hero-assets.py`. It uses `ffmpeg` and `numpy` to:
1. Crop head-to-toe around the centered subject (`crop=800:1000:560:40`, scaled to `768x960`).
2. Whiten the off-white backdrop via `colorlevels=rimax=0.98:gimax=0.98:bimax=0.98`.
3. Create sample-accurate audio crossfades using NumPy array arithmetic and video crossfades using FFmpeg `xfade`.
4. Export `public/hero/hero.mp4` (H.264 / AAC) and `public/hero/hero.webm` (VP9 / Opus).
5. Extract `public/portrait-bust.webp` (480x600 headshot) and `public/og.jpg` (1200x630 OpenGraph card).

To rebuild the video assets:
```bash
python scripts/build-hero-assets.py
```

---

## 🎨 Design System

- **Palette**: Strict monochrome & neutral papers (`#f4f2ee` paper, `#0d0d0d` ink, `#ffffff` card, `#77756f` mute).
- **Typography**:
  - `Inter Tight`: Display and body typography.
  - `Instrument Serif`: Single italicized accent word per section heading.
  - `JetBrains Mono`: Small indices, labels, and atomic symbols.
- **Motion**: CSS transitions with cubic-bezier `(0.16, 1, 0.3, 1)`, Lenis smooth scrolling, and `prefers-reduced-motion` compliance.

---

## 📄 License & Credits

- Candidate data extracted verbatim from `Satyaranjan_moharana_MERN_Stack_Fresher_2025.pdf`.
- Tech brand logos are official trademarks of their respective foundations (React, Node.js, MongoDB, etc.) rendered inline under fair-use portfolio display guidelines.
