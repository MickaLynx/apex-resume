# ARCHITECTURE.md — Rezi Clone (ApexResume)
# Stack: Next.js 16 + Vercel + Stripe + AI Gateway + Supabase

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 App Router | SEO, SSR, streaming |
| UI | shadcn/ui + Tailwind CSS | Professional, fast |
| Auth | Supabase Auth (Google, Email) | Free tier generous |
| DB | Supabase (Postgres + RLS) | Serverless, realtime |
| AI | AI Gateway → Claude/GPT | Resume generation, scoring |
| PDF | @react-pdf/renderer | Client-side PDF gen |
| Payments | Stripe (Checkout + Billing) | Subscriptions + lifetime |
| Deploy | Vercel | Auto-deploy, edge |
| Analytics | PostHog | Funnels, retention |
| Errors | Sentry | Crash monitoring |

## Database Schema (Supabase)

```sql
-- Users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  email text NOT NULL,
  plan text DEFAULT 'free', -- free, pro, lifetime
  stripe_customer_id text,
  resumes_created int DEFAULT 0,
  downloads_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Resumes
CREATE TABLE resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text DEFAULT 'Untitled Resume',
  template_id text DEFAULT 'modern-dark',
  content jsonb NOT NULL DEFAULT '{}',
  score int, -- 0-100
  score_details jsonb,
  target_job_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cover Letters
CREATE TABLE cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id),
  content text,
  target_company text,
  target_role text,
  created_at timestamptz DEFAULT now()
);
```

## API Routes

```
/api/auth/callback     → Supabase auth callback
/api/resume/generate   → AI generates resume content from input
/api/resume/score      → AI scores resume against 23 criteria
/api/resume/tailor     → AI tailors resume to job description
/api/cover-letter      → AI generates cover letter
/api/pdf/download      → Generate and stream PDF
/api/stripe/checkout   → Create Stripe checkout session
/api/stripe/webhook    → Handle Stripe events
/api/stripe/portal     → Customer billing portal
```

## Pages

```
/                      → Landing page (conversion-optimized)
/login                 → Auth (Google + Email magic link)
/dashboard             → Resume list + create new
/resume/[id]           → Resume editor (real-time)
/resume/[id]/preview   → Full-page PDF preview
/resume/[id]/score     → Score + recommendations
/cover-letter/[id]     → Cover letter editor
/pricing               → Plans comparison
/templates             → Template gallery
```

## AI Prompts (core logic)

### Resume Scoring (23 criteria)
1. Contact info completeness
2. Professional summary quality
3. Experience relevance to target role
4. Achievement quantification (numbers, %)
5. Action verbs usage
6. Keyword density vs job description
7. Skills section completeness
8. Education formatting
9. Consistency (tense, formatting)
10. Length appropriateness
11. ATS compatibility (no tables, images)
12-23. [Detailed in CONCEPTION.md]

## Pricing Logic

| Plan | Limits | Price |
|------|--------|-------|
| Free | 1 resume, 3 PDF downloads, basic AI | $0 |
| Pro | Unlimited resumes, full AI, monthly review | $29/mo |
| Lifetime | Everything in Pro, forever | $149 one-time |

Free → Pro conversion trigger: when user tries to create 2nd resume or download 4th PDF.

## MVP Scope (7 days)

Day 1-2: Auth + DB + resume CRUD
Day 3-4: AI generation + scoring
Day 5: PDF generation + templates
Day 6: Stripe integration
Day 7: Landing page + deploy
