# DEPLOY_CHECKLIST — ApexResume (Rezi Clone)
## Généré le : 2026-04-16
## Projet Supabase : `rdguxueprdqqchfptexu`

---

## STATUT RAPIDE

| Composant | État |
|-----------|------|
| Build Next.js | SUCCÈS (0 erreurs) |
| Migration Supabase | PRÊTE — non déployée |
| Supabase URL + Clés | Configurées |
| ANTHROPIC_API_KEY | MANQUANTE — BLOQUANT |
| STRIPE_WEBHOOK_SECRET | MANQUANTE — BLOQUANT |
| NEXT_PUBLIC_APP_URL | localhost:3000 — à changer pour prod |
| Stripe mode | TEST (sk_test_ / pk_test_) |

---

## VARIABLES D'ENVIRONNEMENT — ÉTAT COMPLET

### Variables présentes dans `.env.local`

| Variable | Valeur | Note |
|----------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rdguxueprdqqchfptexu.supabase.co` | OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT anon configuré | OK |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT service_role configuré | OK |
| `STRIPE_SECRET_KEY` | `sk_test_51TMnBX8i...` | OK — mode TEST |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51TMnBX8i...` | OK — mode TEST |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_1TMpvq8i...` | OK |
| `STRIPE_PRICE_LIFETIME` | `price_1TMpvq8i...` | OK |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | A CHANGER pour la prod |

### Variables MANQUANTES — à ajouter avant tout déploiement

| Variable | Où l'obtenir | Criticité |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com | **BLOQUANT** — toute l'IA est hors service sans elle |
| `STRIPE_WEBHOOK_SECRET` | Dashboard Stripe → Webhooks | **BLOQUANT** — paiements jamais confirmés sans elle |

---

## ETAPE 1 — APPLIQUER LA MIGRATION SUPABASE

> La base de données est vide. Les tables `users`, `resumes`, `cover_letters` n'existent pas encore.
> L'application plantera avec des erreurs 400/500 dès la première connexion si cette étape est sautée.

### Procédure (dashboard Supabase — sans CLI requis)

1. Ouvrir https://supabase.com/dashboard/project/rdguxueprdqqchfptexu
2. Dans le menu gauche, cliquer sur **SQL Editor**
3. Cliquer sur **New query** (bouton + en haut)
4. Copier-coller le SQL complet ci-dessous dans l'éditeur :

```sql
-- ApexResume (Rezi Clone) — Initial Migration
-- Tables: users, resumes, cover_letters
-- RLS activé sur les 3 tables

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

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

-- Policies : chaque utilisateur ne voit que ses propres données
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = auth_id);
CREATE POLICY "resumes_own" ON resumes FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "letters_own" ON cover_letters FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Index de performance
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_letters_resume ON cover_letters(resume_id);
```

5. Cliquer sur **Run** (bouton vert, bas à droite)
6. Vérifier le message `Success. No rows returned`
7. Aller dans **Table Editor** → confirmer que 3 tables apparaissent : `users`, `resumes`, `cover_letters`

### Tables attendues après migration

| Table | Colonnes clés | RLS |
|-------|--------------|-----|
| `users` | id, auth_id, email, plan, stripe_customer_id, resumes_created, downloads_used | Activé |
| `resumes` | id, user_id, title, template_id, content (jsonb), score, score_details | Activé |
| `cover_letters` | id, user_id, resume_id, content, target_company, target_role | Activé |

---

## ETAPE 2 — OBTENIR L'ANTHROPIC_API_KEY

> Sans cette clé, les 3 routes IA retournent des erreurs 500.
> Le build passe mais l'app est non fonctionnelle pour l'utilisateur.

### Routes impactées

| Route | Fonctionnalité | Sans la clé |
|-------|---------------|-------------|
| `/api/resume/generate` | Génération de CV par IA | Erreur 500 |
| `/api/resume/score` | Scoring 23 critères | Erreur 500 |
| `/api/cover-letter` | Lettre de motivation IA | Erreur 500 |

### Procédure

1. Aller sur https://console.anthropic.com
2. Se connecter au compte Anthropic
3. Dans le menu gauche, cliquer sur **API Keys**
4. Cliquer sur **Create Key**
5. Nommer la clé : `apexresume-local` (ou `apexresume-prod` pour la production)
6. Copier la clé affichée — elle commence par `sk-ant-api03-...`
   > **Attention :** cette clé n'est affichée qu'une seule fois. La copier immédiatement.
7. Ajouter dans `.env.local` :
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXX
   ```
8. Pour Vercel : ajouter dans **Settings → Environment Variables → ANTHROPIC_API_KEY**

> **Modèle utilisé :** `anthropic/claude-sonnet-4.6` via Vercel AI SDK Gateway
> **Coût estimé :** ~$0.003 par génération de CV, ~$0.001 par scoring

---

## ETAPE 3 — CONFIGURER STRIPE_WEBHOOK_SECRET

> Sans ce secret, le webhook Stripe ne peut pas être vérifié.
> Conséquence : le plan utilisateur reste sur `free` même après un paiement réussi.

### En développement local

1. Installer la Stripe CLI si ce n'est pas déjà fait :
   - Télécharger sur https://stripe.com/docs/stripe-cli#install
   - Ou via Scoop : `scoop install stripe`
2. Se connecter à Stripe :
   ```bash
   stripe login
   ```
3. Lancer l'écoute des webhooks en local :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. La CLI affiche une ligne comme :
   ```
   > Ready! Your webhook signing secret is whsec_abc123def456... (^C to quit)
   ```
5. Copier ce secret et l'ajouter dans `.env.local` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
   ```
6. Laisser la CLI `stripe listen` tourner pendant les tests

### En production (Vercel)

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur **Add endpoint**
3. Renseigner l'URL du endpoint :
   ```
   https://VOTRE_DOMAINE.vercel.app/api/stripe/webhook
   ```
4. Cliquer sur **Select events** et cocher :
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Cliquer sur **Add endpoint**
6. Dans la page du webhook créé, cliquer sur **Reveal signing secret**
7. Copier la valeur (commence par `whsec_...`)
8. Ajouter dans Vercel : **Settings → Environment Variables → STRIPE_WEBHOOK_SECRET**

---

## ETAPE 4 — METTRE A JOUR L'URL DE L'APP POUR LA PRODUCTION

> Cette URL est utilisée dans les redirects Stripe après paiement.
> Si elle pointe vers localhost, l'utilisateur est renvoyé vers localhost après un achat en production.

Modifier dans `.env.local` et dans les variables Vercel :

```env
# Remplacer :
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Par le domaine réel (exemple) :
NEXT_PUBLIC_APP_URL=https://apexresume.vercel.app
# ou
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

---

## ETAPE 5 — CONFIGURER L'AUTH SUPABASE (OAuth Google/GitHub)

> Optionnel pour un premier test mais nécessaire pour l'inscription utilisateur réelle.

### Activer l'auth email (minimum requis)

1. Aller sur https://supabase.com/dashboard/project/rdguxueprdqqchfptexu/auth/providers
2. Vérifier que **Email** est activé (devrait l'être par défaut)
3. Aller dans **Auth → URL Configuration** :
   - **Site URL** : `http://localhost:3000` (local) ou `https://votre-domaine.com` (prod)
   - **Redirect URLs** : `http://localhost:3000/api/auth/callback`

### Activer Google OAuth (optionnel)

1. Sur https://console.cloud.google.com, créer une OAuth App
2. Redirect URI autorisé : `https://rdguxueprdqqchfptexu.supabase.co/auth/v1/callback`
3. Copier Client ID et Client Secret dans le provider Google de Supabase

### Activer GitHub OAuth (optionnel)

1. Sur https://github.com/settings/developers, créer une OAuth App
2. Authorization callback URL : `https://rdguxueprdqqchfptexu.supabase.co/auth/v1/callback`
3. Copier Client ID et Client Secret dans le provider GitHub de Supabase

---

## ETAPE 6 (OPTIONNEL) — PASSER STRIPE EN MODE LIVE

> Ne faire ceci qu'une fois l'app testée de bout en bout en mode TEST.

1. Aller sur https://dashboard.stripe.com/apikeys
2. Passer en mode **Live** (toggle en haut à droite du dashboard)
3. Copier les clés live :
   ```env
   STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXX
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXX
   ```
4. Recréer les produits dans le dashboard Stripe live :
   - "ApexResume Pro Monthly" → $29/mois récurrent
   - "ApexResume Lifetime" → $149 one-time
5. Mettre à jour les Price IDs :
   ```env
   STRIPE_PRICE_PRO_MONTHLY=price_live_XXXX
   STRIPE_PRICE_LIFETIME=price_live_XXXX
   ```
6. Reconfigurer le webhook avec l'URL de production (voir Etape 3 — section production)

---

## CHECKLIST FINALE AVANT DEPLOIEMENT

### Bloquant (ne pas déployer sans ça)

- [x] Migration SQL appliquée — 13 tables live confirmées (Supabase Management API)
- [ ] `ANTHROPIC_API_KEY` ajoutée dans `.env.local` ET dans Vercel — **SEUL BLOCKER RESTANT**
- [x] `STRIPE_WEBHOOK_SECRET` configurée — whsec_M1QvJdvv8ueC54ovray70rEzpCkWc8Gr | Webhook ID: we_1TMsQg8i11dStqD61aTGWzwA
- [x] `NEXT_PUBLIC_APP_URL` = https://rezi-clone.vercel.app (mis à jour + redéployé)

### Important (MVP dégradé sans ça)

- [ ] Auth Supabase — URL Configuration mise à jour avec le domaine réel
- [ ] OAuth Google ou GitHub configuré (au moins un provider)
- [ ] Test de bout en bout : inscription → création CV → scoring → paiement test

### Post-MVP

- [ ] Stripe passé en mode live
- [ ] Puppeteer installé pour export PDF binaire réel
- [ ] Renommer `src/middleware.ts` → `src/proxy.ts` (avertissement deprecation Next.js)
- [ ] Sentry configuré pour le suivi des erreurs

---

## RECAP DES VARIABLES D'ENVIRONNEMENT COMPLETES

```env
# Supabase — déjà configuré
NEXT_PUBLIC_SUPABASE_URL=https://rdguxueprdqqchfptexu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # présente
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # présente

# Stripe — webhook manquant
STRIPE_SECRET_KEY=sk_test_...         # présente (TEST)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # présente (TEST)
STRIPE_PRICE_PRO_MONTHLY=price_1TMpvq8i...       # présente
STRIPE_PRICE_LIFETIME=price_1TMpvq8i...          # présente
STRIPE_WEBHOOK_SECRET=                            # MANQUANTE

# IA — clé manquante
ANTHROPIC_API_KEY=                    # MANQUANTE

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # à changer pour prod
```
