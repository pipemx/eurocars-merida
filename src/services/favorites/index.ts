"use client";

import { createLocalListStore } from "../storage/local-list-store";

/** Favoritos sin login: slugs en localStorage. Mañana puede sincronizarse con una cuenta. */
export const favorites = createLocalListStore("ec-favorites");
