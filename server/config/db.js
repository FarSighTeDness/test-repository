
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
const { Pool } = pkg;

const requiredDbEnvVars = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"];
const missingDbEnvVars = requiredDbEnvVars.filter((name) => !process.env[name]);

if (missingDbEnvVars.length > 0) {
  throw new Error(`Missing required database environment variables: ${missingDbEnvVars.join(", ")}`);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: proces.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default pool;
