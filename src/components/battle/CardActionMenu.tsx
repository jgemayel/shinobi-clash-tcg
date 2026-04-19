'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleState, BattleAction, BattleCardInstance } from '@/types/battle';
import { BattlePhase, CardType, ChakraType } from '@/types/enums';
import { GameCard, NinjaCard } from '@/types/card';
import { getLegalActions, getActivePlayerState } from '@/engine/BattleEngine';
import { getTypeColor, getTypeName } from '@/lib/typeChart';
import { isNinja, canPayChakraCost } from '@/lib/cardUtils';
import CardDisplay from '../cards/CardDisplay';

export type Selection =
  | { kind: 'hand'; index: number; card: GameCard }
  | { kind: 'active'; instance: BattleCardInstance }
  | { kind: 'bench'; index: number; instance: BattleCardInstance }
  | null;

interface Props {
  state: BattleState;
  selection: Selection;
  onAction: (action: BattleAction) => void;
  onClose: () => void;
  disabled?: boolean;
}

interface ActionButtonSpec {
  label: string;
  sub?: string;
  icon?: string;
  action: BattleAction;
  tone?: 'attack' | 'play' | 'evolve' | 'retreat' | 'chakra' | 'tool' | 'jutsu' | 'neutral';
}

function toneStyles(tone: ActionButtonSpec['tone']) {
  switch (tone) {
    case 'attack':
      return { bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.6)', text: '#fca5a5' };
    case 'play':
      return { bg: 'rgba(249, 115, 22, 0.18)', border: 'rgba(249, 115, 22, 0.6)', text: '#fed7aa' };
    case 'evolve':
      return { bg: 'rgba(251, 191, 36, 0.18)', border: 'rgba(251, 191, 36, 0.6)', text: '#fde68a' };
    case 'retreat':
      return { bg: 'rgba(148, 163, 184, 0.18)', border: 'rgba(148, 163, 184, 0.6)', text: '#cbd5e1' };
    case 'chakra':
      return { bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.6)', text: '#d8b4fe' };
    case 'tool':
      return { bg: 'rgba(132, 204, 22, 0.18)', border: 'rgba(132, 204, 22, 0.6)', text: '#bef264' };
    case 'jutsu':
      return { bg: 'rgba(59, 130, 246, 0.18)', border: 'rgba(59, 130, 246, 0.6)', text: '#93c5fd' };
    default:
      return { bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.18)', text: '#e5e7eb' };
  }
}

function instanceLabel(inst: BattleCardInstance | null | undefined, fallback = '?'): string {
  if (!inst) return fallback;
  return inst.card.name;
}

function computeActionsForSelection(state: BattleState, sel: Selection): ActionButtonSpec[] {
  if (!sel) return [];
  if (state.activePlayer !== 'player') return [];
  const active = getActivePlayerState(state);
  const legal = getLegalActions(state);
  const specs: ActionButtonSpec[] = [];

  if (sel.kind === 'hand') {
    const card = sel.card;

    // Play basic Ninja to Bench
    if (card.type === CardType.Ninja && (card as NinjaCard).stage === 0) {
      for (const a of legal) {
        if (a.type === 'play-ninja' && a.cardId === card.id) {
          specs.push({
            label: `Summon to Bench ${a.toBench + 1}`,
            icon: '⧉',
            action: a,
            tone: 'play',
          });
        }
      }
    }

    // Evolve — offer each valid evolution target
    if (card.type === CardType.Ninja && (card as NinjaCard).stage > 0) {
      for (const a of legal) {
        if (a.type === 'evolve' && a.cardId === card.id) {
          let target: BattleCardInstance | null = null;
          if (active.active?.instanceId === a.targetInstanceId) target = active.active;
          else target = active.bench.find((b) => b?.instanceId === a.targetInstanceId) ?? null;
          specs.push({
            label: `Evolve ${instanceLabel(target)}`,
            sub: target?.card.name !== card.name ? `→ ${card.name}` : undefined,
            icon: '⇞',
            action: a,
            tone: 'evolve',
          });
        }
      }
    }

    // Jutsu scroll — single "Use" action
    if (card.type === CardType.JutsuScroll) {
      for (const a of legal) {
        if (a.type === 'play-jutsu-scroll' && a.cardId === card.id) {
          specs.push({ label: 'Use Jutsu', icon: '✦', action: a, tone: 'jutsu' });
        }
      }
    }

    // Tool — offer each valid attachment target
    if (card.type === CardType.Tool) {
      for (const a of legal) {
        if (a.type === 'play-tool' && a.cardId === card.id) {
          let target: BattleCardInstance | null = null;
          if (active.active?.instanceId === a.targetInstanceId) target = active.active;
          else target = active.bench.find((b) => b?.instanceId === a.targetInstanceId) ?? null;
          specs.push({
            label: `Attach to ${instanceLabel(target)}`,
            icon: '⚙',
            action: a,
            tone: 'tool',
          });
        }
      }
    }

    // Setup phase: select-active
    if (state.phase === BattlePhase.Setup && card.type === CardType.Ninja) {
      for (const a of legal) {
        if (a.type === 'select-active' && a.cardId === card.id) {
          specs.push({ label: 'Set as Active', icon: '★', action: a, tone: 'play' });
        }
      }
    }
  }

  if (sel.kind === 'active' || sel.kind === 'bench') {
    const myInstance = sel.instance;

    // Attacks only on your own Active ninja during MainPhase
    if (sel.kind === 'active' && active.active?.instanceId === myInstance.instanceId) {
      if (isNinja(myInstance.card)) {
        const ninja = myInstance.card as NinjaCard;
        ninja.attacks.forEach((atk, i) => {
          const canUse = canPayChakraCost(atk.cost, myInstance.attachedChakra);
          const legalAttack = legal.find((a) => a.type === 'attack' && a.attackIndex === i);
          if (legalAttack) {
            specs.push({
              label: atk.name,
              sub: `${atk.damage} dmg${canUse ? '' : ' (needs chakra)'}`,
              icon: '⚔',
              action: legalAttack,
              tone: 'attack',
            });
          }
        });
      }

      // Retreat with each possible bench swap
      for (const a of legal) {
        if (a.type === 'retreat') {
          const newActive = active.bench.find((b) => b?.instanceId === a.newActiveInstanceId);
          specs.push({
            label: `Retreat — swap in ${instanceLabel(newActive)}`,
            icon: '↶',
            action: a,
            tone: 'retreat',
          });
        }
      }
    }

    // Attach Chakra (any ninja on your side, phase-gated to ChakraPhase)
    if (state.phase === BattlePhase.ChakraPhase && !active.chakraAttachedThisTurn) {
      for (const a of legal) {
        if (a.type === 'attach-chakra' && a.targetInstanceId === myInstance.instanceId) {
          specs.push({
            label: 'Attach Chakra',
            icon: '●',
            action: a,
            tone: 'chakra',
          });
        }
      }
    }
  }

  return specs;
}

function selectionCard(sel: Selection): GameCard | null {
  if (!sel) return null;
  if (sel.kind === 'hand') return sel.card;
  return sel.instance.card;
}

export default function CardActionMenu({ state, selection, onAction, onClose, disabled }: Props) {
  const actions = useMemo(() => computeActionsForSelection(state, selection), [state, selection]);
  const card = selectionCard(selection);

  return (
    <AnimatePresence>
      {selection && card && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-naruto-navy/95 backdrop-blur-xl rounded-t-2xl border-t border-x border-white/10 max-h-[85vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Card preview + actions */}
            <div className="flex gap-3 px-4 pb-3 overflow-y-auto">
              <div className="shrink-0 pt-1">
                <CardDisplay card={card} size="sm" />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="mb-1">
                  <p className="text-sm font-bold font-heading truncate text-white">{card.name}</p>
                  {isNinja(card) && (card as NinjaCard).subtitle && (
                    <p className="text-[10px] text-gray-400 truncate">{(card as NinjaCard).subtitle}</p>
                  )}
                </div>

                {actions.length === 0 ? (
                  <div
                    className="text-xs text-gray-500 italic py-3 px-2 text-center rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    No actions available for this card right now.
                    {state.phase === BattlePhase.ChakraPhase && (
                      <p className="mt-1 text-[10px]">Hint: Pick a Chakra type to attach.</p>
                    )}
                    {state.phase === BattlePhase.MainPhase && selection?.kind === 'hand' && (
                      <p className="mt-1 text-[10px]">
                        This card may need a specific board state (e.g. a Basic to evolve onto).
                      </p>
                    )}
                  </div>
                ) : (
                  actions.map((spec, i) => {
                    const s = toneStyles(spec.tone);
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          onAction(spec.action);
                          onClose();
                        }}
                        disabled={disabled}
                        className="w-full rounded-lg px-3 py-2 text-left flex items-center gap-2 transition-colors hover:brightness-110 disabled:opacity-40"
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.border}`,
                          color: s.text,
                        }}
                      >
                        {spec.icon && (
                          <span className="font-heading text-base shrink-0" aria-hidden>{spec.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold font-heading truncate">{spec.label}</p>
                          {spec.sub && <p className="text-[10px] opacity-75 truncate">{spec.sub}</p>}
                        </div>
                      </motion.button>
                    );
                  })
                )}

                <button
                  onClick={onClose}
                  className="mt-1 w-full rounded-lg py-2 text-xs text-gray-400 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
