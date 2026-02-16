import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["placehold.co"],
  },
  serverExternalPackages: ["express", "genkit", "@genkit-ai/googleai", "sharp"],
  async rewrites() {
    const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://zoeconvert.insforge.site';
    return [
      {
        source: '/insforge-proxy/:path*',
        destination: `${insforgeUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
