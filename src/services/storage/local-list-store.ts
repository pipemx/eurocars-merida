"use client";

import { useSyncExternalStore } from "react";

/**
 * Lista de slugs persistida en localStorage, con suscripción para React
 * (useSyncExternalStore): sincroniza componentes de la misma pestaña y de otras pestañas.
 * En servidor y en el primer render devuelve [] (sin desajuste de hidratación).
 */
const EMPTY: readonly string[] = Object.freeze([]);

export type ToggleResult = "added" | "removed" | "full";

export function createLocalListStore(key: string, max = Infinity) {
  const listeners = new Set<() => void>();
  let cache: readonly string[] = EMPTY;
  let loaded = false;

  const read = (): readonly string[] => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        const list = parsed.filter((x): x is string => typeof x === "string").slice(0, max);
        return list.length ? list : EMPTY;
      }
    } catch {}
    return EMPTY;
  };

  const write = (next: readonly string[]) => {
    cache = next.length ? next : EMPTY;
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {}
    listeners.forEach((l) => l());
  };

  const getSnapshot = () => {
    if (!loaded) {
      cache = read();
      loaded = true;
    }
    return cache;
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key && e.key !== null) return;
      cache = read();
      loaded = true;
      cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    useList: () => useSyncExternalStore(subscribe, getSnapshot, () => EMPTY),
    toggle(slug: string): ToggleResult {
      const cur = getSnapshot();
      if (cur.includes(slug)) {
        write(cur.filter((s) => s !== slug));
        return "removed";
      }
      if (cur.length >= max) return "full";
      write([...cur, slug]);
      return "added";
    },
    add(slug: string): ToggleResult {
      const cur = getSnapshot();
      if (cur.includes(slug)) return "added";
      if (cur.length >= max) return "full";
      write([...cur, slug]);
      return "added";
    },
    remove(slug: string) {
      const cur = getSnapshot();
      if (cur.includes(slug)) write(cur.filter((s) => s !== slug));
    },
    clear() {
      write(EMPTY);
    },
  };
}
