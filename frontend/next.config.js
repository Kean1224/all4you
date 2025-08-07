/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production build optimizations - swcMinify is now default in Next.js 15
  
  async rewrites() {
    // Only use rewrites in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.all4youauctions.co.za/api/:path*',
        },
      ];
    }
    return [];
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'all4youauctions.co.za',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
