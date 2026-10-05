"use client";

import { createLocalListStore } from "../storage/local-list-store";

export const COMPARE_MIN = 2;
export const COMPARE_MAX = 3;

/** Selección del comparador: 2 a 3 vehículos (slugs) en localStorage. */
export const compare = createLocalListStore("ec-compare", COMPARE_MAX);
