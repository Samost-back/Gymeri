import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  // Hides the "X-Powered-By: Next.js" header, so responses don't advertise the stack.
  poweredByHeader: false,
  // Dev only: lets a phone on the same Wi-Fi or hotspot open the dev server by the laptop's
  // IP. Without it Next blocks its dev resources and the page never becomes interactive.
  // 192.168.x.x covers home routers and Android hotspots, 172.20.10.x the iPhone hotspot.
  // Ignored by `next build`, so production is not affected.
  allowedDevOrigins: ["192.168.*.*", "172.20.10.*"],
  async redirects() {
    // Gym search moved into the account page; keep old links working.
    return [{ source: "/gyms", destination: "/account", permanent: false }];
  },
  // Security headers that are the same on every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No other site may embed our pages in a frame (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // The browser must trust the declared Content-Type instead of guessing it.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Other sites see only our domain, not full URLs with search filters.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site uses none of these APIs, so embedded scripts can't request them either.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
