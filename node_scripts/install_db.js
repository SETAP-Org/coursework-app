import { readFile } from "fs/promises";
import pool, { query } from '../db/connection.js';

async function main() {
    try{
        const schema = await readFile('./db/schema.sql', 'utf8');
        const seed = await readFile('./db/seed_dev.sql', 'utf8');

        await query(schema);
        await query(seed);

        console.log("datbase done");
    } catch (err) {
        console.log("Databse is busted: ", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();