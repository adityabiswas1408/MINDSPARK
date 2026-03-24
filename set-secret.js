const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://postgres:Vb0yyc7a2v@@db.ahrnkwuqlhmwenhvnupb.supabase.co:5432/postgres";
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to DB as superuser.");
    await client.query("ALTER DATABASE postgres SET app.offline_sync_secret = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';");
    console.log("Secret set successfully!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
