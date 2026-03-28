import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: './.env.development' });

const connectionString = process.env.DB_URL

if (!connectionString){
  throw new Error ("shits broke")
}

const sql = postgres(connectionString, {
  ssl: 'require'
});

export default sql;