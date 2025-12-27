# PrepVault — Centralized Academic Resource Platform

Tagline
A curated, login-first platform that consolidates exam-focused resources for college students.

Problem Statement
College students spend significant time and energy hunting for reliable, exam-relevant materials across scattered sources (messaging apps, drive links, ad-hoc playlists). This fragmentation creates anxiety and inefficiency during the preparation window.

Solution Overview
PrepVault provides a single trusted repository of high-quality, curated resources (notes, PYQs, solutions, and module-wise playlists). Resources are curated by a small admin team and organized by branch → semester → subject → module so students can find exam-relevant material quickly and confidently.

Key Features (MVP)
- Login-required access (Email + Google OAuth) with role-based admin uploader (admin-only uploads)
- Course-driven resource browsing (branch, semester, subject, module)
- Resource types: links (YouTube, Drive, GitHub) with metadata and descriptions; PDF upload support deferred to later
- Search and filters (subject, module, exam relevance)
- Events page and simple HackHub placeholder
- User profile (view-only for initial MVP with bookmarks/collections planned)

Tech Stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Styling & Fonts: Dark mode, Inter (UI), Space Grotesk (hero/display) with a cyan→purple accent gradient and glassmorphism design language
- Backend & Data: Server actions + API routes in Next.js; Prisma as ORM with PostgreSQL (Supabase or Neon) for future integration
- Auth: Clerk or Supabase Auth (no custom auth; choice to be finalized)
- Hosting & CI/CD: Vercel for frontend and server actions; GitHub + GitHub Actions for CI

Design Philosophy
- Frontend-first: iterate UI and UX before adding backend or AI features to validate flows quickly
- Minimal, curated surface area: avoid public uploads or community contributions for the initial release to prioritize quality and trust
- Consistent, premium aesthetic: dark, spacious layouts with subtle glow borders, rounded corners, and glassmorphism for a focused study experience

Project Structure (High-level)
- `app/` — Next.js App Router pages and layouts (Server and Client components)
- `components/` — Reusable UI primitives and layout blocks
- `styles/` — Tailwind configuration and design tokens
- `data/mock/` — Static fixtures to support frontend-first development
- `prisma/` — Placeholder for schema and migrations (database integration deferred)
- `docs/` — Contribution and onboarding notes

Future Roadmap (planned, no implementation yet)
- Semantic search and AI features: embeddings-backed retrieval, summarization, and a controlled Q&A assistant for students
- Personalized study plans and recommendations driven by PYQ analysis and user progress
- Admin analytics, versioning, and content provenance features
- Optional campus SSO and SAML integration for institutional deployments

Getting Started (high-level)
- Repository contains a frontend-first scaffold with page placeholders and design tokens to begin UI development
- Next implementation steps: install dependencies, configure Tailwind, finalize auth provider, and author the Prisma schema (these steps are planned and gated by the MVP rules)

Status
- Current: Frontend scaffold and placeholders are implemented; no auth, database, or AI features are present
- Next immediate tasks: initialize packages, add Tailwind base styles and typography, and implement the agreed auth provider and database schema for the MVP

License / Usage Note
- License: MIT (placeholder — update as required)
- Usage: Content on PrepVault is curated and published only by the project admin team; do not upload copyrighted solutions without explicit permissions. A takedown and attribution process will be implemented as part of content governance.

Contact & Contribution
- See `docs/CONTRIBUTING.md` for contribution guidelines and the project's development expectations.

