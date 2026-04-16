-- ApexResume (Rezi Clone) — Initial Migration
-- Deploy: supabase db push

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  email text NOT NULL,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime')),
  stripe_customer_id text,
  resumes_created int DEFAULT 0,
  downloads_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Untitled Resume',
  template_id text DEFAULT 'modern-dark',
  content jsonb NOT NULL DEFAULT '{}',
  score int,
  score_details jsonb,
  target_job_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  resume_id uuid REFERENCES resumes(id),
  content text,
  target_company text,
  target_role text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = auth_id);
CREATE POLICY "resumes_own" ON resumes FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "letters_own" ON cover_letters FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_letters_resume ON cover_letters(resume_id);
