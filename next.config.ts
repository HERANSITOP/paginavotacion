import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NextAuth v5 needs these packages to be treated as server-only
  serverExternalPackages: ["@node-rs/argon2", "@node-rs/bcrypt"],
  // Silence the "multiple lockfiles" workspace root warning
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
