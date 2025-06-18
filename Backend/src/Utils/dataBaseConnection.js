// Third-Party Imports:
import pg from 'pg';

const { Client } = pg;

const db = new Client({
    host: process.env.POSTGRESQL_HOST,
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
    port: parseInt(process.env.POSTGRESQL_PORT ?? '5432'),
});

async function connectToDatabase() {
    try {
        await db.connect();
        console.info('Connected to the database.');
    } catch (error) {
        console.error('Could not connect to the database: ', error.message);
    }
}

connectToDatabase();

export default db;
