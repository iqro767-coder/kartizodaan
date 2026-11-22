/**
 * Normalizes Uzbek Latin text so case differences and all apostrophe variants
 * for o' and g' (' ’ ‘ ` ʻ ʼ) match consistently.
 */
export function normalizeUzbek(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019\u02BB\u02BC\u0060\u00B4\u2032]/g, "'")
    .replace(/\s+/g, ' ');
}

/**
 * Checks whether a candidate text matches the user's query using Uzbek rules.
 * Returns match rank:
 *   0 = exact prefix match (highest priority)
 *   1 = word-start prefix match
 *   2 = substring match (only used when query >= 2 chars)
 *  -1 = no match
 */
export function getUzbekMatchRank(candidate: string, rawQuery: string): number {
  const q = normalizeUzbek(rawQuery);
  if (!q) return -1;
  const text = normalizeUzbek(candidate);

  // If user typed just 1 character (e.g. "o" or "k"), match startsWith first.
  // Special care for Uzbek o' / g': if user typed "o'", text must start with "o'";
  // if user typed "o" (1 char), match strings starting with "o" (including "o'..." if needed, prioritizing plain "o" then "o'").
  if (text.startsWith(q)) {
    return 0;
  }

  // Word-boundary start match (e.g., "yugurish" matches "Ertalabki yugurish")
  const words = text.split(' ');
  for (let i = 1; i < words.length; i++) {
    if (words[i].startsWith(q)) {
      return 1;
    }
  }

  // For multi-character queries, allow substring match as fallback
  if (q.length >= 2 && text.includes(q)) {
    return 2;
  }

  return -1;
}
