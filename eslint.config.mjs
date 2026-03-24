import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{
            group: ["*/lib/supabase/admin", "*/lib/supabase/admin/*"],
            message: "Do not import the Supabase Admin client in client components! It exposes the SERVICE_ROLE_KEY."
          }]
        }
      ]
    }
  }
];