import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
});



const pool = new Pool({
  connectionString: process.env.DB_URL,
});

async function query(text, params) {
  const client = await pool.connect();
  const response = await pool.query(text, params);
  client.release();
  return response;
}

export { pool, query };
