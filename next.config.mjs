/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['typeorm', 'pg'],
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};
export default nextConfig;
