'use client';

import { motion } from 'motion/react';
import { BattleState, BattleAction } from '@/types/battle';
import { BattlePhase, ChakraType } from '@/types/enums';
import { getLegalActions, getActivePlayerState } from '@/engine/BattleEngine';
import { NinjaCard, ChakraCost } from '@/types/card';
import { isNinja } from '@/lib/cardUtils';
import { getTypeColor, getTypeEmoji } from '@/lib/typeChart';

interface ActionBarProps {
  state: BattleState;
  onAction: (action: BattleAction) => void;
  disabled: boolean;
}

function formatCost(cost: ChakraCost): string {
  const parts: string[] = [];
  const types: [string, string][] = [
    ['fire', 'F'], ['water', 'W'], ['lightning', 'L'],
    ['earth', 'E'], ['wind', 'N'], ['colorless', 'C'],
  ];
  for (const [key, letter] of types) {
    const val = (cost as Record<string, number | undefined>)[key] ?? 0;
    if (val > 0) parts.push(`${letter}${val}`);
  }
  return parts.join(' ');
}

function SectionLabel({ text }: { text: string }) {
  return <p className="text-[9px] text-gray-500 w-full mt-1 mb-0.5 uppercase tracking-wider">{text}</p>;
}

export default function ActionBar({ state, onAction, disabled }: ActionBarProps) {
  const legalActions = getLegalActions(state);
  const active = getActivePlayerState(state);

  if (state.activePlayer !== 'player' && state.phase !== BattlePhase.GameOver) {
    return (
      <div className="text-center py-3 text-gray-500 text-sm">
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Opponent is thinking...
        </motion.span>
      </div>
    );
  }

  if (state.phase === BattlePhase.GameOver) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <p className={`text-2xl font-bold font-heading ${
          state.winner === 'player' ? 'text-green-400' : state.winner === 'draw' ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {state.winner === 'player' ? 'Victory!' : state.winner === 'draw' ? 'Draw!' : 'Defeat!'}
        </p>
      </motion.div>
    );
  }

  const attacks = legalActions.filter((a) => a.type === 'attack');
  const playNinjas = legalActions.filter((a) => a.type === 'play-ninja');
  const evolves = legalActions.filter((a) => a.type === 'evolve');
  const retreats = legalActions.filter((a) => a.type === 'retreat');
  const jutsus = legalActions.filter((a) => a.type === 'play-jutsu-scroll');
  const tools = legalActions.filter((a) => a.type === 'play-tool');
  const hasSensei = legalActions.some((a) => a.type === 'use-sensei');

  return (
    <div className="flex flex-wrap gap-1.5 justify-center py-2 px-3">
      {/* Setup */}
      {state.phase === BattlePhase.Setup && !active.active && (
        <>
          <p className="text-xs text-yellow-400 text-center w-full mb-1 font-heading">Choose your active ninja</p>
          {legalActions
            .filter((a) => a.type === 'select-active')
            .map((a, i) => {
              if (a.type !== 'select-active') return null;
              const card = active.hand.find((c) => c.id === a.cardId);
              return (
                <ActionButton
                  key={`sa-${i}`}
                  label={card?.name ?? 'Ninja'}
                  onClick={() => onAction(a)}
                  disabled={disabled}
                  color="orange"
                />
              );
            })}
        </>
      )}

      {/* Setup — place bench ninjas (optional), then Start Battle */}
      {state.phase === BattlePhase.Setup && active.active && (
        <>
          <p className="text-xs text-yellow-400 text-center w-full mb-1 font-heading">
            Place ninjas on your bench (optional), then Start Battle
          </p>
          {legalActions
            .filter((a) => a.type === 'play-ninja')
            .slice(0, 6)
            .map((a, i) => {
              if (a.type !== 'play-ninja') return null;
              const card = active.hand.find((c) => c.id === a.cardId);
              return (
                <ActionButton
                  key={`pn-setup-${i}`}
                  label={`${card?.name ?? 'Ninja'} → Bench ${a.toBench + 1}`}
                  onClick={() => onAction(a)}
                  disabled={disabled}
                  color="green"
                  small
                />
              );
            })}
          <div className="w-full flex justify-center mt-1 pt-1 border-t border-white/[0.06]">
            <ActionButton
              label="Start Battle"
              onClick={() => onAction({ type: 'end-setup' })}
              disabled={disabled}
              color="orange"
            />
          </div>
        </>
      )}

      {/* Draw */}
      {state.phase === BattlePhase.DrawPhase && legalActions.find((a) => a.type === 'draw') && (
        <ActionButton
          label="Draw Card"
          onClick={() => onAction({ type: 'draw' })}
          disabled={disabled}
          color="blue"
        />
      )}

      {/* Chakra */}
      {state.phase === BattlePhase.ChakraPhase && (
        <>
          <p className="text-xs text-gray-300 text-center w-full mb-1">
            Power up a ninja — attach <span className="text-naruto-orange font-bold">1 chakra</span> to any ally
          </p>
          {legalActions
            .filter((a) => a.type === 'attach-chakra')
            .slice(0, 12)
            .map((a, i) => {
              if (a.type !== 'attach-chakra') return null;
              const target = active.active?.instanceId === a.targetInstanceId
                ? active.active?.card.name
                : active.bench.find((b) => b?.instanceId === a.targetInstanceId)?.card.name;
              return (
                <ActionButton
                  key={i}
                  label={`Chakra → ${target ?? '?'}`}
                  onClick={() => onAction(a)}
                  disabled={disabled}
                  color="purple"
                  small
                />
              );
            })}
        </>
      )}

      {/* Main Phase - grouped */}
      {state.phase === BattlePhase.MainPhase && (
        <>
          {/* Attacks */}
          {attacks.length > 0 && (
            <>
              <SectionLabel text="Attacks" />
              {attacks.map((a) => {
                if (a.type !== 'attack') return null;
                const ninja = active.active?.card as NinjaCard;
                const atk = ninja?.attacks[a.attackIndex];
                const costStr = atk ? formatCost(atk.cost) : '';
                return (
                  <ActionButton
                    key={`atk-${a.attackIndex}`}
                    label={`${atk?.name ?? 'Attack'} [${costStr}] ${atk?.damage ?? 0} dmg`}
                    onClick={() => onAction(a)}
                    disabled={disabled}
                    color="red"
                  />
                );
              })}
            </>
          )}

          {/* Deploy */}
          {(playNinjas.length > 0 || evolves.length > 0) && (
            <>
              <SectionLabel text="Deploy" />
              {playNinjas.slice(0, 3).map((a, i) => {
                if (a.type !== 'play-ninja') return null;
                const card = active.hand.find((c) => c.id === a.cardId);
                return (
                  <ActionButton
                    key={`pn-${i}`}
                    label={`Play ${card?.name ?? '?'}`}
                    onClick={() => onAction(a)}
                    disabled={disabled}
                    color="green"
                    small
                  />
                );
              })}
              {playNinjas.length > 3 && (
                <span className="text-[9px] text-gray-500 self-center">+{playNinjas.length - 3} more</span>
              )}
              {evolves.slice(0, 2).map((a, i) => {
                if (a.type !== 'evolve') return null;
                const card = active.hand.find((c) => c.id === a.cardId);
                return (
                  <ActionButton
                    key={`evo-${i}`}
                    label={`Evolve → ${card?.name ?? '?'}`}
                    onClick={() => onAction(a)}
                    disabled={disabled}
                    color="yellow"
                    small
                  />
                );
              })}
            </>
          )}

          {/* Other */}
          {(retreats.length > 0 || jutsus.length > 0 || tools.length > 0 || hasSensei) && (
            <>
              <SectionLabel text="Other" />
              {retreats.slice(0, 3).map((a, i) => {
                if (a.type !== 'retreat') return null;
                const benchCard = active.bench.find((b) => b?.instanceId === (a as { newActiveInstanceId: string }).newActiveInstanceId);
                return (
                  <ActionButton
                    key={`ret-${i}`}
                    label={`Retreat → ${benchCard?.card.name ?? '?'}`}
                    onClick={() => onAction(a)}
                    disabled={disabled}
                    color="gray"
                    small
                  />
                );
              })}
              {retreats.length > 3 && (
                <span className="text-[9px] text-gray-500 self-center">+{retreats.length - 3} more</span>
              )}
              {jutsus.slice(0, 2).map((a, i) => {
                if (a.type !== 'play-jutsu-scroll') return null;
                const card = active.hand.find((c) => c.id === a.cardId);
                return (
                  <ActionButton
                    key={`js-${i}`}
                    label={`Use ${card?.name ?? 'Scroll'}`}
                    onClick={() => onAction(a)}
                    disabled={disabled}
                    color="blue"
                    small
                  />
                );
              })}
              {tools.slice(0, 2).map((a, i) => {
                if (a.type !== 'play-tool') return null;
                const card = active.hand.find((c) => c.id === a.cardId);
                return (
                  <ActionButton
                    key={`tl-${i}`}
                    label={`Equip ${card?.name ?? 'Tool'}`}
                    onClick={() => onAction(a)}
                    disabled={disabled}
                    color="purple"
                    small
                  />
                );
              })}
              {hasSensei && (
                <ActionButton
                  label={`Use ${active.senseiCard?.name ?? 'Sensei'}`}
                  onClick={() => onAction({ type: 'use-sensei' })}
                  disabled={disabled}
                  color="yellow"
                  small
                />
              )}
            </>
          )}

          {/* End Turn - always last */}
          <div className="w-full flex justify-center mt-1 pt-1 border-t border-white/[0.06]">
            <ActionButton
              label="End Turn"
              onClick={() => onAction({ type: 'end-turn' })}
              disabled={disabled}
              color="gray"
            />
          </div>
        </>
      )}
    </div>
  );
}

function ActionButton({ label, onClick, disabled, color, small }: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  color: string;
  small?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
    orange: 'bg-naruto-orange/20 text-orange-300 border-naruto-orange/30 hover:bg-naruto-orange/30',
    gray: 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/15',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${small ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} rounded-lg border font-bold font-heading transition-colors ${
        disabled ? 'opacity-40 cursor-not-allowed' : colorClasses[color] ?? colorClasses.gray
      }`}
    >
      {label}
    </motion.button>
  );
}
