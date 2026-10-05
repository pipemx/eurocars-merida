"use client";

import { createLocalJsonStore } from "../storage/local-json-store";
import type { ContentTone, GeneratedVehicleContent } from "./content-types";

/** Borrador guardado (demo, localStorage). Mañana: tabla en Supabase con la misma forma. */
export interface ContentDraft {
  content: GeneratedVehicleContent;
  tone: ContentTone;
  variant: number;
  savedAt: string;
}

const store = createLocalJsonStore<Record<string, ContentDraft>>("ec-demo-content-drafts", {});

export const useContentDrafts = store.useValue;

/** Devuelve false si el navegador rechazó la escritura. */
export function saveContentDraft(slug: string, draft: ContentDraft): boolean {
  return store.update((cur) => ({ ...cur, [slug]: draft }));
}

export function deleteContentDraft(slug: string) {
  store.update((cur) => {
    const next = { ...cur };
    delete next[slug];
    return next;
  });
}
