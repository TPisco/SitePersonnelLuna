import data from '../data/achievements.json';
import type { Lang, Localized } from '../i18n';

export interface Achievement {
  id: string;
  /** YYYY-MM-DD, used for sorting and for the displayed date. */
  date: string;
  /** Replaces the displayed date, e.g. "Fall 2026" or "Before 2023". */
  dateLabel?: Localized;
  title: Localized;
  place?: Localized;
  /** Not confirmed yet: the site appends "(TO BE CHANGED)" in each language. */
  template?: boolean;
  /** Where the fact comes from. For your records only, not displayed. */
  source?: string;
}

export interface AchievementView {
  id: string;
  datetime?: string;
  dateText: string;
  title: string;
  place?: string;
  upcoming: boolean;
  template: boolean;
}

/** 2026-07-24 → 24-07-2026 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return [d, m, y].filter(Boolean).join('-');
}

/**
 * Upcoming items first (soonest first), then past items (newest first).
 * "Upcoming" is decided at build time, so redeploy to move past events down.
 */
export function getAchievements(lang: Lang, today = new Date()): AchievementView[] {
  const todayIso = today.toISOString().slice(0, 10);
  const items = (data.items as Achievement[]).map((item) => ({
    id: item.id,
    datetime: item.dateLabel ? undefined : item.date,
    dateText: item.dateLabel ? item.dateLabel[lang] : formatDate(item.date),
    title: item.title[lang],
    place: item.place?.[lang],
    upcoming: item.date > todayIso,
    template: Boolean(item.template),
    sortKey: item.date,
  }));

  const upcoming = items.filter((i) => i.upcoming).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const past = items.filter((i) => !i.upcoming).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  return [...upcoming, ...past].map(({ sortKey, ...view }) => view);
}
