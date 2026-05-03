import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const SHARED_FOLDERS_BUCKET = process.env.SUPABASE_SHARED_FOLDERS_BUCKET;
