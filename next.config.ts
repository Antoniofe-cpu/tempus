import type {NextConfig} from 'next';

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
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Aggiunto per risolvere l'avviso sulle richieste cross-origin in ambiente di sviluppo Firebase Studio
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1749300889981.cluster-6frnii43o5blcu522sivebzpii.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
