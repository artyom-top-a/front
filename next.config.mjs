/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  images: {
    domains: ['cdn.sanity.io'], // Add Sanity's image CDN domain here
  },
  output: "standalone",
  reactStrictMode: false,
};

export default nextConfig;
