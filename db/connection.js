import dotenv from "dotenv";
import postgres from "postgres";
import pg from "pg";

const { Pool } = pg;

dotenv.config({ path: './.env.development' });

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {rejectUnauthorized: false }
});

export async function query(text, params){
  const client = await pool.connect();

  try {
    const response = await client.query(text, params);
    return response;
  } finally {
    client.release();
  }
}

export default pool;