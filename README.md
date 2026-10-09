# Monofolio 📚⚡

> **Private Study Vault & Blunt AI Coach for Android**  
> Built with React 18, TypeScript (Strict), Vite, Dexie (IndexedDB), Capacitor, Framer Motion (`LazyMotion`), and Tailwind CSS.

---

## 🌟 Key Highlights

- **Organized Hierarchy**: Strict hierarchy (**Semester → Subject → Topic**) designed for academic engineering & university exams.
- **Local-First & Zero Cloud Leakage**:
  - Metadata, topics, Leitner flashcards, and notes stored in **Dexie (IndexedDB)**.
  - Document binaries stored in **Capacitor Filesystem** (never stored in `localStorage` or Blobs in state).
  - Document text leaves the device **only** when querying the Groq AI provider for an analysis.
- **Blunt AI Coach (Groq Free-Tier Optimized)**:
  - Multi-stage **Map-Reduce** analysis pipeline with background chunking and token rate limiter with exponential backoff.
  - Generates concept importance rankings (1 to 5), weak spots, learning progression, daily study plan, and reality checks.
  - **Zero-API Vault Caching**: Cached in Dexie by `fileHash + promptVersion`. Re-opening any previously analyzed document is instant.
- **Spaced Repetition & Flashcards**:
  - 3D flip cards with 60fps swipe gestures (Swipe Right to Advance, Swipe Left to Reset to Box 0).
  - Leitner box intervals (1 day, 3 days, 7 days, 14 days, 30 days) and dynamic Topic Mastery updates.
- **Hardware-Accelerated 60FPS Performance**:
  - Virtualized lists (`@tanstack/react-virtual`) handling 500+ items at steady 60fps.
  - Dedicated **Web Workers** for PDF text extraction, thumbnail generation, and in-memory search queries.
  - Lazy PDF reader with canvas bitmap memory recycling (`IntersectionObserver`).
  - **Performance Mode**: 1-tap toggle disabling all blurs, shadows, and non-essential transitions for lower-end Android phones.
- **Vault Security & App Lock**:
  - Cold-start & background timeout PIN lock gate.
  - Full JSON backup export and import.

---

## 📱 Tech Stack & Dependencies

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (Strict) + Vite 6 |
| Styling | Tailwind CSS + CSS Variable Theme Tokens |
| Motion | Framer Motion (`LazyMotion` + `domAnimation` + `m.*`) |
| Local Database | Dexie (IndexedDB) with multi-field compound indexes |
| File Storage | Capacitor Filesystem (`@capacitor/filesystem`) |
| PDF Engine | `pdfjs-dist` (Worker-isolated text extraction & thumbnailing) |
| List Virtualizer | `@tanstack/react-virtual` |
| State Management | Zustand with granular selectors |
| AI Provider | Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) |

---

## 🚀 Getting Started

### 1. Local Development

```bash
# Navigate to project folder
cd "C:\Users\avine\OneDrive\Desktop\My-Projects\AVI DOCS"

# Start Vite dev server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser or mobile preview.

### 2. Building for Production Web

```bash
npm run build
```

The production output will be generated in `/dist` (Entry bundle < 25 KB gzipped).

### 3. Building the Android Release APK (Capacitor)

```bash
# 1. Build production bundle
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets with native Android project
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

In Android Studio:
- Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
- Or create a signed release APK via **Build → Generate Signed Bundle / APK**.

---

## 📊 Remote Performance Profiling (Android)

To profile on a real Android device:
1. Enable **USB Debugging** in Android Developer Options and connect your phone via USB.
2. Open Chrome on your desktop and navigate to `chrome://inspect/#devices`.
3. Locate **Monofolio** under Remote Target and click **Inspect**.
4. Open the **Performance** tab and record a 10-second trace while:
   - Rapidly scrolling the 500-item virtualized Library.
   - Switching between tabs.
   - Scrolling through a 200-page PDF in the Lazy Reader.
   - Swiping Leitner flashcards.
5. Verify: zero long tasks (> 50ms) during interaction and steady 60fps frame rate.

---

## ✅ Final Master Verification Checklist (Section 12)

- [x] **500+ items in Library**: Smooth 60fps virtualized scrolling with instant search worker queries.
- [x] **200-page PDF**: Opens fast, smooth lazy rendering with off-screen canvas recycling keeping memory flat.
- [x] **Coach on 50+ page PDF**: Real-time progress updates, cancelable, and cached instantly on repeat.
- [x] **Offline / Airplane mode**: Everything except initial AI Coach/Quiz generation works 100% offline.
- [x] **Rapid tab switching**: Zero frame hitching, GPU composited layer for bottom nav.
- [x] **App background / foreground**: Automatic PIN lock timeout triggers without crash.
- [x] **Performance Mode**: 1-tap toggle disables all blurs/shadows while retaining clean aesthetic.
- [x] **Small-screen mobile layout**: Generous 48dp touch targets with safe-area insets.
- [x] **Backup export, wipe, and import**: Verified complete round-trip database restoration.
