# DEPLOY CHECKLIST — ApexResume
# Tout ce qu'il faut pour passer de "build OK" à "en production"
# MAJ: 2026-04-16

## ÉTAT ACTUEL
- [x] Code complet: 20 fichiers, 15 routes, middleware auth
- [x] Build: OK (Next.js 16, 0 errors)
- [x] GitHub: MickaLynx/apex-resume (afb47df)
- [x] Supabase migration: 001_initial.sql (3 tables, RLS, indexes)
- [x] Stripe: checkout + webhook + plans (Free/$29/$149)
- [EN COURS] i18n: next-intl, 15 langues, messages en/fr
- [ ] Déploiement Vercel

---

## ÉTAPE 1: SUPABASE PROJECT
```bash
# 1. Aller sur https://supabase.com/dashboard
# 2. Créer nouveau projet "apex-resume"
# 3. Région: eu-central-1 (Frankfurt) — RGPD
# 4. Copier les clés:
#    - Project URL → NEXT_PUBLIC_SUPABASE_URL
#    - anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - service_role key → SUPABASE_SERVICE_ROLE_KEY

# 5. Appliquer la migration:
#    SQL Editor → coller supabase/migrations/001_initial.sql → Run

# 6. Configurer Auth:
#    Auth → Providers → activer Email (Magic Link)
#    Auth → URL Configuration:
#      Site URL: https://apexresume.ai (ou domaine choisi)
#      Redirect URLs: https://apexresume.ai/api/auth/callback
```

## ÉTAPE 2: STRIPE PRODUCTS
```bash
# 1. Aller sur https://dashboard.stripe.com
# 2. Products → Add product:
#    - "ApexResume Pro Monthly" → $29/month recurring
#    - "ApexResume Lifetime" → $149 one-time
# 3. Copier les Price IDs:
#    - Pro Monthly → STRIPE_PRICE_PRO_MONTHLY
#    - Lifetime → STRIPE_PRICE_LIFETIME
# 4. Developers → API Keys:
#    - Secret key → STRIPE_SECRET_KEY
#    - Publishable key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# 5. Developers → Webhooks → Add endpoint:
#    - URL: https://apexresume.ai/api/stripe/webhook
#    - Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
#    - Signing secret → STRIPE_WEBHOOK_SECRET
```

## ÉTAPE 3: AI KEY
```bash
# Pour les routes /api/resume/generate et /api/resume/score:
# Option A: OpenAI → OPENAI_API_KEY=sk-...
# Option B: Anthropic → ANTHROPIC_API_KEY=sk-ant-...
# Le AI SDK (@ai-sdk/react) supporte les deux
```

## ÉTAPE 4: VERCEL DEPLOY
```bash
# 1. https://vercel.com/new → Import apex-resume from GitHub
# 2. Environment Variables → ajouter TOUT le .env:
#    NEXT_PUBLIC_SUPABASE_URL=
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=
#    SUPABASE_SERVICE_ROLE_KEY=
#    STRIPE_SECRET_KEY=
#    STRIPE_WEBHOOK_SECRET=
#    STRIPE_PRICE_PRO_MONTHLY=
#    STRIPE_PRICE_LIFETIME=
#    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
#    NEXT_PUBLIC_APP_URL=https://apexresume.ai
#    OPENAI_API_KEY=
# 3. Deploy → vérifier que le build passe
# 4. Settings → Domains → ajouter le domaine custom
```

## ÉTAPE 5: DOMAINE
```bash
# Candidats (à vérifier disponibilité):
# - optima.ai ⭐⭐⭐⭐⭐
# - lumina.ai ⭐⭐⭐⭐
# - primo.ai ⭐⭐⭐⭐
# - gradus.ai ⭐⭐⭐⭐
# Micka achète → configure DNS vers Vercel
```

## ÉTAPE 6: POST-DEPLOY
- [ ] Vérifier auth flow (signup → dashboard)
- [ ] Vérifier Stripe checkout (test mode d'abord)
- [ ] Vérifier webhook (stripe trigger)
- [ ] Tester AI generation (resume/score)
- [ ] Vérifier i18n (changer langue)
- [ ] Google Search Console → soumettre sitemap
- [ ] Configurer Sentry pour error tracking
- [ ] Mettre Stripe en mode live
