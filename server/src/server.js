import "./config/dotenv.js";
import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, "127.0.0.1", () => console.log(`C-K-Collection API : http://localhost:${config.port}/api/health`));
