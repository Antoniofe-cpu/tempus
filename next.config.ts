
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ignoreBuildErrors: true, // Removed
  },
  eslint: {
    // ignoreDuringBuilds: true, // Removed
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
      {
        protocol: 'https',
        hostname: 'www.recensioniorologi.it',
        port: '',
        pathname: '/**',
      },
      { // Aggiunto per Firebase Storage
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // L'opzione experimental.allowedDevOrigins è stata rimossa perché non più riconosciuta
  // da Next.js 15.3.3. Se problemi di CORS dovessero ripresentarsi in sviluppo,
  // si dovrà cercare una soluzione alternativa compatibile con la versione attuale di Next.js.
};

export default nextConfig;
