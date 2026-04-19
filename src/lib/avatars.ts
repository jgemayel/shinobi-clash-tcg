export interface Avatar {
  id: string;
  name: string;
  image: string;
  accentColor: string;
}

export const AVATARS: Avatar[] = [
  { id: 'naruto',    name: 'Naruto',    image: '/assets/cards/ninja/naruto-stage0.webp',    accentColor: '#f97316' },
  { id: 'sasuke',    name: 'Sasuke',    image: '/assets/cards/ninja/sasuke-stage0.webp',    accentColor: '#6366f1' },
  { id: 'sakura',    name: 'Sakura',    image: '/assets/cards/ninja/sakura-stage0.webp',    accentColor: '#ec4899' },
  { id: 'kakashi',   name: 'Kakashi',   image: '/assets/cards/ninja/kakashi-stage1.webp',   accentColor: '#94a3b8' },
  { id: 'hinata',    name: 'Hinata',    image: '/assets/cards/ninja/hinata.webp',           accentColor: '#a5b4fc' },
  { id: 'rock-lee',  name: 'Rock Lee',  image: '/assets/cards/ninja/rock-lee-stage0.webp',  accentColor: '#22c55e' },
  { id: 'gaara',     name: 'Gaara',     image: '/assets/cards/ninja/gaara-stage0.webp',     accentColor: '#ef4444' },
  { id: 'neji',      name: 'Neji',      image: '/assets/cards/ninja/neji.webp',             accentColor: '#e5e7eb' },
  { id: 'shikamaru', name: 'Shikamaru', image: '/assets/cards/ninja/shikamaru-stage0.webp', accentColor: '#71717a' },
  { id: 'jiraiya',   name: 'Jiraiya',   image: '/assets/cards/ninja/jiraiya.webp',          accentColor: '#dc2626' },
  { id: 'tsunade',   name: 'Tsunade',   image: '/assets/cards/ninja/tsunade.webp',          accentColor: '#fbbf24' },
  { id: 'minato',    name: 'Minato',    image: '/assets/cards/ninja/minato.webp',           accentColor: '#3b82f6' },
];

export const DEFAULT_AVATAR_ID = 'naruto';

export function getAvatarById(id: string | null | undefined): Avatar {
  if (!id) return AVATARS.find((a) => a.id === DEFAULT_AVATAR_ID)!;
  return AVATARS.find((a) => a.id === id) ?? AVATARS.find((a) => a.id === DEFAULT_AVATAR_ID)!;
}
