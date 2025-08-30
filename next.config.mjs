/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
export default config;
