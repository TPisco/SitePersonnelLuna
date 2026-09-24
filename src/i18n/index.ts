import fr from './fr.json';
import en from './en.json';
import es from './es.json';

export const languages = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;
export type Dict = typeof fr;
/** A value written once per language, e.g. in src/data/*.json. */
export type Localized<T = string> = Record<Lang, T>;

export const langs = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'fr';

// Typed as Record<Lang, Dict> so a missing key in en.json or es.json fails the build.
const dictionaries: Record<Lang, Dict> = { fr, en, es };

export function useTranslations(lang: Lang): Dict {
  return dictionaries[lang];
}

/** Replaces {placeholders} in a translated string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function localePath(lang: Lang): string {
  return `/${lang}/`;
}
