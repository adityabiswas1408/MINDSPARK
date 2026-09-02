require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // Test value with comma and parentheses
  const userSearch = "smith, john (jr)";
  const sanitizedSearch = userSearch.trim().replace(/"/g, '""');
  const orString = `email.ilike."%${sanitizedSearch}%",full_name.ilike."%${sanitizedSearch}%"`;
  
  console.log("Testing .or string:", orString);
  const { data, error } = await supabase.from('profiles').select('id, email, full_name').or(orString);
  
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("SUCCESS. Fetched profiles:", data);
  }
})();
