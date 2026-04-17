import { config } from "dotenv";
import { resolve } from "path";

// Load main .env first
config({ path: resolve(process.cwd(), ".env") });
// Load .env.test next to override keys if they exist
config({ path: resolve(process.cwd(), ".env.test") });
