import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // GitHub Pages serves this repository below the account site's root.
  basePath: process.env.GITHUB_PAGES_BASE_PATH || undefined,
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
