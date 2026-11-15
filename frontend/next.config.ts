import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  async redirects() {
    // Gym search moved into the account page; keep old links working.
    return [{ source: "/gyms", destination: "/account", permanent: false }];
  },
};

export default nextConfig;
