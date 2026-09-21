import dotenv from "dotenv";
// Ordre important : ce module doit être importé EN PREMIER (avant env.js)
// car les imports ESM sont évalués avant le corps du module.
dotenv.config(); // server/.env ou variables plateforme (Vercel)
dotenv.config({ path: new URL("../../../.env", import.meta.url) }); // racine projet en local
