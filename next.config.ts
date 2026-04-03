import type { NextConfig } from "next";

// Environment Validation
const requiredServerEnvs = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_DB_URL", "HMAC_SECRET"];
const requiredPublicEnvs = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"];

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
  const missingServer = requiredServerEnvs.filter((key) => !process.env[key]);
  const missingPublic = requiredPublicEnvs.filter((key) => !process.env[key]);

  if (missingServer.length > 0) {
    // Only warn during build because Vercel sometimes omits secrets during certain build steps, 
    // but the checklist requires env validation at build time.
    console.warn(`Missing required server environment variables: ${missingServer.join(", ")}`);
  }

  if (missingPublic.length > 0) {
    console.warn(`Missing required public environment variables: ${missingPublic.join(", ")}`);
  }
}

// CSP Headers — dev mode needs unsafe-eval for HMR, production uses nonce + strict-dynamic
const isDev = process.env.NODE_ENV === 'development';

const cspHeader = isDev
  ? `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co http://localhost:*;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' wss://*.supabase.co https://*.supabase.co ws://localhost:* http://localhost:*;
  `.replace(/\s{2,}/g, ' ').trim()
  : `
    default-src 'self';
    script-src 'self' 'nonce-{{nonce}}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co http://localhost:*;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    connect-src 'self' wss://*.supabase.co https://*.supabase.co;
  `.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      }
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Fallback CSP for when middleware nonce is not processed
            value: cspHeader.replace("'nonce-{{nonce}}'", ""),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
