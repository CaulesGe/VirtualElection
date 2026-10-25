/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
      "font-src 'self'",
      // MapLibre loads basemap tiles with fetch(), so OSM tile hosts are needed here as well as in img-src.
      "connect-src 'self' https://accounts.google.com https://www.google.com https://*.tile.openstreetmap.org",
      // MapLibre GL (Australia vector-tile map) decodes tiles in blob: web workers.
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-src https://accounts.google.com https://www.google.com"
    ].join('; ');

    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
