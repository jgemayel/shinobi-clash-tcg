'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: '\u{1F3E0}' },
  { href: '/battle', label: 'Battle', icon: '\u2694\uFE0F' },
  { href: '/packs', label: 'Packs', icon: '\u{1F4E6}' },
  { href: '/collection', label: 'Collection', icon: '\u{1F4DA}' },
  { href: '/deck-builder', label: 'Decks', icon: '\u{1F0CF}' },
  { href: '/profile', label: 'Profile', icon: '\u{1F464}' },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-naruto-navy/95 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-naruto-orange'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
