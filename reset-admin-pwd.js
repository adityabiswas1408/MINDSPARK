const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ahrnkwuqlhmwenhvnupb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocm5rd3VxbGhtd2VuaHZudXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMyMDM4NSwiZXhwIjoyMDg5ODk2Mzg1fQ.AjkQJbeB2rNIQ52hG2C49__WIJOz9mw4T28lSmCrn2A';
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function resetPassword() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const adminUser = users.users.find(u => u.email === 'admin@mindspark.test');
  if (!adminUser) throw new Error('Admin not found');

  const { data, error } = await supabase.auth.admin.updateUserById(adminUser.id, {
    password: 'password123'
  });
  if (error) throw error;
  console.log('Password reset successfully for ' + adminUser.email);
}

resetPassword().catch(console.error);
