import { extractNumbers } from './numberWords';

export interface ParsedCommand {
  rowName: string;
  values: number[];
  raw: string;
}

const NUMBER_WORDS = new Set([
  'zero', 'oh', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
  'eighty', 'ninety', 'hundred', 'thousand',
]);

function isNumberToken(token: string): boolean {
  return NUMBER_WORDS.has(token) || /^-?\d+(\.\d+)?$/.test(token);
}

/** Lowercases, strips punctuation, and collapses whitespace. */
export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits "Seiko one zero" into { rowName: "seiko", values: [1, 0] }.
 * The row name is everything before the first recognizable number token;
 * everything from that point on is parsed as the value sequence.
 */
export function parseVoiceCommand(rawText: string): ParsedCommand | null {
  const normalized = normalizeSpeech(rawText);
  if (!normalized) return null;

  const words = normalized.split(' ');
  const firstNumberIndex = words.findIndex(isNumberToken);

  if (firstNumberIndex <= 0) {
    // No name found before a number (or no number at all) — can't build a command.
    return null;
  }

  const rowName = words.slice(0, firstNumberIndex).join(' ');
  const values = extractNumbers(words.slice(firstNumberIndex));

  if (!rowName || values.length === 0) return null;

  return { rowName, values, raw: rawText };
}
