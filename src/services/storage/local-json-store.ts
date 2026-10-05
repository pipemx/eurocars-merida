"use client";

import { useSyncExternalStore } from "react";

/**
 * Valor JSON en localStorage con suscripción para React (useSyncExternalStore).
 * Servidor y primer render usan `initial` (sin desajuste de hidratación).
 * `set` devuelve false si el navegador rechaza la escritura (p. ej. cuota llena) y entonces
 * NO cambia el valor en memoria: la UI nunca muestra algo que no quedó guardado.
 */
export function createLocalJsonStore<T>(key: string, initial: T) {
  const listeners = new Set<() => void>();
  let cache: T = initial;
  let loaded = false;

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {}
    return initial;
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

  const set = (next: T): boolean => {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      return false;
    }
    cache = next;
    loaded = true;
    listeners.forEach((l) => l());
    return true;
  };

  return {
    useValue: () => useSyncExternalStore(subscribe, getSnapshot, () => initial),
    get: getSnapshot,
    set,
    update: (fn: (cur: T) => T) => set(fn(getSnapshot())),
    reset: () => set(initial),
  };
}
