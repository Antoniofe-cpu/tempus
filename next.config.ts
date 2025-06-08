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
  // L'opzione experimental.allowedDevOrigins è stata rimossa perché non più riconosciuta
  // da Next.js 15.3.3. Se problemi di CORS dovessero ripresentarsi in sviluppo,
  // si dovrà cercare una soluzione alternativa compatibile con la versione attuale di Next.js.
};

export default nextConfig;
