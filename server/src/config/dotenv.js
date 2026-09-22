import dotenv from "dotenv";
// Ordre important : ce module doit être importé EN PREMIER (avant env.js)
// car les imports ESM sont évalués avant le corps du module.
dotenv.config({ override: true }); // server/.env ou variables plateforme (Vercel)
dotenv.config({ path: new URL("../../../.env", import.meta.url), override: true }); // racine projet en local
