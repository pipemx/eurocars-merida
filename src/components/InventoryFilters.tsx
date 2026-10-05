"use client";

import { categories, type CategoryId } from "@/services/inventory/categories";
import { usePreferences } from "./providers/Preferences";

export function InventoryFilters({ active, counts, onChange }: { active: CategoryId; counts: Record<CategoryId, number>; onChange: (c: CategoryId) => void }) {
  const { t } = usePreferences();
  return (
    <div role="group" aria-label={t.inventory.filterLabel} className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 md:mx-0 md:px-0 xl:gap-9">
      {categories.map((c) => {
        const on = c === active;
        const empty = counts[c] === 0;
        return (
          <button
            key={c}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(c)}
            className={`relative min-h-11 shrink-0 text-[14px] transition-opacity ${on ? "font-medium opacity-100" : empty ? "opacity-40 hover:opacity-70" : "opacity-70 hover:opacity-100"}`}
          >
            {t.inventory.categories[c]}
            <span aria-hidden className={`absolute bottom-1.5 left-0 h-[1.5px] bg-accent transition-[width] duration-300 ease-[var(--ease-editorial)] ${on ? "w-full" : "w-0"}`} />
          </button>
        );
      })}
    </div>
  );
}
