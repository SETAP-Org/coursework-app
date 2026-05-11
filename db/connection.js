import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

// creates connection to database depending on mode of app
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.NODE_ENV === 'test' ? false : {rejectUnauthorized: false }
});

// function to make queries to the database
async function query(text, params) {
  const client = await pool.connect();
  const response = await client.query(text, params);
  client.release();
  return response;
}

export { pool, query };