@AGENTS.md

# Shinobi Clash TCG — Project Context

## What This Is
A premium Naruto-themed trading card game built with **Next.js 16.2.3**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Zustand** (state), and **motion** (Framer Motion v11+ animations). Runs at `http://localhost:3000` via `npm run dev`.

## Current State (fully playable)
The game is feature-complete with a premium visual overhaul, real character photos, playable battle system, pack opening ceremony, deck builder, and full progression. Everything builds clean with `npm run build` (zero TS errors).

## Tech Stack
- **Next.js 16** App Router (all pages are `'use client'`)
- **Tailwind v4** with `@theme inline` block in `globals.css` (NOT tailwind.config.js)
- **Zustand** with persist middleware — sliced architecture in `src/store/slices/`
- **motion** (`motion/react`) for all animations — NOT Framer Motion import path
- **Web Audio API** for sound effects (`src/lib/sounds.ts`) — zero audio files
- **Phaser** is installed but NOT used — battle/packs are pure React+motion. Phaser scenes exist in `src/game/scenes/` but are never loaded.

## Architecture Overview

### Pages (src/app/)
| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Home — welcome overlay for new players, action cards with hint dots, stats |
| `/packs` | `packs/page.tsx` | Pack opening — tear animation, 3D card flip, summary with XP/rarity |
| `/collection` | `collection/page.tsx` | Card browser with filters, progress bar |
| `/deck-builder` | `deck-builder/page.tsx` | Build/save decks, "Quick Build" auto-fill, deck stats |
| `/battle` | `battle/page.tsx` | Difficulty select → VS splash → full battle board with AI |
| `/profile` | `profile/page.tsx` | Level, XP bar, stats, settings link |
| `/settings` | `settings/page.tsx` | Volume sliders, animation speed, name edit, reset progress |

### Card System
- **80 cards** defined in `src/data/cards/hidden-leaf-origins.json` (40 ninja, 25 jutsu, 10 tools, 5 sensei)
- Card types: `NinjaCard`, `JutsuScrollCard`, `ToolCard`, `SenseiCard` (see `src/types/card.ts`)
- Enums: `ChakraType`, `CardType`, `Rarity`, `StatusEffect`, `BattlePhase`, `AIDifficulty` (see `src/types/enums.ts`)
- **Character photos** downloaded from Naruto wiki in `public/assets/cards/ninja/*.webp` and `public/assets/cards/sensei/*.webp` (41 ninja + 5 sensei images)
- SVG icons for jutsu/tools rendered procedurally in `src/components/cards/CardArt.tsx`

### Battle Engine (DO NOT modify unless asked)
- `src/engine/BattleEngine.ts` — core state machine: `createInitialBattleState`, `processAction`, `processBetweenTurns`, `getLegalActions`
- `src/engine/DamageCalculator.ts`, `ChakraManager.ts`, `StatusEffectProcessor.ts`, `EvolutionValidator.ts`, `WinConditionChecker.ts`, `DeckValidator.ts`
- `src/ai/AIController.ts` — `chooseAIAction()` with difficulty-based strategies
- `src/lib/aiDeckBuilder.ts` — `buildAIDeck()` for AI opponents, `buildPlayerDeck()` for "Quick Build"
- Battle state is ephemeral (NOT persisted) — managed via `battleSlice.ts`

### Store (src/store/)
- `index.ts` — combined Zustand store with persist middleware
- Persisted slices: `collectionSlice`, `deckSlice`, `playerSlice`, `packSlice`, `settingsSlice`
- NOT persisted: `battleSlice` (excluded from `partialize`)
- Key fields in partialize: `ownedCards`, `decks`, `activeDeckId`, `profile`, `availablePacks`, `lastPackTime`, `sfxVolume`, `musicVolume`, `animationSpeed`, `hasSeenWelcome`

### Visual System
- `globals.css` — 10 keyframe animations, glassmorphism panels, 3D card flip CSS, rarity effects (uncommon→crown), particle system, animated backgrounds
- Fonts: **Rajdhani** (headings via `font-heading`), **Inter** (body via `font-body`)
- `CardDisplay.tsx` — renders every card with 3D tilt, rarity glow, chakra dots, character photo
- `CardDetail.tsx` — modal with drag-to-dismiss, blur backdrop, spring animations
- `MainNav.tsx` — bottom nav with SVG icons and sliding `layoutId` indicator

### Key Constants (src/lib/constants.ts)
- `MAX_DECK_SIZE = 20`, `MAX_CARD_COPIES = 2`, `MAX_SENSEI_COPIES = 1`
- `CARDS_PER_PACK = 5`, `MAX_STORED_PACKS = 2`, `PACK_RECHARGE_MS = 12 hours`
- `WIN_POINTS = 3`, `XP_PER_WIN = 50`, `XP_PER_LOSS = 10`, `XP_PER_PACK = 25`

## What Was Built (in order)
1. **Visual overhaul** — fonts, CSS animations, glassmorphism, card redesign, rarity effects
2. **Card art** — SVG character portraits → replaced with real photos from Naruto wiki
3. **Navigation** — SVG icons, sliding active indicator
4. **Pack opening** — tear animation, 3D flip, screen flash for rares, summary panel, recharge timer
5. **Battle system** — BattleBoard, BattleCard, ActionBar (grouped with section headers + cost display), PointsTracker, DamagePopup, AI turn loop
6. **Sound system** — Web Audio synthesizer (cardFlip, packRip, attackHit, rareReveal, victory, defeat, etc.)
7. **New player onboarding** — welcome modal, contextual hint dots, Quick Build deck button
8. **Settings page** — volume, animation speed, name edit, reset progress
9. **Sound sync** — SoundSync component in layout keeps volume synced globally

## Known Remaining Work / Ideas
- Achievement system exists in profile UI but no achievements are defined yet
- Battle post-game screen could show XP earned and card rewards
- No music (only SFX) — musicVolume slider exists but no music playback
- Phaser files still in `src/game/` — could be removed entirely
- Card set is only "Hidden Leaf Origins" — could add more sets
- No multiplayer — AI only
- Mobile haptic feedback not implemented
