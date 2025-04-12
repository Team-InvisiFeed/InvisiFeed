/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ This disables ESLint during `next build`
  },
};

export default nextConfig;
