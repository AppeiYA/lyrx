import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD as string,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});
if (pool) {
  console.log("connected directly");
}

export default pool;
