import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bake SUPABASE_SERVICE_ROLE_KEY into the server bundle at build time.
  // Amplify's SSR Lambda does not inject non-NEXT_PUBLIC_ env vars at runtime,
  // so we must read the value during the build (when it is available in CodeBuild).
  // This value is only present in server-side API route bundles — never sent to the browser.
  env: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
};

export default nextConfig;
