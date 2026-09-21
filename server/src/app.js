import "./config/dotenv.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/validate.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (o, cb) => (!o || config.frontendUrl.includes(o) || !config.isProd ? cb(null, true) : cb(null, false)), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(config.isProd ? "combined" : "dev"));
app.use("/api/", rateLimit({ windowMs: 60_000, max: 200 }));

app.get("/api/health", (_req, res) => res.json({ ok: true, brand: "C-K-Collection", time: new Date().toISOString() }));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
