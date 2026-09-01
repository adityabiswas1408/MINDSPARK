const { Client } = require('pg');
require('dotenv').config({path: '.env.local'});
const c = new Client({ connectionString: process.env.DATABASE_URL });
async function r() {
  await c.connect();
  const { rows: r1 } = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_answers' ORDER BY ordinal_position");
  console.log('TABLE SCHEMA:');
  console.table(r1);
  const { rows: r2 } = await c.query("SELECT pg_get_triggerdef(oid) FROM pg_trigger WHERE tgname = 'update_student_answers_modtime'");
  console.log('TRIGGER DEF:');
  console.table(r2);
  await c.end();
}
r();
