/**
 * Local persistence for user identity & investment history.
 * Backed by localStorage so each browser keeps its own profile.
 * (Swap for a real backend later by replacing only this module.)
 */

import type { Category, CalcResult } from "./calculations";

const USER_KEY = "aura.user";
const HISTORY_KEY = "aura.history";

export interface User {
  name: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  market: string;
  category: Category;
  inputs: {
    amount: number;
    ratePct: number;
    years: number;
    stepUpPct?: number;
  };
  result: {
    invested: number;
    returns: number;
    total: number;
  };
  note?: string;
  createdAt: number;
}

/* -------- User -------- */

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(name: string): User {
  const user: User = { name: name.trim(), createdAt: Date.now() };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

/* -------- History -------- */

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function addEntry(input: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const entry: HistoryEntry = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const next = [entry, ...getHistory()];
  saveHistory(next);
  return entry;
}

export function updateEntry(id: string, patch: Partial<HistoryEntry>): void {
  const next = getHistory().map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveHistory(next);
}

export function deleteEntry(id: string): void {
  saveHistory(getHistory().filter((e) => e.id !== id));
}

/** Sum of every saved entry's projected total — the user's "current corpus" headline. */
export function totalCorpus(entries: HistoryEntry[] = getHistory()): number {
  return entries.reduce((sum, e) => sum + (e.result.total || 0), 0);
}

/** Helper to build a HistoryEntry payload from a calculation result. */
export function buildEntry(opts: {
  market: string;
  category: Category;
  inputs: HistoryEntry["inputs"];
  result: CalcResult;
  note?: string;
}): Omit<HistoryEntry, "id" | "createdAt"> {
  return {
    market: opts.market,
    category: opts.category,
    inputs: opts.inputs,
    result: {
      invested: opts.result.invested,
      returns: opts.result.returns,
      total: opts.result.total,
    },
    note: opts.note,
  };
}