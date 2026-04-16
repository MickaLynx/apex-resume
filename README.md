# ApexResume — AI Resume Builder

Clone of Rezi.ai. AI-powered resume builder with 23-criteria scoring.

## Stack
- Next.js 16 + Tailwind CSS + shadcn/ui
- Supabase (Auth + DB + Storage)
- Stripe (Subscriptions + Lifetime)
- AI Gateway (Claude for resume generation + scoring)

## Setup
```bash
npm install
cp .env.example .env.local
# Fill in Supabase + Stripe + AI Gateway keys
npm run dev
```

## Deploy
```bash
# Vercel (recommended for MVP)
vercel deploy

# Infomaniak (production, EU data sovereignty)
docker build -t apex-resume .
# Deploy container to Infomaniak Cloud
```

## Pricing
- Free: 1 resume, 3 downloads, basic AI
- Pro: $29/mo, unlimited
- Lifetime: $149 one-time

## By QubitumAI
