import fs from "fs";
import sql from '../db/connection.js';

async function main() {
    try{
        const schema = fs.readFileSync('./db/schema.sql', 'utf8');
        const seed = fs.readFileSync('./db/seed_dev.sql', 'utf8');

        await sql.unsafe(schema);
        await sql.unsafe(seed);

        console.log("datbase done");
    } catch (err) {
        console.log("Databse is busted: ", err);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

main();