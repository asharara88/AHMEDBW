import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as result');
    console.log('Connection successful:', res.rows[0].result === 1);
  } catch (err) {
    console.error('Failed to connect:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
