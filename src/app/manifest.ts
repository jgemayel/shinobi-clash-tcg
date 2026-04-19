import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const basePath = process.env.NODE_ENV === 'production' ? '/shinobi-clash-tcg' : '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shinobi Clash TCG',
    short_name: 'Shinobi Clash',
    description: 'A premium Naruto-themed trading card game — collect, build decks, and battle.',
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    id: `${basePath}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#04050a',
    theme_color: '#0b1018',
    categories: ['games', 'entertainment'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: `${basePath}/icons/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${basePath}/icons/icon-maskable-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${basePath}/icons/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
