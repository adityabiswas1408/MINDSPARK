const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ahrnkwuqlhmwenhvnupb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocm5rd3VxbGhtd2VuaHZudXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMjAzODUsImV4cCI6MjA4OTg5NjM4NX0.tXKaP-PUmRGbLxpXN7r-xZDPRUWPQc0Y_crjFhwyQDo'; // anon key
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@mindspark.test',
    password: 'password123'
  });
  if (error) {
    console.error('Login Error:', error.message);
  } else {
    console.log('Login Success:', data.user.email);
  }
}

testLogin();
