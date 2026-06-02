import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "api-puncak-traveller.test",
        port: "",
        pathname: "/storage/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
