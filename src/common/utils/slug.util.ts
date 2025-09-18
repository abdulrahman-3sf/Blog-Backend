import slugifyLib from 'slugify';

export function slugifyAscii(input: string): string {
  return slugifyLib(input, {
    lower: true,
    strict: true,   // drop anything outside [a-z0-9-]
    trim: true,
    locale: 'ar',   // helps with case/diacritics rules where applicable
  });
}

export function slugifyUnicode(input: string): string {
    return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                       // spaces -> dash
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '') // keep letters/numbers/dash across all scripts (incl. Arabic)
    .replace(/-+/g, '-')                        // collapse dashes
    .replace(/^-+|-+$/g, '');                   // trim dashes
}

export const slugifyTitle = slugifyUnicode;