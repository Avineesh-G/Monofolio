# Monofolio

> **Private Academic Vault, Syllabus Manager & Resilient AI Study Coach for Android and Web**  
> Built with React 18, TypeScript (Strict), Vite 6, Dexie (IndexedDB), Supabase (PostgreSQL), Capacitor 6, Framer Motion, and Material Design 3 Expressive.

---

## Architecture & System Overview

Monofolio is an offline-first academic management platform designed for engineering and university curricula. It combines client-side storage, PDF text extraction, and spaced repetition with cloud database synchronization and multi-model AI syllabus analysis.

```
+-------------------------------------------------------------------------+
|                              Monofolio App                              |
+-------------------------------------------------------------------------+
|  Presentation Layer:                                                    |
|  - Material Design 3 Expressive Design System                           |
|  - Google Sans Flex Typography                                          |
|  - Framer Motion Hardware-Accelerated Gestures                          |
|  - Mobile Bottom Dock with Speed Dial Action Sheet                      |
+-------------------------------------------------------------------------+
|  Offline-First Client Engine:                                           |
|  - Dexie IndexedDB (Local cache, compound indexing)                     |
|  - Capacitor Filesystem (Secure binary blob management)                 |
|  - Dedicated Web Workers (PDF text extraction, fuzzy search indexing)   |
+-------------------------------------------------------------------------+
|  AI Intelligence Layer:                                                 |
|  - Resilient Groq Multi-Model Cascading Engine                          |
|  - Primary: Llama 3.3 70B Versatile                                    |
|  - Fallback 1: Llama 3.1 8B Instant (Spike/Rate-Limit Immune)            |
|  - Fallback 2: Mixtral 8x7B | Fallback 3: Gemma 2 9B                   |
+-------------------------------------------------------------------------+
|  Cloud & Identity Layer:                                                |
|  - Supabase PostgreSQL Database (Row-Level Security)                    |
|  - Google OAuth & Email/Password Authentication                         |
|  - Bi-directional Real-time Cloud Sync                                 |
+-------------------------------------------------------------------------+
```

---

## Core Capabilities

### 1. Academic Hierarchy & Syllabus Management
- Strict relational hierarchy (**Semester -> Subject -> Topic -> Materials**) structured for university exams.
- Topic Mastery indexing computed dynamically from Leitner flashcard review accuracy.
- Support for multiple academic semesters with active term prioritization.

### 2. High-Performance Reader & Document Vault
- Isolated **Web Worker PDF Engine** extracting selectable text and rendering low-memory thumbnails without UI thread block.
- Virtualized multi-page PDF reader utilizing canvas bitmap recycling and `IntersectionObserver`.
- Support for PDFs, Markdown study notes, and annotated web links.

### 3. Resilient AI Study Coach & Multi-Model Cascading
- **Multi-Stage Map-Reduce Analysis**: Breaks large lecture slides into structured concept hierarchies, examiner blindspots, and recovery action plans.
- **Failover & Spike Protection**: Automatically cascades across model tiers (`llama-3.3-70b-versatile` -> `llama-3.1-8b-instant` -> `mixtral-8x7b-32768` -> `gemma2-9b-it`) during rate limits (429) or cloud capacity spikes (503).
- **Zero-Token Vault Caching**: Analysis outputs are hashed and indexed locally (`fileHash + promptVersion`) for zero-latency reloading.

### 4. Leitner 5-Box Spaced Repetition Engine
- 3D flip review cards with directional swipe gestures.
- Automated scheduling intervals (Box 0: Immediate, Box 1: 1 Day, Box 2: 3 Days, Box 3: 7 Days, Box 4: 14 Days, Box 5: 30 Days).
- AI-generated high-yield active recall flashcard generation directly from study documents.

### 5. Material Design 3 Expressive UI
- Framed Monofolio geometric monogram card emblem.
- Dynamic color roles (Primary, Secondary, Tertiary, Surface Containers) with dark and light theme compliance.
- Mobile bottom dock with separate speed dial action trigger.
- **Performance Mode**: 1-tap toggle disabling hardware-intensive blurs and shadows for battery savings on mobile chipsets.

### 6. Security & Authentication
- Mandatory authentication gate powered by Supabase Auth (Google OAuth and Email/Password).
- Row-Level Security (RLS) policies enforcing single-tenant data isolation per authenticated user ID.
- Local cold-start and idle background PIN lock gate.
- Complete JSON database backup export and restoration tools.

---

## Technical Stack

| Domain | Technologies |
|---|---|
| **Core Framework** | React 18, TypeScript (Strict Mode), Vite 6 |
| **Mobile Runtime** | Capacitor 6 (`@capacitor/android`, `@capacitor/filesystem`, `@capacitor/preferences`) |
| **Styling & Design** | Tailwind CSS, Material Design 3 Tokens, Google Sans Flex |
| **Animation Engine** | Framer Motion (`LazyMotion`, `domAnimation`) |
| **Client Storage** | Dexie.js (IndexedDB wrapper with multi-field compound indexes) |
| **Cloud Backend** | Supabase (PostgreSQL, GoTrue Auth, PostgREST) |
| **AI Inference** | Groq Cloud API (Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B) |
| **Document Processing** | `pdfjs-dist` (Dedicated background web workers) |
| **List Virtualization** | `@tanstack/react-virtual` |
| **State Management** | Zustand (Granular atomic stores) |

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-publishable-key>

# Optional Default AI Gateway (Can also be configured inside App Settings)
VITE_GROQ_API_KEY=<your-groq-api-key>
```

---

## Database Setup (PostgreSQL Schema)

Execute the PostgreSQL schema located at `supabase/schema.sql` in the Supabase SQL Editor:

```sql
-- Creates the required tables with Row Level Security:
-- 1. profiles
-- 2. semesters
-- 3. subjects
-- 4. topics
-- 5. items (documents, notes, links)
-- 6. flashcards (Leitner SRS cards)
-- 7. coach_analyses (AI study plans and concept rankings)
```

---

## Development & Build Instructions

### Prerequisites
- Node.js 18+ and npm
- Java JDK 17+ and Android SDK (for native Android builds)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to preview the web and mobile interfaces.

### 3. Production Web Bundle
```bash
npm run build
```
Optimized assets will be compiled into the `dist/` directory.

### 4. Build Native Android APK
```bash
# Sync web bundle to Android native assets
npx cap sync android

# Compile debug APK via Gradle wrapper
cd android && gradlew.bat assembleDebug && cd ..

# Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Project Structure

```
├── android/                   # Native Android Capacitor wrapper project
├── src/
│   ├── ai/                    # Groq multi-model failover engine, chunkers & prompts
│   ├── app/                   # Application routing and lazy views
│   ├── components/            # Reusable UI primitives (M3E buttons, cards, docks)
│   ├── db/                    # Dexie IndexedDB schemas, repositories & cloud sync
│   ├── features/              # Feature modules (Auth, Home, Shelf, Library, Quiz, Coach, Settings)
│   ├── lib/                   # Supabase client, hash generators, utilities
│   ├── storage/               # Capacitor filesystem file managers
│   ├── store/                 # Zustand stores (Auth, Library, Settings, PIN Lock)
│   ├── theme/                 # Material 3 color palettes, shapes, motion tokens
│   └── workers/               # PDF processing & fuzzy search web workers
├── supabase/                  # Database migration scripts & PostgreSQL schema
└── package.json               # Dependencies and build scripts
```

---

## License

This project is proprietary and maintained for academic study management.
