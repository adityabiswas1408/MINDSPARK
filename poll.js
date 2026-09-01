const { Client } = require('pg');
require('dotenv').config({path: '.env.local'});
const c = new Client({ connectionString: process.env.DATABASE_URL });
async function r() {
  await c.connect();
  for (let i = 0; i < 20; i++) {
    const { rows } = await c.query("SELECT count(*) FROM pg_stat_activity");
    console.log(`[${new Date().toISOString()}] Connections: ${rows[0].count}`);
    await new Promise(res => setTimeout(res, 2000));
  }
  await c.end();
}
r();
