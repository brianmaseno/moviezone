import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore MongoDB and bcryptjs on client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        'fs/promises': false,
        'timers/promises': false,
      };
      
      // Ignore these modules on client side
      config.externals = [
        ...config.externals || [],
        'mongodb',
        'bcryptjs'
      ];
    }
    
    return config;
  },
};

export default nextConfig;
