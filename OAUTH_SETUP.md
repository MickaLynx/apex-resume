# Google OAuth Setup — ApexResume (Next.js)

## Informations clés du projet

| Paramètre | Valeur |
|-----------|--------|
| App | ApexResume (Next.js 15 + Supabase) |
| Production URL | `https://rezi-clone.vercel.app` |
| Supabase project ref | `rdguxueprdqqchfptexu` |
| Supabase region | EU Frankfurt |
| Auth callback URL | `https://rdguxueprdqqchfptexu.supabase.co/auth/v1/callback` |
| Local dev callback | `http://localhost:3000/api/auth/callback` |

---

## Statut actuel du code

Le code OAuth est DEJA en place et fonctionnel :

- `src/app/[locale]/(auth)/login/page.tsx` — bouton Google (`signInWithOAuth`) + magic link email
- `src/app/api/auth/callback/route.ts` — echange le code OAuth contre une session Supabase
- `src/lib/supabase.ts` — client Supabase configure avec les env vars

**Ce qui manque : la configuration Google Cloud Console + Supabase Dashboard.**

### Comment fonctionne le flux (code existant)

```
User clique "Continue with Google"
    ↓
supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: window.location.origin + '/api/auth/callback' })
    ↓
Redirect vers Google OAuth consent screen
    ↓
Google redirect vers: https://rdguxueprdqqchfptexu.supabase.co/auth/v1/callback
    ↓
Supabase echange le code → crée la session → redirect vers /api/auth/callback?code=xxx
    ↓
route.ts: supabase.auth.exchangeCodeForSession(code)
    ↓
NextResponse.redirect('/dashboard')
```

---

## ETAPE 1 — Google Cloud Console : Créer le projet OAuth

### 1.1 Créer ou selectionner le projet

1. Aller sur https://console.cloud.google.com/
2. Sélectionner ou créer le projet **"Qubitum Apps"** (partager avec SunSpots pour centraliser)
3. Activer l'API : **APIs & Services → Library → "Google Identity" → Enable**

### 1.2 Configurer l'OAuth Consent Screen

1. **APIs & Services → OAuth consent screen**
2. User type : **External** (permet tous les utilisateurs Google)
3. Remplir les champs :
   - App name : `ApexResume`
   - User support email : `mickalynx@gmail.com`
   - App domain : `rezi-clone.vercel.app`
   - Developer contact information : `mickalynx@gmail.com`
4. Scopes — cliquer **Add or Remove Scopes** → cocher :
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Test users : ajouter `mickalynx@gmail.com`
6. Sauvegarder → Status : **Testing** (suffisant pour toi seul, passer en Production pour tous les users)

---

## ETAPE 2 — Créer le Client ID Web

1. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. Application type : **Web application**
3. Name : `ApexResume Web`
4. Authorized JavaScript origins :
   ```
   https://rezi-clone.vercel.app
   https://rdguxueprdqqchfptexu.supabase.co
   http://localhost:3000
   ```
5. Authorized redirect URIs :
   ```
   https://rdguxueprdqqchfptexu.supabase.co/auth/v1/callback
   http://localhost:3000/api/auth/callback
   ```
6. Cliquer **Create**
7. Copier et noter :
   - **Client ID** : `XXXXXXXXXX.apps.googleusercontent.com`
   - **Client Secret** : `GOCSPX-XXXXXXXXXX`

---

## ETAPE 3 — Supabase Dashboard : Activer Google Provider

1. Aller sur : https://supabase.com/dashboard/project/rdguxueprdqqchfptexu
2. **Authentication → Providers → Google**
3. Toggle **Enable Google provider** → ON
4. Remplir :
   - **Client ID (for OAuth)** : coller le Client ID (étape 2, format `xxx.apps.googleusercontent.com`)
   - **Client Secret** : coller le Client Secret (étape 2, format `GOCSPX-xxx`)
5. La **Redirect URL** est pre-remplie en lecture seule :
   ```
   https://rdguxueprdqqchfptexu.supabase.co/auth/v1/callback
   ```
   C'est cette URL que tu as mise dans Google Cloud Console — tout est coherent.
6. Cliquer **Save**

### Configurer les redirect URLs autorisées dans Supabase

1. Supabase Dashboard → **Authentication → URL Configuration**
2. **Site URL** : `https://rezi-clone.vercel.app`
3. **Additional redirect URLs** (une par ligne) :
   ```
   https://rezi-clone.vercel.app/**
   http://localhost:3000/**
   ```
4. Sauvegarder

---

## ETAPE 4 — Variables d'environnement

### Variables deja presentes (ne rien changer)

Le client Supabase utilise uniquement :
- `NEXT_PUBLIC_SUPABASE_URL` — deja configure sur Vercel
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — deja configure sur Vercel

Le Client ID et Secret Google sont stockes DANS Supabase (pas besoin de les mettre dans .env Next.js).

### Si tu veux le Client ID cote client (optionnel)

```bash
# Ajouter sur Vercel uniquement si tu implémentes Google One Tap ou Identity Services
npx vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production
# Valeur: xxx.apps.googleusercontent.com
```

### Fichier .env.local (developpement)

```bash
# D:\PC1\PROJECTS\_STARTUP_COPY\rezi-clone\.env.local
NEXT_PUBLIC_SUPABASE_URL=https://rdguxueprdqqchfptexu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...ton_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...ton_service_role_key...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ETAPE 5 — Test OAuth en local

```bash
cd "D:\PC1\PROJECTS\_STARTUP_COPY\rezi-clone"
npm run dev
# Ouvrir http://localhost:3000/login
# Cliquer "Continue with Google"
# → Redirect vers Google → login → callback → /dashboard
```

Verifier dans Supabase Dashboard → **Authentication → Users** : l'utilisateur Google doit apparaitre.

### Debogage si ca ne marche pas

1. **Erreur "redirect_uri_mismatch"** : verifier que `http://localhost:3000/api/auth/callback` est bien dans les redirect URIs Google Cloud Console
2. **Erreur "Access blocked"** : l'app est en mode Testing → ajouter le compte Google comme test user
3. **Erreur 400 sur /api/auth/callback** : verifier que le callback route.ts utilise le bon client Supabase (avec cookies, pas le client statique)
4. **Session pas persistee** : s'assurer que `createServerClient` de `@supabase/ssr` est utilise dans le callback (non dans le client browser)

---

## ETAPE 6 — Test OAuth en production

1. Deployer sur Vercel :
   ```bash
   git push origin main
   # Vercel deploy automatique
   ```
2. Aller sur `https://rezi-clone.vercel.app/login`
3. Cliquer "Continue with Google" → flux complet
4. Verifier dans Supabase → **Authentication → Users**

### Passer de Testing a Production (pour tous les users)

Dans Google Cloud Console → OAuth consent screen → **Publish App** → confirmer.
Cela permet a n'importe quel compte Google de se connecter (pas seulement les test users).

---

## Stripe Webhook Setup (STRIPE_WEBHOOK_SECRET)

La variable est presente sur Vercel avec une valeur placeholder — doit etre remplacee.

### Creer le webhook Stripe

1. Aller sur : https://dashboard.stripe.com/test/webhooks
2. **Add endpoint** → URL : `https://rezi-clone.vercel.app/api/stripe/webhook`
3. Events a ecouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copier le **Signing secret** (`whsec_...`)

### Mettre a jour sur Vercel

```bash
cd "D:\PC1\PROJECTS\_STARTUP_COPY\rezi-clone"
echo "whsec_VOTRE_SECRET" | npx vercel env update STRIPE_WEBHOOK_SECRET production
echo "whsec_VOTRE_SECRET" | npx vercel env update STRIPE_WEBHOOK_SECRET preview
echo "whsec_VOTRE_SECRET" | npx vercel env update STRIPE_WEBHOOK_SECRET development
```

---

## Statut variables Vercel (2026-04-16)

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | OK | OK | OK |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | OK | OK | OK |
| SUPABASE_SERVICE_ROLE_KEY | OK | OK | OK |
| STRIPE_SECRET_KEY | OK | OK | OK |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | OK | OK | OK |
| STRIPE_PRICE_PRO_MONTHLY | OK | OK | OK |
| STRIPE_PRICE_LIFETIME | OK | OK | OK |
| NEXT_PUBLIC_APP_URL | OK (vercel.app) | OK | OK |
| STRIPE_WEBHOOK_SECRET | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |

---

## Checklist OAuth Google — ApexResume

- [ ] Google Cloud project "Qubitum Apps" créé / selectionné
- [ ] OAuth consent screen configuré (External, scopes email/profile/openid)
- [ ] mickalynx@gmail.com ajouté comme test user
- [ ] Client ID Web créé avec les bonnes origins et redirect URIs
- [ ] Client ID + Secret copiés dans Supabase → Authentication → Providers → Google
- [ ] Supabase → Authentication → URL Configuration → redirect URLs configurées
- [ ] Test local : `npm run dev` → login Google → session créée dans Supabase
- [ ] Test production : `rezi-clone.vercel.app` → login Google → /dashboard OK
- [ ] OAuth consent screen passé en Production (pour ouvrir a tous les users)
- [ ] STRIPE_WEBHOOK_SECRET remplacé (placeholder actuellement)
