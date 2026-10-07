# StudyVault 📚⚡

> Private Study Vault & Blunt AI Coach for Android (Capacitor + React 18 + TypeScript + Dexie + Tailwind CSS).

---

## 🚀 Overview

StudyVault is an on-device, local-first study material storage and active recall companion designed to cut through fluff and maximize exam performance.

- **Vault Organization**: Organized strictly as **Semester → Subject → Topic**.
- **Supported Formats**: Selectable typed PDFs, typed Markdown notes, and saved resource links with context.
- **Hardware-Accelerated Performance**: Built strictly for 60fps on mid-range Android devices using TanStack Virtual virtualization, Web Workers for PDF parsing & search indexing, and Framer Motion (`LazyMotion` + `domAnimation`).
- **Zero Cloud Leakage**: Local-first storage with Dexie (IndexedDB) for metadata and Capacitor Filesystem for document binaries.

---

## 📁 Project Structure

```
AVI DOCS/
├─ capacitor.config.ts          # Android Capacitor configuration
├─ vite.config.ts               # Chunk splitting & Web Worker configuration
├─ tailwind.config.ts           # CSS variable theme tokens
├─ index.html                   # Safe-area and viewport optimization
├─ src/
│  ├─ main.tsx                  # React DOM root
│  ├─ App.tsx                   # App shell, lock gate, routes, dev FPS monitor
│  ├─ app/
│  │  ├─ routes.tsx             # Code-split lazy routes
│  │  └─ providers.tsx          # LazyMotion & ErrorBoundary
│  ├─ theme/
│  │  ├─ tokens.css             # Obsidian & indigo color tokens, safe area insets
│  │  └─ motion.ts              # Framer motion presets & springs
│  ├─ db/
│  │  ├─ schema.ts              # Dexie schema with typed tables & indexes
│  │  ├─ repos/                 # semesters, subjects, topics, items, analyses, quizzes
│  │  └─ backup.ts              # JSON export & import
│  ├─ storage/
│  │  └─ files.ts               # Capacitor Filesystem & web storage abstraction
│  ├─ store/
│  │  ├─ useLibraryStore.ts     # Library & Shelf state with 500-item benchmark seeder
│  │  ├─ useSettingsStore.ts    # Groq API key, model selection, Performance Mode
│  │  └─ useLockStore.ts        # App lock & PIN verification
│  ├─ workers/
│  │  ├─ pdf.worker.ts          # Background PDF text extraction & thumbnail generation
│  │  └─ search.worker.ts       # Non-blocking search index & token query worker
│  ├─ features/
│  │  ├─ home/                  # Today dashboard
│  │  ├─ shelf/                 # Semesters, subject grid & topic mastery rings
│  │  ├─ library/               # 60fps virtualized items list & filter chips
│  │  ├─ coach/                 # Blunt AI coach analysis
│  │  ├─ quiz/                  # Spaced repetition flashcards
│  │  ├─ links/                 # Saved links with "why I saved this"
│  │  ├─ reader/                # PDF reader preview & text extraction
│  │  └─ settings/              # Settings, API key, performance mode & backup
│  ├─ components/
│  │  ├─ BottomNav.tsx          # 5-tab bottom navigation with active pill animation
│  │  ├─ FloatingAddButton.tsx  # Quick add floating button for PDF/Note/Link
│  │  ├─ SheetCard.tsx          # Floating popup card modal
│  │  ├─ ProgressRing.tsx       # SVG circular progress ring
│  │  ├─ Skeleton.tsx           # Lightweight loading placeholder
│  │  ├─ EmptyState.tsx         # Empty state visuals
│  │  └─ VirtualList.tsx        # TanStack Virtual list wrapper
│  └─ lib/
│     ├─ hash.ts                # SHA-256 calculator for analysis caching
│     ├─ perf.ts                # Dev FPS monitor & performance markers
│     └─ utils.ts               # Classnames helper, nanoid, formatters
```

---

## 🛠️ How to Run Locally

```bash
# 1. Navigate to project
cd "C:\Users\avine\OneDrive\Desktop\My-Projects\AVI DOCS"

# 2. Start Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) on your browser or mobile device.

---

## 📦 How to Build for Production & Android

```bash
# Production web build
npm run build

# Sync with Capacitor Android project
npx cap sync android
```
