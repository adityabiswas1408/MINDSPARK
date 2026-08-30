const fs = require('fs');

let rTest = fs.readFileSync('src/app/actions/results.test.ts', 'utf8');
rTest = rTest.replace(
  "chain.eq.mockReturnValue(chain);",
  "chain.eq.mockReturnValue(chain);\n  chain.is = vi.fn().mockReturnValue(chain);"
);
rTest = rTest.replace(
  "chain.eq.mockReturnValue(chain);\n  chain.in.mockReturnValue(chain);",
  "chain.eq.mockReturnValue(chain);\n  chain.in.mockReturnValue(chain);\n  chain.is = vi.fn().mockReturnValue(chain);"
);
fs.writeFileSync('src/app/actions/results.test.ts', rTest);

let authTest = fs.readFileSync('src/app/actions/auth.test.ts', 'utf8');
authTest = authTest.replace(
  "expect(result.ok).toBe(true);",
  "if (!result.ok) console.log('AUTH FAIL:', result);\n      expect(result.ok).toBe(true);"
);
fs.writeFileSync('src/app/actions/auth.test.ts', authTest);

let asTest = fs.readFileSync('src/app/actions/assessment-sessions.test.ts', 'utf8');
asTest = asTest.replace(
  "describe('submitExam validation', () => {",
  "describe('submitExam validation', () => {\n    beforeEach(async () => {\n      const { requireRole } = await import('@/lib/auth/rbac');\n      vi.mocked(requireRole).mockResolvedValue({ userId: '123e4567-e89b-12d3-a456-426614174000', institutionId: '123e4567-e89b-12d3-a456-426614174000', role: 'student' });\n      const { createClient } = await import('@/lib/supabase/server');\n      vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ is: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { paper_id: 'p1', closed_at: null }, error: null }) }) }) }) }) }) } as any);\n    });\n"
);
asTest = asTest.replace(
  "if (table === 'assessment_sessions') {\n          return {\n            select:",
  "if (table === 'assessment_sessions') {\n          return {\n            select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ is: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({data:null, error:null}) }), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) }),\n"
);
fs.writeFileSync('src/app/actions/assessment-sessions.test.ts', asTest);
