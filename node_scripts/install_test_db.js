import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import dotenv from "dotenv";

dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
});

const adminPool = new Pool({
    connectionString: process.env.DB_URL
})

async function recreateDatabase() {
    await adminPool.query(`DROP DATABASE IF EXISTS gcms`);
    await adminPool.query('CREATE DATABASE gcms');
    await adminPool.end();
}

async function seedDatabase() {
    const schema = await readFile('./db/schema.sql', 'utf8');
    
    const appPool = new Pool({
        connectionString: process.env.DB_URL
    });

    await appPool.query(schema);
    await appPool.end();
}

async function installDatabase() {
    await recreateDatabase();
    await seedDatabase();
    console.log('The database has been seeded');
}

installDatabase();