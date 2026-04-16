# CONCEPTION.md — _STARTUP_COPY/rezi-clone
# Generated: 2026-04-15 by Gemma4 (gemma4:e4b)
# Cost: 0 tokens Claude

---

# CONCEPTION.md: Rezi-Clone (Codename: ApexResume)

## NOMS CANDIDATS (Medvi Playbook — à valider par Micka)
| Nom | Extension | Signal | Score |
|-----|-----------|--------|-------|
| Optima | .ai | Optimisation universelle | ⭐⭐⭐⭐⭐ |
| Lumina | .ai | Clarté, lumière, professionnel | ⭐⭐⭐⭐ |
| Primo | .ai | Premier, premium, court | ⭐⭐⭐⭐ |
| Gradus | .ai | Progression, grades, carrière | ⭐⭐⭐⭐ |
| Veridis | .ai | Vérité, authenticité | ⭐⭐⭐ |
| Novum | .ai | Nouveau, innovation | ⭐⭐⭐ |
→ Vérifier disponibilité réelle avant achat

**Project Goal:** To build a best-in-class, AI-powered resume builder that not only meets but exceeds the functionality, speed, and aesthetic quality of existing market leaders (specifically Rezi.ai). Our core differentiator is superior, actionable AI feedback and a flawless mobile UX.

**Role:** Senior Mobile Architect / Product Lead
**Target Platform:** iOS & Android (Flutter)
**Backend:** Next.js / Vercel

---

## 1. App Overview

### 💡 Core Value Proposition (The 10x Improvement)
Current resume builders are often static templates or provide generic keyword suggestions. **ApexResume solves the "Black Box" problem.** We don't just check for keywords; we analyze the *context* of the job description against the user's experience, providing a quantifiable, prioritized score (e.g., "Improve your 'Leadership' section by adding a quantifiable achievement related to cross-functional team management").

**Our Promise:** We turn a vague job description into a precise, actionable content strategy, guaranteeing the resume is not just ATS-compliant, but *AI-optimized* for the specific role.

### 🧑‍💻 Target Users & Market Size
*   **Primary User:** Young professionals (22-35) and career switchers who are tech-savvy, job-hunting actively, and are comfortable with AI tools. They value efficiency and measurable results.
*   **Secondary User:** Recent graduates and experienced professionals needing a portfolio refresh.
*   **Market Size Estimate:** Global job market is massive. Focusing on the US/UK/Canada professional segment, the addressable market is estimated at 50M+ job seekers, with a high conversion potential among the 25-35 demographic who are highly sensitive to career tools.

### ⚔️ Top 3 Competitor Analysis

| Competitor | Strength | Weakness (Our Opportunity) |
| :--- | :--- | :--- |
| **Rezi.ai** | Established brand, good template variety. | AI feedback is often generic (keyword count). UX feels dated/clunky. |
| **Kickstarter/Resume Builders** | Simplicity, ease of use. | Lack of deep AI integration. Templates are boring and non-customizable. |
| **LinkedIn** | Network effect, professional validation. | Not a dedicated *creation* tool. Limited control over formatting/ATS output. |

---

## 2. Architecture

### ⚙️ Feature List (Prioritized)

| Priority | Feature | Description |
| :--- | :--- | :--- |
| **P0 (Must-Have)** | **Core Profile Builder** | Structured input fields (Experience, Education, Skills). |
| **P0 (Must-Have)** | **AI Scoring Engine** | Real-time, multi-criteria scoring (23 criteria). Must show *why* the score is low (e.g., "Needs more quantifiable metrics"). |
| **P0 (Must-Have)** | **Job Description Ingestion** | Ability to paste/upload a JD and run the initial analysis. |
| **P0 (Must-Have)** | **Basic Template Rendering** | 3-5 clean, modern, ATS-friendly templates. |
| **P1 (Should-Have)** | **Conversational AI Agent** | Chat interface to ask questions like: "How do I quantify my project management skills?" |
| **P1 (Should-Have)** | **Cover Letter Generation** | AI-drafted letter based on the resume and JD. |
| **P1 (Should-Have)** | **Advanced Template Library** | More beautiful, modern, and customizable templates (the "beat Rezi" factor). |
| **P2 (Nice-to-Have)** | **Portfolio Integration** | Link to GitHub/Behance for project validation. |
| **P2 (Nice-to-Have)** | **Interview Prep Module** | AI-generated mock interview questions based on the target job. |

### 💾 Data Model (Key Entities)

1.  **User:** `user_id`, `email`, `subscription_status`, `last_login`, `resume_count_free`.
2.  **Resume:** `resume_id`, `user_id`, `title`, `version`, `template_id`, `raw_data` (JSON blob of content).
3.  **Experience:** `exp_id`, `resume_id`, `company`, `role`, `start_date`, `end_date`, `description` (text array).
4.  **Skill:** `skill_id`, `resume_id`, `skill_name`, `proficiency_level`.
5.  **JobDescription:** `jd_id`, `user_id`, `text_content`, `analysis_score` (JSON object containing keyword weights, missing criteria, etc.).
6.  **Subscription:** `sub_id`, `user_id`, `plan_type`, `start_date`, `expiry_date`.

### 🌐 API Endpoints Needed (Next.js Backend)

| Endpoint | Method | Description | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/analysis/score` | POST | Accepts `JD` text and `Resume` JSON. | Returns the 23-point score object and actionable feedback. |
| `/api/v1/generate/coverletter` | POST | Accepts `Resume` JSON and `JD` text. | Calls the AI Gateway (e.g., OpenAI) to generate the letter. |
| `/api/v1/save/resume` | POST | Accepts `Resume` JSON. | Saves the structured data to the database. |
| `/api/v1/auth/stripe` | POST | Handles Stripe webhooks/tokenization. | Payment processing and subscription validation. |
| `/api/v1/ai/chat` | POST | Accepts user query and context. | Handles the conversational AI agent logic. |

### 🚀 Offline-First Strategy

The core functionality must work offline to ensure a smooth user experience, especially when drafting content.

1.  **Local Storage (Drift):** All user-inputted data (User Profile, Experience, Skills, Draft Resume Content) must be stored locally in the device's SQLite database (Drift).
2.  **Offline Workflow:** The user can build, edit, and save drafts indefinitely offline. The AI scoring engine will use a cached, simplified scoring model (based on local keywords/metrics) to provide *some* feedback, but the full, deep scoring requires connectivity.
3.  **Synchronization:** When connectivity is restored, the app uses a background sync service to push all local `Resume` and `Experience` data to Supabase, triggering the full, cloud-based AI scoring analysis.

---

## 3. Technical Stack

*   **Frontend (Mobile):** Flutter 3.x+
*   **State Management:** Riverpod (Provider/Consumer pattern for clean, scalable state management).
*   **Local Database:** Drift (SQLite) – Guarantees robust, type-safe, offline-first data handling.
*   **Backend/Sync:** Supabase (Postgres + Auth) – Provides scalable cloud storage
