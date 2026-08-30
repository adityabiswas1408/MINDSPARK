const fs = require('fs');

let asTest = fs.readFileSync('src/app/actions/assessment-sessions.test.ts', 'utf8');
asTest = asTest.replace(
  "const supabase = createClient();\n      vi.mocked(supabase.from)",
  "const supabase = await createClient();\n      vi.mocked(supabase.from)"
);
asTest = asTest.replace(
  "const supabase = createClient();\n      vi.mocked(supabase.from)",
  "const supabase = await createClient();\n      vi.mocked(supabase.from)"
);
asTest = asTest.replace(
  "vi.mocked(adminSupabase.rpc).mockResolvedValue({ data: [], error: null });",
  "vi.mocked(adminSupabase.rpc).mockResolvedValue({ data: [], error: null, count: null, status: 200, statusText: 'OK' } as any);"
);
fs.writeFileSync('src/app/actions/assessment-sessions.test.ts', asTest);

let authTest = fs.readFileSync('src/app/actions/auth.test.ts', 'utf8');
authTest = authTest.replace(
  "{ error: 'UNAUTHORIZED', message: 'Unauthorized' }",
  "{ ok: false, error: 'UNAUTHORIZED', message: 'Unauthorized' }"
);
authTest = authTest.replace(
  "expect((result as any).error).toBe('UNAUTHORIZED');",
  "expect(result.error).toBe('UNAUTHORIZED');"
);
fs.writeFileSync('src/app/actions/auth.test.ts', authTest);
