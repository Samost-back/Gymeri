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
  // Dev and prod: the browser calls the backend through this proxy, so the session and CSRF
  // cookies are first-party on the frontend's own domain; without it sign-in can't work.
  // Browser code calls paths without the trailing slash and the slash is added here: Next would
  // redirect "/api/v1/auth/login/" to the slashless form, and a redirected POST loses its body.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    // Fail the start or build instead of quietly proxying to a backend that isn't there.
    if (!backendUrl) {
      throw new Error("BACKEND_URL is not set");
    }
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*/` }];
  },
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
