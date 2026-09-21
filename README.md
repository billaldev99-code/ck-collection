# C-K-Collection — Boutique e-commerce & vitrine

Mode féminine : robes, ensembles, pyjamas, nouveautés. Stack **React + Vite + Express + PostgreSQL (Neon)**, prête pour **Vercel**.

## Démarrage local

1. `cp .env.example .env` puis renseignez `DATABASE_URL` (Neon), `JWT_SECRET`, `VITE_API_URL`
2. `npm run install:all`
3. `npm run db:generate && npm run db:deploy && npm run db:seed`
4. Terminal 1 : `npm run dev:server` (http://localhost:4001/api/health)
5. Terminal 2 : `npm run dev:web` (http://localhost:5173)

Compte admin créé par le seed : `ADMIN_EMAIL` / `ADMIN_PASSWORD` (défaut `admin@c-k-collection.dz` / `Admin123!`).

## Neon
1. neon.tech → nouveau projet `ckcollection` → copier la `DATABASE_URL` (avec `?sslmode=require`)
2. `npx prisma migrate deploy --schema=db/prisma/schema.prisma`
3. `node db/seed/seed.mjs`

## Déploiement Vercel
- **Frontend** : projet Vercel, Root Directory `web`, Build `npm run build`, Output `dist`, env `VITE_API_URL=https://votre-api.vercel.app/api`
- **Backend** : projet Vercel, Root Directory `server`, `api/index.js` wrapper Express déjà fourni, env `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- Alternative mono-projet : utilisez `vercel.json` à la racine.

## Scripts
`dev:web`, `dev:server`, `build:web`, `db:generate`, `db:migrate`, `db:deploy`, `db:seed`

## Parcours cliente
Accueil → Collections → Produit (taille/qté) → Panier (localStorage) → Commande (nom, téléphone, wilaya, commune, adresse) → Confirmation + n° `CK-2026-XXXXXX`, paiement à la livraison.
