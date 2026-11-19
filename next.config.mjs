/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The admin preview resolves [[wikilinks]] against the notes at request time.
  outputFileTracingIncludes: { "/api/admin/preview": ["./content/**/*"] },
};
export default nextConfig;
