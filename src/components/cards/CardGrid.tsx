'use client';

import { GameCard } from '@/types/card';
import CardDisplay from './CardDisplay';

interface CardGridProps {
  cards: GameCard[];
  onCardClick?: (card: GameCard) => void;
  cardCounts?: Record<string, number>;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  emptyMessage?: string;
}

export default function CardGrid({
  cards,
  onCardClick,
  cardCounts,
  showCounts,
  size = 'md',
  emptyMessage = 'No cards found',
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const gridClass = {
    sm: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2',
    md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3',
    lg: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
  };

  return (
    <div className={`grid ${gridClass[size]}`}>
      {cards.map((card) => (
        <CardDisplay
          key={card.id}
          card={card}
          size={size}
          onClick={() => onCardClick?.(card)}
          count={cardCounts?.[card.id]}
          showCount={showCounts}
        />
      ))}
    </div>
  );
}
