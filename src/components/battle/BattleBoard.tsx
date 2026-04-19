'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleState, BattleAction } from '@/types/battle';
import { BattlePhase } from '@/types/enums';
import { isNinja } from '@/lib/cardUtils';
import { NinjaCard, GameCard } from '@/types/card';
import { getTypeColor } from '@/lib/typeChart';
import CardArt from '../cards/CardArt';
import BattleCard from './BattleCard';
import ActionBar from './ActionBar';
import PointsTracker from './PointsTracker';
import DamagePopup from './DamagePopup';
import CardActionMenu, { Selection } from './CardActionMenu';

interface BattleBoardProps {
  state: BattleState;
  onAction: (action: BattleAction) => void;
  isAnimating: boolean;
  damagePopups: { id: number; amount: number; isHeal: boolean; side: 'player' | 'opponent' }[];
}

function EmptySlot({ label, compact }: { label?: string; compact?: boolean }) {
  const cls = compact ? 'w-[60px] h-[82px]' : 'w-[78px] h-[105px]';
  return (
    <div className={`${cls} rounded-lg border border-dashed border-white/10 flex items-center justify-center`}>
      {label && <span className="text-[8px] text-gray-600">{label}</span>}
    </div>
  );
}

function HandCard({ card, onClick }: { card: GameCard; onClick?: () => void }) {
  const ninja = isNinja(card) ? (card as NinjaCard) : null;
  const typeColor = ninja ? getTypeColor(ninja.chakraType) : '#6b7280';
  const hue = card.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-[52px] h-[72px] rounded-md overflow-hidden cursor-pointer select-none shrink-0"
      style={{
        background: `linear-gradient(180deg, ${typeColor}15 0%, #0d0d1f 50%)`,
        border: `1px solid ${typeColor}44`,
      }}
    >
      <div className="mx-0.5 mt-0.5 rounded flex items-center justify-center h-[26px] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, hsl(${hue}, 50%, 25%) 0%, hsl(${hue}, 40%, 10%) 70%)`,
          }}
        />
        <div className="relative z-10 w-full h-full">
          <CardArt
            cardName={card.name}
            cardType={card.type}
            chakraType={ninja?.chakraType}
            stage={ninja?.stage}
            artPath={card.artPath}
          />
        </div>
      </div>
      <p className="text-[7px] px-0.5 mt-0.5 truncate text-center font-heading leading-none">{card.name}</p>
      {ninja && (
        <p className="text-[6px] text-center text-gray-400 leading-none mt-0.5">{ninja.hp} HP</p>
      )}
    </motion.div>
  );
}

const PHASE_LABELS: Record<string, string> = {
  [BattlePhase.Setup]: 'Choose Your Ninja',
  [BattlePhase.DrawPhase]: 'Draw Phase',
  [BattlePhase.ChakraPhase]: 'Chakra Phase',
  [BattlePhase.MainPhase]: 'Your Turn',
  [BattlePhase.AttackPhase]: 'Attack Phase',
  [BattlePhase.BetweenTurns]: 'Between Turns',
  [BattlePhase.GameOver]: 'Game Over',
};

const PHASE_HINTS: Record<string, string> = {
  [BattlePhase.DrawPhase]: 'Draw a card from your deck',
  [BattlePhase.ChakraPhase]: 'Attach chakra to power up attacks',
  [BattlePhase.MainPhase]: 'Attack, deploy ninjas, or end your turn',
  [BattlePhase.Setup]: 'Pick a ninja from your hand to lead',
};

export default function BattleBoard({ state, onAction, isAnimating, damagePopups }: BattleBoardProps) {
  const isPlayerTurn = state.activePlayer === 'player';
  const phaseLabel = PHASE_LABELS[state.phase] ?? state.phase;
  const phaseHint = isPlayerTurn ? PHASE_HINTS[state.phase] : undefined;
  const [selection, setSelection] = useState<Selection>(null);

  const canInteract = isPlayerTurn && !isAnimating && state.phase !== BattlePhase.GameOver;

  return (
    <div className="flex flex-col h-full bg-battle relative overflow-hidden">
      {/* Points tracker + turn indicator in one compact row */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-white/5">
        <PointsTracker playerPoints={state.player.points} opponentPoints={state.opponent.points} />
        <div className="text-center">
          <span className="text-[10px] text-gray-300 font-heading bg-white/5 px-2 py-0.5 rounded-full">
            T{state.turn} · {phaseLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span title="Opponent hand">
            <span className="text-purple-400">✋</span>{state.opponent.hand.length}
          </span>
          <span title="Opponent deck">
            <span className="text-purple-400">🂠</span>{state.opponent.deck.length}
          </span>
        </div>
      </div>
      {phaseHint && (
        <p className="text-[10px] text-gray-500 text-center py-0.5">{phaseHint}</p>
      )}

      {/* Board area — uses flex-1 + min-h-0 to fit any viewport */}
      <div className="flex-1 flex flex-col px-2 py-1 relative min-h-0">
        {/* Damage popups */}
        <AnimatePresence>
          {damagePopups.map((dp) => (
            <DamagePopup
              key={dp.id}
              amount={dp.amount}
              isHeal={dp.isHeal}
              y={dp.side === 'opponent' ? '22%' : '62%'}
            />
          ))}
        </AnimatePresence>

        {/* Opponent bench (3 slots) */}
        <div className="flex justify-center gap-1.5 shrink-0">
          {state.opponent.bench.map((slot, i) => (
            <div key={i}>
              {slot ? (
                <BattleCard instance={slot} isOpponent compact />
              ) : (
                <EmptySlot compact />
              )}
            </div>
          ))}
        </div>

        {/* Opponent active — pushed above center with a small margin */}
        <div className="flex justify-center py-1 shrink-0 relative">
          {state.opponent.active ? (
            <motion.div layout>
              <BattleCard instance={state.opponent.active} isOpponent isActive />
            </motion.div>
          ) : (
            <EmptySlot label="No Active" />
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[9px] text-gray-600 font-heading">VS</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Player active */}
        <div className="flex justify-center py-1 shrink-0 relative">
          {state.player.active ? (
            <motion.div layout>
              <BattleCard
                instance={state.player.active}
                isActive
                onClick={canInteract ? () => setSelection({ kind: 'active', instance: state.player.active! }) : undefined}
                highlight={selection?.kind === 'active'}
              />
            </motion.div>
          ) : (
            <EmptySlot label="No Active" />
          )}
        </div>

        {/* Player bench */}
        <div className="flex justify-center gap-1.5 shrink-0">
          {state.player.bench.map((slot, i) => (
            <div key={i}>
              {slot ? (
                <BattleCard
                  instance={slot}
                  compact
                  onClick={canInteract ? () => setSelection({ kind: 'bench', index: i, instance: slot }) : undefined}
                  highlight={selection?.kind === 'bench' && selection.index === i}
                />
              ) : (
                <EmptySlot compact />
              )}
            </div>
          ))}
        </div>

        {/* Spacer to push hand to bottom when board is small */}
        <div className="flex-1 min-h-0" />

        {/* Player hand — horizontal scroll if many cards */}
        <div className="flex justify-center gap-1 pt-1 shrink-0 overflow-x-auto pb-0.5">
          {state.player.hand.map((card, i) => (
            <motion.div
              key={`${card.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <HandCard
                card={card}
                onClick={canInteract ? () => setSelection({ kind: 'hand', index: i, card }) : undefined}
              />
            </motion.div>
          ))}
          {state.player.hand.length === 0 && (
            <div className="text-[10px] text-gray-600 italic py-4">No cards in hand</div>
          )}
        </div>
      </div>

      {/* Card action menu */}
      <CardActionMenu
        state={state}
        selection={selection}
        onAction={onAction}
        onClose={() => setSelection(null)}
        disabled={isAnimating}
      />

      {/* Action bar */}
      <div className="border-t border-white/[0.06] bg-naruto-navy/50 backdrop-blur-sm">
        <ActionBar
          state={state}
          onAction={onAction}
          disabled={isAnimating || (state.activePlayer !== 'player' && state.phase !== BattlePhase.GameOver)}
        />
      </div>
    </div>
  );
}
