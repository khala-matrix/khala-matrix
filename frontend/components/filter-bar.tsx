"use client";

import type { TopicCategory } from "@/lib/hot-topics/types";

type FilterCategory = "All Categories" | TopicCategory;

const CATEGORY_OPTIONS: readonly FilterCategory[] = [
  "All Categories",
  "LLM",
  "Computer Vision",
  "Robotics",
  "NLP",
  "AI Infrastructure",
  "Data Platforms",
  "Agent Systems",
  "Policy & Compliance",
] as const;

export interface FilterBarProps {
  category: string;
  search: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  category,
  search,
  onCategoryChange,
  onSearchChange,
  onClear,
}: FilterBarProps) {
  const clearDisabled = category === "All Categories" && search.trim().length === 0;

  return (
    <section className="panel rounded-2xl p-4 md:p-5">
      <div className="grid gap-3 md:grid-cols-[14rem_1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            Search
          </span>
          <input
            type="search"
            value={search}
            placeholder="Search topics, domains, signals..."
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={clearDisabled}
          className="rounded-xl border border-[var(--line)] bg-white/85 px-4 py-3 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          Clear
        </button>
      </div>
    </section>
  );
}
