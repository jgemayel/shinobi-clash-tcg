// Multi-profile storage: an index of profile summaries + per-profile game state.
// Each profile's game state lives under `naruto-tcg-profile-{id}` managed by zustand
// persist. This module only manages the index, the active-profile pointer, and migration
// from the legacy single-profile `naruto-tcg-save` key.

export const PROFILE_INDEX_KEY = 'naruto-tcg-profile-index';
export const LEGACY_STORAGE_KEY = 'naruto-tcg-save';
export const PROFILE_STORAGE_PREFIX = 'naruto-tcg-profile-';
export const MAX_PROFILES = 6;

export interface ProfileSummary {
  id: string;
  name: string;
  avatarId: string;
  level: number;
  createdAt: number;
  lastPlayed: number;
}

export interface ProfileIndex {
  profiles: ProfileSummary[];
  activeProfileId: string | null;
}

export function getProfileStorageKey(id: string): string {
  return `${PROFILE_STORAGE_PREFIX}${id}`;
}

function newProfileId(): string {
  // Short stable ID, URL-safe, doesn't need to be cryptographic
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Read the profile index, migrating from the legacy single-save key on first read.
 * Idempotent — subsequent calls return the stored index.
 */
export function readProfileIndex(): ProfileIndex {
  if (!hasLocalStorage()) return { profiles: [], activeProfileId: null };

  const existing = safeParse<ProfileIndex>(localStorage.getItem(PROFILE_INDEX_KEY));
  if (existing && Array.isArray(existing.profiles)) return existing;

  // Attempt migration from legacy single-profile save
  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw) {
    const legacy = safeParse<{ state?: { profile?: { name?: string; avatarId?: string; level?: number; createdAt?: number } } }>(legacyRaw);
    const profile = legacy?.state?.profile;
    if (profile?.name) {
      const id = newProfileId();
      const summary: ProfileSummary = {
        id,
        name: profile.name,
        avatarId: profile.avatarId ?? 'naruto',
        level: profile.level ?? 1,
        createdAt: profile.createdAt ?? Date.now(),
        lastPlayed: Date.now(),
      };
      localStorage.setItem(getProfileStorageKey(id), legacyRaw);
      const index: ProfileIndex = { profiles: [summary], activeProfileId: id };
      localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(index));
      // Leave legacy key in place as a backup; it can be cleaned up later.
      return index;
    }
  }

  const empty: ProfileIndex = { profiles: [], activeProfileId: null };
  localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(empty));
  return empty;
}

export function writeProfileIndex(index: ProfileIndex): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(index));
}

export function getActiveProfileId(): string | null {
  if (!hasLocalStorage()) return null;
  return readProfileIndex().activeProfileId;
}

export function setActiveProfile(id: string | null): void {
  const index = readProfileIndex();
  if (id && !index.profiles.some((p) => p.id === id)) return;
  writeProfileIndex({ ...index, activeProfileId: id });
}

/**
 * Create a new profile summary and mark it active. Does NOT create game state —
 * the zustand store writes to the new key after page reload.
 */
export function createProfile(name: string, avatarId: string): ProfileSummary | null {
  const index = readProfileIndex();
  if (index.profiles.length >= MAX_PROFILES) return null;
  const now = Date.now();
  const summary: ProfileSummary = {
    id: newProfileId(),
    name: name.trim() || 'Ninja',
    avatarId,
    level: 1,
    createdAt: now,
    lastPlayed: now,
  };
  writeProfileIndex({
    profiles: [...index.profiles, summary],
    activeProfileId: summary.id,
  });
  return summary;
}

export function deleteProfile(id: string): ProfileIndex {
  if (!hasLocalStorage()) return { profiles: [], activeProfileId: null };
  const index = readProfileIndex();
  const remaining = index.profiles.filter((p) => p.id !== id);
  const newActive = index.activeProfileId === id
    ? (remaining[0]?.id ?? null)
    : index.activeProfileId;
  localStorage.removeItem(getProfileStorageKey(id));
  const next: ProfileIndex = { profiles: remaining, activeProfileId: newActive };
  writeProfileIndex(next);
  return next;
}

/**
 * Update the summary fields (called from the game store whenever profile.name,
 * avatarId, or level change, so the picker stays in sync without a reload).
 */
export function updateProfileSummary(id: string, patch: Partial<Omit<ProfileSummary, 'id' | 'createdAt'>>): void {
  const index = readProfileIndex();
  const next: ProfileIndex = {
    ...index,
    profiles: index.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
  writeProfileIndex(next);
}

export function touchActiveProfile(): void {
  const id = getActiveProfileId();
  if (!id) return;
  updateProfileSummary(id, { lastPlayed: Date.now() });
}
